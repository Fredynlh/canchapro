import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LandPlot, Pencil, Plus, Trash2, Leaf, Layers } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { CourtFormDialog } from "@/components/CourtFormDialog";
import { Button } from "@/components/ui/button";
import { COURT_TYPE_LABEL, formatMoney, newId, useCourts, useReservations, type Court } from "@/lib/canchapro";
import { logActivity } from "@/lib/session";

export const Route = createFileRoute("/canchas")({
  validateSearch: (s: Record<string, unknown>): { nuevo?: boolean } => (s["nuevo"] ? { nuevo: true } : {}),
  head: () => ({
    meta: [
      { title: "Canchas — CanchaPro" },
      { name: "description", content: "Registra, edita y elimina las canchas deportivas." },
      { property: "og:title", content: "Canchas — CanchaPro" },
      { property: "og:description", content: "Registra, edita y elimina las canchas deportivas." },
    ],
  }),
  component: CanchasPage,
});

function CanchasPage() {
  const { nuevo } = Route.useSearch();
  const navigate = useNavigate();
  const [courts, setCourts] = useCourts();
  const [reservations, setReservations] = useReservations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Court | null>(null);

  useEffect(() => {
    if (nuevo) {
      setEditing(null);
      setOpen(true);
      navigate({ to: "/canchas", search: {}, replace: true });
    }
  }, [nuevo, navigate]);

  const save = (data: Omit<Court, "id">) => {
    if (editing) {
      setCourts(courts.map((c) => (c.id === editing.id ? { ...data, id: editing.id } : c)));
      logActivity("update", `Cancha "${data.name}" actualizada`);
      toast.success("Cancha actualizada");
    } else {
      setCourts([...courts, { ...data, id: newId() }]);
      logActivity("create", `Cancha "${data.name}" registrada`);
      toast.success("Cancha registrada");
    }
    setOpen(false);
  };

  const remove = (c: Court) => {
    setCourts(courts.filter((x) => x.id !== c.id));
    setReservations(reservations.filter((r) => r.courtId !== c.id));
    logActivity("delete", `Cancha "${c.name}" eliminada`);
    toast.success("Cancha eliminada");
  };

  return (
    <AppShell>
      <PageHeader
        title="Canchas"
        subtitle="Administra las canchas disponibles."
        action={
          <Button variant="accent" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus /> Registrar cancha
          </Button>
        }
      />
      {courts.length === 0 ? (
        <div className="surface flex flex-col items-center border-dashed p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <LandPlot className="h-7 w-7" />
          </div>
          <p className="mt-4 font-medium">Aún no hay canchas registradas</p>
          <p className="mt-1 text-sm text-muted-foreground">Registra tu primera cancha para comenzar.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courts.map((c) => {
            const TypeIcon = c.type === "natural" ? Leaf : Layers;
            return (
              <article key={c.id} className="surface group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
                <div className="relative h-24 bg-gradient-brand">
                  <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full text-primary-foreground/15" fill="none" stroke="currentColor" strokeWidth="1.5" preserveAspectRatio="none">
                    <rect x="10" y="8" width="180" height="64" rx="2" />
                    <line x1="100" y1="8" x2="100" y2="72" />
                    <circle cx="100" cy="40" r="12" />
                    <rect x="10" y="24" width="20" height="32" />
                    <rect x="170" y="24" width="20" height="32" />
                  </svg>
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-soft">
                    <TypeIcon className="h-3.5 w-3.5 text-accent" /> {COURT_TYPE_LABEL[c.type]}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="truncate font-display text-lg font-semibold">{c.name}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{c.description || "Sin descripción."}</p>
                  <div className="mt-4 flex items-end justify-between gap-2 border-t pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Precio por hora</p>
                      <p className="font-display text-xl font-bold text-accent">{formatMoney(c.pricePerHour)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => { setEditing(c); setOpen(true); }}>
                        <Pencil />
                      </Button>
                      <ConfirmDelete
                        title="¿Eliminar cancha?"
                        description={`Se eliminará "${c.name}" y sus reservaciones. Esta acción no se puede deshacer.`}
                        onConfirm={() => remove(c)}
                        trigger={
                          <Button variant="ghost-destructive" size="icon" aria-label="Eliminar">
                            <Trash2 />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <CourtFormDialog open={open} onOpenChange={setOpen} court={editing} onSave={save} />
    </AppShell>
  );
}
