export interface ElapsedTime {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isToday: boolean;
  anniversaryNumber: number;
}

export interface DaughterProgress {
  isBorn: boolean;
  // Born fields
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  totalDays?: number;
  totalWeeks?: number;
  nextMonthlyNumber?: number;
  daysToNextMonthly?: number;
  isMonthlyToday?: boolean;
  // Expecting fields
  currentWeeks?: number;
  currentDays?: number;
  daysToDue?: number;
  percentage?: number;
}

/**
 * Parses YYYY-MM-DD strings as local midnight (avoiding UTC-5 one-day shift)
 */
export function parseLocalDate(dateStr: string): Date {
  const dateOnlyMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return new Date(dateStr);
}

export function formatSpanishDate(
  dateStr: string,
  monthFormat: 'short' | 'long' = 'short'
): string {
  const dateObj = parseLocalDate(dateStr);
  if (Number.isNaN(dateObj.getTime())) return dateStr;
  return dateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: monthFormat,
    year: 'numeric',
  });
}

function addCalendarMonths(base: Date, monthsToAdd: number): Date {
  const totalMonths = base.getMonth() + monthsToAdd;
  const targetYear = base.getFullYear() + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;
  const maxDayInTarget = new Date(targetYear, targetMonth + 1, 0).getDate();
  const day = Math.min(base.getDate(), maxDayInTarget);
  return new Date(
    targetYear,
    targetMonth,
    day,
    base.getHours(),
    base.getMinutes(),
    base.getSeconds()
  );
}

function calculateCalendarDiff(
  start: Date,
  end: Date
): {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
} {
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (end.getTime() <= start.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
    };
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();
  let minutes = end.getMinutes() - start.getMinutes();
  let seconds = end.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    totalDays,
  };
}

/**
 * Calculates exact elapsed time between start date and now
 */
export function calculateElapsedTime(
  startDateStr: string,
  now: Date = new Date()
): ElapsedTime {
  const start = parseLocalDate(startDateStr);
  return calculateCalendarDiff(start, now);
}

/**
 * Calculates countdown to next anniversary on July 11th
 */
export function calculateNextAnniversary(
  startDateStr: string,
  now: Date = new Date()
): CountdownTime {
  const start = parseLocalDate(startDateStr);

  const currentYear = now.getFullYear();
  const anniversaryThisYear = new Date(
    currentYear,
    start.getMonth(),
    start.getDate(),
    0,
    0,
    0
  );

  let targetAnniversary = anniversaryThisYear;
  let anniversaryNumber = currentYear - start.getFullYear();

  if (now.getTime() > anniversaryThisYear.getTime() + 24 * 60 * 60 * 1000) {
    targetAnniversary = new Date(
      currentYear + 1,
      start.getMonth(),
      start.getDate(),
      0,
      0,
      0
    );
    anniversaryNumber += 1;
  }

  const isToday =
    now.getMonth() === start.getMonth() && now.getDate() === start.getDate();

  const diffMs = Math.max(0, targetAnniversary.getTime() - now.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isToday,
    anniversaryNumber,
  };
}

/**
 * Calculates gestation progress or baby's live calendar age + next cumplemes
 */
export function calculateDaughterProgress(
  status: 'expecting' | 'born',
  refDateStr: string,
  weeksAtRef: number,
  estimatedDueDateStr: string,
  birthDateStr?: string | null,
  now: Date = new Date()
): DaughterProgress {
  if (status === 'born' && birthDateStr) {
    const birth = parseLocalDate(birthDateStr);
    const diff = calculateCalendarDiff(birth, now);
    const completedMonths = diff.years * 12 + diff.months;
    const totalWeeks = Math.floor(diff.totalDays / 7);

    const currentMonthMark = addCalendarMonths(birth, completedMonths);
    const isMonthlyToday =
      completedMonths >= 1 &&
      now.getFullYear() === currentMonthMark.getFullYear() &&
      now.getMonth() === currentMonthMark.getMonth() &&
      now.getDate() === currentMonthMark.getDate();

    const nextMonthlyNumber = completedMonths + 1;
    const nextMonthTarget = addCalendarMonths(birth, nextMonthlyNumber);
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const nextTargetMidnight = new Date(
      nextMonthTarget.getFullYear(),
      nextMonthTarget.getMonth(),
      nextMonthTarget.getDate()
    );
    const daysToNextMonthly = Math.max(
      0,
      Math.round(
        (nextTargetMidnight.getTime() - todayMidnight.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    return {
      isBorn: true,
      years: diff.years,
      months: diff.months,
      days: diff.days,
      hours: diff.hours,
      minutes: diff.minutes,
      seconds: diff.seconds,
      totalDays: diff.totalDays,
      totalWeeks,
      nextMonthlyNumber,
      daysToNextMonthly,
      isMonthlyToday,
    };
  }

  // Expecting calculations
  const refDate = parseLocalDate(refDateStr);
  const daysSinceRef = Math.max(
    0,
    Math.floor((now.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const currentTotalDays = weeksAtRef * 7 + daysSinceRef;
  const currentWeeks = Math.floor(currentTotalDays / 7);
  const currentDays = currentTotalDays % 7;

  const dueDate = parseLocalDate(estimatedDueDateStr);
  const diffToDueMs = dueDate.getTime() - now.getTime();
  const daysToDue = Math.ceil(diffToDueMs / (1000 * 60 * 60 * 24));

  const percentage = Math.min(100, Math.round((currentTotalDays / 280) * 100));

  return {
    isBorn: false,
    currentWeeks,
    currentDays,
    daysToDue: Math.max(0, daysToDue),
    percentage,
  };
}
