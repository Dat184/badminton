"use server";

import { refresh } from "next/cache";
import { parseNickname } from "@/features/members/member";
import { requireHost } from "@/server/auth";
import {
  archiveMember,
  insertMember,
  type MemberWriteResult,
  updateMemberNickname,
} from "@/server/members";

export type NicknameFormState = {
  error: string | null;
  nickname: string;
  saved: boolean;
};

export type RemoveMemberState = {
  error: string | null;
};

const NOT_FOUND_MESSAGE = "Thành viên này không còn trong danh sách.";

function failureMessage(
  result: Extract<MemberWriteResult, { ok: false }>,
): string {
  switch (result.reason) {
    case "duplicate":
      return "Biệt danh này đã có trong danh sách.";
    case "not_found":
      return NOT_FOUND_MESSAGE;
    default:
      return "Không lưu được, vui lòng thử lại.";
  }
}

function typedValue(raw: FormDataEntryValue | null): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function readId(formData: FormData): string {
  const raw = formData.get("id");
  return typeof raw === "string" ? raw : "";
}

export async function addMember(
  _prevState: NicknameFormState,
  formData: FormData,
): Promise<NicknameFormState> {
  await requireHost();

  const raw = formData.get("nickname");
  const parsed = parseNickname(raw);
  if (!parsed.ok) {
    return { error: parsed.error, nickname: typedValue(raw), saved: false };
  }

  const result = await insertMember(parsed.nickname);
  if (!result.ok) {
    if (result.reason === "duplicate") {
      // The duplicate may have been added in another tab: show it here too.
      // The add form stays mounted, so its error survives the refresh.
      refresh();
    }
    return {
      error: failureMessage(result),
      nickname: parsed.nickname,
      saved: false,
    };
  }

  refresh();
  return { error: null, nickname: "", saved: true };
}

export async function renameMember(
  _prevState: NicknameFormState,
  formData: FormData,
): Promise<NicknameFormState> {
  await requireHost();

  const raw = formData.get("nickname");
  const parsed = parseNickname(raw);
  if (!parsed.ok) {
    return { error: parsed.error, nickname: typedValue(raw), saved: false };
  }

  const id = readId(formData);
  if (!id) {
    return {
      error: NOT_FOUND_MESSAGE,
      nickname: parsed.nickname,
      saved: false,
    };
  }

  const result = await updateMemberNickname(id, parsed.nickname);
  if (!result.ok) {
    if (result.reason === "duplicate") {
      // Same as addMember: surface a member added in another tab. This row is
      // still active, so it stays mounted in edit mode and keeps its error.
      refresh();
    }
    return {
      error: failureMessage(result),
      nickname: parsed.nickname,
      saved: false,
    };
  }

  refresh();
  return { error: null, nickname: parsed.nickname, saved: true };
}

export async function removeMember(
  _prevState: RemoveMemberState,
  formData: FormData,
): Promise<RemoveMemberState> {
  await requireHost();

  const id = readId(formData);
  if (!id) {
    return { error: NOT_FOUND_MESSAGE };
  }

  const result = await archiveMember(id);
  if (!result.ok) {
    return { error: failureMessage(result) };
  }

  refresh();
  return { error: null };
}
