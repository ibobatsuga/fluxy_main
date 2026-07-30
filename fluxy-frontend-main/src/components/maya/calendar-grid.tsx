import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Schedule } from "@/types";

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const STATUS_DOT: Record<Schedule["status"], string> = {
  draft: "bg-muted-foreground",
  scheduled: "bg-blue-500",
  processing: "bg-yellow-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

interface CalendarGridProps {
  month: Date;
  posts: Schedule[];
  onSelectDay: (day: Date) => void;
}

export function CalendarGrid({ month, posts, onSelectDay }: CalendarGridProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const postsByDay = new Map<string, Schedule[]>();
  for (const post of posts) {
    if (!post.scheduled_at) continue;
    const key = format(new Date(post.scheduled_at), "yyyy-MM-dd");
    const existing = postsByDay.get(key) || [];
    existing.push(post);
    postsByDay.set(key, existing);
  }

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-border pb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayPosts = postsByDay.get(key) || [];
          const inMonth = isSameMonth(day, month);

          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex min-h-20 flex-col items-start gap-1 bg-card p-2 text-left transition-colors hover:bg-muted/50 sm:min-h-24",
                !inMonth && "opacity-40"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                  isToday(day) && "bg-primary text-primary-foreground font-semibold"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-wrap gap-1">
                {dayPosts.slice(0, 3).map((post) => (
                  <span key={post.id} className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[post.status])} />
                ))}
                {dayPosts.length > 3 && (
                  <span className="text-[9px] text-muted-foreground">+{dayPosts.length - 3}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
