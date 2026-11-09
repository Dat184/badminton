"use client";

import {
  startTransition,
  useActionState,
  useOptimistic,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Member } from "@/features/members/member";
import {
  addGuest,
  type GuestFormState,
  removeGuest,
  setAttendance,
} from "@/features/sessions/actions";
import {
  type Attendee,
  GUEST_NAME_MAX_LENGTH,
} from "@/features/sessions/session";

type AttendanceListProps = {
  sessionId: string;
  members: Member[];
  attendees: Attendee[];
};

type MemberAttendanceRow = {
  memberId: string;
  name: string;
};

type OptimisticToggle = {
  memberId: string;
  attending: boolean;
};

const WRITE_ERROR_FALLBACK = "Không lưu được, vui lòng thử lại.";

export function AttendanceList({
  sessionId,
  members,
  attendees,
}: AttendanceListProps) {
  const activeMemberIds = new Set(members.map((member) => member.id));
  const serverMemberIds = new Set<string>();
  const inactiveAttendeeRows: MemberAttendanceRow[] = [];
  const guests: Attendee[] = [];

  for (const attendee of attendees) {
    if (attendee.isGuest) {
      guests.push(attendee);
    } else if (attendee.memberId !== null) {
      serverMemberIds.add(attendee.memberId);
      if (!activeMemberIds.has(attendee.memberId)) {
        inactiveAttendeeRows.push({
          memberId: attendee.memberId,
          name: attendee.name,
        });
      }
    }
  }

  const memberRows: MemberAttendanceRow[] = [
    ...members.map((member) => ({
      memberId: member.id,
      name: member.nickname,
    })),
    ...inactiveAttendeeRows,
  ];

  const [optimisticMemberIds, setOptimisticMember] = useOptimistic(
    serverMemberIds,
    (current: Set<string>, update: OptimisticToggle) => {
      const next = new Set(current);
      if (update.attending) {
        next.add(update.memberId);
      } else {
        next.delete(update.memberId);
      }
      return next;
    },
  );

  const [pendingMemberIds, setPendingMemberIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [pendingGuestIds, setPendingGuestIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const handleToggleMember = (memberId: string, attending: boolean) => {
    if (pendingMemberIds.has(memberId)) {
      return;
    }
    setActionError(null);
    setPendingMemberIds((prev) => {
      const next = new Set(prev);
      next.add(memberId);
      return next;
    });

    startTransition(async () => {
      setOptimisticMember({ memberId, attending });
      try {
        const result = await setAttendance(sessionId, memberId, attending);
        if (result.error) {
          setActionError(result.error);
        }
      } catch {
        setActionError(WRITE_ERROR_FALLBACK);
      } finally {
        setPendingMemberIds((prev) => {
          const next = new Set(prev);
          next.delete(memberId);
          return next;
        });
      }
    });
  };

  const handleRemoveGuest = (attendeeId: string) => {
    if (pendingGuestIds.has(attendeeId)) {
      return;
    }
    setActionError(null);
    setPendingGuestIds((prev) => {
      const next = new Set(prev);
      next.add(attendeeId);
      return next;
    });

    startTransition(async () => {
      try {
        const result = await removeGuest(sessionId, attendeeId);
        if (result.error) {
          setActionError(result.error);
        }
      } catch {
        setActionError(WRITE_ERROR_FALLBACK);
      } finally {
        setPendingGuestIds((prev) => {
          const next = new Set(prev);
          next.delete(attendeeId);
          return next;
        });
      }
    });
  };

  const attendeeCount = optimisticMemberIds.size + guests.length;
  const hasRows = memberRows.length > 0 || guests.length > 0;

  return (
    <section
      aria-labelledby="attendance-heading"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="attendance-heading"
          className="text-xl font-semibold tracking-tight"
        >
          Ai đi? ({attendeeCount})
        </h2>
        <p className="text-sm text-foreground/70">
          Bấm vào tên mình để báo đi hoặc không đi.
        </p>
      </div>

      {!hasRows ? (
        <p className="text-sm text-foreground/70">Chưa có thành viên nào.</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {memberRows.map((row) => {
            const checked = optimisticMemberIds.has(row.memberId);
            const rowPending = pendingMemberIds.has(row.memberId);
            return (
              <li key={row.memberId}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 select-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={rowPending}
                    onChange={(event) =>
                      handleToggleMember(
                        row.memberId,
                        event.currentTarget.checked,
                      )
                    }
                    className="size-5 shrink-0 accent-primary"
                  />
                  <span className="min-w-0 flex-1 break-words">{row.name}</span>
                </label>
              </li>
            );
          })}
          {guests.map((guest) => {
            const guestPending = pendingGuestIds.has(guest.id);
            return (
              <li
                key={guest.id}
                className="flex min-h-11 items-center gap-2 px-3 py-2"
              >
                <span className="min-w-0 flex-1 break-words">{guest.name}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground/70">
                  khách
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-label={`Bỏ ${guest.name}`}
                  disabled={guestPending}
                  onClick={() => handleRemoveGuest(guest.id)}
                >
                  Bỏ
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {actionError ? (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      ) : null}

      <AddGuestForm sessionId={sessionId} />
    </section>
  );
}

const initialGuestState: GuestFormState = {
  error: null,
  name: "",
};

function AddGuestForm({ sessionId }: { sessionId: string }) {
  const [state, formAction, pending] = useActionState(
    addGuest,
    initialGuestState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="session_id" value={sessionId} />
      <div className="flex gap-2">
        <Input
          name="name"
          aria-label="Tên người ngoài nhóm"
          placeholder="Thêm người ngoài nhóm"
          defaultValue={state.name}
          maxLength={GUEST_NAME_MAX_LENGTH}
          autoComplete="off"
          required
          aria-invalid={state.error ? true : undefined}
          className="min-w-0 flex-1"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Đang thêm…" : "Thêm"}
        </Button>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
