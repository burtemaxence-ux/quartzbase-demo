"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import leaves from "@/data/leaves.json";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  refused: "Refusé",
};

const STATUS_CLASSES: Record<string, string> = {
  pending: "dp-badge-pending",
  approved: "dp-badge-approved",
  refused: "dp-badge-refused",
};

type ModalState = "closed" | "open" | "sent";

export default function LeavesPage() {
  const [modal, setModal] = useState<ModalState>("closed");

  const myLeaves = leaves.filter((l) => l.employee === "Lucas Dubois");

  function openModal() {
    setModal("open");
    setTimeout(() => setModal("sent"), 1200);
    setTimeout(() => setModal("closed"), 2800);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "20px", color: "var(--text-primary)" }}>
            Mes congés
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>Lucas Dubois</p>
        </div>
        <button
          onClick={openModal}
          className="btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 16px",
            fontSize: "13px",
          }}
        >
          <Plus size={14} />
          Nouvelle demande
        </button>
      </div>

      {/* Soldes */}
      <div style={{ display: "flex", gap: "12px" }}>
        {[
          { label: "Congés payés", value: "12j", color: "var(--violet)" },
          { label: "RTT", value: "2j", color: "var(--green)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="dp-card"
            style={{ flex: 1, padding: "16px 20px" }}
          >
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "28px", fontFamily: "var(--font-syne)", fontWeight: 800, color }}>
              {value}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>disponibles</div>
          </div>
        ))}
      </div>

      {/* Leave requests */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "14px",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Mes demandes
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {leaves.map((leave, i) => (
            <div
              key={i}
              className="dp-card animate-fade-slide-up"
              style={{
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {leave.employee}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "5px",
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {leave.type}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {new Date(leave.start).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} →{" "}
                  {new Date(leave.end).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {leave.days}j
                </div>
              </div>
              <div
                className={STATUS_CLASSES[leave.status]}
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                {STATUS_LABELS[leave.status]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal !== "closed" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setModal("closed")}
        >
          <div
            className="dp-card animate-card-reveal"
            style={{ width: "100%", maxWidth: 400, padding: "28px 24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {modal === "open" ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    background: "var(--violet-muted)",
                    border: "1px solid var(--border-active)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--violet)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                </div>
                <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>
                  Envoi en cours...
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    background: "var(--green-muted)",
                    border: "1px solid rgba(0,212,170,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Check size={24} color="var(--green)" />
                </div>
                <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px" }}>
                  ✓ Demande envoyée
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Votre manager sera notifié et validera votre demande.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
