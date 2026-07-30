import { useQuery } from "@tanstack/react-query";
import { usageApi } from "@/api/usage";
import type { UsageSummary } from "@/types";

export function useUsageSummary() {
  return useQuery<UsageSummary>({
    queryKey: ["usage", "summary"],
    queryFn: () => usageApi.getSummary(),
  });
}
