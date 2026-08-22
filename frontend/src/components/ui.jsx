export function Card({ title, children, action }) {
  return (
    <div className="bg-white border border-[var(--color-line)] rounded-xl p-5 shadow-sm">
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-semibold text-[var(--color-ink)]">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, tone = "brand" }) {
  const tones = {
    brand: "text-[var(--color-brand)] bg-[var(--color-brand-light)]",
    accent: "text-[var(--color-accent)] bg-orange-50",
    warn: "text-red-700 bg-red-50",
  };
  return (
    <div className={`rounded-xl p-4 border border-[var(--color-line)] ${tones[tone]}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50";
  const variants = {
    primary: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)]",
    secondary: "bg-white border border-[var(--color-line)] text-[var(--color-ink)] hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 ${props.className || ""}`}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40 ${props.className || ""}`}
    >
      {children}
    </select>
  );
}

export function Badge({ status }) {
  const map = {
    active: "bg-green-100 text-green-700",
    paid: "bg-green-100 text-green-700",
    approved: "bg-green-100 text-green-700",
    enrolled: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    pending: "bg-amber-100 text-amber-700",
    unpaid: "bg-amber-100 text-amber-700",
    partial: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    failed: "bg-red-100 text-red-700",
    sent: "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export function Table({ columns, rows, empty = "No records yet." }) {
  if (!rows?.length) {
    return <p className="text-sm text-[var(--color-slate)] py-6 text-center">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--color-slate)] border-b border-[var(--color-line)]">
            {columns.map((c) => (
              <th key={c.key} className="py-2 pr-4 font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-[var(--color-line)]/60 hover:bg-[var(--color-brand-light)]/30">
              {columns.map((c) => (
                <td key={c.key} className="py-2 pr-4">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
