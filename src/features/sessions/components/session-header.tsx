"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Board, BoardBackLink, BoardBar } from "@/components/ui/board";
import { Button } from "@/components/ui/button";
import {
  type ActionResult,
  deleteSession,
  editSession,
} from "@/features/sessions/actions";
import { SessionForm } from "@/features/sessions/components/session-form";
import { SessionScoreboard } from "@/features/sessions/components/session-scoreboard";
import type { SessionSummary } from "@/features/sessions/session";
import { formatSessionDate } from "@/lib/dates";

type Mode = "view" | "edit" | "confirm";

export function SessionHeader({
  session,
  today,
}: {
  session: SessionSummary;
  today: string;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  // When an edit or confirmation closes, the focused control unmounts. Send
  // focus back to the button that opened it instead of letting it drop to <body>.
  const returnFocusTo = useRef<"edit" | "delete" | null>(null);

  useEffect(() => {
    if (mode !== "view" || returnFocusTo.current === null) {
      return;
    }
    const target =
      returnFocusTo.current === "edit"
        ? editButtonRef.current
        : deleteButtonRef.current;
    returnFocusTo.current = null;
    target?.focus();
  }, [mode]);

  const closeEdit = () => {
    returnFocusTo.current = "edit";
    setMode("view");
  };
  const closeConfirm = () => {
    returnFocusTo.current = "delete";
    setMode("view");
  };

  return (
    <Board>
      <BoardBar>
        <BoardBackLink href="/">Cầu lông</BoardBackLink>
        {mode === "view" ? (
          <div className="flex gap-2">
            <Button
              ref={editButtonRef}
              type="button"
              size="sm"
              variant="board"
              onClick={() => setMode("edit")}
            >
              <Pencil aria-hidden />
              Sửa
            </Button>
            <Button
              ref={deleteButtonRef}
              type="button"
              size="sm"
              variant="board"
              onClick={() => setMode("confirm")}
            >
              <Trash2 aria-hidden />
              Xóa buổi
            </Button>
          </div>
        ) : null}
      </BoardBar>

      {mode === "edit" ? (
        <div className="mt-4 rounded-md bg-card p-4 text-card-foreground">
          <h1 className="mb-4 text-lg font-bold">Sửa buổi đánh</h1>
          <SessionForm
            action={editSession}
            sessionId={session.id}
            initialValues={{
              playDate: session.playDate,
              startTime: session.startTime ?? "",
              venue: session.venue ?? "",
            }}
            submitLabel="Lưu"
            pendingLabel="Đang lưu…"
            onCancel={closeEdit}
          />
        </div>
      ) : mode === "confirm" ? (
        <DeleteSessionConfirm session={session} onCancel={closeConfirm} />
      ) : (
        <div className="mt-4">
          <SessionScoreboard
            playDate={session.playDate}
            startTime={session.startTime}
            venue={session.venue}
            today={today}
          />
        </div>
      )}
    </Board>
  );
}

const initialDeleteState: ActionResult = { error: null };

function DeleteSessionConfirm({
  session,
  onCancel,
}: {
  session: SessionSummary;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    deleteSession,
    initialDeleteState,
  );

  return (
    <form
      action={formAction}
      className="mt-4 flex flex-col gap-4 rounded-md bg-card p-4 text-card-foreground"
    >
      <input type="hidden" name="id" value={session.id} />
      <h1 className="text-lg font-bold break-words">
        Xóa buổi {formatSessionDate(session.playDate)}?
      </h1>
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Đang xóa…" : "Xóa buổi"}
        </Button>
        {/* Focus the safe choice when the question opens. */}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
          autoFocus
        >
          Hủy
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
