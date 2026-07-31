import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motionApi, type MotionBrief } from "@/api/motion";
import { toast } from "sonner";

export function useGenerateMotionPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brief: MotionBrief) => motionApi.generatePrompt(brief),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat prompt video");
    },
  });
}
