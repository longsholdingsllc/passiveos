import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2, Radio } from "lucide-react";
import { api } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

type Stream = {
  id: string;
  name: string;
  category?: string;
  monthly_amount?: number;
  notes?: string;
};

const CATEGORIES = ["dividends", "rental", "digital", "interest", "royalties", "other"];

function money(n: number | undefined) {
  return `$${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function Streams() {
  const { push } = useToast();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  async function load() {
    try {
      const { data } = await api.get<Stream[]>("/streams");
      setStreams(data ?? []);
    } catch {
      push("Could not load streams.", "error");
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
      await api.post("/streams", {
        name,
        category,
        monthly_amount: Number(amount) || 0,
        notes,
      });
      push("Stream added.");
      setOpen(false);
      setName("");
      setAmount("");
      setNotes("");
      await load();
    } catch {
      push("Could not add that stream.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await api.delete(`/streams/${id}`);
      push("Stream removed.");
      await load();
    } catch {
      push("Could not remove that stream.", "error");
    }
  }

  const total = streams.reduce((sum, s) => sum + (s.monthly_amount ?? 0), 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Income Streams</h1>
          <p>Every source of passive income, tracked in one place.</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>
          <Plus size={16} /> Add stream
        </button>
      </div>

      <div className="stat" style={{ marginBottom: 18 }}>
        <div className="label">Total monthly</div>
        <div className="value">{money(total)}</div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-muted)" }}>
            <Spinner size={18} /> Loading streams…
          </div>
        ) : streams.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No streams yet"
            description="Add dividends, rentals, digital products — anything that pays you."
            action={<button className="btn" onClick={() => setOpen(true)}>Add your first stream</button>}
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Monthly</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {streams.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.name}
                    {s.notes ? <div className="note">{s.notes}</div> : null}
                  </td>
                  <td><span className="pill pill-slate">{s.category ?? "other"}</span></td>
                  <td style={{ textAlign: "right", fontWeight: 650 }}>{money(s.monthly_amount)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => onDelete(s.id)} aria-label="Delete stream">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add income stream">
        <form onSubmit={onCreate}>
          <div className="field">
            <label htmlFor="sname">Name</label>
            <input id="sname" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vanguard dividend fund" />
          </div>
          <div className="field">
            <label htmlFor="scat">Category</label>
            <select id="scat" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="samt">Monthly amount ($)</label>
            <input id="samt" type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="250" />
          </div>
          <div className="field">
            <label htmlFor="snotes">Notes (optional)</label>
            <textarea id="snotes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="btn-row">
            <button className="btn" type="submit" disabled={busy}>{busy ? "Adding…" : "Add stream"}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
