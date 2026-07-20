<script setup lang="ts">
const { user } = useUserSession();

const habitIdeas = [
  'Sholat tepat waktu',
  'Minum air putih',
  'Belajar anak',
  'Olahraga ringan',
];

const features = [
  {
    icon: 'i-heroicons-heart-20-solid',
    title: 'Untuk keluarga',
    text: 'Pantau rutinitas kecil yang sering kelupaan: minum, tidur, belajar, ibadah, olahraga, dan jadwal rumah.',
  },
  {
    icon: 'i-heroicons-sparkles-20-solid',
    title: 'Nggak ribet',
    text: 'Satu layar, tinggal centang. Langsung pakai tanpa tutorial.',
  },
  {
    icon: 'i-heroicons-chart-bar-square-20-solid',
    title: 'Kelihatan progresnya',
    text: 'Heatmap bikin kebiasaan terasa nyata. Bukan cuma niat Senin doang.',
  },
];

watchEffect(async () => {
  if (user.value) {
    await navigateTo(`/${user.value.login}`);
  }
});
</script>

<template>
  <Card class="items-start justify-start gap-6 overflow-y-auto p-6">
    <div class="relative z-10 flex w-full flex-col gap-6">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-300/40 bg-lime-300 text-2xl font-bold text-lime-950 shadow-lg shadow-lime-500/20">
            R
          </div>
          <div>
            <div class="text-lg font-semibold leading-none">Rutina</div>
            <div class="mt-1 text-xs text-white/45">Habit keluarga Indonesia</div>
          </div>
        </div>
        <a href="#masuk" class="rounded-full bg-lime-300 px-4 py-1.5 text-xs font-semibold text-lime-950 transition hover:bg-lime-200">Mulai</a>
      </div>

      <div class="flex flex-col gap-3">
        <h1 class="text-4xl font-semibold leading-tight tracking-tight">
          Atur rutinitas harian
          <span class="text-lime-300">pribadi & keluarga</span>
          dalam satu tempat.
        </h1>
        <p class="text-sm leading-6 text-white/60">
          Dari minum air, ibadah, belajar anak, olahraga ringan, sampai rutinitas malam. Simpel dan enak dilihat.
        </p>
      </div>


      <div class="flex flex-wrap gap-2">
        <span v-for="idea in habitIdeas" :key="idea" class="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70">
          {{ idea }}
        </span>
      </div>

      <a href="/api/auth/google" id="masuk" class="button bg-white/20 px-4 py-2.5 text-center text-sm hover:bg-white/30">
        Masuk dengan Google
      </a>

      <div class="grid gap-2">
        <div v-for="item in features" :key="item.title" class="rounded-3xl border border-white/10 bg-black/20 p-4">
          <div class="mb-2 flex items-center gap-2 text-sm font-semibold">
            <UIcon :name="item.icon" class="h-5 w-5 text-lime-300" />
            {{ item.title }}
          </div>
          <p class="text-xs leading-5 text-white/55">{{ item.text }}</p>
        </div>
      </div>

      <div class="text-center text-[11px] leading-4 text-white/35">
        Rutina · 2026 · Pelacak kebiasaan keluarga Indonesia
      </div>
    </div>
  </Card>
</template>
