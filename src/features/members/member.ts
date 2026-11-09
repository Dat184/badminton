import { nameLength, normalizeName } from "@/lib/names";

export type Member = {
  id: string;
  nickname: string;
};

// Matches the `char_length(nickname) between 1 and 30` check on `public.members`.
export const NICKNAME_MAX_LENGTH = 30;

export type NicknameResult =
  { ok: true; nickname: string } | { ok: false; error: string };

export function parseNickname(raw: FormDataEntryValue | null): NicknameResult {
  const nickname = normalizeName(raw);

  if (!nickname) {
    return { ok: false, error: "Nhập biệt danh." };
  }

  if (nameLength(nickname) > NICKNAME_MAX_LENGTH) {
    return { ok: false, error: "Biệt danh tối đa 30 ký tự." };
  }

  return { ok: true, nickname };
}
