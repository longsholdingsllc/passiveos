import { FormEvent, useEffect, useState } from "react";
import { Target, Plus, Trash2 } from "lucide-react";
import { api } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

type Goal = {
  id: string;
  title: string;
  target_amount: number;
  current_amount?: number;
  due_date?: string;
};

function money(n: number | undefined) {
  return `$${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function Goals() {
  const { push } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [due, setDue] = useState("");

  async function load() {
    try {
      const { data } = await api.get<Goal[]>("/goals");
      setGoals(data ?? []);
    } catch {
      push("Could not load goals.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/goals", {
        title,
        target_amount: Number(target) || 0,
        due_date: due || undefined,
      });
      push("Goal created.");
      setOpen(false);
      setTitle("");
      setTarget("");
      setDue("");
      await load();
    } catch {
      push("Could not create that goal.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await api.delete(`/goals/${id}`);
      push("Goal removed.");
      await load();
    } catch {
      push("Could not remove that goal.", "error");
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Goals</h1>
          <p>Set income targets and track progress against them.</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>
          <Plus size={16} /> New goal
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-muted)" }}>
          <Spinner size={18} /> Loading goals…
        </div>
      ) : goals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Set a monthly income target to track your progress."
            action={<button className="btn" onClick={() => setOpen(true)}>Create your first goal</button>}
          />
        </div>
      ) : (
        <div className="grid grid-2">
          {goals.map((g) => {
            const pct = g.target_amount > 0
              ? Math.min(100, Math.round(((g.current_amount ?? 0) / g.target_amount) * 100))
              : 0;
            return (
              <div className="card" key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                      <Target size={16} color="var(--accent)" /> {g.title}
                    </h3>
                    <div className="note">
                      {money(g.current_amount)} of {money(g.target_amount)}
                      {g.due_date ? ` · due ${g.due_date}` : ""}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-icon" onClick={() => onDelete(g.id)} aria-label="Delete goal">
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{ height: 10, background: "var(--bg)", borderRadius: 999, overflow: "hidden", marginTop: 14 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)" }} />
                </div>
                <div className="note" style={{ marginTop: 8 }}>{pct}% complete</div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New goal">
        <form onSubmit={onCreate}>
          <div className="field">
            <label htmlFor="gtitle">Title</label>
            <input id="gtitle" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. $2,000 monthly income" />
          </div>
          <div className="field">
            <label htmlFor="gtarget">Target amount ($)</label>
            <input id="gtarget" type="number" min="0" required value={target} onChange={(e) => setTarget(e.target.value)} placeholder="2000" />
          </div>
          <div className="field">
            <label htmlFor="gdue">Due date (optional)</label>
            <input id="gdue" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="btn-row">
            <button className="btn" type="submit" disabled={busy}>{busy ? "Creating…" : "Create goal"}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
