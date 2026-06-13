"use client";

export function DemoBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #FF8C42 0%, #FF6B6B 100%)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "13px",
        fontWeight: 500,
        color: "white",
        fontFamily: "var(--font-dm-sans)",
        zIndex: 100,
        position: "relative",
      }}
    >
      <span>🎭 Mode démo · Données fictives · Aucune action réelle</span>
      <a
        href="https://quartzbase.fr/register"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: "8px",
          padding: "4px 14px",
          color: "white",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "12px",
          whiteSpace: "nowrap",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLAnchorElement).style.background = "rgba(255,255,255,0.35)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)";
        }}
      >
        Essayer gratuitement →
      </a>
    </div>
  );
}
