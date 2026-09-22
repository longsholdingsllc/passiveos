import { FormEvent, useState } from "react";
import { FileText, Wand2, Copy } from "lucide-react";
import { api } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Spinner from "../components/Spinner";

type Piece = { kind: string; body: string };

export default function Content() {
  const { push } = useToast();
  const [topic, setTopic] = useState("");
  const [channel, setChannel] = useState("newsletter");
  const [audience, setAudience] = useState("");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [busy, setBusy] = useState(false);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/ai/content", { topic, channel, audience });
      setPieces(data?.pieces ?? []);
      push("Content generated.");
    } catch {
      push("Could not generate content right now.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function copy(body: string) {
    try {
      await navigator.clipboard.writeText(body);
      push("Copied to clipboard.");
    } catch {
      push("Copy failed — select the text manually.", "error");
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>AI Content</h1>
          <p>Draft channel-ready content for any income stream you run.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={onGenerate}>
          <div className="grid grid-3">
            <div className="field">
              <label htmlFor="topic">Topic</label>
              <input id="topic" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. dividend investing basics" />
            </div>
            <div className="field">
              <label htmlFor="channel">Channel</label>
              <select id="channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="newsletter">Newsletter</option>
                <option value="blog">Blog post</option>
                <option value="social">Social post</option>
                <option value="video">Video script</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="audience">Audience</label>
              <input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. new investors" />
            </div>
          </div>
          <button className="btn" type="submit" disabled={busy}>
            <Wand2 size={16} /> {busy ? "Generating…" : "Generate content"}
          </button>
        </form>
      </div>

      {busy ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-muted)" }}>
          <Spinner size={18} /> Writing…
        </div>
      ) : pieces.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>Nothing generated yet</h3>
          <p style={{ fontSize: "0.9rem", maxWidth: 340, margin: "0 auto" }}>
            Give a topic and channel, and a draft appears here ready to publish.
          </p>
        </div>
      ) : (
        <div className="grid" style={{ gap: 16 }}>
          {pieces.map((p, i) => (
            <div className="card" key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span className="pill pill-green">{p.kind}</span>
                <button className="btn btn-ghost btn-icon" onClick={() => copy(p.body)} aria-label="Copy content">
                  <Copy size={15} />
                </button>
              </div>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.89rem", margin: 0, color: "var(--text)" }}>
                {p.body}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
