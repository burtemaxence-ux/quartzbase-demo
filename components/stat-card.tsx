"use client";

import { useEffect, useRef, useState } from "react";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  icon: LucideIcon;
  trend?: string;
  delay?: number;
}

export function StatCard({ label, value, suffix = "", color, icon: Icon, trend, delay = 0 }: StatCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const start = performance.now();
      const duration = 800;

      function tick(now: number) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(ease * value));
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const colorMap: Record<string, string> = {
    green: "var(--green)",
    violet: "var(--violet)",
    yellow: "var(--yellow)",
    red: "var(--red)",
    orange: "var(--orange)",
  };
  const resolvedColor = colorMap[color] ?? color;

  return (
    <div
      ref={ref}
      className="dp-card animate-card-reveal"
      style={{
        padding: "20px 24px",
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            background: `${resolvedColor}22`,
            border: `1px solid ${resolvedColor}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: resolvedColor,
          }}
        >
          <Icon size={18} />
        </div>
        {trend && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: trend.startsWith("+") ? "var(--green)" : "var(--text-muted)",
              background: trend.startsWith("+") ? "var(--green-muted)" : "rgba(255,255,255,0.05)",
              padding: "2px 8px",
              borderRadius: "6px",
            }}
          >
            {trend}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: "32px",
          fontWeight: 800,
          fontFamily: "var(--font-syne)",
          color: resolvedColor,
          lineHeight: 1,
          marginBottom: "6px",
        }}
      >
        {displayed}
        {suffix}
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{label}</div>
    </div>
  );
}
