import { useEffect, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Court, CourtType } from "@/lib/canchapro";

export function CourtFormDialog({
  open,
  onOpenChange,
  court,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  court: Court | null;
  onSave: (data: Omit<Court, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CourtType>("sintetica");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(court?.name ?? "");
    setType(court?.type ?? "sintetica");
    setPrice(court ? String(court.pricePerHour) : "");
    setDescription(court?.description ?? "");
    setError(null);
  }, [open, court]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = Number(price);
    if (!name.trim()) return setError("Ingresa el nombre de la cancha.");
    if (!price || isNaN(p) || p <= 0) return setError("Ingresa un precio por hora válido.");
    onSave({ name: name.trim(), type, pricePerHour: p, description: description.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{court ? "Editar cancha" : "Registrar cancha"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as CourtType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sintetica">Sintética</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio por hora (Q)</Label>
              <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Descripción (opcional)</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
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
