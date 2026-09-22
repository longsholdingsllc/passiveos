import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  Lightbulb,
  FileText,
  Calculator,
  GraduationCap,
  Target,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/streams", label: "Streams", icon: Radio },
  { to: "/app/ideas", label: "Ideas", icon: Lightbulb },
  { to: "/app/content", label: "Content", icon: FileText },
  { to: "/app/simulator", label: "Simulator", icon: Calculator },
  { to: "/app/coach", label: "Coach", icon: GraduationCap },
  { to: "/app/goals", label: "Goals", icon: Target },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <TrendingUp size={18} color="var(--accent)" />
          PassiveOS
        </div>

        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <div className="note" style={{ padding: "0 10px 8px", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.email ?? "Signed in"}
          </div>
          <button className="nav-link" onClick={handleLogout} style={{ width: "100%", border: "none", background: "transparent", cursor: "pointer", font: "inherit" }}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
