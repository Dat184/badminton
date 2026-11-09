"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseGuestName,
  parseSessionForm,
  type SessionFormValues,
  type SessionInput,
} from "@/features/sessions/session";
import { normalizeName } from "@/lib/names";
import {
  addMemberAttendance,
  archiveSession,
  deleteGuest,
  getSessionStatus,
  insertGuest,
  insertSession,
  removeMemberAttendance,
  type SessionWriteResult,
  updateSessionInfo,
} from "@/server/sessions";

export type SessionFormState = {
  error: string | null;
  values: SessionFormValues;
  saved: boolean;
};

export type GuestFormState = {
  error: string | null;
  name: string;
};

export type ActionResult = {
  error: string | null;
};

const NOT_FOUND_MESSAGE = "Buổi này không còn nữa.";
const WRITE_ERROR_MESSAGE = "Không lưu được, vui lòng thử lại.";

function failureMessage(
  result: Extract<SessionWriteResult, { ok: false }>,
): string {
  switch (result.reason) {
    case "duplicate":
      return "Tên này đã có trong buổi.";
    case "not_found":
    case "closed":
      return NOT_FOUND_MESSAGE;
    default:
      return WRITE_ERROR_MESSAGE;
  }
}

function typedValue(raw: FormDataEntryValue | null): string {
  return typeof raw === "string" ? raw.trim() : "";
}

function readFormValues(formData: FormData): SessionFormValues {
  return {
    playDate: typedValue(formData.get("play_date")),
    startTime: typedValue(formData.get("start_time")),
    venue: normalizeName(formData.get("venue")),
  };
}

function toFormValues(input: SessionInput): SessionFormValues {
  return {
    playDate: input.playDate,
    startTime: input.startTime ?? "",
    venue: input.venue ?? "",
  };
}

export async function createSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const parsed = parseSessionForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error, values: parsed.values, saved: false };
  }

  const result = await insertSession(parsed.input);
  if (!result.ok) {
    return {
      error: WRITE_ERROR_MESSAGE,
      values: toFormValues(parsed.input),
      saved: false,
    };
  }

  redirect(`/sessions/${result.id}`);
}

export async function editSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const id = typedValue(formData.get("id"));
  const status = await getSessionStatus(id);
  if (status === "missing") {
    return {
      error: NOT_FOUND_MESSAGE,
      values: readFormValues(formData),
      saved: false,
    };
  }

  const parsed = parseSessionForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error, values: parsed.values, saved: false };
  }

  const savedValues = toFormValues(parsed.input);
  const result = await updateSessionInfo(id, parsed.input);
  if (!result.ok) {
    return {
      error: failureMessage(result),
      values: savedValues,
      saved: false,
    };
  }

  refresh();
  return { error: null, values: savedValues, saved: true };
}

export async function deleteSession(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = typedValue(formData.get("id"));
  const status = await getSessionStatus(id);
  if (status === "missing") {
    return { error: NOT_FOUND_MESSAGE };
  }

  const result = await archiveSession(id);
  if (!result.ok) {
    return { error: failureMessage(result) };
  }

  redirect("/");
}

export async function setAttendance(
  sessionId: string,
  memberId: string,
  attending: boolean,
): Promise<ActionResult> {
  if (
    typeof sessionId !== "string" ||
    !sessionId ||
    typeof memberId !== "string" ||
    !memberId
  ) {
    return { error: NOT_FOUND_MESSAGE };
  }

  const status = await getSessionStatus(sessionId);
  if (status === "missing") {
    return { error: NOT_FOUND_MESSAGE };
  }

  const result = attending
    ? await addMemberAttendance(sessionId, memberId)
    : await removeMemberAttendance(sessionId, memberId);

  if (!result.ok) {
    return { error: failureMessage(result) };
  }

  refresh();
  return { error: null };
}

export async function addGuest(
  _prev: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  const sessionId = typedValue(formData.get("session_id"));
  const rawName = formData.get("name");
  const status = await getSessionStatus(sessionId);
  if (status === "missing") {
    return { error: NOT_FOUND_MESSAGE, name: typedValue(rawName) };
  }

  const parsed = parseGuestName(rawName);
  if (!parsed.ok) {
    return { error: parsed.error, name: typedValue(rawName) };
  }

  const result = await insertGuest(sessionId, parsed.name);
  if (!result.ok) {
    if (result.reason === "duplicate") {
      // Surface a guest added in another tab while keeping the form error.
      refresh();
    }
    return { error: failureMessage(result), name: parsed.name };
  }

  refresh();
  return { error: null, name: "" };
}

export async function removeGuest(
  sessionId: string,
  attendeeId: string,
): Promise<ActionResult> {
  if (
    typeof sessionId !== "string" ||
    !sessionId ||
    typeof attendeeId !== "string" ||
    !attendeeId
  ) {
    return { error: NOT_FOUND_MESSAGE };
  }

  const status = await getSessionStatus(sessionId);
  if (status === "missing") {
    return { error: NOT_FOUND_MESSAGE };
  }

  const result = await deleteGuest(sessionId, attendeeId);
  if (!result.ok) {
    return { error: failureMessage(result) };
  }

  refresh();
  return { error: null };
}
