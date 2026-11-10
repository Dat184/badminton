"use client";

import { Archive, Pencil } from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type NicknameFormState,
  type RemoveMemberState,
  removeMember,
  renameMember,
} from "@/features/members/actions";
import { type Member, NICKNAME_MAX_LENGTH } from "@/features/members/member";

type Mode = "view" | "edit" | "confirm";

export function MemberRow({ member }: { member: Member }) {
  const [mode, setMode] = useState<Mode>("view");
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const removeButtonRef = useRef<HTMLButtonElement>(null);
  // When an edit or confirmation closes, the focused control unmounts. Send
  // focus back to the button that opened it instead of letting it drop to <body>.
  const returnFocusTo = useRef<"edit" | "remove" | null>(null);

  useEffect(() => {
    if (mode !== "view" || returnFocusTo.current === null) {
      return;
    }
    const target =
      returnFocusTo.current === "edit"
        ? editButtonRef.current
        : removeButtonRef.current;
    returnFocusTo.current = null;
    target?.focus();
  }, [mode]);

  const closeEdit = () => {
    returnFocusTo.current = "edit";
    setMode("view");
  };
  const closeConfirm = () => {
    returnFocusTo.current = "remove";
    setMode("view");
  };

  return (
    <li className="py-2 pr-2 pl-4">
      {mode === "view" ? (
        <div className="flex min-h-10 items-center gap-1">
          <span className="min-w-0 flex-1 text-base font-semibold break-words">
            {member.nickname}
          </span>
          <Button
            ref={editButtonRef}
            type="button"
            size="sm"
            variant="ghost"
            aria-label={`Sửa ${member.nickname}`}
            onClick={() => setMode("edit")}
          >
            <Pencil aria-hidden />
            Sửa
          </Button>
          <Button
            ref={removeButtonRef}
            type="button"
            size="sm"
            variant="ghost"
            aria-label={`Bỏ ${member.nickname}`}
            onClick={() => setMode("confirm")}
          >
            <Archive aria-hidden />
            Bỏ
          </Button>
        </div>
      ) : mode === "edit" ? (
        <EditMemberForm member={member} onDone={closeEdit} />
      ) : (
        <RemoveMemberConfirm member={member} onCancel={closeConfirm} />
      )}
    </li>
  );
}

// Each mode is its own component so its action state (and any error) resets
// when the row leaves that mode. Both put their buttons on a second line, so a
// double-click on Sửa/Bỏ lands on the field or the question, not on Lưu/Bỏ.
function EditMemberForm({
  member,
  onDone,
}: {
  member: Member;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prevState: NicknameFormState, formData: FormData) => {
      const next = await renameMember(prevState, formData);
      if (next.saved) {
        // Code after an await runs outside the action's transition; keep the
        // close in a transition so it commits together with the refreshed list
        // instead of flashing the old nickname first.
        startTransition(() => onDone());
      }
      return next;
    },
    { error: null, nickname: member.nickname, saved: false },
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 py-2 pr-2">
      <input type="hidden" name="id" value={member.id} />
      <Input
        name="nickname"
        aria-label="Biệt danh"
        defaultValue={state.nickname}
        maxLength={NICKNAME_MAX_LENGTH}
        autoComplete="off"
        autoFocus
        required
        aria-invalid={state.error ? true : undefined}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Đang lưu…" : "Lưu"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDone}
          disabled={pending}
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

const initialRemoveState: RemoveMemberState = { error: null };

function RemoveMemberConfirm({
  member,
  onCancel,
}: {
  member: Member;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    removeMember,
    initialRemoveState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 py-2 pr-2">
      <input type="hidden" name="id" value={member.id} />
      <p className="text-[0.9375rem] font-semibold break-words">
        Bỏ {member.nickname} khỏi danh sách?
      </p>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={pending}
        >
          {pending ? "Đang bỏ…" : "Bỏ"}
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
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
