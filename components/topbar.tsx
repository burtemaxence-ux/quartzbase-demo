"use client";

import { Bell, ChevronDown, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface TopbarProps {
  mode: "manager" | "employee";
}

export function Topbar({ mode }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isManager = mode === "manager";

  const managerLinks = [
    { href: "/manager", label: "Dashboard" },
    { href: "/manager/planning", label: "Planning" },
    { href: "/manager/employees", label: "Employés" },
    { href: "/manager/compliance", label: "Conformité" },
  ];

  return (
    <header
      style={{
        height: "var(--topbar-height)",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        paddingLeft: "24px",
        paddingRight: "24px",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--violet), #9b8dff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "14px",
            color: "white",
            flexShrink: 0,
          }}
        >
          Q
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "15px",
              color: "var(--text-primary)",
            }}
          >
            Quartzbase
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            La Boulangerie du Soleil
          </span>
        </div>
      </div>

      {/* Nav links (manager only, desktop) */}
      {isManager && (
        <nav
          style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "16px" }}
          className="hidden md:flex"
        >
          {managerLinks.map((link) => {
            const active =
              link.href === "/manager"
                ? pathname === "/manager"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--violet)" : "var(--text-secondary)",
                  background: active ? "var(--violet-muted)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}

      <div style={{ flex: 1 }} />

      {/* Mode switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "4px",
        }}
      >
        <button
          onClick={() => router.push("/manager")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "7px",
            fontSize: "12px",
            fontWeight: isManager ? 600 : 400,
            color: isManager ? "white" : "var(--text-muted)",
            background: isManager ? "var(--violet)" : "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <LayoutDashboard size={13} />
          Manager
        </button>
        <button
          onClick={() => router.push("/employee")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "7px",
            fontSize: "12px",
            fontWeight: !isManager ? 600 : 400,
            color: !isManager ? "white" : "var(--text-muted)",
            background: !isManager ? "var(--green)" : "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <Users size={13} />
          Employé
        </button>
      </div>

      {/* DÉMO badge */}
      <div
        style={{
          background: "var(--orange-muted)",
          border: "1px solid rgba(255,140,66,0.4)",
          borderRadius: "6px",
          padding: "3px 8px",
          fontSize: "11px",
          fontWeight: 700,
          color: "var(--orange)",
          letterSpacing: "0.08em",
        }}
      >
        DÉMO
      </div>

      {/* Notifications */}
      <button
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: "10px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-secondary)",
        }}
        title="2 notifications"
      >
        <Bell size={16} />
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--red)",
            border: "1px solid var(--bg-secondary)",
          }}
        />
      </button>

      {/* User avatar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            background: "var(--violet-muted)",
            border: "1px solid var(--border-active)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--violet)",
            fontFamily: "var(--font-syne)",
          }}
        >
          MB
        </div>
        <div className="hidden md:block" style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
            Maxence
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Manager</div>
        </div>
        <ChevronDown size={14} color="var(--text-muted)" />
      </div>
    </header>
  );
}
