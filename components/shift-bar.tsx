"use client";

interface ShiftBarProps {
  employeeName: string;
  startTime: string;
  endTime: string;
  role: string;
  color: string;
  compact?: boolean;
}

function timeToDecimal(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

const DAY_START = 5;
const DAY_END = 23;
const TOTAL = DAY_END - DAY_START;

export function ShiftBar({ employeeName, startTime, endTime, role, color, compact }: ShiftBarProps) {
  const start = timeToDecimal(startTime);
  const end = timeToDecimal(endTime);
  const left = ((start - DAY_START) / TOTAL) * 100;
  const width = ((end - start) / TOTAL) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        width: `${width}%`,
        height: compact ? "28px" : "34px",
        borderRadius: "8px",
        background: `${color}22`,
        border: `1px solid ${color}66`,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: "6px",
        overflow: "hidden",
        cursor: "default",
        transition: "box-shadow 0.15s",
        boxShadow: `inset 2px 0 0 ${color}`,
      }}
      title={`${employeeName} · ${role} · ${startTime}–${endTime}`}
    >
      <span
        style={{
          fontSize: compact ? "10px" : "11px",
          fontWeight: 600,
          color,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {startTime}–{endTime}
      </span>
      {!compact && (
        <span
          style={{
            fontSize: "10px",
            color: `${color}bb`,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {role}
        </span>
      )}
    </div>
  );
}
