<script setup lang="ts">
const { isSupported, permission, reminderTime, setReminder, clearReminder, testNotification, requestPermission, lastError } = useNotifications()

const timeInput = ref(reminderTime.value || '08:00')
const saving = ref(false)
const saved = ref(false)

const handleSave = async () => {
  saving.value = true
  const ok = await setReminder(timeInput.value)
  saving.value = false
  if (ok) {
    saved.value = true
    setTimeout(() => saved.value = false, 2000)
  }
}

const handleClear = () => {
  clearReminder()
  timeInput.value = '08:00'
}

const notifSchedule = [
  { icon: '🌅', time: 'Jam yang dipilih', desc: 'Pesan random pagi hari — variasi setiap hari' },
  { icon: '☀️', time: '12:00', desc: 'Pengingat tengah hari — cek habit yang belum selesai' },
  { icon: '📊', time: '21:00', desc: 'Rekap harian — progres hari ini + streak' },
]
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-bell" class="w-5 h-5 text-primary" />
        <h3 class="text-lg font-semibold">Pengingat Harian</h3>
      </div>
    </template>

    <!-- Not supported -->
    <div v-if="!isSupported" class="space-y-3">
      <div class="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500 shrink-0" />
        <p class="text-sm text-red-700 dark:text-red-300">
          Browser ini tidak mendukung notifikasi. Coba buka pakai <strong>Chrome</strong> atau <strong>Edge</strong>.
        </p>
      </div>
    </div>

    <!-- Permission denied -->
    <div v-else-if="permission === 'denied'" class="space-y-3">
      <div class="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <UIcon name="i-heroicons-no-symbol" class="w-5 h-5 text-red-500 shrink-0" />
        <div class="flex-1">
          <p class="text-sm font-medium text-red-700 dark:text-red-300">Notifikasi diblokir</p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-1">
            Untuk mengaktifkan:<br>
            1. Klik ikon gembok 🔒 di address bar<br>
            2. Cari "Notifications"<br>
            3. Ganti ke "Allow"<br>
            4. Refresh halaman
          </p>
        </div>
      </div>
    </div>

    <!-- Default (not yet granted) -->
    <div v-else-if="permission === 'default'" class="space-y-3">
      <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-500 shrink-0" />
        <div class="flex-1">
          <p class="text-sm text-blue-700 dark:text-blue-300">Aktifkan notifikasi untuk mendapat pengingat harian.</p>
        </div>
      </div>
      <UButton @click="requestPermission" color="primary" block>
        <UIcon name="i-heroicons-bell" class="w-4 h-4 mr-2" />
        Aktifkan Notifikasi
      </UButton>
      <UButton @click="testNotification" variant="ghost" block>
        Coba Test Dulu
      </UButton>
    </div>

    <!-- Granted — show settings -->
    <div v-else class="space-y-5">
      <!-- Jadwal notifikasi -->
      <div>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Jadwal Notifikasi</p>
        <div class="space-y-2">
          <div v-for="item in notifSchedule" :key="item.icon" class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <span class="text-lg">{{ item.icon }}</span>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-medium">{{ item.time }}</span>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Jam reminder pagi -->
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Jam Reminder</label>
        <UInput v-model="timeInput" type="time" class="w-32" />
      </div>

      <div v-if="reminderTime" class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
        <span>Aktif setiap hari jam {{ reminderTime }} + siang (12:00) + malam (21:00)</span>
      </div>

      <!-- Streak info -->
      <div class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <p class="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
          🔥 Notifikasi Streak
        </p>
        <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Kamu akan dapat notif khusus saat streak 3, 7, 14, 21, atau 30 hari!
        </p>
      </div>

      <div class="flex gap-2">
        <UButton @click="handleSave" :loading="saving" :color="saved ? 'green' : 'primary'">
          <UIcon :name="saved ? 'i-heroicons-check' : 'i-heroicons-bell'" class="w-4 h-4 mr-1" />
          {{ saved ? 'Tersimpan!' : 'Simpan' }}
        </UButton>

        <UButton v-if="reminderTime" variant="ghost" color="red" @click="handleClear">
          Matikan
        </UButton>

        <UButton variant="ghost" @click="testNotification">
          Test
        </UButton>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="lastError" class="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <p class="text-xs text-red-600 dark:text-red-400">{{ lastError }}</p>
    </div>
  </UCard>
</template>
