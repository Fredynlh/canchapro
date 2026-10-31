import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LandPlot, CalendarDays, Plus, ArrowRight, Clock, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, reservationStatus, useCourts, useReservations } from "@/lib/canchapro";
import { getActivity, getSession, type Activity } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CanchaPro — Panel principal" },
      { name: "description", content: "Administra tus canchas deportivas y reservaciones con CanchaPro." },
      { property: "og:title", content: "CanchaPro — Panel principal" },
      { property: "og:description", content: "Administra tus canchas deportivas y reservaciones con CanchaPro." },
    ],
  }),
  component: Index,
});

const ACT_ICON = { create: PlusCircle, update: Pencil, delete: Trash2 };
const ACT_CLS = { create: "bg-accent-soft text-accent", update: "bg-info-soft text-primary", delete: "bg-destructive/10 text-destructive" };

function timeAgo(at: number) {
  const m = Math.floor((Date.now() - at) / 60000);
  if (m < 1) return "Hace un momento";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} h`;
  return new Date(at).toLocaleDateString("es-GT");
}

function Index() {
  const [courts] = useCourts();
  const [reservations] = useReservations();
  const [activity, setActivity] = useState<Activity[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setActivity(getActivity().slice(0, 6));
    setName(getSession()?.email.split("@")[0] ?? "");
  }, []);

  const upcoming = reservations
    .filter((r) => reservationStatus(r) !== "finalizada")
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
    .slice(0, 5);
  const courtName = (id: string) => courts.find((c) => c.id === id)?.name ?? "—";

  const stats = [
    { to: "/canchas" as const, title: "Canchas registradas", count: courts.length, icon: LandPlot, cls: "bg-gradient-brand" },
    { to: "/reservaciones" as const, title: "Reservaciones", count: reservations.length, icon: CalendarDays, cls: "bg-gradient-accent" },
  ];

  return (
    <AppShell>
      <PageHeader
        title={`¡Hola${name ? `, ${name}` : ""}! 👋`}
        subtitle="Bienvenido a CanchaPro. Esto es lo que está pasando hoy."
        action={
          <>
            <Button asChild variant="outline">
              <Link to="/canchas" search={{ nuevo: true }}><Plus /> Registrar cancha</Link>
            </Button>
            <Button asChild variant="accent">
              <Link to="/reservaciones" search={{ nuevo: true }}><Plus /> Crear reservación</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {stats.map((s) => (
          <Link key={s.to} to={s.to} className="surface group flex items-center gap-5 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-primary-foreground ${s.cls}`}>
              <s.icon className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">{s.title}</p>
              <p className="font-display text-4xl font-bold text-foreground">{s.count}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="surface p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Próximas reservaciones</h2>
            <Link to="/reservaciones" className="text-sm font-medium text-accent hover:underline">Ver todas</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No hay reservaciones próximas.</p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((r) => (
                <li key={r.id} className="flex items-center gap-4 py-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      {new Date(r.date + "T00:00").toLocaleDateString("es-GT", { month: "short" })}
                    </span>
                    <span className="font-display text-lg font-bold leading-none">{r.date.slice(8)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.clientName}</p>
                    <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" /> {r.start} – {r.end} · {courtName(r.courtId)}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="font-semibold">{formatMoney(r.total)}</p>
                    <StatusBadge status={reservationStatus(r)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold">Actividad reciente</h2>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aún no hay actividad.</p>
          ) : (
            <ul className="space-y-4">
              {activity.map((a) => {
                const Icon = ACT_ICON[a.kind];
                return (
                  <li key={a.id} className="flex gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ACT_CLS[a.kind]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm">{a.text}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(a.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
