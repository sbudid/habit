const REMINDER_KEY = 'rutina-reminder-time';
const EVENING_KEY = 'rutina-evening-time';

interface HabitData {
  title: string;
  completeDays: string[];
}

export function useNotifications() {
  const reminderTime = useState<string>('reminder-time', () => '');
  const eveningTime = useState<string>('evening-time', () => '21:00');
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

  const sendNotification = (title: string, body: string) => {
    if (permission.value !== 'granted') return;
    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'rutina-reminder',
      requireInteraction: false,
    });
  };

  // ── Pesan pagi random ──
  const morningMessages = [
    { title: '☀️ Selamat pagi!', body: 'Yuk mulai hari dengan habit pertama. Kecil tapi konsisten!' },
    { title: '🌅 Pagi yang fresh!', body: 'Jangan lupa centang habit hari ini ya.' },
    { title: '💪 Siap produktif?', body: 'Mulai dari yang paling gampang dulu. Kamu bisa!' },
    { title: '🔥 Hari baru, kesempatan baru', body: 'Satu habit selesai = satu langkah maju.' },
    { title: '⭐ Morning check-in', body: 'Cek list habit kamu dan mulai yang pertama!' },
    { title: '🎯 Fokus hari ini', body: 'Berapa habit yang bisa kamu selesaikan hari ini?' },
    { title: '🌿 Waktunya bergerak', body: 'Habit kecil setiap hari = perubahan besar setahun.' },
  ];

  // ── Pesan siang/sore (pengingat tengah hari) ──
  const middayMessages = [
    { title: '🔥 Jangan lupa!', body: 'Sudah siang — cek habit yang belum dicentang.' },
    { title: '⚡ Masih ada waktu', body: 'Beberapa habit belum selesai. Yuk diselesaikan!' },
    { title: '📋 Quick check', body: 'Sisa hari ini masih cukup untuk menyelesaikan habit.' },
  ];

  // ── Pesan streak ──
  const getStreakMessage = (streak: number): { title: string; body: string } | null => {
    if (streak >= 30) return { title: '🏆 30 HARI!', body: 'Sebulan penuh konsisten! Kamu luar biasa!' };
    if (streak >= 21) return { title: '🎯 21 hari!', body: 'Katanya 21 hari buat bikin kebiasaan. Kamu sudah di jalur yang benar!' };
    if (streak >= 14) return { title: '🔥 2 minggu!', body: 'Dua minggu berturut-turut! Pertahanin!' };
    if (streak >= 7) return { title: '⚡ 1 minggu!', body: 'Tujuh hari berturut-turut! Momentum bagus!' };
    if (streak >= 3) return { title: '💪 ' + streak + ' hari!', body: 'Mulai terbentuk! Terus lanjut ya.' };
    return null;
  };

  // ── Hitung streak dari completeDays ──
  const calculateStreak = (completeDays: string[]): number => {
    if (!completeDays.length) return 0;
    const sorted = [...completeDays].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Streak harus dimulai dari hari ini atau kemarin
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 0;
    let checkDate = sorted[0] === today ? new Date() : new Date(Date.now() - 86400000);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sorted.includes(dateStr)) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
    return streak;
  };

  // ── Rekap malam ──
  const getEveningRecap = (habits: HabitData[]): { title: string; body: string } => {
    const today = new Date().toISOString().split('T')[0];
    const total = habits.length;
    const done = habits.filter(h => h.completeDays.includes(today)).length;

    if (total === 0) return { title: '📊 Hari ini', body: 'Belum ada habit yang diatur. Yuk tambah habit baru!' };
    if (done === total) return { title: '🎉 Sempurna!', body: `Semua ${total} habit selesai hari ini! Besok lanjut ya!` };
    if (done >= total * 0.7) return { title: '📊 Hampir sempurna!', body: `${done}/${total} habit selesai. Tinggal sedikit lagi!` };
    if (done > 0) return { title: '📊 Rekap hari ini', body: `${done}/${total} habit selesai. Besok coba lebih banyak ya!` };
    return { title: '📊 Hari ini', body: `Belum ada habit yang dicentang. Masih ada waktu sebelum tidur!` };
  };

  const startScheduler = () => {
    if (intervalId.value) clearInterval(intervalId.value);

    let lastMorning = '';
    let lastMidday = '';
    let lastEvening = '';

    intervalId.value = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];

      // ── Morning reminder ──
      if (reminderTime.value && currentTime === reminderTime.value && lastMorning !== today) {
        lastMorning = today;
        const msg = morningMessages[Math.floor(Math.random() * morningMessages.length)];
        sendNotification(msg.title, msg.body);
      }

      // ── Midday reminder (12:00) ──
      if (currentTime === '12:00' && lastMidday !== today) {
        lastMidday = today;
        const msg = middayMessages[Math.floor(Math.random() * middayMessages.length)];
        sendNotification(msg.title, msg.body);
      }

      // ── Evening recap (21:00) ──
      if (currentTime === '21:00' && lastEvening !== today) {
        lastEvening = today;
        // Try to get habits from global store or localStorage
        try {
          const habitsRaw = localStorage.getItem('rutina-habits');
          const habits: HabitData[] = habitsRaw ? JSON.parse(habitsRaw) : [];
          const recap = getEveningRecap(habits);
          sendNotification(recap.title, recap.body);

          // Also check streaks
          for (const habit of habits) {
            const streak = calculateStreak(habit.completeDays);
            const streakMsg = getStreakMessage(streak);
            if (streakMsg) {
              setTimeout(() => sendNotification(streakMsg.title, streakMsg.body), 3000);
              break; // Only send one streak notification
            }
          }
        } catch {
          // Ignore errors
        }
      }
    }, 30_000);
  };

  const testNotification = () => {
    sendNotification(
      ' Rutina — Test Notifikasi',
      'Notifikasi berhasil! Kamu akan dapat reminder pagi, siang, dan rekap malam.',
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
    getEveningRecap,
    calculateStreak,
    getStreakMessage,
  };
}
