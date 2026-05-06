export const APP_TIMEZONE = "America/Sao_Paulo";
export const APP_LOCALE = "pt-BR";

// Memoized formatters for performance
const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const timeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit'
});

const monthYearFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIMEZONE,
  month: 'long',
  year: 'numeric'
});

/**
 * Returns a new Date object representing the current moment in SP timezone
 */
export const getNowSP = () => {
  return new Date(); // JavaScript Date objects are UTC internally, but Intl handles the display/calculation
};

/**
 * Formats a date to DD/MM/YYYY
 */
export const formatDateSP = (date: Date | string | number) => {
  const d = date instanceof Date ? date : new Date(date);
  return dateFormatter.format(d);
};

/**
 * Formats a date to DD/MM/YYYY HH:mm
 */
export const formatDateTimeSP = (date: Date | string | number) => {
  const d = date instanceof Date ? date : new Date(date);
  return dateTimeFormatter.format(d);
};

/**
 * Formats a date to HH:mm
 */
export const formatTimeSP = (date: Date | string | number) => {
  const d = date instanceof Date ? date : new Date(date);
  return timeFormatter.format(d);
};

/**
 * Returns the name of the current month in PT-BR
 */
export const getCurrentMonthSP = (date: Date = getNowSP()) => {
  return monthYearFormatter.format(date);
};

/**
 * Checks if a given date is today in SP timezone
 */
export const isTodaySP = (date: Date | string | number) => {
  const target = date instanceof Date ? date : new Date(date);
  const now = getNowSP();
  return formatDateSP(target) === formatDateSP(now);
};

/**
 * Returns the start of the day for a given date in SP timezone
 */
export const startOfDaySP = (date: Date = getNowSP()) => {
  const d = new Date(date.toLocaleString('en-US', { timeZone: APP_TIMEZONE }));
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Returns the end of the day for a given date in SP timezone
 */
export const endOfDaySP = (date: Date = getNowSP()) => {
  const d = new Date(date.toLocaleString('en-US', { timeZone: APP_TIMEZONE }));
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Returns a range [start, end] for the current month
 */
export const getMonthRangeSP = (date: Date = getNowSP()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Formats relative time (e.g., "há 5 minutos", "ontem")
 */
export const formatRelativeTimeSP = (date: Date | string | number) => {
  const d = date instanceof Date ? date : new Date(date);
  const now = getNowSP();
  const diffSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSeconds < 60) return 'agora mesmo';
  if (diffSeconds < 3600) return `há ${Math.floor(diffSeconds / 60)} min`;
  if (diffSeconds < 86400) return `há ${Math.floor(diffSeconds / 3600)}h`;
  if (diffSeconds < 172800) return 'ontem';
  
  return formatDateSP(d);
};

/**
 * Returns a greeting based on the current hour in SP timezone
 */
export const getGreetingSP = () => {
  const hour = parseInt(new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
    hour: 'numeric',
    hour12: false
  }).format(getNowSP()));

  if (hour >= 5 && hour < 12) return 'Bom dia! ☀️';
  if (hour >= 12 && hour < 18) return 'Boa tarde! 🌤️';
  return 'Boa noite! 🌙';
};
