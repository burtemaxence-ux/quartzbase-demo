"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Cpu,
  Wand2,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
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
  const first = new Date();
  first.setDate(first.getDate() - (first.getDay() === 0 ? 6 : first.getDay() - 1));
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${fmt(first)} – ${fmt(last)}`;
}

function totalHours(list: typeof shifts): number {
  return list.reduce((acc, s) => {
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    return acc + (eh + em / 60 - sh - sm / 60);
  }, 0);
}

// Stable reveal order: day by day, employee by employee (mirrors a
// "jour par jour" generation like the real Nexus AI planner).
const ORDERED_SHIFTS = DAYS.flatMap((day) =>
  employees
    .map((emp) => shifts.find((s) => s.employeeId === emp.id && s.day === day))
    .filter((s): s is (typeof shifts)[number] => Boolean(s))
);

type Phase = "empty" | "generating" | "published";
type Method = "algo" | "ia";

const METHODS: {
  id: Method;
  label: string;
  desc: string;
  icon: typeof Cpu;
  color: string;
  duration: number;
}[] = [
  {
    id: "algo",
    label: "Algorithme déterministe",
    desc: "Instantané et reproductible. Répartit les heures contractuelles en respectant repos et disponibilités.",
    icon: Cpu,
    color: "var(--green)",
    duration: 1100,
  },
  {
    id: "ia",
    label: "Génération IA",
    desc: "Optimise l'équité, la couverture des postes et le confort de l'équipe. Un créneau à la fois.",
    icon: Sparkles,
    color: "var(--violet)",
    duration: 2400,
  },
];

export default function PlanningPage() {
  const weekDays = getWeekDates();
  const [phase, setPhase] = useState<Phase>("empty");
  const [modalOpen, setModalOpen] = useState(false);
  const [method, setMethod] = useState<Method>("ia");
  const [revealed, setRevealed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activeMethod = METHODS.find((m) => m.id === method)!;

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function launch() {
    setModalOpen(false);
    setPhase("generating");
    setRevealed(0);
    const total = ORDERED_SHIFTS.length;
    const step = activeMethod.duration / total;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    for (let i = 1; i <= total; i++) {
      timers.current.push(
        setTimeout(() => {
          setRevealed(i);
          if (i === total) setTimeout(() => setPhase("published"), 250);
        }, step * i)
      );
    }
  }

  const visible = phase === "published" ? shifts.length : revealed;
  const visibleSet = useMemo(
    () => new Set(ORDERED_SHIFTS.slice(0, visible)),
    [visible]
  );
  const shownShifts = ORDERED_SHIFTS.slice(0, visible);
  const progress = Math.round((visible / ORDERED_SHIFTS.length) * 100);

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
            style={navBtn}
            title="Semaine précédente (démo)"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            style={navBtn}
            title="Semaine suivante (démo)"
          >
            <ChevronRight size={16} />
          </button>

          {phase === "published" ? (
            <>
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "8px", padding: "7px 14px",
                  fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <Wand2 size={13} /> Régénérer
              </button>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "var(--green-muted)", border: "1px solid rgba(0,212,170,0.3)",
                  borderRadius: "8px", padding: "7px 12px",
                  fontSize: "12px", fontWeight: 600, color: "var(--green)",
                }}
              >
                <CheckCircle size={13} />
                Publiée ✓
              </div>
            </>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              disabled={phase === "generating"}
              className="btn-primary"
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "8px 16px", fontSize: "13px",
                opacity: phase === "generating" ? 0.6 : 1,
                cursor: phase === "generating" ? "wait" : "pointer",
              }}
            >
              {phase === "generating" ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
              {phase === "generating" ? "Génération…" : "Générer le planning"}
            </button>
          )}
        </div>
      </div>

      {/* Generation status bar */}
      {phase === "generating" && (
        <div
          className="dp-card"
          style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <activeMethod.icon size={16} color={activeMethod.color} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              {method === "ia" ? "L'IA construit le planning, jour par jour…" : "L'algorithme répartit les créneaux…"}
            </span>
          </div>
          <div style={{ flex: 1, height: 6, borderRadius: 4, background: "var(--bg-elevated)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: activeMethod.color,
                borderRadius: 4,
                transition: "width 0.12s linear",
              }}
            />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: activeMethod.color, minWidth: 36, textAlign: "right" }}>
            {progress}%
          </span>
        </div>
      )}

      {/* Grid */}
      <div className="dp-card" style={{ padding: "0", overflow: "auto", position: "relative" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "180px repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ padding: "12px 16px", fontSize: "11px", color: "var(--text-muted)" }}>Employé</div>
          {weekDays.map((day) => (
            <div
              key={day.key}
              style={{
                padding: "12px 8px", textAlign: "center", fontSize: "12px",
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
        {employees.map((emp) => (
          <div
            key={emp.id}
            style={{
              display: "grid",
              gridTemplateColumns: "180px repeat(7, 1fr)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {/* Employee name */}
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: "8px",
                  background: `${emp.color}22`, border: `1px solid ${emp.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700, color: emp.color, flexShrink: 0,
                }}
              >
                {emp.initials}
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{emp.firstName}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{emp.role}</div>
              </div>
            </div>

            {/* Day cells */}
            {weekDays.map((day) => {
              const dayShift = shifts.find((s) => s.employeeId === emp.id && s.day === day.key);
              const show = dayShift && visibleSet.has(dayShift);
              return (
                <div
                  key={day.key}
                  style={{
                    borderLeft: "1px solid var(--border-subtle)",
                    padding: "8px 6px", height: "52px", position: "relative",
                    background: day.isToday ? "rgba(108,99,255,0.03)" : "transparent",
                  }}
                >
                  {show && (
                    <div className="animate-card-reveal" style={{ position: "relative", height: "100%" }}>
                      <div
                        style={{
                          position: "absolute", inset: 0, borderRadius: "6px",
                          background: `${dayShift.color}18`, border: `1px solid ${dayShift.color}44`,
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          boxShadow: `inset 2px 0 0 ${dayShift.color}`,
                        }}
                      >
                        <span style={{ fontSize: "10px", fontWeight: 700, color: dayShift.color }}>{dayShift.start}</span>
                        <span style={{ fontSize: "9px", color: `${dayShift.color}99` }}>{dayShift.end}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Empty overlay CTA */}
        {phase === "empty" && (
          <div
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.88) 100%)",
              backdropFilter: "blur(1.5px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "14px", textAlign: "center", padding: "24px",
            }}
          >
            <div
              style={{
                width: 56, height: 56, borderRadius: "16px",
                background: "linear-gradient(135deg, var(--violet), #9b8dff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 30px rgba(108,99,255,0.4)",
              }}
            >
              <Sparkles size={26} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)" }}>
                Aucun planning pour cette semaine
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: 380 }}>
                Laissez Quartzbase composer un planning conforme en un clic — algorithme instantané ou IA optimisée.
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 22px", fontSize: "14px" }}
            >
              <Wand2 size={16} /> Générer le planning
            </button>
          </div>
        )}
      </div>

      {/* Footer recap */}
      {phase !== "empty" && (
        <>
          {phase === "published" && (
            <div
              className="animate-fade-slide-up"
              style={{
                display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
                background: `${activeMethod.color}14`,
                border: `1px solid ${activeMethod.color}44`,
                borderRadius: "12px", padding: "12px 16px",
              }}
            >
              <activeMethod.icon size={16} color={activeMethod.color} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Généré par {method === "ia" ? "l'IA" : "l'algorithme"}
              </span>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  fontSize: "12px", fontWeight: 600, color: "var(--green)",
                  background: "var(--green-muted)", borderRadius: "6px", padding: "3px 9px",
                }}
              >
                <ShieldCheck size={12} /> 0 conflit de conformité
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {method === "ia" ? "Optimisé : équité + couverture des postes" : "Répartition contractuelle respectée"}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div className="dp-card" style={{ padding: "14px 20px", flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Total heures</div>
              <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "var(--violet)" }}>
                {Math.round(totalHours(shownShifts))}h
              </div>
            </div>
            <div className="dp-card" style={{ padding: "14px 20px", flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Créneaux placés</div>
              <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "var(--green)" }}>
                {shownShifts.length}
              </div>
            </div>
            <div className="dp-card" style={{ padding: "14px 20px", flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Employés couverts</div>
              <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "var(--yellow)" }}>
                {new Set(shownShifts.map((s) => s.employeeId)).size}/{employees.length}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Generation modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(6,6,12,0.72)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-card-reveal"
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border-active)",
              borderRadius: "18px", padding: "24px", width: "100%", maxWidth: 460,
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)" }}>
                Générer le planning
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "18px" }}>
              Semaine du {getWeekRange()} · {employees.length} employés · convention Boulangerie-Pâtisserie
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {METHODS.map((m) => {
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    style={{
                      textAlign: "left", padding: "14px 16px", borderRadius: "12px",
                      background: active ? `${m.color}14` : "var(--bg-elevated)",
                      border: `1px solid ${active ? m.color : "var(--border)"}`,
                      cursor: "pointer", display: "flex", gap: "12px", alignItems: "flex-start",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                        background: `${m.color}22`, color: m.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <m.icon size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{m.label}</span>
                        {m.id === "ia" && (
                          <span
                            style={{
                              fontSize: "10px", fontWeight: 700, color: "var(--violet)",
                              background: "var(--violet-muted)", borderRadius: "5px", padding: "1px 6px",
                            }}
                          >
                            RECOMMANDÉ
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px", lineHeight: 1.4 }}>
                        {m.desc}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                        border: `2px solid ${active ? m.color : "var(--border)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={launch}
              className="btn-primary"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px" }}
            >
              <Sparkles size={16} /> Lancer la génération
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: "8px",
  background: "var(--bg-card)", border: "1px solid var(--border)",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "var(--text-secondary)",
};
