import { useMemo, useState } from "react";
import { ArrowUpDown, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InstagramIcon, TiktokIcon } from "@/components/icons/social-icons";
import { cn } from "@/lib/utils";
import type { ContentPerformanceItem } from "@/api/echo";

const PLATFORM_STYLE: Record<string, { label: string; badgeClass: string; icon: typeof InstagramIcon }> = {
  instagram: { label: "Instagram", badgeClass: "bg-gradient-to-br from-purple-500 to-pink-500", icon: InstagramIcon },
  tiktok: { label: "TikTok", badgeClass: "bg-black", icon: TiktokIcon },
};

type SortKey = "published_at" | "reach" | "likes" | "comments" | "shares" | "views";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "published_at", label: "Tanggal" },
  { key: "reach", label: "Reach" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Komentar" },
  { key: "shares", label: "Shares" },
  { key: "views", label: "Views" },
];

interface ContentPerformanceTableProps {
  items: ContentPerformanceItem[];
  isLoading?: boolean;
}

export function ContentPerformanceTable({ items, isLoading }: ContentPerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("published_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      let av: number;
      let bv: number;
      if (sortKey === "published_at") {
        av = a.published_at ? new Date(a.published_at).getTime() : 0;
        bv = b.published_at ? new Date(b.published_at).getTime() : 0;
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return copy;
  }, [items, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="Belum ada konten untuk dianalisis"
            description="Hubungkan akun Instagram atau TikTok Anda lewat Maya untuk mulai melihat performa konten."
            action={
              <Button asChild size="sm" variant="outline">
                <Link to="/maya/connect">
                  <Link2 className="mr-1.5 h-3.5 w-3.5" />
                  Hubungkan Akun
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Konten</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                {COLUMNS.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-foreground",
                        sortKey === col.key && "text-foreground"
                      )}
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((item) => {
                const style = PLATFORM_STYLE[item.platform];
                return (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="max-w-[240px] px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 shrink-0 rounded-md bg-muted" />
                        )}
                        <span className="line-clamp-2 text-xs leading-snug text-foreground">
                          {item.caption || "Tanpa caption"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-md text-white",
                          style.badgeClass
                        )}
                      >
                        <style.icon className="h-3.5 w-3.5" />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {item.published_at
                        ? format(new Date(item.published_at), "d MMM yyyy", { locale: id })
                        : "-"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{item.reach.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 tabular-nums">{item.likes.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 tabular-nums">{item.comments.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 tabular-nums">{item.shares.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 tabular-nums">{item.views.toLocaleString("id-ID")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
