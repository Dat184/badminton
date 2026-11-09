import "server-only";

import type { Member } from "@/features/members/member";
import { createSupabaseServerClient } from "@/server/supabase/server";

export type MemberWriteResult =
  { ok: true } | { ok: false; reason: "duplicate" | "not_found" | "error" };

type PostgresError = { code?: string; message?: string } | null;

function toFailure(operation: string, error: PostgresError): MemberWriteResult {
  if (error?.code === "23505") {
    return { ok: false, reason: "duplicate" };
  }
  // 22P02: the id is not a valid uuid, so no such member exists.
  if (error?.code === "22P02") {
    return { ok: false, reason: "not_found" };
  }
  // The UI only shows a generic message, so keep the cause in the server logs.
  console.error(`members: ${operation} failed`, error?.code, error?.message);
  return { ok: false, reason: "error" };
}

function thrownFailure(operation: string, cause: unknown): MemberWriteResult {
  console.error(`members: ${operation} threw`, cause);
  return { ok: false, reason: "error" };
}

// Callers must already be at request time (requireHost() or `await connection()`)
// and must do that outside any try/catch: during prerendering connection()
// rejects on purpose, and catching that turns the abort into a rendered error.
export async function listActiveMembers(): Promise<Member[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, nickname")
    .is("archived_at", null);

  if (error) {
    throw new Error(`Failed to load members: ${error.message}`);
  }

  const members: Member[] = (data ?? []).map((row) => ({
    id: String(row.id),
    nickname: String(row.nickname),
  }));

  return members.sort((a, b) =>
    a.nickname.localeCompare(b.nickname, "vi", { sensitivity: "base" }),
  );
}

export async function insertMember(
  nickname: string,
): Promise<MemberWriteResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("members").insert({ nickname });
    return error ? toFailure("insert", error) : { ok: true };
  } catch (cause) {
    return thrownFailure("insert", cause);
  }
}

async function updateActiveMember(
  id: string,
  changes: { nickname: string } | { archived_at: string },
): Promise<MemberWriteResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("members")
      .update(changes)
      .eq("id", id)
      .is("archived_at", null)
      .select("id");

    if (error) {
      return toFailure("update", error);
    }
    return data && data.length > 0
      ? { ok: true }
      : { ok: false, reason: "not_found" };
  } catch (cause) {
    return thrownFailure("update", cause);
  }
}

export async function updateMemberNickname(
  id: string,
  nickname: string,
): Promise<MemberWriteResult> {
  return updateActiveMember(id, { nickname });
}

export async function archiveMember(id: string): Promise<MemberWriteResult> {
  return updateActiveMember(id, { archived_at: new Date().toISOString() });
}
