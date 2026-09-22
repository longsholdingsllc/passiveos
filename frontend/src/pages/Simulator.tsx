import { FormEvent, useState } from "react";
import { Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Spinner from "../components/Spinner";

type Point = { year: number; invested: number; value: number };

type Result = {
  final_value: number;
  total_invested: number;
  total_growth: number;
  series: Point[];
};

function money(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function Simulator() {
  const { push } = useToast();
  const [monthly, setMonthly] = useState("500");
  const [years, setYears] = useState("20");
  const [rate, setRate] = useState("7");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  async function onRun(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/ai/simulate", {
        monthly_amount: Number(monthly) || 0,
        years: Number(years) || 1,
        annual_return: Number(rate) || 0,
      });
      setResult(data);
      push("Projection ready.");
    } catch {
      push("Could not run the simulation.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>DCA Simulator</h1>
          <p>Model dollar-cost averaging before you commit capital.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={onRun}>
          <div className="grid grid-3">
            <div className="field">
              <label htmlFor="monthly">Monthly contribution ($)</label>
              <input id="monthly" type="number" min="0" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="years">Years</label>
              <input id="years" type="number" min="1" max="60" value={years} onChange={(e) => setYears(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="rate">Annual return (%)</label>
              <input id="rate" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
          </div>
          <button className="btn" type="submit" disabled={busy}>
            <Calculator size={16} /> {busy ? "Calculating…" : "Run projection"}
          </button>
        </form>
      </div>

      {busy ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-muted)" }}>
          <Spinner size={18} /> Running the numbers…
        </div>
      ) : !result ? (
        <div className="empty-state">
          <Calculator size={48} />
          <h3>No projection yet</h3>
          <p style={{ fontSize: "0.9rem", maxWidth: 340, margin: "0 auto" }}>
            Set your contribution, timeline, and expected return to see the curve.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-3" style={{ marginBottom: 20 }}>
            <div className="stat">
              <div className="label">Projected value</div>
              <div className="value">{money(result.final_value)}</div>
            </div>
            <div className="stat">
              <div className="label">Total invested</div>
              <div className="value">{money(result.total_invested)}</div>
            </div>
            <div className="stat">
              <div className="label">Growth</div>
              <div className="value">{money(result.total_growth)}</div>
              <div className="delta">from compounding</div>
            </div>
          </div>

          <div className="card">
            <strong style={{ display: "block", marginBottom: 14 }}>Value over time</strong>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.series}>
                  <defs>
                    <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#26344f" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" stroke="#93a1bd" fontSize={12} tickLine={false} />
                  <YAxis stroke="#93a1bd" fontSize={12} tickLine={false} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#131c31", border: "1px solid #26344f", borderRadius: 8, color: "#e8edf7" }}
                    formatter={(v: number) => money(v)}
                    labelFormatter={(l) => `Year ${l}`}
                  />
                  <Area type="monotone" dataKey="value" name="Value" stroke="#10b981" strokeWidth={2} fill="url(#valueFill)" />
                  <Area type="monotone" dataKey="invested" name="Invested" stroke="#93a1bd" strokeWidth={1.5} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
