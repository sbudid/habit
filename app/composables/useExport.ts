import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function useExport() {
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (habits: Habit[], userName: string) => {
    const data = {
      exportedAt: new Date().toISOString(),
      user: userName,
      habits: habits.map(h => ({
        title: h.title,
        description: h.description,
        category: (h as any).category || 'umum',
        createdAt: h.createdAt,
        completeDays: h.completeDays,
        totalCompletions: h.completeDays.length,
      })),
    };

    const json = JSON.stringify(data, null, 2);
    const filename = `habit-${userName}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    downloadFile(json, filename, 'application/json');
  };

  const exportToCSV = (habits: Habit[], userName: string) => {
    const headers = ['Judul', 'Deskripsi', 'Kategori', 'Tanggal Dibuat', 'Total Hari Selesai', 'Hari Selesai'];
    const rows = habits.map(h => [
      `"${(h.title || '').replace(/"/g, '""')}"`,
      `"${(h.description || '').replace(/"/g, '""')}"`,
      (h as any).category || 'umum',
      format(new Date(h.createdAt), 'd MMMM yyyy', { locale: id }),
      h.completeDays.length,
      `"${h.completeDays.join(', ')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const BOM = '\uFEFF';
    const filename = `habit-${userName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    downloadFile(BOM + csv, filename, 'text/csv;charset=utf-8');
  };

  return {
    exportToJSON,
    exportToCSV,
  };
}
