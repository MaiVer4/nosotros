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

/**
 * Calculates exact elapsed time between start date and now
 */
export function calculateElapsedTime(startDateStr: string): ElapsedTime {
  const start = new Date(startDateStr);
  const now = new Date();

  // Total milliseconds difference
  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Calendar year / month / day calculation
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

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
    // Days in previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
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
 * Calculates countdown to next anniversary on July 11th
 */
export function calculateNextAnniversary(startDateStr: string): CountdownTime {
  const start = new Date(startDateStr);
  const now = new Date();

  const currentYear = now.getFullYear();
  const anniversaryThisYear = new Date(currentYear, start.getMonth(), start.getDate(), 0, 0, 0);

  let targetAnniversary = anniversaryThisYear;
  let anniversaryNumber = currentYear - start.getFullYear();

  // If already passed this year, target next year
  if (now.getTime() > anniversaryThisYear.getTime() + 24 * 60 * 60 * 1000) {
    targetAnniversary = new Date(currentYear + 1, start.getMonth(), start.getDate(), 0, 0, 0);
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
 * Calculates gestation progress or baby's live age
 */
export function calculateDaughterProgress(
  status: 'expecting' | 'born',
  refDateStr: string,
  weeksAtRef: number,
  estimatedDueDateStr: string,
  birthDateStr?: string
) {
  const now = new Date();

  if (status === 'born' && birthDateStr) {
    const birth = new Date(birthDateStr);
    const diffMs = Math.max(0, now.getTime() - birth.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

    const months = Math.floor(totalDays / 30.4375);
    const remainingDays = Math.floor(totalDays % 30.4375);

    return {
      isBorn: true,
      totalDays,
      months,
      remainingDays,
      hours,
      minutes,
    };
  }

  // Expecting calculations
  const refDate = new Date(refDateStr);
  const daysSinceRef = Math.max(0, Math.floor((now.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  const currentTotalDays = weeksAtRef * 7 + daysSinceRef;
  const currentWeeks = Math.floor(currentTotalDays / 7);
  const currentDays = currentTotalDays % 7;

  const dueDate = new Date(estimatedDueDateStr);
  const diffToDueMs = dueDate.getTime() - now.getTime();
  const daysToDue = Math.ceil(diffToDueMs / (1000 * 60 * 60 * 24));

  // Progress percentage out of 40 weeks (280 days)
  const percentage = Math.min(100, Math.round((currentTotalDays / 280) * 100));

  return {
    isBorn: false,
    currentWeeks,
    currentDays,
    daysToDue: Math.max(0, daysToDue),
    percentage,
  };
}
