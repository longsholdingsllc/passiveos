import { FormEvent, useState } from "react";
import { Lightbulb, Wand2 } from "lucide-react";
import { api } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Spinner from "../components/Spinner";

type Idea = { title: string; description: string; effort?: string; potential?: string };

export default function Ideas() {
  const { push } = useToast();
  const [niche, setNiche] = useState("");
  const [skills, setSkills] = useState("");
  const [capital, setCapital] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [busy, setBusy] = useState(false);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/ai/ideas", { niche, skills, capital });
      setIdeas(data?.ideas ?? []);
      push("Ideas generated.");
    } catch {
      push("Could not generate ideas right now.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>AI Idea Engine</h1>
          <p>Generate passive income ideas grounded in your skills, niche, and capital.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={onGenerate}>
          <div className="grid grid-3">
            <div className="field">
              <label htmlFor="niche">Niche</label>
              <input id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. personal finance" />
            </div>
            <div className="field">
              <label htmlFor="skills">Skills</label>
              <input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. writing, spreadsheets" />
            </div>
            <div className="field">
              <label htmlFor="capital">Capital available ($)</label>
              <input id="capital" type="number" min="0" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="500" />
            </div>
          </div>
          <button className="btn" type="submit" disabled={busy}>
            <Wand2 size={16} /> {busy ? "Generating…" : "Generate ideas"}
          </button>
        </form>
      </div>

      {busy ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-muted)" }}>
          <Spinner size={18} /> Thinking…
        </div>
      ) : ideas.length === 0 ? (
        <div className="empty-state">
          <Lightbulb size={48} />
          <h3>No ideas yet</h3>
          <p style={{ fontSize: "0.9rem", maxWidth: 340, margin: "0 auto" }}>
            Fill in your niche, skills, and capital above to generate a tailored set.
          </p>
        </div>
      ) : (
        <div className="grid grid-2">
          {ideas.map((idea, i) => (
            <div className="card" key={`${idea.title}-${i}`}>
              <h3 style={{ fontSize: "0.98rem", display: "flex", alignItems: "center", gap: 8 }}>
                <Lightbulb size={16} color="var(--accent)" /> {idea.title}
              </h3>
              <p style={{ fontSize: "0.89rem", marginBottom: 10 }}>{idea.description}</p>
              <div className="btn-row">
                {idea.effort ? <span className="pill pill-amber">Effort: {idea.effort}</span> : null}
                {idea.potential ? <span className="pill pill-green">Potential: {idea.potential}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
