"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ShieldCheck,
  ArrowLeftRight,
  Settings,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { href: "/manager", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manager/planning", label: "Planning", icon: CalendarDays },
  { href: "/manager/employees", label: "Employés", icon: Users },
  { href: "/manager/marketplace", label: "Remplacements", icon: ArrowLeftRight },
  { href: "/manager/compliance", label: "Conformité", icon: ShieldCheck },
];

const bottomItems = [
  { href: "#", label: "Paramètres", icon: Settings },
  { href: "#", label: "Aide", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 0,
      }}
    >
      {/* Nav section */}
      <div style={{ flex: 1, padding: "16px 12px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "var(--text-muted)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0 8px",
            marginBottom: "8px",
          }}
        >
          Navigation
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/manager"
                ? pathname === "/manager"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--violet)" : "var(--text-secondary)",
                  background: active ? "var(--violet-muted)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  borderLeft: active ? "2px solid var(--violet)" : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                  }
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom items */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => {}}
            title="Fonctionnalité désactivée en démo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "10px",
              fontSize: "13px",
              color: "var(--text-muted)",
              background: "transparent",
              border: "none",
              cursor: "not-allowed",
              width: "100%",
              opacity: 0.5,
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}

        {/* Plan badge */}
        <div
          style={{
            margin: "8px 4px 4px",
            background: "var(--violet-muted)",
            border: "1px solid var(--border-active)",
            borderRadius: "10px",
            padding: "10px 12px",
          }}
        >
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>
            Plan actuel
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--violet)",
              fontFamily: "var(--font-syne)",
            }}
          >
            Pro ✦
          </div>
        </div>
      </div>
    </aside>
  );
}
