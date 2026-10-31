import type { ReservationStatus } from "@/lib/canchapro";
import { cn } from "@/lib/utils";

const MAP: Record<ReservationStatus, { label: string; cls: string; dot: string }> = {
  proxima: { label: "Próxima", cls: "bg-info-soft text-primary", dot: "bg-primary" },
  "en-curso": { label: "En curso", cls: "bg-accent-soft text-accent", dot: "bg-accent" },
  finalizada: { label: "Finalizada", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const s = MAP[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", s.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
