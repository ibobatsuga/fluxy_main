import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarGrid } from "@/components/maya/calendar-grid";
import { DayDetailModal } from "@/components/maya/day-detail-modal";
import { EditPostModal } from "@/components/maya/edit-post-modal";
import { useMayaAccounts, useMayaPosts, useDeletePost, useRetryPost } from "@/hooks/use-maya";
import { cn } from "@/lib/utils";
import type { Schedule } from "@/types";

const STATUS_DOT: Record<Schedule["status"], string> = {
  draft: "bg-muted-foreground",
  scheduled: "bg-blue-500",
  processing: "bg-yellow-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

type ViewMode = "month" | "week";

function WeekView({ posts, onSelectDay }: { posts: Schedule[]; onSelectDay: (day: Date) => void }) {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const postsByDay = new Map<string, Schedule[]>();
  for (const post of posts) {
    if (!post.scheduled_at) continue;
    const key = format(new Date(post.scheduled_at), "yyyy-MM-dd");
    const existing = postsByDay.get(key) || [];
    existing.push(post);
    postsByDay.set(key, existing);
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[700px] grid-cols-7 gap-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayPosts = (postsByDay.get(key) || []).sort(
            (a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
          );

          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelectDay(day)}
              className="flex min-h-[150px] flex-col rounded-lg border border-border bg-card p-2 text-left transition-colors hover:bg-muted/50"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">
                  {format(day, "EEE", { locale: id })}
                </span>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    isToday(day) && "bg-primary font-semibold text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-1">
                {dayPosts.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground/50">Tidak ada</span>
                ) : (
                  <>
                    {dayPosts.slice(0, 4).map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center gap-1 rounded bg-muted/60 px-1.5 py-1 text-[10px] leading-tight"
                      >
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[post.status])} />
                        <span className="shrink-0 font-medium">
                          {format(new Date(post.scheduled_at!), "HH:mm")}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {post.content?.caption || "Tanpa caption"}
                        </span>
                      </div>
                    ))}
                    {dayPosts.length > 4 && (
                      <span className="text-[9px] text-muted-foreground">+{dayPosts.length - 4} lainnya</span>
                    )}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ContentCalendarSection() {
  const { data: accounts = [] } = useMayaAccounts();
  const { data: posts = [], isLoading: postsLoading } = useMayaPosts();
  const deletePost = useDeletePost();
  const retryPost = useRetryPost();

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<Schedule | null>(null);

  const isCurrentMonth = isSameMonth(month, new Date());

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Kalender Konten</h2>
          <p className="text-sm text-muted-foreground">Kelola jadwal publikasi konten Anda</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
              viewMode === "month" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
              viewMode === "week" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Minggu Ini
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          {viewMode === "month" ? (
            <>
              <div className="mb-4 flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(subMonths(month, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="min-w-36 text-center text-base font-semibold">
                  {format(month, "MMMM yyyy", { locale: id })}
                </h3>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(addMonths(month, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!isCurrentMonth && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setMonth(new Date())}>
                    Hari Ini
                  </Button>
                )}
              </div>

              {postsLoading ? (
                <Skeleton className="h-96 w-full rounded-lg" />
              ) : (
                <CalendarGrid month={month} posts={posts} onSelectDay={setSelectedDay} />
              )}
            </>
          ) : postsLoading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : (
            <WeekView posts={posts} onSelectDay={setSelectedDay} />
          )}
        </CardContent>
      </Card>

      <DayDetailModal
        date={selectedDay}
        posts={posts}
        open={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        onEdit={(post) => {
          setEditingPost(post);
          setSelectedDay(null);
        }}
        onDelete={(id) => deletePost.mutate(id)}
        onRetry={(id) => retryPost.mutate(id)}
        isMutating={deletePost.isPending || retryPost.isPending}
      />

      <EditPostModal
        post={editingPost}
        accounts={accounts}
        open={editingPost !== null}
        onClose={() => setEditingPost(null)}
      />
    </section>
  );
}
