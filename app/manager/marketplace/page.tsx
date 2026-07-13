"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, X, Clock, Users, AlertCircle } from "lucide-react";
import data from "@/data/marketplace.json";

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

export default function MarketplacePage() {
  // Local demo state: covered open shifts + resolved swaps
  const [covered, setCovered] = useState<Record<string, string>>({});
  const [swapState, setSwapState] = useState<Record<string, "accepted" | "refused">>({});

  const openCount = data.openShifts.filter((s) => !covered[s.id]).length;
  const swapCount = data.swaps.filter((s) => !swapState[s.id]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "820px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "22px", color: "var(--text-primary)" }}>
          Remplacements & échanges
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          {openCount} créneau{openCount > 1 ? "x" : ""} à couvrir · {swapCount} échange{swapCount > 1 ? "s" : ""} en attente de validation
        </p>
      </div>

      {/* Open shifts */}
      <section>
        <h2 style={sectionTitle}>
          <Users size={15} color="var(--violet)" /> Créneaux à couvrir
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.openShifts.map((shift) => {
            const assigned = covered[shift.id];
            return (
              <div
                key={shift.id}
                className="dp-card"
                style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}
              >
                {/* Time block */}
                <div
                  style={{
                    width: 64, borderRadius: "10px", padding: "8px 6px", textAlign: "center", flexShrink: 0,
                    background: `${shift.color}18`, border: `1px solid ${shift.color}44`,
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: shift.color }}>{shift.day}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{shift.date}</div>
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {shift.role} · {shift.start}–{shift.end}
                    </span>
                    {shift.urgent && !assigned && (
                      <span
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: 700,
                          color: "var(--red)", background: "var(--red-muted)", borderRadius: "5px", padding: "1px 6px",
                        }}
                      >
                        <AlertCircle size={10} /> URGENT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{shift.reason}</div>
                </div>

                {/* Applicants / assign */}
                {assigned ? (
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600,
                      color: "var(--green)", background: "var(--green-muted)", border: "1px solid rgba(0,212,170,0.3)",
                      borderRadius: "8px", padding: "7px 12px",
                    }}
                  >
                    <Check size={14} /> Attribué à {assigned.split(" ")[0]}
                  </div>
                ) : shift.applicants.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {shift.applicants.map((name) => (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: 26, height: 26, borderRadius: "7px", background: "var(--bg-elevated)",
                            border: "1px solid var(--border)", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)",
                          }}
                        >
                          {initials(name)}
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", minWidth: 90 }}>{name}</span>
                        <button
                          onClick={() => setCovered((c) => ({ ...c, [shift.id]: name }))}
                          className="btn-primary"
                          style={{ padding: "5px 12px", fontSize: "12px" }}
                        >
                          Attribuer
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "6px", fontSize: "12px",
                      color: "var(--yellow)", background: "var(--yellow-muted)",
                      border: "1px solid rgba(255,179,71,0.3)", borderRadius: "8px", padding: "7px 12px",
                    }}
                  >
                    <Clock size={13} /> En attente de candidat
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Swap requests */}
      <section>
        <h2 style={sectionTitle}>
          <ArrowLeftRight size={15} color="var(--green)" /> Échanges entre salariés
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.swaps.map((swap) => {
            const state = swapState[swap.id];
            return (
              <div
                key={swap.id}
                className="dp-card"
                style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{swap.from}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{swap.fromShift}</span>
                    <ArrowLeftRight size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{swap.to}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{swap.toShift}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{swap.note}</div>
                </div>

                {state === "accepted" ? (
                  <span style={{ ...pill, color: "var(--green)", background: "var(--green-muted)", border: "1px solid rgba(0,212,170,0.3)" }}>
                    <Check size={13} /> Validé
                  </span>
                ) : state === "refused" ? (
                  <span style={{ ...pill, color: "var(--red)", background: "var(--red-muted)", border: "1px solid rgba(255,107,107,0.3)" }}>
                    <X size={13} /> Refusé
                  </span>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setSwapState((s) => ({ ...s, [swap.id]: "refused" }))}
                      style={{
                        width: 34, height: 34, borderRadius: "9px", background: "var(--red-muted)",
                        border: "1px solid rgba(255,107,107,0.3)", color: "var(--red)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                      title="Refuser"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => setSwapState((s) => ({ ...s, [swap.id]: "accepted" }))}
                      style={{
                        width: 34, height: 34, borderRadius: "9px", background: "var(--green-muted)",
                        border: "1px solid rgba(0,212,170,0.3)", color: "var(--green)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                      title="Valider l'échange"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "15px",
  color: "var(--text-primary)", marginBottom: "12px",
  display: "flex", alignItems: "center", gap: "8px",
};

const pill: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "5px",
  fontSize: "12px", fontWeight: 600, borderRadius: "8px", padding: "7px 12px",
};
