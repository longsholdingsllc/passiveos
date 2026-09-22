import { Link } from "react-router-dom";
import { TrendingUp, Radio, Lightbulb, Calculator, Target, GraduationCap } from "lucide-react";

const FEATURES = [
  { icon: Radio, title: "Income Streams", body: "Track every stream — dividends, rentals, digital products — with entries and running totals in one place." },
  { icon: Lightbulb, title: "AI Idea Engine", body: "Generate niche-specific passive income ideas grounded in your existing skills and capital." },
  { icon: GraduationCap, title: "AI Coach", body: "Ask anything about your portfolio and get a structured, numbers-first answer." },
  { icon: Calculator, title: "DCA Simulator", body: "Model dollar-cost averaging over time and see projected value before you commit capital." },
  { icon: Target, title: "Goal Tracking", body: "Set income targets, track progress against them, and see what each stream contributes." },
  { icon: TrendingUp, title: "Dashboard", body: "Monthly income, stream breakdown, and progress-to-goal — always current." },
];

export default function Landing() {
  return (
    <div>
      <section className="hero">
        <div className="brand" style={{ justifyContent: "center", padding: "0 0 18px", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={20} color="var(--accent)" />
          PassiveOS
        </div>
        <h1>Your passive income, on autopilot.</h1>
        <p>
          Track every stream, generate ideas with AI, simulate dollar-cost averaging, and
          get coached toward your income goal — in one workspace.
        </p>
        <div className="btn-row">
          <Link className="btn" to="/register">Get started free</Link>
          <Link className="btn btn-ghost" to="/login">Sign in</Link>
        </div>
      </section>

      <section className="content" style={{ margin: "0 auto" }}>
        <div className="grid grid-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div className="feature" key={title}>
              <Icon size={22} color="var(--accent)" />
              <h3 style={{ marginTop: 12, fontSize: "1rem" }}>{title}</h3>
              <p style={{ margin: 0, fontSize: "0.89rem" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
