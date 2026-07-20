const REMINDER_KEY = 'rutina-reminder-time';
const NOTIF_PERMISSION_KEY = 'rutina-notif-permission';

export function useNotifications() {
  const reminderTime = useState<string>('reminder-time', () => '');
  const isSupported = useState('notif-supported', () => false);
  const permission = useState<NotificationPermission>('notif-permission', () => 'default');
  const intervalId = useState<ReturnType<typeof setInterval> | null>('notif-interval', () => null);

  const init = () => {
    if (typeof window === 'undefined') return;
    isSupported.value = 'Notification' in window;
    if (!isSupported.value) return;

    permission.value = Notification.permission;
    const saved = localStorage.getItem(REMINDER_KEY);
    if (saved) {
      reminderTime.value = saved;
      startScheduler();
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) return false;
    const result = await Notification.requestPermission();
    permission.value = result;
    return result === 'granted';
  };

  const setReminder = async (time: string) => {
    if (!isSupported.value) return false;

    if (permission.value !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    reminderTime.value = time;
    localStorage.setItem(REMINDER_KEY, time);
    startScheduler();
    return true;
  };

  const clearReminder = () => {
    reminderTime.value = '';
    localStorage.removeItem(REMINDER_KEY);
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  };

  const sendNotification = (title: string, body: string, icon?: string) => {
    if (permission.value !== 'granted') return;
    new Notification(title, {
      body,
      icon: icon || '/avatar-rutina.svg',
      badge: '/avatar-rutina.svg',
      tag: 'rutina-reminder',
      requireInteraction: true,
    });
  };

  const startScheduler = () => {
    if (intervalId.value) clearInterval(intervalId.value);

    // Check every 30 seconds if it's time to send reminder
    intervalId.value = setInterval(() => {
      if (!reminderTime.value) return;

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (currentTime === reminderTime.value) {
        // Check if we already sent today
        const lastSentKey = 'rutina-last-notif-date';
        const today = now.toISOString().split('T')[0];
        const lastSent = localStorage.getItem(lastSentKey);

        if (lastSent !== today) {
          localStorage.setItem(lastSentKey, today);
          sendNotification(
            ' Rutina — Waktunya cek habit!',
            'Jangan lupa tandai habit yang sudah kamu selesaikan hari ini.',
          );
        }
      }
    }, 30_000);
  };

  const testNotification = () => {
    sendNotification(
      ' Rutina — Test Notifikasi',
      'Notifikasi berhasil! Kamu akan dapat reminder setiap hari pada waktu yang dipilih.',
    );
  };

  return {
    reminderTime,
    isSupported,
    permission,
    init,
    requestPermission,
    setReminder,
    clearReminder,
    testNotification,
    sendNotification,
  };
}
