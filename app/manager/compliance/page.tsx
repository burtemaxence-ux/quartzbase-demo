"use client";

import { useState } from "react";
import { AlertTriangle, Info, CheckCircle, ChevronDown } from "lucide-react";
import conventions from "@/data/conventions.json";

type RuleStatus = "ok" | "warning" | "info";

const RULE_COLOR: Record<RuleStatus, string> = {
  ok: "var(--green)",
  warning: "var(--yellow)",
  info: "var(--violet)",
};

function scoreColor(score: number): string {
  if (score >= 90) return "var(--green)";
  if (score >= 80) return "var(--yellow)";
  return "var(--red)";
}

export default function CompliancePage() {
  const [conventionId, setConventionId] = useState(conventions[0].id);
  const [open, setOpen] = useState(false);
  const convention = conventions.find((c) => c.id === conventionId)!;
  const color = scoreColor(convention.score);
  const R = 58;
  const CIRC = 2 * Math.PI * R;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "720px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "22px", color: "var(--text-primary)" }}>
            Conformité
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            {convention.rules.length} règles surveillées automatiquement selon votre convention
          </p>
        </div>

        {/* Convention selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "var(--bg-card)", border: "1px solid var(--border-active)",
              borderRadius: "10px", padding: "9px 14px", cursor: "pointer", minWidth: 240,
            }}
          >
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>CONVENTION COLLECTIVE</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{convention.name}</div>
            </div>
            <ChevronDown size={16} color="var(--text-muted)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>

          {open && (
            <div
              className="animate-fade-slide-up"
              style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 60,
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: "12px", padding: "6px", minWidth: 260,
                boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
              }}
            >
              {conventions.map((c) => {
                const active = c.id === conventionId;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setConventionId(c.id); setOpen(false); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: "8px",
                      background: active ? "var(--violet-muted)" : "transparent", border: "none", cursor: "pointer",
                      display: "flex", flexDirection: "column", gap: "1px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 600, color: active ? "var(--violet)" : "var(--text-primary)" }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{c.idcc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Score card */}
      <div
        key={convention.id}
        className="dp-card animate-card-reveal"
        style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px" }}
      >
        <div style={{ position: "relative", width: 140, height: 140 }}>
          <svg viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="70" cy="70" r={R} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(convention.score / 100) * CIRC} ${CIRC}`}
              style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 0.6s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "36px", color, lineHeight: 1 }}>
              {convention.score}
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/100</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "18px", color: "var(--text-primary)" }}>
            {convention.verdict}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {convention.alerts.length} point{convention.alerts.length > 1 ? "s" : ""} à surveiller cette semaine · {convention.idcc}
          </div>
        </div>

        {/* Rules summary */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
          {convention.rules.map((rule) => {
            const c = RULE_COLOR[rule.status as RuleStatus];
            return (
              <div
                key={rule.label}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", fontSize: "11px",
                  color: "var(--text-secondary)", background: "var(--bg-elevated)",
                  border: "1px solid var(--border)", borderRadius: "6px", padding: "4px 10px",
                }}
              >
                {rule.status === "ok" ? (
                  <CheckCircle size={11} color={c} />
                ) : rule.status === "warning" ? (
                  <AlertTriangle size={11} color={c} />
                ) : (
                  <Info size={11} color={c} />
                )}
                {rule.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "12px" }}>
          Points d&apos;attention
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {convention.alerts.map((alert, i) => {
            const isWarning = alert.type === "warning";
            const c = isWarning ? "var(--yellow)" : "var(--violet)";
            const bg = isWarning ? "var(--yellow-muted)" : "var(--violet-muted)";
            const border = isWarning ? "rgba(255,179,71,0.3)" : "rgba(108,99,255,0.3)";
            const Icon = isWarning ? AlertTriangle : Info;

            return (
              <div
                key={`${convention.id}-${i}`}
                className="animate-fade-slide-up"
                style={{
                  padding: "18px 20px", borderRadius: "12px", background: bg,
                  border: `1px solid ${border}`, display: "flex", gap: "14px",
                  alignItems: "flex-start", animationDelay: `${i * 100}ms`,
                }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: "10px", background: `${c}22`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: c,
                  }}
                >
                  <Icon size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: c, marginBottom: "4px" }}>{alert.employee}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: "6px" }}>{alert.message}</div>
                  <div
                    style={{
                      fontSize: "11px", color: "var(--text-muted)", background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border)", borderRadius: "6px", padding: "3px 8px", display: "inline-block",
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
