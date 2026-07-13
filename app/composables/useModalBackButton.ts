import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue';

/**
 * Membuat tombol Back browser/Android menutup modal terlebih dahulu,
 * bukan langsung meninggalkan aplikasi.
 */
export function useModalBackButton(isOpen: Ref<boolean>) {
  if (import.meta.server) return;

  let ownsHistoryEntry = false;

  const handlePopState = () => {
    if (!isOpen.value) return;

    ownsHistoryEntry = false;
    isOpen.value = false;
  };

  onMounted(() => {
    window.addEventListener('popstate', handlePopState);
  });

  watch(
    isOpen,
    (open) => {
      if (open && !ownsHistoryEntry) {
        window.history.pushState(
          {
            ...(window.history.state ?? {}),
            rutinaModalOpen: true,
          },
          '',
        );

        ownsHistoryEntry = true;
        return;
      }

      if (!open && ownsHistoryEntry) {
        ownsHistoryEntry = false;
        window.history.back();
      }
    },
    { flush: 'sync' },
  );

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', handlePopState);
  });
}
