"use client";

import { Check, Plus, RotateCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useOptimistic,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreTile } from "@/components/ui/score-tile";
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
import { cn } from "@/lib/utils";

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
  const router = useRouter();

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
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="attendance-heading"
            className="text-[1.375rem] leading-tight font-bold"
          >
            Ai đi?
          </h2>
          <p className="text-sm text-muted-foreground">
            Bấm vào tên mình để báo đi, bấm lần nữa để bỏ.
          </p>
        </div>
        <p className="flex shrink-0 items-center gap-2">
          <ScoreTile value={attendeeCount} size="count" tone="score" />
          <span
            aria-hidden
            className="text-sm font-semibold whitespace-nowrap text-muted-foreground"
          >
            người đi
          </span>
          <span className="sr-only" aria-live="polite">
            {attendeeCount} người đi
          </span>
        </p>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-card py-2 pr-2 pl-4"
        >
          <p className="text-sm font-medium text-destructive">{actionError}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setActionError(null);
              router.refresh();
            }}
          >
            <RotateCw aria-hidden />
            Tải lại
          </Button>
        </div>
      ) : null}

      {!hasRows ? (
        <p className="rounded-md border border-dashed border-input/50 bg-card px-4 py-6 text-center text-[0.9375rem] text-muted-foreground">
          Nhóm chưa có thành viên nào. Vẫn có thể thêm người ngoài nhóm bên
          dưới.
        </p>
      ) : (
        <ul className="flex flex-col divide-y overflow-hidden rounded-md border bg-card">
          {memberRows.map((row) => {
            const checked = optimisticMemberIds.has(row.memberId);
            const rowPending = pendingMemberIds.has(row.memberId);
            return (
              <li key={row.memberId}>
                <label className="flex min-h-14 cursor-pointer items-center gap-3 py-2 pr-2 pl-4 transition-colors select-none hover:bg-accent has-[:disabled]:cursor-wait has-[:focus-visible]:bg-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-ring">
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
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-base break-words",
                      checked
                        ? "font-semibold text-foreground"
                        : "font-medium text-muted-foreground",
                    )}
                  >
                    {row.name}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "inline-flex h-11 w-26 shrink-0 items-center justify-center gap-1.5 rounded-md border text-sm font-bold transition-colors",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input/60 bg-card text-muted-foreground",
                      rowPending && "opacity-60",
                    )}
                  >
                    {checked ? (
                      <>
                        <Check className="size-4" strokeWidth={3} />
                        Đi
                      </>
                    ) : (
                      "Đi?"
                    )}
                  </span>
                </label>
              </li>
            );
          })}
          {guests.map((guest) => {
            const guestPending = pendingGuestIds.has(guest.id);
            return (
              <li
                key={guest.id}
                className="flex min-h-14 items-center gap-2 py-2 pr-2 pl-4"
              >
                <span className="min-w-0 flex-1 text-base font-semibold break-words">
                  {guest.name}
                </span>
                <span className="rounded-sm bg-muted px-1.5 py-1 text-xs leading-none font-semibold text-muted-foreground">
                  Khách
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Bỏ ${guest.name} khỏi buổi`}
                  title="Bỏ khỏi buổi"
                  disabled={guestPending}
                  onClick={() => handleRemoveGuest(guest.id)}
                  className="mr-2 text-muted-foreground hover:text-foreground"
                >
                  <X aria-hidden />
                </Button>
                <span
                  aria-hidden
                  className="inline-flex h-11 w-26 shrink-0 items-center justify-center gap-1.5 rounded-md border border-primary bg-primary text-sm font-bold text-primary-foreground"
                >
                  <Check className="size-4" strokeWidth={3} />
                  Đi
                </span>
              </li>
            );
          })}
        </ul>
      )}

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
        <Button type="submit" variant="secondary" disabled={pending}>
          <Plus aria-hidden />
          {pending ? "Đang thêm…" : "Thêm"}
        </Button>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
