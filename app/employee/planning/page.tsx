"use client";

import shifts from "@/data/shifts.json";
import currentEmployee from "@/data/current-employee.json";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS: Record<string, string> = {
  Mon: "Lun", Tue: "Mar", Wed: "Mer", Thu: "Jeu", Fri: "Ven", Sat: "Sam", Sun: "Dim",
};

function getWeekDates() {
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

function getTodayKey(): string {
  const d = new Date().getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

export default function EmployeePlanningPage() {
  const weekDays = getWeekDates();
  const myId = currentEmployee.id;
  const myShifts = shifts.filter((s) => s.employeeId === myId);
  const myDays = new Set(myShifts.map((s) => s.day));

  const totalHours = myShifts.reduce((acc, s) => {
    const [sh] = s.start.split(":").map(Number);
    const [eh] = s.end.split(":").map(Number);
    return acc + (eh - sh);
  }, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "20px", color: "var(--text-primary)" }}>
          Mon planning
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          {myDays.size} jour{myDays.size > 1 ? "s" : ""} · {totalHours}h planifiées cette semaine
        </p>
      </div>

      {/* Week grid */}
      <div className="dp-card" style={{ overflow: "hidden" }}>
        {weekDays.map((day, i) => {
          const myShift = shifts.find((s) => s.employeeId === myId && s.day === day.key);
          const othersOnDay = shifts.filter((s) => s.employeeId !== myId && s.day === day.key);

          return (
            <div
              key={day.key}
              style={{
                borderBottom: i < weekDays.length - 1 ? "1px solid var(--border-subtle)" : "none",
                padding: "14px 16px",
                background: day.isToday ? "rgba(108,99,255,0.04)" : "transparent",
              }}
            >
              {/* Day header */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: myShift || othersOnDay.length > 0 ? "10px" : "0" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: day.isToday ? "var(--violet)" : "var(--bg-elevated)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "9px", color: day.isToday ? "rgba(255,255,255,0.7)" : "var(--text-muted)", textTransform: "uppercase" }}>
                    {day.label}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: day.isToday ? "white" : "var(--text-secondary)", lineHeight: 1 }}>
                    {day.date}
                  </span>
                </div>
                {day.isToday && (
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--violet)" }}>Aujourd&apos;hui</span>
                )}
              </div>

              {/* My shift — full opacity */}
              {myShift && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: `${currentEmployee.color}22`,
                    border: `1px solid ${currentEmployee.color}55`,
                    boxShadow: `inset 3px 0 0 ${currentEmployee.color}`,
                    marginBottom: othersOnDay.length > 0 ? "8px" : "0",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 700, color: currentEmployee.color }}>
                    {myShift.start} — {myShift.end}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {currentEmployee.role}
                  </div>
                </div>
              )}

              {/* Others — opacity 30 */}
              {othersOnDay.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", opacity: 0.3 }}>
                  {othersOnDay.map((s, j) => (
                    <div
                      key={j}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: `${s.color}18`,
                        border: `1px solid ${s.color}33`,
                        fontSize: "10px",
                        color: s.color,
                        fontWeight: 500,
                      }}
                    >
                      {s.employeeName.split(" ")[0]} {s.start}–{s.end}
                    </div>
                  ))}
                </div>
              )}

              {!myShift && othersOnDay.length === 0 && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  Repos
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly summary */}
      <div className="dp-card animate-fade-slide-up" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
          Récap semaine
        </div>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "var(--green)" }}>
              {totalHours}h
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>planifiées</div>
          </div>
          <div>
            <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "var(--violet)" }}>
              {myDays.size}j
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>travaillés</div>
          </div>
          <div>
            <div style={{ fontSize: "22px", fontFamily: "var(--font-syne)", fontWeight: 800, color: "var(--text-secondary)" }}>
              {currentEmployee.weeklyHours}h
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>contrat</div>
          </div>
        </div>
      </div>
    </div>
  );
}
