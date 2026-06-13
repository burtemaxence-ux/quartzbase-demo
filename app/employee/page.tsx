"use client";

import { useEffect, useState } from "react";
import { Clock, Coffee, LogOut, Wifi } from "lucide-react";
import currentEmployee from "@/data/current-employee.json";

type Status = "working" | "on_break" | "done";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getClockInSeconds(): number {
  const now = new Date();
  const [h, m] = currentEmployee.clockInTime.split(":").map(Number);
  const clockIn = new Date(now);
  clockIn.setHours(h, m, 0, 0);
  if (clockIn > now) clockIn.setDate(clockIn.getDate() - 1);
  return Math.floor((now.getTime() - clockIn.getTime()) / 1000);
}

export default function BadgeusePage() {
  const [status, setStatus] = useState<Status>("working");
  const [elapsed, setElapsed] = useState(getClockInSeconds);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const statusConfig = {
    working: {
      label: "EN SERVICE",
      color: "var(--green)",
      bg: "var(--green-muted)",
      border: "rgba(0,212,170,0.3)",
    },
    on_break: {
      label: "EN PAUSE",
      color: "var(--yellow)",
      bg: "var(--yellow-muted)",
      border: "rgba(255,179,71,0.3)",
    },
    done: {
      label: "SERVICE TERMINÉ",
      color: "var(--text-muted)",
      bg: "rgba(255,255,255,0.05)",
      border: "var(--border)",
    },
  };

  const sc = statusConfig[status];

  return (
    <div
      className="animate-dashboard"
      style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}
    >
      {/* Employee header */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "18px",
            background: "rgba(0,212,170,0.15)",
            border: "2px solid rgba(0,212,170,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: 800,
            color: "var(--green)",
            fontFamily: "var(--font-syne)",
            margin: "0 auto 12px",
          }}
        >
          {currentEmployee.initials}
        </div>
        <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "18px", color: "var(--text-primary)" }}>
          {currentEmployee.firstName} {currentEmployee.lastName}
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          {currentEmployee.role} · {currentEmployee.contractType} {currentEmployee.weeklyHours}h
        </p>
      </div>

      {/* Current time */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "52px",
            color: "var(--text-primary)",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          {timeStr.slice(0, 5)}
        </div>
        <div style={{ fontSize: "20px", color: "var(--text-muted)", marginTop: "4px" }}>
          :{timeStr.slice(6, 8)}
        </div>
      </div>

      {/* Status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 20px",
          borderRadius: "100px",
          background: sc.bg,
          border: `1px solid ${sc.border}`,
        }}
      >
        <div
          className={status === "working" ? "dp-status-dot-green" : undefined}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: sc.color,
          }}
        />
        <span style={{ fontSize: "13px", fontWeight: 700, color: sc.color, letterSpacing: "0.08em" }}>
          {sc.label}
        </span>
      </div>

      {/* Timer card */}
      <div
        className="dp-card"
        style={{
          padding: "24px 32px",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
          {status === "working" ? "En service depuis" : status === "on_break" ? "Durée de la pause" : "Durée totale"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "40px",
            color: sc.color,
            letterSpacing: "-1px",
          }}
        >
          {formatDuration(elapsed)}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
          <Wifi size={11} style={{ display: "inline", marginRight: 4 }} />
          Prise de service : {currentEmployee.clockInTime}
        </div>
      </div>

      {/* Action buttons */}
      {status === "working" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          <button
            onClick={() => setStatus("on_break")}
            style={{
              padding: "14px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--yellow)",
              background: "var(--yellow-muted)",
              border: "1px solid rgba(255,179,71,0.4)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.15s",
              fontFamily: "var(--font-syne)",
            }}
          >
            <Coffee size={17} />
            Début de pause
          </button>
          <button
            onClick={() => setStatus("done")}
            style={{
              padding: "14px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--red)",
              background: "var(--red-muted)",
              border: "1px solid rgba(255,107,107,0.4)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.15s",
              fontFamily: "var(--font-syne)",
            }}
          >
            <LogOut size={17} />
            Pointer le départ
          </button>
        </div>
      )}

      {status === "on_break" && (
        <button
          onClick={() => setStatus("working")}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--green)",
            background: "var(--green-muted)",
            border: "1px solid rgba(0,212,170,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "var(--font-syne)",
          }}
        >
          <Clock size={17} />
          Fin de pause — Reprendre
        </button>
      )}

      {status === "done" && (
        <div
          style={{
            width: "100%",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>✅</div>
          <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, color: "var(--text-primary)", fontSize: "16px" }}>
            Service terminé
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Durée totale : {formatDuration(elapsed)}
          </div>
        </div>
      )}
    </div>
  );
}
