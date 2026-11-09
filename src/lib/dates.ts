const vietnamDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
});

const sessionDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/** Current calendar date in Vietnam (`YYYY-MM-DD`). Callers must be at request time. */
export function todayInVietnam(): string {
  return vietnamDateFormatter.format(new Date());
}

/** `"2026-11-14"` → `"Thứ Bảy, 14/11/2026"` */
export function formatSessionDate(playDate: string): string {
  return sessionDateFormatter.format(new Date(`${playDate}T00:00:00Z`));
}

export function formatSessionWhen(s: {
  playDate: string;
  startTime: string | null;
  venue: string | null;
}): string {
  return [formatSessionDate(s.playDate), s.startTime, s.venue]
    .filter(Boolean)
    .join(" · ");
}
