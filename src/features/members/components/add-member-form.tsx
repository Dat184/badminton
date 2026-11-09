"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addMember, type NicknameFormState } from "@/features/members/actions";
import { NICKNAME_MAX_LENGTH } from "@/features/members/member";

const initialState: NicknameFormState = {
  error: null,
  nickname: "",
  saved: false,
};

export function AddMemberForm() {
  const [state, formAction, pending] = useActionState(addMember, initialState);

  // React resets the form after each action; defaultValue from the returned
  // state keeps the typed text on error and clears it on success.
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          name="nickname"
          aria-label="Biệt danh"
          placeholder="Biệt danh, ví dụ DatNT"
          defaultValue={state.nickname}
          maxLength={NICKNAME_MAX_LENGTH}
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
