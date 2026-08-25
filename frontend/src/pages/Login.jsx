import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "staff") navigate("/staff");
      else navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your username and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-brand)] text-white flex items-center justify-center mx-auto mb-3 font-bold text-lg">
            SM
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-ink)]">School Management System</h1>
          <p className="text-sm text-[var(--color-slate)] mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-line)] rounded-xl p-6 shadow-sm space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-slate)]">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-slate)]">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-xs text-center text-[var(--color-slate)] mt-6">
          First time here? Default admin login: <span className="font-mono">admin / admin123</span>
        </p>
      </div>
    </div>
  );
}
