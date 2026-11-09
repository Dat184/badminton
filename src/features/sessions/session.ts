import { nameLength, normalizeName } from "@/lib/names";

export type SessionSummary = {
  id: string;
  playDate: string;
  startTime: string | null;
  venue: string | null;
  attendeeCount: number;
};

export type Attendee = {
  id: string;
  memberId: string | null;
  name: string;
  isGuest: boolean;
};

export type SessionDetail = SessionSummary & {
  attendees: Attendee[];
};

export type SessionInput = {
  playDate: string;
  startTime: string | null;
  venue: string | null;
};

export type SessionFormValues = {
  playDate: string;
  startTime: string;
  venue: string;
};

// Matches the `char_length(venue) between 1 and 60` check on `public.sessions`.
export const VENUE_MAX_LENGTH = 60;

// Matches the `char_length(guest_name) between 1 and 30` check on `public.session_attendees`.
export const GUEST_NAME_MAX_LENGTH = 30;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidPlayDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  if (year < 2000 || year > 2100) {
    return false;
  }
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

export function parseSessionForm(
  formData: FormData,
):
  | { ok: true; input: SessionInput }
  | { ok: false; error: string; values: SessionFormValues } {
  const rawPlayDate = formData.get("play_date");
  const rawStartTime = formData.get("start_time");
  const playDate = typeof rawPlayDate === "string" ? rawPlayDate.trim() : "";
  const startTimeRaw =
    typeof rawStartTime === "string" ? rawStartTime.trim() : "";
  const venue = normalizeName(formData.get("venue"));

  const values: SessionFormValues = {
    playDate,
    startTime: startTimeRaw,
    venue,
  };

  if (!playDate) {
    return { ok: false, error: "Chọn ngày.", values };
  }

  if (!isValidPlayDate(playDate)) {
    return { ok: false, error: "Ngày không hợp lệ.", values };
  }

  let startTime: string | null = null;
  if (startTimeRaw) {
    const hhmm = startTimeRaw.slice(0, 5);
    if (!TIME_PATTERN.test(hhmm)) {
      return { ok: false, error: "Giờ không hợp lệ.", values };
    }
    startTime = hhmm;
  }

  if (nameLength(venue) > VENUE_MAX_LENGTH) {
    return { ok: false, error: "Tên sân tối đa 60 ký tự.", values };
  }

  return {
    ok: true,
    input: {
      playDate,
      startTime,
      venue: venue || null,
    },
  };
}

export function parseGuestName(
  raw: FormDataEntryValue | null,
): { ok: true; name: string } | { ok: false; error: string } {
  const name = normalizeName(raw);

  if (!name) {
    return { ok: false, error: "Nhập tên." };
  }

  if (nameLength(name) > GUEST_NAME_MAX_LENGTH) {
    return { ok: false, error: "Tên tối đa 30 ký tự." };
  }

  return { ok: true, name };
}
