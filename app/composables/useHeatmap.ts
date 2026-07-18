import { format, subDays, isThisYear } from 'date-fns';

interface HeatmapDay {
  date: string;
}
type HeatmapWeek = HeatmapDay[];

export const generateWeeks = (daysCount = 49): HeatmapWeek[] => {
  const days: HeatmapDay[] = Array.from({ length: daysCount }, (_, i) => {
    const date = subDays(new Date(), daysCount - 1 - i);
    return { date: format(date, 'yyyy-MM-dd') };
  });

  const weeks: HeatmapWeek[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
};

export const formatDate = (date: string): string => {
  return isThisYear(new Date(date)) ? format(new Date(date), 'MMMM d') : format(new Date(date), 'MMMM d, yyyy');
};
