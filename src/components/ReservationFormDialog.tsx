import { useEffect, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calcTotal, formatMoney, validateReservation, type Court, type Reservation } from "@/lib/canchapro";

export function ReservationFormDialog({
  open,
  onOpenChange,
  reservation,
  courts,
  reservations,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  reservation: Reservation | null;
  courts: Court[];
  reservations: Reservation[];
  onSave: (data: Omit<Reservation, "id">) => void;
}) {
  const [courtId, setCourtId] = useState("");
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCourtId(reservation?.courtId ?? "");
    setClientName(reservation?.clientName ?? "");
    setDate(reservation?.date ?? "");
    setStart(reservation?.start ?? "");
    setEnd(reservation?.end ?? "");
    setError(null);
  }, [open, reservation]);

  const court = courts.find((c) => c.id === courtId);
  const total = court ? calcTotal(court.pricePerHour, start, end) : 0;
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data = { id: reservation?.id, courtId, clientName: clientName.trim(), date, start, end };
    const err = validateReservation(data, reservations);
    if (err) return setError(err);
    onSave({ courtId, clientName: data.clientName, date, start, end, total });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reservation ? "Editar reservación" : "Nueva reservación"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cancha</Label>
            <Select value={courtId} onValueChange={setCourtId}>
              <SelectTrigger><SelectValue placeholder="Selecciona una cancha" /></SelectTrigger>
              <SelectContent>
                {courts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {formatMoney(c.pricePerHour)}/h
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client">Nombre del cliente</Label>
            <Input id="client" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Hora inicio</Label>
              <Input id="start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Hora fin</Label>
              <Input id="end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
            <span className="text-sm text-secondary-foreground">Precio total</span>
            <span className="font-display text-xl font-bold text-primary">{formatMoney(total)}</span>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" variant="accent">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
