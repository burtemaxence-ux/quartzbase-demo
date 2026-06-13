import { Topbar } from "@/components/topbar";
import { Sidebar } from "@/components/sidebar";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 40px)" }}>
      <Topbar mode="manager" />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
            background: "var(--bg-primary)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
