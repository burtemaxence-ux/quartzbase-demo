"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Check, CalendarPlus } from "lucide-react";

type Proposal = { name: string; slot: string };
type Message = {
  role: "bot" | "user";
  text: string;
  proposals?: Proposal[];
};

type Scenario = {
  prompt: string;
  reply: string;
  proposals?: Proposal[];
};

const SCENARIOS: Scenario[] = [
  {
    prompt: "Qui peut remplacer Sophie samedi ?",
    reply:
      "Sophie est en congé samedi (06:00–14:00, poste Boulanger). Deux personnes sont disponibles et conformes au repos légal :",
    proposals: [
      { name: "Thomas Moreau", slot: "Sam 06:00–14:00 · Boulanger" },
      { name: "Antoine Rousseau", slot: "Sam 07:00–14:00 · Pâtissier" },
    ],
  },
  {
    prompt: "Y a-t-il des alertes de conformité ?",
    reply:
      "1 alerte cette semaine : le repos quotidien de Lucas Dubois est à 10h mardi (11h requis en CCN Boulangerie). Décaler sa prise de service à 07:00 résout le conflit.",
  },
  {
    prompt: "Complète les trous du planning",
    reply:
      "Il manque une couverture mercredi après-midi et dimanche matin. Voici les créneaux que je propose d'ajouter :",
    proposals: [
      { name: "Emma Laurent", slot: "Mer 14:00–19:00 · Vendeur" },
      { name: "Léa Durand", slot: "Dim 08:00–13:00 · Vendeur" },
    ],
  },
];

const GREETING: Message = {
  role: "bot",
  text: "Bonjour Maxence 👋 Je suis l'assistant Quartzbase. Je peux composer un planning, trouver un remplaçant ou vérifier la conformité. Que puis-je faire ?",
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const remaining = SCENARIOS.filter((s) => !used.includes(s.prompt));
  const lastHasProposals = messages[messages.length - 1]?.proposals?.length;

  function ask(s: Scenario) {
    setUsed((u) => [...u, s.prompt]);
    setValidated(false);
    setMessages((m) => [...m, { role: "user", text: s.prompt }]);
    setTyping(true);
    timers.current.push(
      setTimeout(() => {
        setTyping(false);
        setMessages((m) => [...m, { role: "bot", text: s.reply, proposals: s.proposals }]);
      }, 900)
    );
  }

  function validateAll() {
    setValidated(true);
    setMessages((m) => [
      ...m,
      { role: "bot", text: "✅ Créneaux proposés ajoutés au planning et notifiés à l'équipe. Le planning reste conforme (0 conflit)." },
    ]);
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 210,
          width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, var(--violet), #9b8dff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 10px 30px rgba(108,99,255,0.45)",
        }}
        title="Assistant Quartzbase"
      >
        {open ? <X size={22} color="white" /> : <Sparkles size={24} color="white" />}
      </button>

      {open && (
        <div
          className="animate-card-reveal"
          style={{
            position: "fixed", bottom: 92, right: 24, zIndex: 210,
            width: "min(380px, calc(100vw - 32px))", height: "min(560px, calc(100vh - 140px))",
            background: "var(--bg-card)", border: "1px solid var(--border-active)",
            borderRadius: "18px", display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "10px",
              background: "var(--bg-secondary)",
            }}
          >
            <div
              style={{
                width: 34, height: 34, borderRadius: "10px",
                background: "linear-gradient(135deg, var(--violet), #9b8dff)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <Sparkles size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                Assistant Quartzbase
              </div>
              <div style={{ fontSize: "11px", color: "var(--green)", display: "flex", alignItems: "center", gap: "5px" }}>
                <span className="dp-status-dot-green" style={{ width: 7, height: 7 }} /> En ligne
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "85%", padding: "10px 13px", borderRadius: "13px", fontSize: "13px", lineHeight: 1.45,
                    background: msg.role === "user" ? "var(--violet)" : "var(--bg-elevated)",
                    color: msg.role === "user" ? "white" : "var(--text-primary)",
                    border: msg.role === "user" ? "none" : "1px solid var(--border)",
                    borderBottomRightRadius: msg.role === "user" ? "4px" : "13px",
                    borderBottomLeftRadius: msg.role === "user" ? "13px" : "4px",
                  }}
                >
                  {msg.text}
                </div>

                {msg.proposals && (
                  <div style={{ width: "85%", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {msg.proposals.map((p) => (
                      <div
                        key={p.name}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                          background: "var(--violet-muted)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: "10px",
                        }}
                      >
                        <CalendarPlus size={15} color="var(--violet)" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.slot}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div style={{ display: "flex", gap: "4px", padding: "10px 13px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "13px", width: "fit-content" }}>
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    style={{
                      width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)",
                      animation: "dotPulseGreen 1s ease-in-out infinite", animationDelay: `${d * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Validate-all action for the last proposal */}
            {lastHasProposals && !typing && !validated && (
              <button
                onClick={validateAll}
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px", marginTop: "2px" }}
              >
                <Check size={15} /> Valider tous les créneaux proposés
              </button>
            )}
          </div>

          {/* Suggestions */}
          {remaining.length > 0 && !typing && (
            <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {remaining.map((s) => (
                <button
                  key={s.prompt}
                  onClick={() => ask(s)}
                  style={{
                    fontSize: "11px", fontWeight: 600, color: "var(--violet)",
                    background: "var(--violet-muted)", border: "1px solid rgba(108,99,255,0.3)",
                    borderRadius: "100px", padding: "6px 12px", cursor: "pointer",
                  }}
                >
                  {s.prompt}
                </button>
              ))}
            </div>
          )}

          {/* Fake input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              disabled
              placeholder="Saisie désactivée en démo…"
              style={{
                flex: 1, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: "10px", padding: "9px 12px", fontSize: "12px", color: "var(--text-muted)",
              }}
            />
            <div
              style={{
                width: 36, height: 36, borderRadius: "10px", background: "var(--bg-elevated)",
                border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)", flexShrink: 0,
              }}
            >
              <Send size={15} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
