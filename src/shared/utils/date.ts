type DateInput = Date | string | number;

const pad = (value: number) => String(value).padStart(2, '0');

/** `2026-11-17T13:45:00+04:00` — local time with offset, used in access logs. */
export function toIsoWithLocalOffset(value: DateInput): string {
  const date = new Date(value);
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);

  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  const offsetPart = `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;

  return `${datePart}T${timePart}${offsetPart}`;
}

/** `Nov 17, 2026` */
export function formatDate(value: DateInput, locale = 'en-US'): string {
  return new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** `Nov 17, 2026, 01:45 PM` */
export function formatDateTime(value: DateInput, locale = 'en-US'): string {
  return new Date(value).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
