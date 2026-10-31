import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { ReservationFormDialog } from "@/components/ReservationFormDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, newId, reservationStatus, useCourts, useReservations, type Reservation } from "@/lib/canchapro";
import { logActivity } from "@/lib/session";

export const Route = createFileRoute("/reservaciones")({
  validateSearch: (s: Record<string, unknown>): { nuevo?: boolean } => (s["nuevo"] ? { nuevo: true } : {}),
  head: () => ({
    meta: [
      { title: "Reservaciones — CanchaPro" },
      { name: "description", content: "Crea y administra las reservaciones de canchas." },
      { property: "og:title", content: "Reservaciones — CanchaPro" },
      { property: "og:description", content: "Crea y administra las reservaciones de canchas." },
    ],
  }),
  component: ReservacionesPage,
});

const fmtDate = (d: string) => d.split("-").reverse().join("/");

function ReservacionesPage() {
  const { nuevo } = Route.useSearch();
  const navigate = useNavigate();
  const [courts] = useCourts();
  const [reservations, setReservations] = useReservations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);

  useEffect(() => {
    if (nuevo) {
      setEditing(null);
      setOpen(true);
      navigate({ to: "/reservaciones", search: {}, replace: true });
    }
  }, [nuevo, navigate]);

  const save = (data: Omit<Reservation, "id">) => {
    if (editing) {
      setReservations(reservations.map((r) => (r.id === editing.id ? { ...data, id: editing.id } : r)));
      logActivity("update", `Reservación de ${data.clientName} actualizada`);
      toast.success("Reservación actualizada");
    } else {
      setReservations([...reservations, { ...data, id: newId() }]);
      logActivity("create", `Nueva reservación de ${data.clientName}`);
      toast.success("Reservación creada");
    }
    setOpen(false);
  };

  const remove = (r: Reservation) => {
    setReservations(reservations.filter((x) => x.id !== r.id));
    logActivity("delete", `Reservación de ${r.clientName} eliminada`);
    toast.success("Reservación eliminada");
  };

  const sorted = [...reservations].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const courtName = (id: string) => courts.find((c) => c.id === id)?.name ?? "—";

  const Actions = ({ r }: { r: Reservation }) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => { setEditing(r); setOpen(true); }}>
        <Pencil />
      </Button>
      <ConfirmDelete
        title="¿Eliminar reservación?"
        description={`Se eliminará la reservación de ${r.clientName}. Esta acción no se puede deshacer.`}
        onConfirm={() => remove(r)}
        trigger={
          <Button variant="ghost-destructive" size="icon" aria-label="Eliminar">
            <Trash2 />
          </Button>
        }
      />
    </div>
  );

  return (
    <AppShell>
      <PageHeader
        title="Reservaciones"
        subtitle="Administra las reservaciones de tus canchas."
        action={
          <Button variant="accent" disabled={courts.length === 0} onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus /> Nueva reservación
          </Button>
        }
      />
      {courts.length === 0 && (
        <p className="mb-4 rounded-lg bg-warning-soft px-4 py-3 text-sm">
          Primero <Link to="/canchas" className="font-medium text-accent underline">registra una cancha</Link> para poder crear reservaciones.
        </p>
      )}

      {sorted.length === 0 ? (
        <div className="surface flex flex-col items-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CalendarDays className="h-7 w-7" />
          </div>
          <p className="mt-4 font-medium">No hay reservaciones registradas</p>
        </div>
      ) : (
        <>
          {/* Tabla en pantallas medianas y grandes */}
          <div className="surface hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  {["Cliente", "Cancha", "Fecha", "Horario", "Estado"].map((h) => (
                    <TableHead key={h} className="h-12 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</TableHead>
                  ))}
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Precio</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.id} className="transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold uppercase text-primary-foreground">
                          {r.clientName.charAt(0)}
                        </div>
                        <span className="font-medium">{r.clientName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{courtName(r.courtId)}</TableCell>
                    <TableCell>{fmtDate(r.date)}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.start} – {r.end}</TableCell>
                    <TableCell><StatusBadge status={reservationStatus(r)} /></TableCell>
                    <TableCell className="text-right font-semibold">{formatMoney(r.total)}</TableCell>
                    <TableCell><Actions r={r} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Tarjetas en teléfonos */}
          <div className="space-y-3 md:hidden">
            {sorted.map((r) => (
              <div key={r.id} className="surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.clientName}</p>
                    <p className="truncate text-sm text-muted-foreground">{courtName(r.courtId)}</p>
                  </div>
                  <StatusBadge status={reservationStatus(r)} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                  <div className="text-sm">
                    <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> {fmtDate(r.date)}</p>
                    <p className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {r.start} – {r.end}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatMoney(r.total)}</p>
                    <Actions r={r} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <ReservationFormDialog
        open={open}
        onOpenChange={setOpen}
        reservation={editing}
        courts={courts}
        reservations={reservations}
        onSave={save}
      />
    </AppShell>
  );
}
