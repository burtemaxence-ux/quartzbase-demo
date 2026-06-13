"use client";

import { UserPlus, Mail, Phone } from "lucide-react";
import employees from "@/data/employees.json";
import shifts from "@/data/shifts.json";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getTodayKey(): string {
  const d = new Date().getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

export default function EmployeesPage() {
  const today = getTodayKey();
  const presentIds = new Set(shifts.filter((s) => s.day === today).map((s) => s.employeeId));

  const contractColors: Record<string, string> = {
    CDI: "var(--green)",
    CDD: "var(--yellow)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "22px", color: "var(--text-primary)" }}>
            Équipe
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            {employees.length} employés · {presentIds.size} présents aujourd&apos;hui
          </p>
        </div>
        <button
          disabled
          title="Fonctionnalité Pro — désactivée en démo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--violet)",
            background: "var(--violet-muted)",
            border: "1px solid var(--border-active)",
            cursor: "not-allowed",
            opacity: 0.6,
          }}
        >
          <UserPlus size={15} />
          Inviter un employé
        </button>
      </div>

      {/* Employee grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {employees.map((emp, i) => {
          const isPresent = presentIds.has(emp.id);
          const todayShift = shifts.find((s) => s.employeeId === emp.id && s.day === today);

          return (
            <div
              key={emp.id}
              className="dp-card animate-card-reveal"
              style={{
                padding: "20px",
                animationDelay: `${i * 60}ms`,
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background: `${emp.color}22`,
                      border: `1px solid ${emp.color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: emp.color,
                      fontFamily: "var(--font-syne)",
                    }}
                  >
                    {emp.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {emp.firstName} {emp.lastName}
                    </div>
                    <div style={{ fontSize: "12px", color: emp.color, fontWeight: 500 }}>{emp.role}</div>
                  </div>
                </div>

                {/* Presence badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 9px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: isPresent ? "var(--green-muted)" : "rgba(255,255,255,0.05)",
                    color: isPresent ? "var(--green)" : "var(--text-muted)",
                    border: `1px solid ${isPresent ? "rgba(0,212,170,0.3)" : "var(--border)"}`,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: isPresent ? "var(--green)" : "var(--text-muted)",
                    }}
                  />
                  {isPresent ? "Présent" : "Absent"}
                </div>
              </div>

              {/* Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Contrat</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: contractColors[emp.contractType] ?? "var(--text-secondary)",
                    }}
                  >
                    {emp.contractType} {emp.weeklyHours}h/sem
                  </span>
                </div>
                {todayShift && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Aujourd&apos;hui</span>
                    <span style={{ fontWeight: 600, color: emp.color }}>
                      {todayShift.start}–{todayShift.end}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[Mail, Phone].map((Icon, j) => (
                  <button
                    key={j}
                    disabled
                    title="Désactivé en démo"
                    style={{
                      flex: 1,
                      height: 32,
                      borderRadius: "8px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "not-allowed",
                      opacity: 0.4,
                      color: "var(--text-muted)",
                    }}
                  >
                    <Icon size={13} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
