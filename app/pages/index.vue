<script setup lang="ts">
const { user } = useUserSession();

const habitIdeas = [
  'Sholat tepat waktu',
  'Minum air putih',
  'Belajar anak 20 menit',
  'Baca buku sebelum tidur',
  'Olahraga ringan',
  'Journaling syukur',
];

const familyUseCases = [
  {
    icon: 'i-heroicons-heart-20-solid',
    title: 'Untuk keluarga',
    text: 'Pantau rutinitas kecil yang sering kelupaan: minum, tidur, belajar, ibadah, olahraga, dan jadwal rumah.',
  },
  {
    icon: 'i-heroicons-sparkles-20-solid',
    title: 'Nggak ribet',
    text: 'Satu layar, tinggal centang. Cocok buat dipakai pribadi dulu sebelum dibikin versi jualan.',
  },
  {
    icon: 'i-heroicons-chart-bar-square-20-solid',
    title: 'Kelihatan progresnya',
    text: 'Heatmap bikin kebiasaan terasa nyata. Jadi bukan cuma niat Senin doang hahaha.',
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
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-300/40 bg-lime-300 text-2xl shadow-lg shadow-lime-500/20">
            R
          </div>
          <div>
            <div class="text-lg font-semibold leading-none">Rutina</div>
            <div class="mt-1 text-xs text-white/45">Habit keluarga Indonesia</div>
          </div>
        </div>
        <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">MVP lokal</span>
      </div>

      <div class="flex flex-col gap-3">
        <p class="w-fit rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-xs font-medium text-lime-200">
          Biar kebiasaan baik nggak cuma jadi niat doang.
        </p>
        <h1 class="text-4xl font-semibold leading-tight tracking-tight">
          Atur rutinitas harian
          <span class="text-lime-300">pribadi & keluarga</span>
          dalam satu tempat.
        </h1>
        <p class="text-sm leading-6 text-white/60">
          Dari minum air, ibadah, belajar anak, olahraga ringan, sampai rutinitas malam. Simpel, enak dilihat, dan cocok banget buat dikembangin jadi microSaaS Indonesia.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-2xl border border-white/10 bg-white/10 p-3">
          <div class="text-2xl font-semibold">7</div>
          <div class="text-xs text-white/50">hari buat mulai konsisten</div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/10 p-3">
          <div class="text-2xl font-semibold">3</div>
          <div class="text-xs text-white/50">habit gratis nanti</div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <span v-for="idea in habitIdeas" :key="idea" class="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70">
          {{ idea }}
        </span>
      </div>

      <div class="flex flex-col gap-3">
        <div v-for="item in familyUseCases" :key="item.title" class="rounded-3xl border border-white/10 bg-black/20 p-4">
          <div class="mb-2 flex items-center gap-2 text-sm font-semibold">
            <UIcon :name="item.icon" class="h-5 w-5 text-lime-300" />
            {{ item.title }}
          </div>
          <p class="text-xs leading-5 text-white/55">{{ item.text }}</p>
        </div>
      </div>

      <div class="sticky bottom-0 -mx-1 flex flex-col gap-2 rounded-3xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl">
        <a href="/api/auth/github" class="button bg-lime-300 px-4 py-3 font-semibold text-lime-950 hover:bg-lime-200">
          <UIcon name="i-simple-icons-github" class="h-5 w-5" />
          Masuk dulu pakai GitHub
        </a>
        <p class="text-center text-[11px] leading-4 text-white/45">
          Auth ini masih sementara buat MVP. Kalau mau dijual Indonesia, next step-nya ganti ke Google/email login.
        </p>
      </div>
    </div>
  </Card>
</template>
