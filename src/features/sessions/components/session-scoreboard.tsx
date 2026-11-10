import { MapPin } from "lucide-react";
import { ScoreTile, TileSeparator } from "@/components/ui/score-tile";
import {
  formatSessionDate,
  relativeDayLabel,
  sessionDateParts,
  startTimeParts,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

type SessionScoreboardProps = {
  playDate: string;
  startTime: string | null;
  venue: string | null;
  /** Today in Vietnam (`YYYY-MM-DD`), for "Hôm nay" and whether to show the year. */
  today: string;
  heading?: "h1" | "h2";
};

/**
 * When and where, set on the board: the weekday as the heading, the date and
 * start time as scoreboard tiles, then the court.
 */
export function SessionScoreboard({
  playDate,
  startTime,
  venue,
  today,
  heading: Heading = "h1",
}: SessionScoreboardProps) {
  const date = sessionDateParts(playDate);
  const time = startTime ? startTimeParts(startTime) : null;
  const relative = relativeDayLabel(playDate, today);
  const showYear = date.year !== Number(today.slice(0, 4));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Heading className="board-heading text-[1.75rem] leading-none lg:text-[2.25rem]">
          <span className="sr-only">{formatSessionDate(playDate)}</span>
          <span aria-hidden>
            {date.weekday}
            {showYear ? ` · ${date.year}` : null}
          </span>
        </Heading>
        {relative ? (
          <span
            className={cn(
              "rounded-sm px-2 py-1 text-xs leading-none font-bold tracking-wide uppercase",
              relative === "Đã qua"
                ? "text-board-muted ring-1 ring-board-line ring-inset"
                : "bg-tile text-primary",
            )}
          >
            {relative}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-1">
          <ScoreTile value={date.day} />
          <TileSeparator>/</TileSeparator>
          <ScoreTile value={date.month} />
        </div>
        {time ? (
          <div className="flex items-center gap-1">
            <span className="sr-only">Giờ: {startTime}</span>
            <ScoreTile value={time.hour} size="count" />
            <TileSeparator size="count">:</TileSeparator>
            <ScoreTile value={time.minute} size="count" />
          </div>
        ) : (
          <p className="text-[0.9375rem] text-board-muted">Chưa có giờ</p>
        )}
      </div>

      <p className="flex items-start gap-2 text-lg leading-snug font-semibold break-words">
        <MapPin className="mt-1 size-4.5 shrink-0" aria-hidden />
        <span className="sr-only">Sân: </span>
        {venue ? (
          <span className="min-w-0">{venue}</span>
        ) : (
          <span className="font-medium text-board-muted">Chưa chọn sân</span>
        )}
      </p>
    </div>
  );
}
