"use client";

import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { ShiftBar } from "@/components/shift-bar";
import employees from "@/data/employees.json";
import shifts from "@/data/shifts.json";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS: Record<string, string> = {
  Mon: "Lun", Tue: "Mar", Wed: "Mer", Thu: "Jeu", Fri: "Ven", Sat: "Sam", Sun: "Dim",
};

function getWeekDates(): { key: string; label: string; date: number; isToday: boolean }[] {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));

  return DAYS.map((key, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday = d.toDateString() === now.toDateString();
    return { key, label: DAY_LABELS[key], date: d.getDate(), isToday };
  });
}

function getWeekRange(): string {
  const days = getWeekDates();
  const first = new Date();
  first.setDate(first.getDate() - (first.getDay() === 0 ? 6 : first.getDay() - 1));
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${fmt(first)} – ${fmt(last)}`;
}

function totalHours(): number {
  return shifts.reduce((acc, s) => {
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    return acc + (eh + em / 60 - sh - sm / 60);
  }, 0);
}

const TIME_LABELS = ["6h", "8h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];

export default function PlanningPage() {
  const weekDays = getWeekDates();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "22px", color: "var(--text-primary)" }}>
            Planning semaine
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{getWeekRange()}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            style={{
              width: 34, height: 34, borderRadius: "8px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)",
            }}
            title="Semaine précédente (démo)"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", minWidth: 120, textAlign: "center" }}>
            {getWeekRange()}
          </span>
          <button
            style={{
              width: 34, height: 34, borderRadius: "8px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)",
            }}
            title="Semaine suivante (démo)"
          >
            <ChevronRight size={16} />
          </button>
          <div
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "var(--green-muted)", border: "1px solid rgba(0,212,170,0.3)",
              borderRadius: "8px", padding: "5px 12px",
              fontSize: "12px", fontWeight: 600, color: "var(--green)",
            }}
          >
            <CheckCircle size={13} />
            Publiée ✓
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className="dp-card"
        style={{ padding: "0", overflow: "auto" }}
      >
        {/* Day headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px repeat(7, 1fr)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ padding: "12px 16px", fontSize: "11px", color: "var(--text-muted)" }}>Employé</div>
          {weekDays.map((day) => (
            <div
              key={day.key}
              style={{
                padding: "12px 8px",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: day.isToday ? 700 : 500,
                color: day.isToday ? "var(--violet)" : "var(--text-secondary)",
                borderLeft: "1px solid var(--border)",
                background: day.isToday ? "var(--violet-muted)" : "transparent",
              }}
            >
              <div>{day.label}</div>
              <div style={{ fontSize: "16px", fontFamily: "var(--font-syne)", fontWeight: 700, marginTop: "2px" }}>
                {day.date}
              </div>
            </div>
          ))}
        </div>

        {/* Employee rows */}
        {employees.map((emp, empIdx) => (
          <div
            key={emp.id}
            style={{
              display: "grid",
              gridTemplateColumns: "180px repeat(7, 1fr)",
              borderBottom: empIdx < employees.length - 1 ? "1px solid var(--border-subtle)" : "none",
              animationDelay: `${empIdx * 60}ms`,
            }}
            className="animate-slide-left"
          >
            {/* Employee name */}
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  background: `${emp.color}22`,
                  border: `1px solid ${emp.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: emp.color,
                  flexShrink: 0,
                }}
              >
                {emp.initials}
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {emp.firstName}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{emp.role}</div>
              </div>
            </div>

            {/* Day cells */}
            {weekDays.map((day) => {
              const dayShift = shifts.find((s) => s.employeeId === emp.id && s.day === day.key);
              return (
                <div
                  key={day.key}
                  style={{
                    borderLeft: "1px solid var(--border-subtle)",
                    padding: "8px 6px",
                    height: "52px",
                    position: "relative",
                    background: day.isToday ? "rgba(108,99,255,0.03)" : "transparent",
                  }}
                >
                  {dayShift && (
                    <div style={{ position: "relative", height: "100%" }}>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "6px",
                          background: `${dayShift.color}18`,
                          border: `1px solid ${dayShift.color}44`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `inset 2px 0 0 ${dayShift.color}`,
                        }}
                      >
                        <span style={{ fontSize: "10px", fontWeight: 700, color: dayShift.color }}>
                          {dayShift.start}
                        </span>
                        <span style={{ fontSize: "9px", color: `${dayShift.color}99` }}>
                          {dayShift.end}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer recap */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div className="dp-card" style={{ padding: "14px 20px", flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Total heures</div>
          <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "var(--violet)" }}>
            {Math.round(totalHours())}h
          </div>
        </div>
        <div className="dp-card" style={{ padding: "14px 20px", flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Nombre de shifts</div>
          <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "var(--green)" }}>
            {shifts.length}
          </div>
        </div>
        <div className="dp-card" style={{ padding: "14px 20px", flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Employés couverts</div>
          <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "var(--yellow)" }}>
            {new Set(shifts.map((s) => s.employeeId)).size}/8
          </div>
        </div>
      </div>
    </div>
  );
}
