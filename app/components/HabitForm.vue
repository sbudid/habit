<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const { t, tCategory, lang } = useI18n();

const CATEGORIES_MAP: Record<string, { label: string; labelEn: string; icon: string }> = {
  umum: { label: 'Umum', labelEn: 'General', icon: '📋' },
  kesehatan: { label: 'Kesehatan', labelEn: 'Health', icon: '💪' },
  produktivitas: { label: 'Produktivitas', labelEn: 'Productivity', icon: '⚡' },
  belajar: { label: 'Belajar', labelEn: 'Learning', icon: '📚' },
  keuangan: { label: 'Keuangan', labelEn: 'Finance', icon: '💰' },
  sosial: { label: 'Sosial', labelEn: 'Social', icon: '👥' },
  kreativitas: { label: 'Kreativitas', labelEn: 'Creativity', icon: '🎨' },
};

const TARGET_OPTIONS = [
  { value: 7, label: '7' },
  { value: 14, label: '14' },
  { value: 30, label: '30' },
  { value: 40, label: '40' },
  { value: 90, label: '90' },
  { value: 180, label: '180' },
  { value: 365, label: '365' },
];

const schema = z.object({
  title: z.string().min(1, 'title_required').trim(),
  description: z.string().min(1, 'desc_required').trim(),
  habitView: z.boolean(),
  category: z.string(),
  targetDays: z.number(),
});

type Schema = z.output<typeof schema>;

const formState = reactive<Schema>({
  title: '',
  description: '',
  habitView: false,
  category: 'umum',
  targetDays: 40,
});

const queryCache = useQueryCache();
const emit = defineEmits<{ (e: 'habitAdded'): void }>();

const { mutate: addHabit } = useMutation({
  mutation: (data: Schema) => $fetch('/api/habits', { method: 'POST', body: data }) as Promise<Habit>,
  async onSuccess() {
    await queryCache.invalidateQueries({ active: true });
    emit('habitAdded');
  },
  onSettled() {
    formState.title = '';
    formState.description = '';
    formState.category = 'umum';
    formState.targetDays = 40;
  },
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  addHabit(event.data);
}

const habitVisibilityMessage = computed(() => formState.habitView ? t('publicHabitDesc') : t('privateHabitDesc'));
</script>

<template>
  <div class="p-8">
    <UForm :schema="schema" :state="formState" class="flex flex-col gap-4" @submit="onSubmit">
      <UFormGroup name="title">
        <div class="input-container">
          <input v-model="formState.title" :placeholder="t('title')" />
        </div>
      </UFormGroup>
      <UFormGroup name="description">
        <div class="input-container">
          <textarea class="scroll-bar" rows="5" v-model="formState.description" :placeholder="t('desc')"></textarea>
        </div>
      </UFormGroup>
      <UFormGroup name="category">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-semibold text-white">{{ t('category') }}</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(cat, key) in CATEGORIES_MAP"
              :key="key"
              type="button"
              @click="formState.category = key"
              :class="[
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                formState.category === key
                  ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50'
                  : 'bg-white/10 text-white/60 hover:bg-white/15',
              ]">
              <span>{{ cat.icon }}</span>
              <span>{{ lang === 'id' ? cat.label : cat.labelEn }}</span>
            </button>
          </div>
        </div>
      </UFormGroup>
      <UFormGroup name="targetDays">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-semibold text-white">Target hari</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in TARGET_OPTIONS"
              :key="opt.value"
              type="button"
              @click="formState.targetDays = opt.value"
              :class="[
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                formState.targetDays === opt.value
                  ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
                  : 'bg-white/10 text-white/60 hover:bg-white/15',
              ]">
              {{ opt.label }} hari
            </button>
          </div>
        </div>
      </UFormGroup>
      <UFormGroup name="habitView">
        <div class="toggle flex items-center justify-between gap-20">
          <div class="flex flex-col">
            <div class="text-sm font-semibold text-white">{{ t('publicHabit') }}</div>
            <div class="text-xs text-white/60" v-html="habitVisibilityMessage"></div>
          </div>
          <UToggle v-model="formState.habitView" />
        </div>
      </UFormGroup>
      <button type="submit" class="button bg-green-500 px-2.5 py-3 font-semibold text-black/80 outline-none hover:bg-green-400">{{ t('addHabit') }}</button>
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
  box-shadow: inset 0.5px 0.5px 1px 0px rgba(255, 255, 255, 0.1), inset -0.5px -0.5px 1px 0px rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2) 0px 3px 10px -5px;
  @apply w-full rounded-2xl bg-white/10 p-4 outline-none transition-all placeholder:text-white/35;
  &:focus { @apply bg-white/15; }
}
</style>
