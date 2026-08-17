import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select, Table, Badge, StatCard } from "../../components/ui";

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monthFilter, setMonthFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", month: "", amountDue: "", dueDate: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function load() {
    api.get("/fees", { params: monthFilter ? { month: monthFilter } : {} }).then((res) => setFees(res.data));
    api.get("/fees/summary", { params: monthFilter ? { month: monthFilter } : {} }).then((res) => setSummary(res.data));
    api.get("/students").then((res) => setStudents(res.data));
  }
  useEffect(load, [monthFilter]);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/fees", form);
      setMessage("Fee record created.");
      setIsError(false);
      setShowForm(false);
      setForm({ studentId: "", month: "", amountDue: "", dueDate: "" });
      load();
    } catch (err) {
      const serverMsg = err.response?.data?.message || "Could not create fee record.";
      const detail = err.response?.data?.error;
      setMessage(detail ? `${serverMsg} (${detail})` : serverMsg);
      setIsError(true);
    }
  }

  async function handlePay(record) {
    const amount = prompt(`Amount being paid now (due: ${record.amountDue}, already paid: ${record.amountPaid}):`);
    if (!amount) return;
    await api.post(`/fees/${record.id}/pay`, { amountPaid: parseFloat(amount) });
    load();
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`text-sm rounded-lg px-3 py-2 ${isError ? "bg-red-50 text-red-700" : "bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]"}`}>
          {message}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Due" value={summary.totalDue} />
          <StatCard label="Total Collected" value={summary.totalPaid} />
          <StatCard label="Unpaid" value={summary.unpaidCount || 0} tone="warn" />
          <StatCard label="Overdue" value={summary.overdueCount || 0} tone="warn" />
        </div>
      )}

      <Card
        title="Fee Records"
        action={<Button onClick={() => setShowForm(true)} disabled={!students.length}>+ New Fee Record</Button>}
      >
        {!students.length && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            No students found yet. Add a student first (Students tab) before creating fee records.
          </p>
        )}
        <div className="mb-4">
          <Input placeholder="Filter by month, e.g. 2026-08" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="max-w-xs" />
        </div>
        <Table
          columns={[
            { key: "student", label: "Student", render: (r) => r.Student?.fullName || r.studentId },
            { key: "className", label: "Class", render: (r) => r.Student?.className || "—" },
            { key: "month", label: "Month" },
            { key: "amountDue", label: "Due" },
            { key: "amountPaid", label: "Paid" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            {
              key: "actions",
              label: "",
              render: (r) => r.status !== "paid" && (
                <button className="text-xs text-[var(--color-brand)] hover:underline" onClick={() => handlePay(r)}>Record Payment</button>
              ),
            },
          ]}
          rows={fees}
          empty="No fee records yet."
        />
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">New Fee Record</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <Field label="Student">
                <Select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                  <option value="">Select a student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName} — {s.rollNumber} ({s.className})</option>
                  ))}
                </Select>
              </Field>
              <Field label="Month (e.g. 2026-08)"><Input required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder="2026-08" /></Field>
              <Field label="Amount Due"><Input required type="number" value={form.amountDue} onChange={(e) => setForm({ ...form, amountDue: e.target.value })} /></Field>
              <Field label="Due Date"><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">{label}</label>
      {children}
    </div>
  );
}
