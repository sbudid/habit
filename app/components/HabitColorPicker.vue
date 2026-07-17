<script setup lang="ts">
import { DEFAULT_HABIT_COLOR, HABIT_COLOR_PRESETS, normalizeHabitColor } from '../utils/habitUi.mjs';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    compact?: boolean;
  }>(),
  {
    modelValue: DEFAULT_HABIT_COLOR,
    compact: false,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const selectedColor = computed(() => normalizeHabitColor(props.modelValue));

function selectColor(color: string) {
  emit('update:modelValue', normalizeHabitColor(color));
}

function selectCustomColor(event: Event) {
  selectColor((event.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="rounded-2xl bg-white/10 p-3">
    <div class="flex items-center justify-between gap-3">
      <div>
        <div class="text-sm font-semibold text-white">Warna rutinitas</div>
        <p v-if="!compact" class="mt-0.5 text-xs text-white/50">Pilih preset atau warna bebas.</p>
      </div>

      <label class="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-white/30">
        <span class="absolute inset-0" :style="{ backgroundColor: selectedColor }"></span>
        <UIcon name="i-heroicons-eye-dropper-20-solid" class="relative h-5 w-5 text-white drop-shadow" />
        <input :value="selectedColor" type="color" class="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Pilih warna bebas" @input="selectCustomColor" />
      </label>
    </div>

    <div class="mt-3 grid grid-cols-5 gap-2">
      <button
        v-for="color in HABIT_COLOR_PRESETS"
        :key="color"
        type="button"
        class="relative h-11 min-w-11 rounded-xl border border-white/15 transition active:scale-90"
        :class="selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : 'hover:brightness-110'"
        :style="{ backgroundColor: color }"
        :aria-label="`Pilih warna ${color}`"
        :aria-pressed="selectedColor === color"
        @click="selectColor(color)">
        <UIcon v-if="selectedColor === color" name="i-heroicons-check-16-solid" class="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
      </button>
    </div>
  </div>
</template>
