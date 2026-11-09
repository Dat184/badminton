"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type ActionResult,
  deleteSession,
  editSession,
} from "@/features/sessions/actions";
import { SessionForm } from "@/features/sessions/components/session-form";
import type { SessionSummary } from "@/features/sessions/session";
import { formatSessionDate, formatSessionWhen } from "@/lib/dates";

type Mode = "view" | "edit" | "confirm";

export function SessionHeader({ session }: { session: SessionSummary }) {
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

  if (mode === "edit") {
    return (
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
    );
  }

  if (mode === "confirm") {
    return <DeleteSessionConfirm session={session} onCancel={closeConfirm} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-semibold tracking-tight break-words">
        {formatSessionWhen(session)}
      </h1>
      <div className="flex gap-2">
        <Button
          ref={editButtonRef}
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setMode("edit")}
        >
          Sửa
        </Button>
        <Button
          ref={deleteButtonRef}
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setMode("confirm")}
        >
          Xóa buổi
        </Button>
      </div>
    </div>
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
      className="flex flex-col gap-3 rounded-lg border p-3"
    >
      <input type="hidden" name="id" value={session.id} />
      <p className="text-sm font-medium break-words">
        Xóa buổi {formatSessionDate(session.playDate)}?
      </p>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={pending}
        >
          {pending ? "Đang xóa…" : "Xóa"}
        </Button>
        {/* Focus the safe choice when the question opens. */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
          autoFocus
        >
          Hủy
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
