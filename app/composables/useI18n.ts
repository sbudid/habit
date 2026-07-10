type Lang = 'id' | 'en';

const translations = {
  id: {
    // Landing
    landingTitle: 'Pelacak Kebiasaan',
    landingDesc: 'Alat yang efektif untuk <n>melacak</n> dan mengelola <n>kebiasaan harian</n> Anda',
    loginGithub: 'Masuk dengan GitHub',
    loginGoogle: 'Masuk dengan Google',
    // Profile
    create: 'Buat',
    signIn: 'Masuk',
    noHabits: 'Belum ada kebiasaan',
    noHabitsDesc: 'Buat kebiasaan baru untuk melacak progres Anda',
    noVisible: 'Tidak ada kebiasaan yang terlihat',
    privateAccount: 'bersifat privat',
    // Habit
    completionRate: 'Tingkat Penyelesaian',
    today: 'Hari ini',
    completed: 'Selesai',
    pending: 'Belum',
    undo: 'Urungkan',
    complete: 'Selesai',
    edit: 'Edit',
    delete: 'Hapus',
    cancel: 'Batal',
    save: 'Simpan Perubahan',
    visibility: 'Visibilitas',
    public: 'Publik',
    private: 'Privat',
    confirmDelete: 'Anda yakin?',
    deleteWarning: 'Peringatan: Kebiasaan ini telah diselesaikan selama {{n}} hari. Menghapusnya akan memindahkannya ke tong sampah.',
    typeDelete: 'Untuk mengonfirmasi penghapusan, ketik <strong>HAPUS</strong> di bawah ini.',
    typeDeleteHere: 'Ketik HAPUS di sini...',
    understandDelete: 'Saya mengerti, hapus kebiasaan ini',
    // Form
    titleRequired: 'Judul wajib diisi',
    descRequired: 'Deskripsi wajib diisi',
    title: 'Judul...',
    desc: 'Deskripsi (mendukung Markdown)...',
    category: 'Kategori',
    publicHabit: 'Kebiasaan Publik',
    publicHabitDesc: 'Kebiasaan ini bersifat <strong>publik</strong> dan dapat dilihat oleh semua orang jika akun Anda publik.',
    privateHabitDesc: 'Kebiasaan ini bersifat <strong>privat</strong> dan hanya dapat dilihat oleh Anda.',
    addHabit: 'Tambah Kebiasaan',
    // Stats
    streak: 'Streak',
    best: 'Terbaik',
    total: 'Total',
    lastWeeks: '8 Minggu Terakhir',
    lastMonths: '6 Bulan Terakhir',
    streakStats: 'Streak & Statistik',
    // Profile form
    publicAccount: 'Akun Publik',
    publicAccountDesc: 'Profil Anda bersifat <strong>publik</strong>. Kebiasaan yang diatur sebagai publik dapat dilihat oleh siapa saja.',
    privateAccountDesc: 'Profil Anda bersifat <strong>privat</strong>. Hanya Anda yang dapat melihat kebiasaan Anda.',
    deleteAccount: 'Hapus akun',
    deleteAccountDesc: 'Hapus akun Anda secara permanen, termasuk semua data terkait.',
    deleteMyAccount: 'Hapus akun saya',
    deleteAccountTitle: 'Hapus Akun',
    deletePermanent: 'PERINGATAN: Ini bersifat permanen dan tidak dapat dibatalkan!',
    close: 'Tutup',
    // Dropdown
    reminder: 'Pengingat',
    darkMode: 'Mode gelap',
    signOut: 'Keluar',
    exportData: 'Ekspor Data',
    // Notifications
    dailyReminder: 'Pengingat Harian',
    enableReminder: 'Aktifkan Pengingat',
    reminderDesc: 'Notifikasi harian untuk mengingatkan kebiasaan Anda',
    reminderTime: 'Waktu Pengingat',
    notifUnsupported: 'Browser Anda tidak mendukung notifikasi.',
    notifBlocked: 'Notifikasi diblokir. Silakan izinkan notifikasi di pengaturan browser Anda.',
    reminderTitle: 'Saatnya melacak kebiasaan! 🎯',
    reminderBody: 'Jangan lupa untuk menandai kebiasaan hari ini.',
    // Export
    exportTitle: 'Ekspor Data',
    exportDesc: 'Unduh semua data kebiasaan Anda dalam format JSON atau CSV.',
    exportJSON: 'Ekspor sebagai JSON',
    exportCSV: 'Ekspor sebagai CSV',
    // Trash
    trash: 'Tong Sampah',
    restore: 'Pulihkan',
    trashEmpty: 'Tong sampah kosong',
    expired: 'Kedaluwarsa',
    // 404
    notFound: '404',
    pageNotFound: 'Maaf, halaman ini tidak tersedia.',
    brokenLink: 'Tautan yang Anda ikuti mungkin rusak, atau halaman mungkin telah dihapus.',
    goBack: 'Kembali ke Habit',
    // General
    all: 'Semua',
    categories: { umum: 'Umum', kesehatan: 'Kesehatan', produktivitas: 'Produktivitas', belajar: 'Belajar', keuangan: 'Keuangan', sosial: 'Sosial', kreativitas: 'Kreativitas' },
    // Footer
    by: 'oleh',
    // Language
    language: 'Bahasa',
  },
  en: {
    landingTitle: 'Habit Tracker',
    landingDesc: 'An efficient tool to <n>track</n> and manage your <n>daily habits</n>',
    loginGithub: 'Continue with GitHub',
    loginGoogle: 'Continue with Google',
    create: 'Create',
    signIn: 'Sign in',
    noHabits: 'No habit found',
    noHabitsDesc: 'Create a new habit to track your progress',
    noVisible: 'No visible habits',
    privateAccount: 'account is private',
    completionRate: 'Completion Rate',
    today: 'Today',
    completed: 'Completed',
    pending: 'Pending',
    undo: 'Undo',
    complete: 'Complete',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save changes',
    visibility: 'Visibility',
    public: 'Public',
    private: 'Private',
    confirmDelete: 'Are you sure?',
    deleteWarning: 'Warning: This habit has been completed for {{n}} days. Deleting it will move it to trash.',
    typeDelete: 'To confirm deletion, please type <strong>DELETE</strong> in the box below.',
    typeDeleteHere: 'Type DELETE here...',
    understandDelete: 'I understand, delete this habit',
    titleRequired: 'Title is required',
    descRequired: 'Description is required',
    title: 'Title...',
    desc: 'Description (Markdown supported)...',
    category: 'Category',
    publicHabit: 'Public Habit',
    publicHabitDesc: 'This habit is <strong>public</strong> and visible to everyone if your account is public.',
    privateHabitDesc: 'This habit is <strong>private</strong> and only visible to you.',
    addHabit: 'Add Habit',
    streak: 'Streak',
    best: 'Best',
    total: 'Total',
    lastWeeks: 'Last 8 Weeks',
    lastMonths: 'Last 6 Months',
    streakStats: 'Streak & Stats',
    publicAccount: 'Public Account',
    publicAccountDesc: 'Your profile is <strong>public</strong>. Public habits can be viewed by anyone.',
    privateAccountDesc: 'Your profile is <strong>private</strong>. Only you can view your habits.',
    deleteAccount: 'Delete account',
    deleteAccountDesc: 'Permanently delete your account and all associated data.',
    deleteMyAccount: 'Delete my account',
    deleteAccountTitle: 'Delete Account',
    deletePermanent: 'WARNING: This is permanent and cannot be undone!',
    close: 'Close',
    reminder: 'Reminder',
    darkMode: 'Dark mode',
    signOut: 'Sign out',
    exportData: 'Export Data',
    dailyReminder: 'Daily Reminder',
    enableReminder: 'Enable Reminder',
    reminderDesc: 'Daily notification to remind your habits',
    reminderTime: 'Reminder Time',
    notifUnsupported: 'Your browser does not support notifications.',
    notifBlocked: 'Notifications blocked. Please allow notifications in your browser settings.',
    reminderTitle: 'Time to track your habits! 🎯',
    reminderBody: "Don't forget to mark today's habits.",
    exportTitle: 'Export Data',
    exportDesc: 'Download all your habit data in JSON or CSV format.',
    exportJSON: 'Export as JSON',
    exportCSV: 'Export as CSV',
    trash: 'Trash',
    restore: 'Restore',
    trashEmpty: 'Trash is empty',
    expired: 'Expired',
    notFound: '404',
    pageNotFound: 'Sorry, this page isn\'t available.',
    brokenLink: 'The link you followed may be broken, or the page may have been removed.',
    goBack: 'Go back to Habit',
    all: 'All',
    categories: { umum: 'General', kesehatan: 'Health', produktivitas: 'Productivity', belajar: 'Learning', keuangan: 'Finance', sosial: 'Social', kreativitas: 'Creativity' },
    by: 'by',
    language: 'Language',
  },
} as const;

type Translations = typeof translations.id;
type Key = keyof Translations;

const currentLang = ref<Lang>('id');

export function useI18n() {
  const setLang = async (lang: Lang) => {
    currentLang.value = lang;
    if (import.meta.client) {
      localStorage.setItem('habit_lang', lang);
    }
  };

  const t = (key: Key, params?: Record<string, string | number>): string => {
    let val = translations[currentLang.value][key] as string;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(`{{${k}}}`, String(v));
      });
    }
    return val;
  };

  const tCategory = (cat: string): string => {
    const cats = translations[currentLang.value].categories;
    return (cats as Record<string, string>)[cat] || cat;
  };

  const initLang = (userLang?: string) => {
    if (import.meta.client) {
      const saved = localStorage.getItem('habit_lang') as Lang | null;
      if (saved && (saved === 'id' || saved === 'en')) {
        currentLang.value = saved;
      } else if (userLang && (userLang === 'id' || userLang === 'en')) {
        currentLang.value = userLang;
      }
    }
  };

  return {
    lang: currentLang,
    setLang,
    t,
    tCategory,
    initLang,
  };
}
