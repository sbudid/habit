<script setup lang="ts">
type ScheduleType = 'daily' | 'specific_days' | 'times_per_week' | 'interval_days';
interface ScheduleModel {
  scheduleType: ScheduleType;
  scheduleDays: number[];
  weeklyTarget: number;
  intervalDays: number;
  scheduleStartDate: string | null;
}

const props = defineProps<{ modelValue: ScheduleModel }>();
const emit = defineEmits<{ (event: 'update:modelValue', value: ScheduleModel): void }>();

const scheduleOptions: Array<{ value: ScheduleType; label: string; description: string }> = [
  { value: 'daily', label: 'Setiap hari', description: 'Muncul sebagai target setiap hari.' },
  { value: 'specific_days', label: 'Hari tertentu', description: 'Pilih hari aktif Senin–Minggu.' },
  { value: 'times_per_week', label: 'X kali per minggu', description: 'Bebas hari sampai target minggu ini tercapai.' },
  { value: 'interval_days', label: 'Setiap beberapa hari', description: 'Berulang dari tanggal mulai.' },
];
const days = [
  { value: 1, short: 'Sen', label: 'Senin' },
  { value: 2, short: 'Sel', label: 'Selasa' },
  { value: 3, short: 'Rab', label: 'Rabu' },
  { value: 4, short: 'Kam', label: 'Kamis' },
  { value: 5, short: 'Jum', label: 'Jumat' },
  { value: 6, short: 'Sab', label: 'Sabtu' },
  { value: 7, short: 'Min', label: 'Minggu' },
];

function update(patch: Partial<ScheduleModel>) {
  emit('update:modelValue', { ...props.modelValue, ...patch });
}

function toggleDay(day: number) {
  const selected = props.modelValue.scheduleDays.includes(day);
  const scheduleDays = selected ? props.modelValue.scheduleDays.filter(value => value !== day) : [...props.modelValue.scheduleDays, day].sort((a, b) => a - b);
  update({ scheduleDays });
}

function selectScheduleType(scheduleType: ScheduleType) {
  const patch: Partial<ScheduleModel> = { scheduleType };
  if (scheduleType === 'specific_days' && props.modelValue.scheduleDays.length === 0) {
    const browserDay = new Date().getDay();
    patch.scheduleDays = [browserDay === 0 ? 7 : browserDay];
  }
  if (scheduleType === 'interval_days' && !props.modelValue.scheduleStartDate) {
    const now = new Date();
    patch.scheduleStartDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  }
  update(patch);
}
</script>

<template>
  <fieldset class="rounded-2xl border border-white/10 bg-white/5 p-3">
    <legend class="px-1 text-sm font-semibold text-white">Jadwal</legend>

    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="option in scheduleOptions"
        :key="option.value"
        type="button"
        class="min-h-14 rounded-xl border px-3 py-2 text-left transition active:scale-[.98]"
        :class="modelValue.scheduleType === option.value ? 'border-lime-300/60 bg-lime-300/15 text-white' : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10'"
        @click="selectScheduleType(option.value)">
        <span class="block text-xs font-semibold leading-4">{{ option.label }}</span>
        <span class="mt-0.5 block text-[10px] leading-3.5 text-white/45">{{ option.description }}</span>
      </button>
    </div>

    <div v-if="modelValue.scheduleType === 'specific_days'" class="mt-3">
      <div class="mb-2 text-xs text-white/55">Pilih minimal satu hari</div>
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="day in days"
          :key="day.value"
          type="button"
          class="flex min-h-11 min-w-0 items-center justify-center rounded-xl text-[11px] font-semibold transition active:scale-95"
          :class="modelValue.scheduleDays.includes(day.value) ? 'bg-lime-300 text-lime-950' : 'bg-white/10 text-white/65'"
          :aria-label="day.label"
          :aria-pressed="modelValue.scheduleDays.includes(day.value)"
          @click="toggleDay(day.value)">
          {{ day.short }}
        </button>
      </div>
    </div>

    <label v-else-if="modelValue.scheduleType === 'times_per_week'" class="mt-3 flex min-h-11 items-center justify-between gap-4 text-xs text-white/65">
      <span>Target per minggu</span>
      <span class="flex items-center gap-2">
        <input
          :value="modelValue.weeklyTarget"
          type="number"
          inputmode="numeric"
          min="1"
          max="7"
          class="h-11 w-20 rounded-xl bg-white/10 px-3 text-center text-sm font-semibold text-white outline-none"
          @input="update({ weeklyTarget: Number(($event.target as HTMLInputElement).value) })" />
        kali
      </span>
    </label>

    <div v-else-if="modelValue.scheduleType === 'interval_days'" class="mt-3 grid grid-cols-2 gap-2">
      <label class="text-xs text-white/55">
        Ulang setiap
        <span class="mt-1 flex h-11 items-center rounded-xl bg-white/10 px-3">
          <input
            :value="modelValue.intervalDays"
            type="number"
            inputmode="numeric"
            min="2"
            max="365"
            class="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none"
            @input="update({ intervalDays: Number(($event.target as HTMLInputElement).value) })" />
          hari
        </span>
      </label>
      <label class="text-xs text-white/55">
        Mulai tanggal
        <input
          :value="modelValue.scheduleStartDate || ''"
          type="date"
          class="mt-1 h-11 w-full rounded-xl bg-white/10 px-2 text-xs text-white outline-none [color-scheme:dark]"
          @input="update({ scheduleStartDate: ($event.target as HTMLInputElement).value || null })" />
      </label>
    </div>
  </fieldset>
</template>
