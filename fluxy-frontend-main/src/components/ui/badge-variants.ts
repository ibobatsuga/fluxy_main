import { cva, type VariantProps } from "class-variance-authority";

// Fix #11: badgeVariants dipindah ke file .ts terpisah agar badge.tsx hanya
// export komponen — ini memenuhi react/only-export-components rule dan
// memungkinkan Fast Refresh bekerja dengan benar.
export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-violet-100 text-violet-700 dark:bg-primary/15 dark:text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-500",
        warning: "border-transparent bg-amber-100 text-amber-700 dark:bg-yellow-500/15 dark:text-yellow-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariantsProps = VariantProps<typeof badgeVariants>;
