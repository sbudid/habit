import { parseISO, differenceInDays, compareAsc, format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, subMonths, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';

export function useStats() {
  const getStreak = (completeDays: string[]): number => {
    if (completeDays.length === 0) return 0;

    const sorted = completeDays.slice().sort((a, b) => compareAsc(parseISO(a), parseISO(b)));
    let streak = 1;
    let maxStreak = 1;

    for (let i = sorted.length - 1; i > 0; i--) {
      const diff = differenceInDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
      if (diff === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else if (diff > 1) {
        break;
      }
    }

    // Cek apakah streak masih aktif (hari ini atau kemarin)
    const lastDay = parseISO(sorted[sorted.length - 1]);
    const today = new Date();
    const diffToToday = differenceInDays(today, lastDay);
    if (diffToToday > 1) return 0;

    return streak;
  };

  const getMaxStreak = (completeDays: string[]): number => {
    if (completeDays.length === 0) return 0;

    const sorted = completeDays.slice().sort((a, b) => compareAsc(parseISO(a), parseISO(b)));
    let streak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
      if (diff === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else if (diff > 1) {
        streak = 1;
      }
    }

    return maxStreak;
  };

  const getWeeklyData = (completeDays: string[], weeksCount = 8) => {
    const result: { label: string; count: number }[] = [];
    const today = new Date();

    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

      const count = completeDays.filter(day =>
        daysInWeek.some(d => format(d, 'yyyy-MM-dd') === day)
      ).length;

      result.push({
        label: format(weekStart, 'd MMM', { locale: id }),
        count,
      });
    }

    return result;
  };

  const getMonthlyData = (completeDays: string[], monthsCount = 6) => {
    const result: { label: string; count: number }[] = [];
    const today = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const count = completeDays.filter(day => {
        const d = parseISO(day);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      }).length;

      result.push({
        label: format(monthDate, 'MMM yyyy', { locale: id }),
        count,
      });
    }

    return result;
  };

  const getTotalCompletions = (completeDays: string[]): number => completeDays.length;

  const getCompletionRate = (completeDays: string[], totalDays = 30): number => {
    if (totalDays === 0) return 0;
    const recentDays = completeDays.filter(day => {
      const diff = differenceInDays(new Date(), parseISO(day));
      return diff >= 0 && diff < totalDays;
    });
    return Math.round((recentDays.length / totalDays) * 100);
  };

  return {
    getStreak,
    getMaxStreak,
    getWeeklyData,
    getMonthlyData,
    getTotalCompletions,
    getCompletionRate,
  };
}
