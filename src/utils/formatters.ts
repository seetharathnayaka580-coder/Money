/**
 * Formatting and Financial Calculations for Pathum Sathintha's Money System
 */

export const formatLKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const formatLKRShort = (amount: number): string => {
  if (Math.abs(amount) >= 1000000) {
    return `Rs. ${(amount / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(1)}k`;
  }
  return `Rs. ${amount}`;
};

export interface PayCycleStatus {
  todayDay: number;
  currentDateStr: string;
  // Basic salary (10th)
  daysUntilBasic: number;
  isBasicToday: boolean;
  nextBasicDateStr: string;
  // OT (15th - 20th)
  isOTPeriod: boolean;
  daysUntilOT: number;
  otWindowText: string;
}

export const calculatePayCycles = (currentDate: Date = new Date()): PayCycleStatus => {
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Basic salary is on 10th
  let nextBasicDate = new Date(year, month, 10);
  if (day > 10) {
    nextBasicDate = new Date(year, month + 1, 10);
  }

  const diffTimeBasic = nextBasicDate.getTime() - currentDate.getTime();
  const daysUntilBasic = Math.max(0, Math.ceil(diffTimeBasic / (1000 * 60 * 60 * 24)));
  const isBasicToday = day === 10;

  // OT is received between 15th and 20th
  const isOTPeriod = day >= 15 && day <= 20;
  let nextOTDate = new Date(year, month, 15);
  if (day > 20) {
    nextOTDate = new Date(year, month + 1, 15);
  }
  const diffTimeOT = nextOTDate.getTime() - currentDate.getTime();
  const daysUntilOT = isOTPeriod ? 0 : Math.max(0, Math.ceil(diffTimeOT / (1000 * 60 * 60 * 24)));

  return {
    todayDay: day,
    currentDateStr: currentDate.toLocaleDateString('en-LK', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    daysUntilBasic: isBasicToday ? 0 : daysUntilBasic,
    isBasicToday,
    nextBasicDateStr: nextBasicDate.toLocaleDateString('en-LK', {
      month: 'short',
      day: 'numeric',
    }),
    isOTPeriod,
    daysUntilOT,
    otWindowText: isOTPeriod
      ? 'Active Window (15th–20th)'
      : `Next window starts ${nextOTDate.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })}`,
  };
};
