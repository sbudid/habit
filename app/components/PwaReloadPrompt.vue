<script setup lang="ts">
const showUpdate = ref(false)

// Listen for SW update
if (import.meta.client) {
  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    showUpdate.value = false
  })

  // Check for waiting SW periodically
  const checkSW = async () => {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg?.waiting) {
      showUpdate.value = true
    }
  }
  onMounted(() => {
    checkSW()
    setInterval(checkSW, 60_000)
  })
}

const reload = () => {
  navigator.serviceWorker?.getRegistration().then((reg) => {
    reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  })
  showUpdate.value = false
  window.location.reload()
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
        <UButton size="sm" @click="reload">
          Update
        </UButton>
      </div>
    </UCard>
  </div>
</template>
