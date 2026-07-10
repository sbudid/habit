const notificationPermission = ref<NotificationPermission | 'unsupported'>('default');
const reminderEnabled = ref(false);
const reminderTime = ref('09:00');

if (import.meta.client) {
  notificationPermission.value = 'Notification' in window ? Notification.permission : 'unsupported';

  const saved = localStorage.getItem('habit_reminder');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      reminderEnabled.value = data.enabled ?? false;
      reminderTime.value = data.time ?? '09:00';
    } catch {}
  }
}

let reminderInterval: ReturnType<typeof setInterval> | null = null;

export function useNotifications() {
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    const perm = await Notification.requestPermission();
    notificationPermission.value = perm;
    return perm === 'granted';
  };

  const sendNotification = (title: string, body: string) => {
    if (notificationPermission.value !== 'granted') return;
    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/icon.png',
    });
  };

  const saveReminderSettings = (enabled: boolean, time: string) => {
    reminderEnabled.value = enabled;
    reminderTime.value = time;
    localStorage.setItem('habit_reminder', JSON.stringify({ enabled, time }));

    if (reminderInterval) {
      clearInterval(reminderInterval);
      reminderInterval = null;
    }

    if (enabled) {
      checkAndSchedule();
      reminderInterval = setInterval(checkAndSchedule, 60000);
    }
  };

  const checkAndSchedule = () => {
    if (!reminderEnabled.value) return;
    const now = new Date();
    const [h, m] = reminderTime.value.split(':').map(Number);
    if (now.getHours() === h && now.getMinutes() === m) {
      const { t } = useI18n();
      sendNotification(t('reminderTitle'), t('reminderBody'));
    }
  };

  const initReminder = () => {
    if (reminderInterval) clearInterval(reminderInterval);
    if (reminderEnabled.value) {
      reminderInterval = setInterval(checkAndSchedule, 60000);
    }
  };

  return {
    notificationPermission,
    reminderEnabled,
    reminderTime,
    requestPermission,
    sendNotification,
    saveReminderSettings,
    initReminder,
  };
}
