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

const weekdayFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  timeZone: "UTC",
});

export type SessionDateParts = {
  /** `"Thứ Bảy"`, `"Chủ Nhật"` */
  weekday: string;
  day: number;
  month: number;
  year: number;
};

/** `"2026-11-14"` → `{ weekday: "Thứ Bảy", day: 14, month: 11, year: 2026 }` */
export function sessionDateParts(playDate: string): SessionDateParts {
  return {
    weekday: weekdayFormatter.format(new Date(`${playDate}T00:00:00Z`)),
    day: Number(playDate.slice(8, 10)),
    month: Number(playDate.slice(5, 7)),
    year: Number(playDate.slice(0, 4)),
  };
}

/** `"07:30"` → `{ hour: 7, minute: "30" }`: hours unpadded, minutes padded. */
export function startTimeParts(startTime: string): {
  hour: number;
  minute: string;
} {
  return {
    hour: Number(startTime.slice(0, 2)),
    minute: startTime.slice(3, 5),
  };
}

/** Whole days from `from` to `to`, both `YYYY-MM-DD`. */
function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

/** How far a session is from `today`: `"Hôm nay"`, `"Ngày mai"`, `"Còn 3 ngày"`, `"Đã qua"`. */
export function relativeDayLabel(playDate: string, today: string): string {
  const days = daysBetween(today, playDate);
  if (days < 0) {
    return "Đã qua";
  }
  if (days === 0) {
    return "Hôm nay";
  }
  if (days === 1) {
    return "Ngày mai";
  }
  return `Còn ${days} ngày`;
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
