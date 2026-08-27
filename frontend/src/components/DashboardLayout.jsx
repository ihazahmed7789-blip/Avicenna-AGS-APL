import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ title, navItems, children, showHomeLink }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-surface)]">
      <aside className="w-60 shrink-0 bg-[var(--color-brand-dark)] text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-semibold">School Management</p>
          <p className="text-xs text-white/60 mt-0.5 capitalize">{user?.role} panel</p>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? "bg-white/15 text-white font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white mt-1">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-[var(--color-line)] px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h1>
          {showHomeLink && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium rounded-lg border border-[var(--color-line)] px-3 py-1.5 hover:bg-[var(--color-brand-light)] text-[var(--color-ink)]"
              title="Open the public website in a new tab"
            >
              🏠 Home
            </a>
          )}
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
