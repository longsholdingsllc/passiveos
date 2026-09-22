import { FormEvent, useEffect, useRef, useState } from "react";
import { GraduationCap, Send } from "lucide-react";
import { api } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Spinner from "../components/Spinner";

type Message = { role: "user" | "coach"; body: string };

const SUGGESTIONS = [
  "How do I diversify across stream types?",
  "What's a realistic monthly goal for year one?",
  "Should I reinvest dividends or take the cash?",
];

export default function Coach() {
  const { push } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/coach/history");
        if (!cancelled) {
          setMessages(
            (data?.messages ?? []).map((m: any) => ({
              role: m.role === "user" ? "user" : "coach",
              body: m.body ?? m.content ?? "",
            }))
          );
        }
      } catch {
        // A fresh account has no history yet — not an error worth surfacing.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setMessages((prev) => [...prev, { role: "user", body: question }]);
    setInput("");
    setBusy(true);
    try {
      const { data } = await api.post("/coach/ask", { message: question });
      setMessages((prev) => [...prev, { role: "coach", body: data?.reply ?? data?.message ?? "No answer returned." }]);
    } catch {
      push("The coach could not respond right now.", "error");
      setMessages((prev) => [
        ...prev,
        { role: "coach", body: "I hit an error reaching the coach service. Try again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>AI Coach</h1>
          <p>Ask anything about your portfolio, goals, or strategy.</p>
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 460 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {loading ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-muted)" }}>
              <Spinner size={18} /> Loading conversation…
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state" style={{ margin: "auto 0" }}>
              <GraduationCap size={48} />
              <h3>Ask your first question</h3>
              <p style={{ fontSize: "0.9rem", maxWidth: 360, margin: "0 auto 16px" }}>
                The coach answers with specifics based on the streams and goals you've tracked.
              </p>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="btn btn-ghost" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "78%",
                  background: m.role === "user" ? "var(--accent)" : "var(--bg-elev-2)",
                  color: m.role === "user" ? "#05221a" : "var(--text)",
                  border: m.role === "user" ? "none" : "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 13px",
                  fontSize: "0.9rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.body}
              </div>
            ))
          )}
          {busy && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-muted)", fontSize: "0.86rem" }}>
              <Spinner size={16} /> Coach is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the coach…"
            aria-label="Message the coach"
          />
          <button className="btn" type="submit" disabled={busy || !input.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
