"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, CalendarDays, ArrowLeftRight, PalmtreeIcon } from "lucide-react";

const navItems = [
  { href: "/employee", label: "Badgeuse", icon: Clock },
  { href: "/employee/planning", label: "Planning", icon: CalendarDays },
  { href: "/employee/echanges", label: "Échanges", icon: ArrowLeftRight },
  { href: "/employee/leaves", label: "Congés", icon: PalmtreeIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile header */}
      <div
        className="md:hidden"
        style={{
          height: "var(--topbar-height)",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "16px" }}>
          Mon espace
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            background: "rgba(0, 212, 170, 0.15)",
            border: "1px solid rgba(0, 212, 170, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--green)",
          }}
        >
          LD
        </div>
      </div>

      {/* Bottom nav */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "var(--bottomnav-height)",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 50,
          backdropFilter: "blur(12px)",
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/employee"
              ? pathname === "/employee"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "6px 20px",
                borderRadius: "12px",
                textDecoration: "none",
                color: active ? "var(--green)" : "var(--text-muted)",
                background: active ? "var(--green-muted)" : "transparent",
                transition: "all 0.15s",
                minWidth: 64,
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: "11px", fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
