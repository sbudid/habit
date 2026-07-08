<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const schema = z.object({
  title: z.string().min(1, 'Nama rutinitas wajib diisi').trim(),
  description: z.string().min(1, 'Catatan singkat wajib diisi').trim(),
  habitView: z.boolean(),
});

type Schema = z.output<typeof schema>;

const formState = reactive<Schema>({
  title: '',
  description: '',
  habitView: false,
});

const quickTemplates = [
  {
    title: 'Sholat tepat waktu',
    description: 'Centang kalau hari ini berhasil menjaga sholat tepat waktu. Mulai dari yang paling realistis dulu, pelan-pelan konsisten.',
  },
  {
    title: 'Minum air putih',
    description: 'Target sederhana: minum air cukup hari ini. Cocok buat reminder badan biar nggak nunggu haus dulu.',
  },
  {
    title: 'Belajar anak 20 menit',
    description: 'Waktu kecil tapi rutin. Bisa membaca, berhitung, hafalan, atau ngobrol fokus tanpa distraksi.',
  },
  {
    title: 'Olahraga ringan',
    description: 'Gerak ringan 10-20 menit. Jalan kaki, stretching, workout pendek, atau main aktif bareng anak.',
  },
];

const queryCache = useQueryCache();

const emit = defineEmits<{
  (e: 'habitAdded'): void;
}>();

const { mutate: addHabit } = useMutation({
  mutation: (data: Schema) => {
    return $fetch('/api/habits', {
      method: 'POST',
      body: data,
    }) as Promise<Habit>;
  },
  async onSuccess() {
    await queryCache.invalidateQueries({ active: true });
    emit('habitAdded');
  },
  onSettled() {
    formState.title = '';
    formState.description = '';
  },
});

function useTemplate(template: { title: string; description: string }) {
  formState.title = template.title;
  formState.description = template.description;
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  addHabit(event.data);
}

const habitVisibilityMessage = computed(() => {
  return formState.habitView
    ? 'Rutinitas ini <strong>publik</strong> kalau profil kamu juga publik.'
    : 'Rutinitas ini <strong>private</strong> dan hanya kamu yang bisa lihat.';
});
</script>

<template>
  <div class="p-8">
    <div class="mb-5 flex flex-col gap-1">
      <div class="text-xl font-semibold">Tambah rutinitas</div>
      <p class="text-xs leading-5 text-white/45">
        Pilih template cepat atau tulis sendiri. Jangan kebanyakan dulu, mulai dari 1-3 habit yang beneran mau dijalani.
      </p>
    </div>

    <div class="mb-4 grid grid-cols-2 gap-2">
      <button
        v-for="template in quickTemplates"
        :key="template.title"
        type="button"
        class="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-left text-xs leading-4 text-white/70 transition hover:bg-white/15"
        @click="useTemplate(template)">
        {{ template.title }}
      </button>
    </div>

    <UForm :schema="schema" :state="formState" class="flex flex-col gap-4" @submit="onSubmit">
      <UFormGroup name="title">
        <div class="input-container">
          <input v-model="formState.title" placeholder="Nama rutinitas..." />
        </div>
      </UFormGroup>

      <UFormGroup name="description">
        <div class="input-container">
          <textarea
            v-model="formState.description"
            class="scroll-bar"
            rows="5"
            placeholder="Catatan singkat. Contoh: centang kalau berhasil jalan kaki 15 menit hari ini..." />
        </div>
      </UFormGroup>

      <UFormGroup name="habitView">
        <div class="toggle flex items-center justify-between gap-6">
          <div class="flex flex-col">
            <div class="text-sm font-semibold text-white">Tampilkan ke publik</div>
            <div class="text-xs text-white/60" v-html="habitVisibilityMessage"></div>
          </div>
          <UToggle v-model="formState.habitView" />
        </div>
      </UFormGroup>

      <button type="submit" class="button bg-lime-300 px-2.5 py-3 font-semibold text-lime-950 outline-none hover:bg-lime-200">
        Simpan rutinitas
      </button>
    </UForm>
  </div>
</template>

<style lang="postcss" scoped>
.input-container {
  @apply relative flex w-full items-center text-white;
}

input,
textarea,
.toggle {
  box-shadow:
    inset 0.5px 0.5px 1px 0px rgba(255, 255, 255, 0.1),
    inset -0.5px -0.5px 1px 0px rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.2) 0px 3px 10px -5px;
  @apply w-full rounded-2xl bg-white/10 p-4 outline-none transition-all placeholder:text-white/35;

  &:focus {
    @apply bg-white/15;
  }
}
</style>
