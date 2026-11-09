export type Member = {
  id: string;
  nickname: string;
};

// Matches the `char_length(nickname) between 1 and 30` check on `public.members`.
export const NICKNAME_MAX_LENGTH = 30;

export type NicknameResult =
  { ok: true; nickname: string } | { ok: false; error: string };

export function parseNickname(raw: FormDataEntryValue | null): NicknameResult {
  const nickname = (typeof raw === "string" ? raw : "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");

  if (!nickname) {
    return { ok: false, error: "Nhập biệt danh." };
  }

  // Count code points, as Postgres `char_length` does, not UTF-16 units.
  if (Array.from(nickname).length > NICKNAME_MAX_LENGTH) {
    return { ok: false, error: "Biệt danh tối đa 30 ký tự." };
  }

  return { ok: true, nickname };
}
