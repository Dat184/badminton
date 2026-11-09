import "server-only";

import type {
  Attendee,
  SessionDetail,
  SessionInput,
  SessionSummary,
} from "@/features/sessions/session";
import { createSupabaseServerClient } from "@/server/supabase/server";

export type SessionWriteResult =
  | { ok: true }
  | { ok: false; reason: "duplicate" | "not_found" | "closed" | "error" };

type PostgresError = { code?: string; message?: string } | null;

function toFailure(
  operation: string,
  error: PostgresError,
): SessionWriteResult {
  if (error?.code === "23505") {
    return { ok: false, reason: "duplicate" };
  }
  // 22P02: malformed uuid; 23503: foreign-key target does not exist.
  if (error?.code === "22P02" || error?.code === "23503") {
    return { ok: false, reason: "not_found" };
  }
  if (error?.code === "42501") {
    return { ok: false, reason: "closed" };
  }
  console.error(`sessions: ${operation} failed`, error?.code, error?.message);
  return { ok: false, reason: "error" };
}

function thrownFailure(operation: string, cause: unknown): SessionWriteResult {
  console.error(`sessions: ${operation} threw`, cause);
  return { ok: false, reason: "error" };
}

function formatStartTime(raw: unknown): string | null {
  return typeof raw === "string" && raw.length >= 5 ? raw.slice(0, 5) : null;
}

function readMemberNickname(raw: unknown): string {
  if (!raw) {
    return "";
  }
  if (Array.isArray(raw)) {
    const first = raw[0] as { nickname?: unknown } | undefined;
    return typeof first?.nickname === "string" ? first.nickname : "";
  }
  const obj = raw as { nickname?: unknown };
  return typeof obj.nickname === "string" ? obj.nickname : "";
}

// Callers must already be at request time (e.g. `await connection()`) outside
// any try/catch.
export async function listSessions(): Promise<SessionSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, play_date, start_time, venue, session_attendees(count)")
    .is("archived_at", null)
    .order("play_date", { ascending: false })
    .order("start_time", { ascending: false, nullsFirst: false })
    .limit(30);

  if (error) {
    throw new Error(`Failed to load sessions: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const countRows = Array.isArray(row.session_attendees)
      ? row.session_attendees
      : [];
    const firstCount = countRows[0] as { count?: unknown } | undefined;
    const attendeeCount =
      typeof firstCount?.count === "number" ? firstCount.count : 0;

    return {
      id: String(row.id),
      playDate: String(row.play_date),
      startTime: formatStartTime(row.start_time),
      venue: typeof row.venue === "string" ? row.venue : null,
      attendeeCount,
    };
  });
}

export async function getSessionDetail(
  id: string,
): Promise<SessionDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, play_date, start_time, venue, session_attendees(id, member_id, guest_name, created_at, members(nickname))",
    )
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    if (error.code === "22P02") {
      return null;
    }
    throw new Error(`Failed to load session: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const rawAttendees = Array.isArray(data.session_attendees)
    ? data.session_attendees
    : [];

  const withTimestamp = rawAttendees.map((row) => {
    const memberId = typeof row.member_id === "string" ? row.member_id : null;
    const isGuest = memberId === null;
    const name = isGuest
      ? typeof row.guest_name === "string"
        ? row.guest_name
        : ""
      : readMemberNickname(row.members);

    return {
      attendee: {
        id: String(row.id),
        memberId,
        name,
        isGuest,
      } satisfies Attendee,
      createdAt: typeof row.created_at === "string" ? row.created_at : "",
    };
  });

  withTimestamp.sort((a, b) => {
    if (a.attendee.isGuest !== b.attendee.isGuest) {
      return a.attendee.isGuest ? 1 : -1;
    }
    if (!a.attendee.isGuest) {
      return a.attendee.name.localeCompare(b.attendee.name, "vi", {
        sensitivity: "base",
      });
    }
    return a.createdAt.localeCompare(b.createdAt);
  });

  const attendees = withTimestamp.map((item) => item.attendee);

  return {
    id: String(data.id),
    playDate: String(data.play_date),
    startTime: formatStartTime(data.start_time),
    venue: typeof data.venue === "string" ? data.venue : null,
    attendeeCount: attendees.length,
    attendees,
  };
}

export async function getSessionStatus(
  id: string,
): Promise<"open" | "missing"> {
  if (!id) {
    return "missing";
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("session_is_open", {
      p_session_id: id,
    });
    if (error) {
      if (error.code !== "22P02") {
        console.error(
          "sessions: getSessionStatus failed",
          error.code,
          error.message,
        );
      }
      return "missing";
    }
    return data === true ? "open" : "missing";
  } catch (cause) {
    console.error("sessions: getSessionStatus threw", cause);
    return "missing";
  }
}

export async function insertSession(
  input: SessionInput,
): Promise<{ ok: true; id: string } | { ok: false; reason: "error" }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        play_date: input.playDate,
        start_time: input.startTime,
        venue: input.venue,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error(
        "sessions: insertSession failed",
        error?.code,
        error?.message,
      );
      return { ok: false, reason: "error" };
    }

    return { ok: true, id: String(data.id) };
  } catch (cause) {
    console.error("sessions: insertSession threw", cause);
    return { ok: false, reason: "error" };
  }
}

async function updateActiveSession(
  id: string,
  changes:
    | {
        play_date: string;
        start_time: string | null;
        venue: string | null;
      }
    | { archived_at: string },
): Promise<SessionWriteResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sessions")
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

export async function updateSessionInfo(
  id: string,
  input: SessionInput,
): Promise<SessionWriteResult> {
  return updateActiveSession(id, {
    play_date: input.playDate,
    start_time: input.startTime,
    venue: input.venue,
  });
}

export async function archiveSession(id: string): Promise<SessionWriteResult> {
  return updateActiveSession(id, { archived_at: new Date().toISOString() });
}

export async function addMemberAttendance(
  sessionId: string,
  memberId: string,
): Promise<SessionWriteResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("session_attendees")
      .insert({ session_id: sessionId, member_id: memberId });

    if (error) {
      if (error.code === "23505") {
        return { ok: true };
      }
      return toFailure("addMemberAttendance", error);
    }
    return { ok: true };
  } catch (cause) {
    return thrownFailure("addMemberAttendance", cause);
  }
}

export async function removeMemberAttendance(
  sessionId: string,
  memberId: string,
): Promise<SessionWriteResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("session_attendees")
      .delete()
      .eq("session_id", sessionId)
      .eq("member_id", memberId);

    return error ? toFailure("removeMemberAttendance", error) : { ok: true };
  } catch (cause) {
    return thrownFailure("removeMemberAttendance", cause);
  }
}

export async function insertGuest(
  sessionId: string,
  name: string,
): Promise<SessionWriteResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("session_attendees")
      .insert({ session_id: sessionId, guest_name: name });

    return error ? toFailure("insertGuest", error) : { ok: true };
  } catch (cause) {
    return thrownFailure("insertGuest", cause);
  }
}

export async function deleteGuest(
  sessionId: string,
  attendeeId: string,
): Promise<SessionWriteResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("session_attendees")
      .delete()
      .eq("session_id", sessionId)
      .eq("id", attendeeId)
      .not("guest_name", "is", null);

    return error ? toFailure("deleteGuest", error) : { ok: true };
  } catch (cause) {
    return thrownFailure("deleteGuest", cause);
  }
}
