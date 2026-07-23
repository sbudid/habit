<script setup lang="ts">
const showUpdate = ref(false)
const dismissed = ref(false)

// Track the SW version to avoid re-showing for same update
const DISMISS_KEY = 'rutina-sw-dismissed-version'

if (import.meta.client) {
  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    showUpdate.value = false
    dismissed.value = false
    localStorage.removeItem(DISMISS_KEY)
  })

  const checkSW = async () => {
    if (dismissed.value) return
    const reg = await navigator.serviceWorker?.getRegistration()
    if (!reg?.waiting) return

    // Check if this is a genuinely new SW version, not just OneSignal/Workbox competing
    // Only show banner if the waiting SW is different from active SW
    const activeURL = reg.active?.scriptURL || ''
    const waitingURL = reg.waiting?.scriptURL || ''

    // Same URL → skip waiting silently (minor update cycle)
    if (activeURL === waitingURL) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      return
    }

    // Check if we already dismissed this version
    const dismissedVersion = localStorage.getItem(DISMISS_KEY)
    if (dismissedVersion === waitingURL) return

    showUpdate.value = true
  }

  onMounted(() => {
    checkSW()
    setInterval(checkSW, 60_000)
  })
}

const reload = () => {
  navigator.serviceWorker?.getRegistration().then((reg) => {
    // Remember which SW we're updating to, so we don't re-show
    const waitingURL = reg?.waiting?.scriptURL || ''
    localStorage.setItem(DISMISS_KEY, waitingURL)

    reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  })
  showUpdate.value = false
  dismissed.value = true
  window.location.reload()
}

const dismiss = () => {
  const reg = navigator.serviceWorker?.getRegistration?.()
  // Fire and forget
  Promise.resolve(reg).then((r) => {
    if (r?.waiting?.scriptURL) {
      localStorage.setItem(DISMISS_KEY, r.waiting.scriptURL)
    }
  })
  showUpdate.value = false
  dismissed.value = true
}
</script>

<template>
  <div
    v-if="showUpdate"
    class="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80"
  >
    <UCard class="shadow-2xl">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-primary shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">Update tersedia</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Ada versi baru Rutina.</p>
        </div>
        <div class="flex gap-2">
          <UButton size="sm" variant="ghost" @click="dismiss">
            Nanti
          </UButton>
          <UButton size="sm" @click="reload">
            Update
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
