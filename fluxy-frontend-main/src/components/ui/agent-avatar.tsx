import { cn } from "@/lib/utils";

interface AgentAvatarProps {
  img: string;
  name: string;
  /** Tailwind background class for the circle behind the cropped photo, e.g. "bg-violet-600" */
  bgClassName?: string;
  /** Tailwind size classes, e.g. "h-20 w-20" */
  size?: string;
  className?: string;
}

export function AgentAvatar({
  img,
  name,
  bgClassName = "bg-zinc-200",
  size = "h-20 w-20",
  className,
}: AgentAvatarProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-full", size, bgClassName, className)}
    >
      <img
        src={img}
        alt={name}
        className="absolute left-1/2 top-0 h-[150%] w-auto max-w-none -translate-x-1/2 object-contain"
      />
    </div>
  );
}
