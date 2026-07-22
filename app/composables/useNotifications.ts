const REMINDER_KEY = 'rutina-reminder-time';

interface HabitData {
  title: string;
  completeDays: string[];
}

export function useNotifications() {
  const reminderTime = useState<string>('reminder-time', () => '');
  const isSupported = useState('notif-supported', () => false);
  const permission = useState<NotificationPermission>('notif-permission', () => 'default');
  const intervalId = useState<ReturnType<typeof setInterval> | null>('notif-interval', () => null);
  const lastError = useState<string>('notif-error', () => '');

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
    lastError.value = '';

    if (!('Notification' in window)) {
      lastError.value = 'Browser ini tidak mendukung notifikasi. Coba pakai Chrome/Edge di HP atau laptop.';
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      permission.value = result;

      if (result === 'denied') {
        lastError.value = 'Notifikasi ditolak. Untuk mengaktifkan: buka Settings browser → Site Settings → Notifications → izinkan situs ini.';
        return false;
      }

      if (result === 'default') {
        lastError.value = 'Popup ditutup tanpa izin. Klik "Aktifkan" lagi dan pilih "Izinkan".';
        return false;
      }

      return result === 'granted';
    } catch (err: any) {
      lastError.value = `Error: ${err?.message || 'Gagal meminta izin notifikasi'}`;
      return false;
    }
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

  const sendNotification = async (title: string, body: string) => {
    if (permission.value !== 'granted') return;
    try {
      // PWA standalone mode requires ServiceWorkerRegistration.showNotification()
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: '/icon.png',
          badge: '/icon.png',
          tag: 'rutina-reminder',
        });
      } else {
        new Notification(title, { body, icon: '/icon.png', tag: 'rutina-reminder' });
      }
    } catch (err: any) {
      lastError.value = `Gagal kirim notifikasi: ${err?.message}`;
    }
  };

  const morningMessages = [
    { title: '☀️ Selamat pagi!', body: 'Yuk mulai hari dengan habit pertama. Kecil tapi konsisten!' },
    { title: '🌅 Pagi yang fresh!', body: 'Jangan lupa centang habit hari ini ya.' },
    { title: '💪 Siap produktif?', body: 'Mulai dari yang paling gampang dulu. Kamu bisa!' },
    { title: '🔥 Hari baru, kesempatan baru', body: 'Satu habit selesai = satu langkah maju.' },
    { title: '⭐ Morning check-in', body: 'Cek list habit kamu dan mulai yang pertama!' },
    { title: '🎯 Fokus hari ini', body: 'Berapa habit yang bisa kamu selesaikan hari ini?' },
    { title: '🌿 Waktunya bergerak', body: 'Habit kecil setiap hari = perubahan besar setahun.' },
  ];

  const middayMessages = [
    { title: '🔥 Jangan lupa!', body: 'Sudah siang — cek habit yang belum dicentang.' },
    { title: '⚡ Masih ada waktu', body: 'Beberapa habit belum selesai. Yuk diselesaikan!' },
    { title: '📋 Quick check', body: 'Sisa hari ini masih cukup untuk menyelesaikan habit.' },
  ];

  const getStreakMessage = (streak: number): { title: string; body: string } | null => {
    if (streak >= 30) return { title: '🏆 30 HARI!', body: 'Sebulan penuh konsisten! Kamu luar biasa!' };
    if (streak >= 21) return { title: '🎯 21 hari!', body: 'Katanya 21 hari buat bikin kebiasaan. Kamu sudah di jalur yang benar!' };
    if (streak >= 14) return { title: '🔥 2 minggu!', body: 'Dua minggu berturut-turut! Pertahanin!' };
    if (streak >= 7) return { title: '⚡ 1 minggu!', body: 'Tujuh hari berturut-turut! Momentum bagus!' };
    if (streak >= 3) return { title: '💪 ' + streak + ' hari!', body: 'Mulai terbentuk! Terus lanjut ya.' };
    return null;
  };

  const calculateStreak = (completeDays: string[]): number => {
    if (!completeDays.length) return 0;
    const sorted = [...completeDays].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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

  const syncHabits = (habits: HabitData[]) => {
    try {
      localStorage.setItem('rutina-habits', JSON.stringify(habits));
    } catch {}
  };

  const getEveningRecap = (habits?: HabitData[]): { title: string; body: string } => {
    const data = habits || (() => {
      try {
        const raw = localStorage.getItem('rutina-habits');
        return raw ? JSON.parse(raw) as HabitData[] : [];
      } catch { return []; }
    })();
    const today = new Date().toISOString().split('T')[0];
    const total = data.length;
    const done = data.filter(h => h.completeDays.includes(today)).length;

    if (total === 0) return { title: '📊 Hari ini', body: 'Belum ada habit yang diatur. Yuk tambah habit baru!' };
    if (done === total) return { title: '🎉 Sempurna!', body: `Semua ${total} habit selesai hari ini! Besok lanjut ya!` };
    if (done >= total * 0.7) return { title: '📊 Hampir sempurna!', body: `${done}/${total} habit selesai. Tinggal sedikit lagi!` };
    if (done > 0) return { title: '📊 Rekap hari ini', body: `${done}/${total} habit selesai. Besok coba lebih banyak ya!` };
    return { title: '📊 Hari ini', body: 'Belum ada habit yang dicentang. Masih ada waktu sebelum tidur!' };
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

      if (reminderTime.value && currentTime === reminderTime.value && lastMorning !== today) {
        lastMorning = today;
        const msg = morningMessages[Math.floor(Math.random() * morningMessages.length)];
        sendNotification(msg.title, msg.body);
      }

      if (currentTime === '12:00' && lastMidday !== today) {
        lastMidday = today;
        const msg = middayMessages[Math.floor(Math.random() * middayMessages.length)];
        sendNotification(msg.title, msg.body);
      }

      if (currentTime === '21:00' && lastEvening !== today) {
        lastEvening = today;
        try {
          const recap = getEveningRecap();
          sendNotification(recap.title, recap.body);

          try {
            const raw = localStorage.getItem('rutina-habits');
            const habits: HabitData[] = raw ? JSON.parse(raw) : [];
            for (const habit of habits) {
              const streak = calculateStreak(habit.completeDays);
              const streakMsg = getStreakMessage(streak);
              if (streakMsg) {
                setTimeout(() => sendNotification(streakMsg.title, streakMsg.body), 3000);
                break;
              }
            }
          } catch {}
        } catch {}
      }
    }, 30_000);
  };

  const testNotification = async () => {
    lastError.value = '';

    // Step 1: Check browser support
    if (!('Notification' in window)) {
      lastError.value = 'Browser tidak mendukung notifikasi. Pakai Chrome atau Edge.';
      alert(lastError.value);
      return;
    }

    // Step 2: Request permission if needed
    if (Notification.permission !== 'granted') {
      const result = await Notification.requestPermission();
      permission.value = result;

      if (result === 'denied') {
        lastError.value = 'Notifikasi ditolak oleh browser.';
        alert('Notifikasi ditolak. Untuk mengaktifkan:\n\n1. Klik ikon gembok/kunci di address bar\n2. Cari "Notifications"\n3. Ganti ke "Allow"\n4. Refresh halaman ini');
        return;
      }

      if (result !== 'granted') {
        lastError.value = 'Izinkan notifikasi untuk melanjutkan.';
        return;
      }
    }

    // Step 3: Send test notification
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) {
        await reg.showNotification(' Rutina — Test Notifikasi', {
          body: 'Berhasil! Kamu akan dapat reminder pagi, siang, dan rekap malam.',
          icon: '/icon.png',
          tag: 'rutina-test',
        });
      } else {
        new Notification(' Rutina — Test Notifikasi', {
          body: 'Berhasil! Kamu akan dapat reminder pagi, siang, dan rekap malam.',
          icon: '/icon.png',
          tag: 'rutina-test',
        });
      }
    } catch (err: any) {
      lastError.value = `Gagal kirim: ${err?.message}`;
      alert(`Gagal kirim notifikasi: ${err?.message}`);
    }
  };

  return {
    reminderTime,
    isSupported,
    permission,
    lastError,
    init,
    requestPermission,
    setReminder,
    clearReminder,
    testNotification,
    sendNotification,
    syncHabits,
    getEveningRecap,
    calculateStreak,
    getStreakMessage,
  };
}
