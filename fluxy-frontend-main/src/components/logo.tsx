import logoUrl from "@/assets/fluxyVector.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function Logo({ size = "md", showText = false, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <img
        src={logoUrl}
        alt="Fluxy Logo"
        className={`${sizeClasses[size]} rounded-lg object-contain`}
      />
      {showText && (
        <span className="text-lg font-bold font-vag-rounded tracking-tight">Fluxy</span>
      )}
    </div>
  );
}
