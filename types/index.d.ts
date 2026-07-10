interface Day {
  date: string;
}

type Week = Day[];

type CategoryKey = 'umum' | 'kesehatan' | 'produktivitas' | 'belajar' | 'keuangan' | 'sosial' | 'kreativitas';

interface CategoryInfo {
  label: string;
  labelEn: string;
  icon: string;
}

const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  umum: { label: 'Umum', labelEn: 'General', icon: '📋' },
  kesehatan: { label: 'Kesehatan', labelEn: 'Health', icon: '💪' },
  produktivitas: { label: 'Produktivitas', labelEn: 'Productivity', icon: '⚡' },
  belajar: { label: 'Belajar', labelEn: 'Learning', icon: '📚' },
  keuangan: { label: 'Keuangan', labelEn: 'Finance', icon: '💰' },
  sosial: { label: 'Sosial', labelEn: 'Social', icon: '👥' },
  kreativitas: { label: 'Kreativitas', labelEn: 'Creativity', icon: '🎨' },
};
