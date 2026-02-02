export type PresetPeriod = 'week' | 'month' | 'year' | 'all';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const formatLocalDate = (date: Date): string => {
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, '0');
  const day: string = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (dateStr: string): string => {
  const date: Date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const getTodayLocalDate = (): string => {
  const now: Date = new Date();
  return formatLocalDate(now);
};

export const getLast7Days = (): string[] => {
  const dates: string[] = [];
  const today: Date = new Date();

  for (let i: number = 0; i < 7; i++) {
    const date: Date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(formatLocalDate(date));
  }

  return dates;
};

export const generateDatesInRange = (
  startDate: string,
  endDate: string,
  reverseOrder: boolean = false,
): string[] => {
  const dates: string[] = [];
  const current: Date = new Date(startDate + 'T00:00:00');
  const end: Date = new Date(endDate + 'T00:00:00');

  while (current <= end) {
    dates.push(formatLocalDate(current));
    current.setDate(current.getDate() + 1);
  }

  return reverseOrder ? dates.reverse() : dates;
};

export const getDateRange = (preset: PresetPeriod): DateRange | null => {
  const today: Date = new Date();

  switch (preset) {
    case 'week': {
      // Sunday to Saturday of current week
      const dayOfWeek: number = today.getDay();
      const sunday: Date = new Date(today);
      sunday.setDate(today.getDate() - dayOfWeek);
      const saturday: Date = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      return {
        startDate: formatLocalDate(sunday),
        endDate: formatLocalDate(saturday),
      };
    }
    case 'month': {
      // First to last day of current month
      const firstOfMonth: Date = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
      const lastOfMonth: Date = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      );
      return {
        startDate: formatLocalDate(firstOfMonth),
        endDate: formatLocalDate(lastOfMonth),
      };
    }
    case 'year': {
      // First to last day of current year
      const firstOfYear: Date = new Date(today.getFullYear(), 0, 1);
      const lastOfYear: Date = new Date(today.getFullYear(), 11, 31);
      return {
        startDate: formatLocalDate(firstOfYear),
        endDate: formatLocalDate(lastOfYear),
      };
    }
    case 'all':
      return null;
  }
};

export const navigateDateRange = (
  presetPeriod: PresetPeriod,
  currentStartDate: string,
  direction: 'prev' | 'next',
): DateRange | null => {
  if (presetPeriod === 'all' || !currentStartDate) return null;

  const currentStart: Date = new Date(currentStartDate + 'T00:00:00');
  const offset: number = direction === 'prev' ? -1 : 1;

  let newStart: Date;
  let newEnd: Date;

  switch (presetPeriod) {
    case 'week': {
      newStart = new Date(currentStart);
      newStart.setDate(currentStart.getDate() + offset * 7);
      newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + 6);
      break;
    }
    case 'month': {
      newStart = new Date(
        currentStart.getFullYear(),
        currentStart.getMonth() + offset,
        1,
      );
      newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
      break;
    }
    case 'year': {
      newStart = new Date(currentStart.getFullYear() + offset, 0, 1);
      newEnd = new Date(currentStart.getFullYear() + offset, 11, 31);
      break;
    }
    default:
      return null;
  }

  return {
    startDate: formatLocalDate(newStart),
    endDate: formatLocalDate(newEnd),
  };
};
