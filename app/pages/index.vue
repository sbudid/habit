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

const pricingIdeas = [
  { plan: 'Free', price: 'Rp0', detail: '3 rutinitas aktif untuk mulai coba' },
  { plan: 'Personal', price: 'Rp19rb/bln', detail: 'Habit pribadi tanpa batas ringan' },
  { plan: 'Family', price: 'Rp49rb/bln', detail: 'Nanti bisa untuk pasangan & anak' },
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
        <a href="#masuk" class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 transition hover:bg-white/15">Coba MVP</a>
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

      <EmailLoginForm />

      <div class="grid gap-2">
        <div v-for="item in familyUseCases" :key="item.title" class="rounded-3xl border border-white/10 bg-black/20 p-4">
          <div class="mb-2 flex items-center gap-2 text-sm font-semibold">
            <UIcon :name="item.icon" class="h-5 w-5 text-lime-300" />
            {{ item.title }}
          </div>
          <p class="text-xs leading-5 text-white/55">{{ item.text }}</p>
        </div>
      </div>

      <div class="rounded-3xl border border-white/10 bg-white/10 p-4">
        <div class="mb-3 text-sm font-semibold">Ide harga kalau nanti dijual</div>
        <div class="grid gap-2">
          <div v-for="item in pricingIdeas" :key="item.plan" class="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-3 py-2">
            <div>
              <div class="text-sm font-semibold">{{ item.plan }}</div>
              <div class="text-xs text-white/45">{{ item.detail }}</div>
            </div>
            <div class="text-xs font-semibold text-lime-200">{{ item.price }}</div>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-white/10 bg-black/25 p-3 text-center text-[11px] leading-4 text-white/35">
        GitHub login masih tersedia buat dev/admin:
        <a href="/api/auth/github" class="text-lime-200 underline underline-offset-4">masuk pakai GitHub</a>
      </div>
    </div>
  </Card>
</template>
