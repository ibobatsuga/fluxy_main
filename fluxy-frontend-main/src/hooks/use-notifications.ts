import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/notifications";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.list,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
