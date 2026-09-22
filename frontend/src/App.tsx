import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./hooks/useToast";
import Layout from "./components/Layout";
import Spinner from "./components/Spinner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Streams from "./pages/Streams";
import Ideas from "./pages/Ideas";
import Content from "./pages/Content";
import Simulator from "./pages/Simulator";
import Coach from "./pages/Coach";
import Goals from "./pages/Goals";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-muted)" }}>
        <Spinner size={24} /> Loading…
      </div>
    );
  }
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="streams" element={<Streams />} />
              <Route path="ideas" element={<Ideas />} />
              <Route path="content" element={<Content />} />
              <Route path="simulator" element={<Simulator />} />
              <Route path="coach" element={<Coach />} />
              <Route path="goals" element={<Goals />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
