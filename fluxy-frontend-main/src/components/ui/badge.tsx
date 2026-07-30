import { cn } from "@/lib/utils";
import { badgeVariants } from "./badge-variants";
import type { VariantProps } from "class-variance-authority";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
