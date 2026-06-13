import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 40px)" }}>
      <Topbar mode="employee" />
      <main
        style={{
          flex: 1,
          padding: "24px 20px",
          paddingBottom: "calc(var(--bottomnav-height) + 24px)",
          background: "var(--bg-primary)",
          maxWidth: "640px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
