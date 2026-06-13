"use client";

import { ShieldCheck, AlertTriangle, Info, CheckCircle } from "lucide-react";
import alerts from "@/data/alerts.json";

export default function CompliancePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "720px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "22px", color: "var(--text-primary)" }}>
          Conformité
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          7 règles du Code du Travail surveillées automatiquement
        </p>
      </div>

      {/* Score card */}
      <div
        className="dp-card animate-card-reveal"
        style={{
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "12px",
        }}
      >
        {/* Score circle */}
        <div style={{ position: "relative", width: 140, height: 140 }}>
          <svg viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="70" cy="70" r="58" fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="none"
              stroke="var(--green)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(94 / 100) * 2 * Math.PI * 58} ${2 * Math.PI * 58}`}
              style={{ filter: "drop-shadow(0 0 8px var(--green))" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 800,
                fontSize: "36px",
                color: "var(--green)",
                lineHeight: 1,
              }}
            >
              94
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/100</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "18px", color: "var(--text-primary)" }}>
            Très bon score
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {alerts.length} point{alerts.length > 1 ? "s" : ""} à surveiller cette semaine
          </div>
        </div>

        {/* Rules summary */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "8px",
          }}
        >
          {[
            "Repos quotidien (11h)",
            "Repos hebdo (35h)",
            "Durée max journalière",
            "Heures supp.",
            "Pause repas",
            "Durée hebdo max",
            "Nuit et dimanche",
          ].map((rule) => (
            <div
              key={rule}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                color: "var(--text-secondary)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "4px 10px",
              }}
            >
              <CheckCircle size={11} color="var(--green)" />
              {rule}
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "15px",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Points d&apos;attention
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((alert, i) => {
            const isWarning = alert.type === "warning";
            const color = isWarning ? "var(--yellow)" : "var(--violet)";
            const bg = isWarning ? "var(--yellow-muted)" : "var(--violet-muted)";
            const border = isWarning ? "rgba(255,179,71,0.3)" : "rgba(108,99,255,0.3)";
            const Icon = isWarning ? AlertTriangle : Info;

            return (
              <div
                key={i}
                className="animate-fade-slide-up"
                style={{
                  padding: "18px 20px",
                  borderRadius: "12px",
                  background: bg,
                  border: `1px solid ${border}`,
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: `${color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color,
                  }}
                >
                  <Icon size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color, marginBottom: "4px" }}>
                    {alert.employee}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: "6px" }}>
                    {alert.message}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "3px 8px",
                      display: "inline-block",
                    }}
                  >
                    📋 {alert.rule}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
