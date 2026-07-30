import { useQuery } from "@tanstack/react-query";
import { accountsApi, postsApi, kaiDeviceApi, analyticsApi, usageApi } from "@/api/dashboard";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecentPosts(limit = 5) {
  return useQuery({
    queryKey: ["posts", "recent", limit],
    queryFn: () => postsApi.list({ per_page: limit }),
    staleTime: 1 * 60 * 1000,
  });
}

export function useKaiDevice() {
  return useQuery({
    queryKey: ["kai", "device"],
    queryFn: kaiDeviceApi.status,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyticsOverview(days = 30) {
  return useQuery({
    queryKey: ["analytics", "overview", days],
    queryFn: () => analyticsApi.overview({ days }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsageSummary() {
  return useQuery({
    queryKey: ["usage", "summary"],
    queryFn: usageApi.summary,
    staleTime: 60 * 1000,
  });
}
