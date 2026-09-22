import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, DollarSign, TrendingUp, Target, ArrowRight } from "lucide-react";
import { api } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

type Summary = {
  monthly_income: number;
  total_income: number;
  stream_count: number;
  goal_amount?: number;
  goal_progress?: number;
  streams?: { name: string; monthly: number; category?: string }[];
};

function money(n: number | undefined) {
  return `$${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<Summary>("/dashboard/summary");
        if (!cancelled) setData(res.data);
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.detail ?? "Could not load your dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-muted)" }}>
        <Spinner size={20} /> Loading your dashboard…
      </div>
    );
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!data) return null;

  const progress = Math.min(100, Math.round(data.goal_progress ?? 0));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Your passive income at a glance.</p>
        </div>
        <Link className="btn" to="/app/streams">
          <Radio size={16} /> Manage streams
        </Link>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <div className="stat">
          <div className="label">Monthly income</div>
          <div className="value">{money(data.monthly_income)}</div>
        </div>
        <div className="stat">
          <div className="label">Total tracked income</div>
          <div className="value">{money(data.total_income)}</div>
        </div>
        <div className="stat">
          <div className="label">Active streams</div>
          <div className="value">{data.stream_count ?? 0}</div>
        </div>
      </div>

      {data.goal_amount ? (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={17} color="var(--accent)" /> Progress to goal
            </strong>
            <span className="note">
              {money(data.monthly_income)} / {money(data.goal_amount)} monthly
            </span>
          </div>
          <div style={{ height: 10, background: "var(--bg)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "var(--accent)" }} />
          </div>
          <div className="note" style={{ marginTop: 8 }}>{progress}% of your monthly goal</div>
        </div>
      ) : null}

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={17} color="var(--accent)" /> Income by stream
          </strong>
          <Link to="/app/streams" className="note" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {data.streams && data.streams.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Stream</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Monthly</th>
              </tr>
            </thead>
            <tbody>
              {data.streams.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td><span className="pill pill-slate">{s.category ?? "other"}</span></td>
                  <td style={{ textAlign: "right", fontWeight: 650 }}>{money(s.monthly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={DollarSign}
            title="No streams yet"
            description="Add your first income stream to see it appear here."
            action={<Link className="btn" to="/app/streams">Add a stream</Link>}
          />
        )}
      </div>
    </div>
  );
}
