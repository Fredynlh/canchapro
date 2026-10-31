import { describe, expect, it } from "vitest";
import { calcTotal, validateReservation, type Reservation } from "./canchapro";

const now = new Date(2026, 0, 1, 8, 0);
const base = { courtId: "c1", clientName: "Ana", date: "2026-01-02", start: "10:00", end: "11:00" };
const existing: Reservation[] = [{ id: "r1", ...base, total: 100 }];

describe("reservaciones", () => {
  it("calcula el total según el precio por hora", () => {
    expect(calcTotal(100, "10:00", "11:30")).toBe(150);
  });
  it("rechaza horario ocupado", () => {
    expect(validateReservation({ ...base, start: "10:30", end: "12:00" }, existing, now)).toMatch(/ocupada/);
  });
  it("permite horario contiguo", () => {
    expect(validateReservation({ ...base, start: "11:00", end: "12:00" }, existing, now)).toBeNull();
  });
  it("exige fin posterior al inicio", () => {
    expect(validateReservation({ ...base, courtId: "c2", start: "11:00", end: "10:00" }, [], now)).toMatch(/posterior/);
  });
  it("rechaza fechas pasadas", () => {
    expect(validateReservation({ ...base, date: "2025-12-31" }, [], now)).toMatch(/pasada/);
  });
  it("al editar no choca consigo misma", () => {
    expect(validateReservation({ ...base, id: "r1" }, existing, now)).toBeNull();
  });
});

import { reservationStatus } from "./canchapro";
describe("estado de reservación", () => {
  const r = { date: "2026-01-02", start: "10:00", end: "11:00" };
  it("próxima, en curso y finalizada", () => {
    expect(reservationStatus(r, new Date(2026, 0, 2, 9, 0))).toBe("proxima");
    expect(reservationStatus(r, new Date(2026, 0, 2, 10, 30))).toBe("en-curso");
    expect(reservationStatus(r, new Date(2026, 0, 2, 11, 0))).toBe("finalizada");
  });
});
