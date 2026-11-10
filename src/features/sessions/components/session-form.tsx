"use client";

import { startTransition, useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionFormState } from "@/features/sessions/actions";
import {
  type SessionFormValues,
  VENUE_MAX_LENGTH,
} from "@/features/sessions/session";

type SessionFormAction = (
  prevState: SessionFormState,
  formData: FormData,
) => Promise<SessionFormState>;

type SessionFormProps = {
  action: SessionFormAction;
  initialValues: SessionFormValues;
  submitLabel: string;
  pendingLabel: string;
  sessionId?: string;
  onCancel?: () => void;
};

function OptionalHint() {
  return (
    <span className="ml-auto text-[0.8125rem] font-normal text-muted-foreground">
      Không bắt buộc
    </span>
  );
}

export function SessionForm({
  action,
  initialValues,
  submitLabel,
  pendingLabel,
  sessionId,
  onCancel,
}: SessionFormProps) {
  const idPrefix = useId();
  const playDateId = `${idPrefix}-play-date`;
  const startTimeId = `${idPrefix}-start-time`;
  const venueId = `${idPrefix}-venue`;

  const [state, formAction, pending] = useActionState(
    async (prevState: SessionFormState, formData: FormData) => {
      const next = await action(prevState, formData);
      if (next.saved && onCancel) {
        // Code after an await runs outside the action's transition; keep the
        // close in a transition so it commits together with the refreshed view.
        startTransition(() => onCancel());
      }
      return next;
    },
    { error: null, values: initialValues, saved: false },
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {sessionId ? <input type="hidden" name="id" value={sessionId} /> : null}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor={playDateId}>Ngày</Label>
          <Input
            id={playDateId}
            name="play_date"
            type="date"
            defaultValue={state.values.playDate}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={startTimeId}>
            Giờ
            <OptionalHint />
          </Label>
          <Input
            id={startTimeId}
            name="start_time"
            type="time"
            defaultValue={state.values.startTime}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={venueId}>
          Sân
          <OptionalHint />
        </Label>
        <Input
          id={venueId}
          name="venue"
          placeholder="Ví dụ: Sân Kỳ Hòa"
          defaultValue={state.values.venue}
          maxLength={VENUE_MAX_LENGTH}
          autoComplete="off"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="flex-1 sm:flex-none"
        >
          {pending ? pendingLabel : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={pending}
          >
            Hủy
          </Button>
        ) : null}
      </div>
    </form>
  );
}
