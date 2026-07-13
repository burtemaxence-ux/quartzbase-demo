"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, Clock, Plus, Sparkles, TrendingUp } from "lucide-react";
import data from "@/data/marketplace.json";

export default function EchangesPage() {
  const [taken, setTaken] = useState<Record<string, boolean>>({});

  const statusStyle: Record<string, { label: string; cls: string }> = {
    pending: { label: "En attente", cls: "dp-badge-pending" },
    accepted: { label: "Accepté", cls: "dp-badge-approved" },
  };

  return (
    <div className="animate-dashboard" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "20px", color: "var(--text-primary)" }}>
          Échanges de créneaux
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          Prenez un créneau libre ou proposez le vôtre à l&apos;équipe
        </p>
      </div>

      {/* Available shifts */}
      <section>
        <h2 style={sectionTitle}>
          <Sparkles size={15} color="var(--green)" /> Créneaux disponibles
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.available.map((shift) => {
            const isTaken = taken[shift.id];
            return (
              <div key={shift.id} className="dp-card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {shift.role} · {shift.start}–{shift.end}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {shift.day} · publié par {shift.postedBy}
                    </div>
                  </div>
                  {isTaken ? (
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700,
                        color: "var(--green)", background: "var(--green-muted)", border: "1px solid rgba(0,212,170,0.3)",
                        borderRadius: "10px", padding: "9px 14px",
                      }}
                    >
                      <Check size={15} /> Créneau réservé
                    </span>
                  ) : (
                    <button
                      onClick={() => setTaken((t) => ({ ...t, [shift.id]: true }))}
                      className="btn-primary"
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "var(--green)" }}
                    >
                      <Plus size={15} /> Je prends
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "10px",
                    fontSize: "11px", fontWeight: 600, color: "var(--yellow)",
                    background: "var(--yellow-muted)", borderRadius: "6px", padding: "3px 9px",
                  }}
                >
                  <TrendingUp size={11} /> {shift.bonus}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* My exchanges */}
      <section>
        <h2 style={sectionTitle}>
          <ArrowLeftRight size={15} color="var(--violet)" /> Mes échanges
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {data.myExchanges.map((ex) => {
            const s = statusStyle[ex.status] ?? statusStyle.pending;
            return (
              <div
                key={ex.id}
                className="dp-card"
                style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: "10px",
                      background: ex.status === "accepted" ? "var(--green-muted)" : "var(--yellow-muted)",
                      color: ex.status === "accepted" ? "var(--green)" : "var(--yellow)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    {ex.status === "accepted" ? <Check size={16} /> : <Clock size={16} />}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{ex.label}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{ex.detail}</div>
                  </div>
                </div>
                <span
                  className={s.cls}
                  style={{ fontSize: "11px", fontWeight: 600, borderRadius: "6px", padding: "4px 10px", whiteSpace: "nowrap" }}
                >
                  {s.label}
                </span>
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
