export function useSupporter() {
  const isSupporter = useState('is-supporter', () => false);
  const loading = useState('supporter-loading', () => true);

  const checkStatus = async () => {
    try {
      const data = await $fetch('/api/support/status');
      isSupporter.value = data?.isSupporter || false;
    } catch {
      isSupporter.value = false;
    } finally {
      loading.value = false;
    }
  };

  const goToSupport = () => {
    window.location.href = '/api/support/create';
  };

  return { isSupporter, loading, checkStatus, goToSupport };
}
