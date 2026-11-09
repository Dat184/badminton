// Invisible characters that \s does not match (zero-width space, non-joiner,
// joiner, word joiner) plus the BOM. Left in, a pasted "DatNT​" would pass
// as a different name that looks identical to "DatNT".
const INVISIBLE_CHARACTERS = /[​-‍⁠﻿]/g;

export function normalizeName(raw: FormDataEntryValue | null): string {
  return (typeof raw === "string" ? raw : "")
    .normalize("NFC")
    .replace(INVISIBLE_CHARACTERS, "")
    .trim()
    .replace(/\s+/g, " ");
}

// Count code points, as Postgres `char_length` does, not UTF-16 units.
export function nameLength(value: string): number {
  return Array.from(value).length;
}
