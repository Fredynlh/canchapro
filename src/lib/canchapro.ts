import { useEffect, useState, useCallback } from "react";

export type CourtType = "sintetica" | "natural";

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  pricePerHour: number;
  description?: string | undefined;
}

export interface Reservation {
  id: string;
  courtId: string;
  clientName: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  total: number;
}

export const COURT_TYPE_LABEL: Record<CourtType, string> = {
  sintetica: "Sintética",
  natural: "Natural",
};

const toMinutes = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
};

export function calcTotal(pricePerHour: number, start: string, end: string): number {
  if (!start || !end) return 0;
  const mins = toMinutes(end) - toMinutes(start);
  if (mins <= 0) return 0;
  return Math.round(((pricePerHour * mins) / 60) * 100) / 100;
}

/** Returns an error message, or null when the reservation is valid. */
export function validateReservation(
  r: Omit<Reservation, "id" | "total"> & { id?: string | undefined },
  existing: Reservation[],
  now: Date = new Date(),
): string | null {
  if (!r.courtId) return "Selecciona una cancha.";
  if (!r.clientName.trim()) return "Ingresa el nombre del cliente.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || isNaN(Date.parse(r.date)))
    return "La fecha no es válida.";
  if (!/^\d{2}:\d{2}$/.test(r.start) || !/^\d{2}:\d{2}$/.test(r.end))
    return "El horario no es válido.";
  if (toMinutes(r.end) <= toMinutes(r.start))
    return "La hora de finalización debe ser posterior a la hora de inicio.";
  const [y = 0, mo = 1, d = 1] = r.date.split("-").map(Number);
  const [h = 0, mi = 0] = r.start.split(":").map(Number);
  if (new Date(y, mo - 1, d, h, mi) < now) return "No se puede reservar en una fecha u hora pasada.";
  const clash = existing.some(
    (e) =>
      e.id !== r.id &&
      e.courtId === r.courtId &&
      e.date === r.date &&
      toMinutes(r.start) < toMinutes(e.end) &&
      toMinutes(e.start) < toMinutes(r.end),
  );
  if (clash) return "La cancha ya está ocupada en ese horario.";
  return null;
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

export const formatMoney = (n: number) =>
  "Q" + n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [key]);
  const save = useCallback(
    (next: T) => {
      setValue(next);
      localStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );
  return [value, save] as const;
}

export const useCourts = () => useStored<Court[]>("canchapro.courts", []);
export const useReservations = () => useStored<Reservation[]>("canchapro.reservations", []);

export type ReservationStatus = "proxima" | "en-curso" | "finalizada";

export function reservationStatus(r: Pick<Reservation, "date" | "start" | "end">, now: Date = new Date()): ReservationStatus {
  const [y = 0, mo = 1, d = 1] = r.date.split("-").map(Number);
  const at = (t: string) => {
    const [h = 0, m = 0] = t.split(":").map(Number);
    return new Date(y, mo - 1, d, h, m).getTime();
  };
  const n = now.getTime();
  if (n < at(r.start)) return "proxima";
  if (n < at(r.end)) return "en-curso";
  return "finalizada";
}
