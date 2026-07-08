<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').trim(),
  email: z.string().email('Email belum valid').trim(),
});

type Schema = z.output<typeof schema>;

const formState = reactive<Schema>({
  name: '',
  email: '',
});

const loading = ref(false);
const errorMessage = ref('');

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await $fetch<{ ok: boolean; redirectTo: string }>('/api/auth/email', {
      method: 'POST',
      body: event.data,
    });

    await navigateTo(result.redirectTo);
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'Belum bisa masuk. Coba cek nama/email lalu ulangi lagi.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div id="masuk" class="rounded-3xl border border-lime-300/20 bg-black/35 p-4 shadow-2xl shadow-lime-950/30 backdrop-blur-xl">
    <div class="mb-4">
      <div class="text-sm font-semibold text-lime-100">Masuk cepat MVP</div>
      <p class="mt-1 text-xs leading-5 text-white/50">
        Pakai nama dan email dulu. Ini mode testing biar istri/teman bisa coba tanpa GitHub.
      </p>
    </div>

    <UForm :schema="schema" :state="formState" class="flex flex-col gap-3" @submit="onSubmit">
      <UFormGroup name="name">
        <div class="input-container">
          <input v-model="formState.name" placeholder="Nama, contoh: Bunda Sri" autocomplete="name" />
        </div>
      </UFormGroup>

      <UFormGroup name="email">
        <div class="input-container">
          <input v-model="formState.email" placeholder="Email" type="email" autocomplete="email" />
        </div>
      </UFormGroup>

      <p v-if="errorMessage" class="rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-100">
        {{ errorMessage }}
      </p>

      <button type="submit" class="button bg-lime-300 px-4 py-3 font-semibold text-lime-950 hover:bg-lime-200 disabled:cursor-wait disabled:opacity-70" :disabled="loading">
        <UIcon v-if="loading" name="i-heroicons-arrow-path" class="h-5 w-5 animate-spin" />
        <UIcon v-else name="i-heroicons-envelope-20-solid" class="h-5 w-5" />
        {{ loading ? 'Masukin akun...' : 'Masuk & mulai Rutina' }}
      </button>
    </UForm>

    <div class="mt-3 flex items-center gap-2 text-[11px] leading-4 text-white/35">
      <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4 shrink-0" />
      Belum pakai password. Jangan jual public dulu sebelum auth production diganti.
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.input-container {
  @apply relative flex w-full items-center text-white;
}

input {
  box-shadow:
    inset 0.5px 0.5px 1px 0px rgba(255, 255, 255, 0.1),
    inset -0.5px -0.5px 1px 0px rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.2) 0px 3px 10px -5px;
  @apply w-full rounded-2xl bg-white/10 p-4 text-sm outline-none transition-all placeholder:text-white/35;

  &:focus {
    @apply bg-white/15;
  }
}
</style>
