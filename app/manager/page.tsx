"use client";

import { Users, CalendarCheck, AlertTriangle, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { ShiftBar } from "@/components/shift-bar";
import stats from "@/data/stats.json";
import shifts from "@/data/shifts.json";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS: Record<string, string> = {
  Mon: "Lun", Tue: "Mar", Wed: "Mer", Thu: "Jeu", Fri: "Ven", Sat: "Sam", Sun: "Dim",
};

function getTodayKey(): string {
  const d = new Date().getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

export default function ManagerDashboard() {
  const today = getTodayKey();
  const todayLabel = DAY_LABELS[today] ?? "Aujourd'hui";
  const todayShifts = shifts.filter((s) => s.day === today);

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const cards = [
    {
      label: "Taux de présence",
      value: stats.presenceRate,
      suffix: "%",
      color: "green",
      icon: TrendingUp,
      trend: "+3%",
      delay: 0,
    },
    {
      label: `Employés présents`,
      value: stats.activeEmployees,
      suffix: `/${stats.totalEmployees}`,
      color: "violet",
      icon: Users,
      delay: 80,
    },
    {
      label: "Congés en attente",
      value: stats.pendingLeaves,
      color: "yellow",
      icon: CalendarCheck,
      delay: 160,
    },
    {
      label: "Score conformité",
      value: stats.complianceScore,
      suffix: "/100",
      color: "green",
      icon: AlertTriangle,
      trend: "✓",
      delay: 240,
    },
  ];

  const quickActions = [
    { label: "Publier le planning", color: "var(--violet)" },
    { label: "Valider les congés", color: "var(--yellow)" },
    { label: "Exporter PDF", color: "var(--text-muted)" },
  ];

  return (
    <div className="animate-dashboard" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "24px",
            color: "var(--text-primary)",
            marginBottom: "4px",
          }}
        >
          Bonjour Maxence 👋
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          La Boulangerie du Soleil · {dateFormatted}
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Today's planning */}
      <div className="dp-card animate-fade-slide-up" style={{ padding: "24px", animationDelay: "300ms" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "16px",
                color: "var(--text-primary)",
              }}
            >
              Planning du {todayLabel.toLowerCase()}
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              {todayShifts.length} shift{todayShifts.length > 1 ? "s" : ""} planifié
              {todayShifts.length > 1 ? "s" : ""}
            </p>
          </div>
          <a
            href="/manager/planning"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "var(--violet)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Voir tout <ChevronRight size={14} />
          </a>
        </div>

        {todayShifts.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
            Aucun shift planifié aujourd&apos;hui
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {todayShifts.map((shift, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: `${shift.color}22`,
                    border: `1px solid ${shift.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: shift.color,
                    flexShrink: 0,
                  }}
                >
                  {shift.employeeName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {shift.employeeName}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{shift.role}</div>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: shift.color,
                    background: `${shift.color}18`,
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {shift.start}–{shift.end}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="animate-fade-slide-up" style={{ animationDelay: "400ms" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "15px",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Actions rapides
        </h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {quickActions.map(({ label, color }) => (
            <button
              key={label}
              disabled
              title="Fonctionnalité désactivée en démo"
              style={{
                padding: "9px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                color,
                background: `${color}18`,
                border: `1px solid ${color}33`,
                cursor: "not-allowed",
                opacity: 0.6,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
