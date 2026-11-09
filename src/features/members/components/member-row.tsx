"use client";

import { useActionState, useState } from "react";
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
  const backToView = () => setMode("view");

  return (
    <li className="px-3 py-2">
      {mode === "view" ? (
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 break-words">{member.nickname}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setMode("edit")}
          >
            Sửa
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setMode("confirm")}
          >
            Bỏ
          </Button>
        </div>
      ) : mode === "edit" ? (
        <EditMemberForm member={member} onDone={backToView} />
      ) : (
        <RemoveMemberConfirm member={member} onCancel={backToView} />
      )}
    </li>
  );
}

// Each mode is its own component so its action state (and any error) resets
// when the row leaves that mode.
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
        onDone();
      }
      return next;
    },
    { error: null, nickname: member.nickname, saved: false },
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={member.id} />
      <div className="flex gap-2">
        <Input
          name="nickname"
          aria-label="Biệt danh"
          defaultValue={state.nickname}
          maxLength={NICKNAME_MAX_LENGTH}
          autoComplete="off"
          autoFocus
          required
          aria-invalid={state.error ? true : undefined}
          className="min-w-0 flex-1"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : "Lưu"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          disabled={pending}
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
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={member.id} />
      <p className="text-sm break-words">
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
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
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
