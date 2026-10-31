import { cn } from "@/lib/utils";

export function Logo({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/logo.png"
        alt="CanchaPro"
        className="h-9 w-9 shrink-0 rounded-lg object-contain"
      />
      <span className={cn("font-display text-lg font-bold tracking-tight", textClassName)}>
        Cancha<span className="text-accent">Pro</span>
      </span>
    </div>
  );
}