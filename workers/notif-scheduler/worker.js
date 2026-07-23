function calculateStreak(completeDays) {
  if (!completeDays || completeDays.length === 0) return 0;
  const sorted = [...completeDays].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Streak must include today or yesterday
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00Z');
    const curr = new Date(sorted[i] + 'T00:00:00Z');
    const diff = (prev - curr) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function streakMessage(streak, habitName) {
  if (streak >= 30) return `🏆 ${habitName} — ${streak} hari berturut! LEGENDA!`;
  if (streak >= 14) return `🔥 ${habitName} — ${streak} hari streak! Luar biasa!`;
  if (streak >= 7) return `⚡ ${habitName} — ${streak} hari streak! Pertahankan!`;
  if (streak >= 3) return `💪 ${habitName} — ${streak} hari streak! Teruskan!`;
  return null;
}

const scheduledMessages = {
  '0 21 * * *': { title: '🌅 Selamat pagi!', body: 'Hari baru, semangat baru — jangan lupa sholat Subuh dan mulai harimu dengan baik.' },
  '0 1 * * *':  { title: '☀️ Pagi Rutina', body: 'Sudah pagi — cek jadwal hari ini dan mulai centang habit pertama!' },
  '0 5 * * *':  { title: '🔥 Jangan lupa!', body: 'Sudah siang — cek habit yang belum dicentang hari ini.' },
  '0 8 * * *':  { title: '🌤️ Sore', body: 'Masih ada waktu — selesaikan habit sebelum hari berakhir!' },
  '0 11 * * *': { title: '🕌 Maghrib reminder', body: 'Waktu Maghrib — sebentar istirahat, perbarui wudhu, dan cek habit hari ini.' },
  '0 14 * * *': { title: '📊 Rekap malam', body: 'Sudah malam — cek berapa habit yang selesai hari ini!' },
};

export default {
  async scheduled(event, env) {
    const msg = scheduledMessages[event.cron];

    // Streak check at 08:00 WIB (cron 0 1 * * *)
    if (event.cron === '0 1 * * *' && env.DB) {
      try {
        const habits = await env.DB.prepare('SELECT id, user_id, title, complete_days FROM habits').all();
        const userStreaks = {};

        for (const h of habits.results || []) {
          let days;
          try { days = JSON.parse(h.complete_days); } catch { continue; }
          const streak = calculateStreak(days);
          if (streak >= 3) {
            if (!userStreaks[h.user_id]) userStreaks[h.user_id] = [];
            userStreaks[h.user_id].push({ title: h.title, streak });
          }
        }

        // Send streak notifications
        for (const [userId, streaks] of Object.entries(userStreaks)) {
          const best = streaks.sort((a, b) => b.streak - a.streak)[0];
          const streakMsg = streakMessage(best.streak, best.title);
          if (!streakMsg) continue;

          await fetch('https://api.onesignal.com/notifications', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${env.ONESIGNAL_REST_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              app_id: env.ONESIGNAL_APP_ID,
              include_external_user_ids: [String(userId)],
              headings: { en: `🎯 Streak ${best.streak} hari!` },
              contents: { en: streakMsg },
              url: 'https://habit-id.pages.dev',
            }),
          });
        }
      } catch (e) {
        console.error('Streak check failed:', e.message);
      }
    }

    // Broadcast scheduled message
    if (msg) {
      const res = await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: env.ONESIGNAL_APP_ID,
          included_segments: ['All'],
          headings: { en: msg.title },
          contents: { en: msg.body },
          url: 'https://habit-id.pages.dev',
        }),
      });
      const data = await res.json();
      console.log(JSON.stringify({ time: new Date().toISOString(), cron: event.cron, title: msg.title, recipients: data.recipients || 0 }));
    }

    return new Response('ok');
  },
};
