<script setup lang="ts">
const { isSupported, permission, reminderTime, setReminder, clearReminder, testNotification, requestPermission } = useNotifications()

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

const handleEnable = async () => {
  await requestPermission()
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-bell" class="w-5 h-5 text-primary" />
        <h3 class="text-lg font-semibold">Pengingat Harian</h3>
      </div>
    </template>

    <div v-if="!isSupported" class="text-sm text-gray-500 dark:text-gray-400">
      Browser kamu tidak mendukung notifikasi. Coba pakai Chrome atau Edge.
    </div>

    <div v-else-if="permission === 'denied'" class="text-sm text-red-500">
      Notifikasi diblokir. Aktifkan di pengaturan browser (Settings → Site Settings → Notifications).
    </div>

    <div v-else class="space-y-4">
      <div v-if="permission === 'default'" class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-500 shrink-0" />
        <div class="flex-1">
          <p class="text-sm text-blue-700 dark:text-blue-300">Aktifkan notifikasi untuk mendapat pengingat harian.</p>
        </div>
        <UButton size="sm" @click="handleEnable">Aktifkan</UButton>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Jam Reminder</label>
          <UInput
            v-model="timeInput"
            type="time"
            class="w-32"
          />
        </div>

        <div v-if="reminderTime" class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
          <span>Aktif setiap hari jam {{ reminderTime }}</span>
        </div>

        <div class="flex gap-2">
          <UButton @click="handleSave" :loading="saving" :color="saved ? 'green' : 'primary'">
            <UIcon :name="saved ? 'i-heroicons-check' : 'i-heroicons-bell'" class="w-4 h-4 mr-1" />
            {{ saved ? 'Tersimpan!' : 'Simpan Reminder' }}
          </UButton>

          <UButton v-if="reminderTime" variant="ghost" color="red" @click="handleClear">
            Matikan
          </UButton>

          <UButton variant="ghost" @click="testNotification">
            Test
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>
