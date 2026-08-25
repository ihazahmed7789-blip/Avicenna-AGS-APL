import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select, Table, Badge, StatCard } from "../../components/ui";

export default function AdminFees() {
  const [tab, setTab] = useState("records");
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-[var(--color-line)]">
        {[{ key: "records", label: "All Records" }, { key: "unpaid", label: "Unpaid Report" }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "records" && <FeeRecords />}
      {tab === "unpaid" && <UnpaidReport />}
    </div>
  );
}

function FeeRecords() {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monthFilter, setMonthFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", month: "", amountDue: "", dueDate: "" });
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showHistory, setShowHistory] = useState(null);
  const [history, setHistory] = useState([]);

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
      setMessage("Fee record created."); setIsError(false);
      setShowForm(false); setForm({ studentId: "", month: "", amountDue: "", dueDate: "" });
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

  async function handleViewHistory(studentId, studentName) {
    const res = await api.get(`/fees/student/${studentId}/history`);
    setHistory(res.data);
    setShowHistory(studentName);
  }

  function handleExport() {
    const base = api.defaults.baseURL;
    const token = localStorage.getItem("token");
    fetch(`${base}/export/fee-report?month=${monthFilter}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "fee-report.xlsx"; a.click();
      });
  }

  return (
    <div className="space-y-6">
      {message && <div className={`text-sm rounded-lg px-3 py-2 ${isError ? "bg-red-50 text-red-700" : "bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]"}`}>{message}</div>}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Due" value={summary.totalDue} />
          <StatCard label="Total Collected" value={summary.totalPaid} />
          <StatCard label="Unpaid" value={summary.unpaidCount || 0} tone="warn" />
          <StatCard label="Overdue" value={summary.overdueCount || 0} tone="warn" />
        </div>
      )}
      <Card title="Fee Records" action={<div className="flex gap-2"><Button variant="secondary" onClick={handleExport}>Export Excel</Button><Button onClick={() => setShowForm(true)} disabled={!students.length}>+ New Fee Record</Button></div>}>
        {!students.length && <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-4">No students found yet. Add a student first.</p>}
        <div className="mb-4"><Input placeholder="Filter by month, e.g. 2026-08" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="max-w-xs" /></div>
        <Table
          columns={[
            { key: "student", label: "Student", render: (r) => <button className="text-[var(--color-brand)] hover:underline" onClick={() => handleViewHistory(r.studentId, r.Student?.fullName)}>{r.Student?.fullName || r.studentId}</button> },
            { key: "className", label: "Class", render: (r) => r.Student?.className || "—" },
            { key: "month", label: "Month" }, { key: "amountDue", label: "Due" }, { key: "amountPaid", label: "Paid" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            { key: "actions", label: "", render: (r) => r.status !== "paid" && <button className="text-xs text-[var(--color-brand)] hover:underline" onClick={() => handlePay(r)}>Record Payment</button> },
          ]}
          rows={fees} empty="No fee records yet."
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
                  {students.map((s) => <option key={s.id} value={s.id}>{s.fullName} — {s.rollNumber} ({s.className})</option>)}
                </Select>
              </Field>
              <Field label="Month (e.g. 2026-08)"><Input required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></Field>
              <Field label="Amount Due"><Input required type="number" value={form.amountDue} onChange={(e) => setForm({ ...form, amountDue: e.target.value })} /></Field>
              <Field label="Due Date"><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
              <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">Create</Button></div>
            </form>
          </div>
        </div>
      )}
      {showHistory && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-semibold mb-4">Fee History — {showHistory}</h3>
            <Table
              columns={[{ key: "month", label: "Month" }, { key: "amountDue", label: "Due" }, { key: "amountPaid", label: "Paid" }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> }]}
              rows={history} empty="No fee history for this student."
            />
            <div className="flex justify-end mt-4"><Button variant="secondary" onClick={() => setShowHistory(null)}>Close</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function UnpaidReport() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [records, setRecords] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => { api.get("/classes").then((res) => setClasses(res.data)); }, []);

  function load() {
    api.get("/fees/unpaid", { params: className ? { className } : {} }).then((res) => setRecords(res.data));
  }
  useEffect(load, [className]);

  async function handleSendToAllUnpaid() {
    if (!messageText) return;
    setStatus("Sending...");
    const uniqueGuardians = [...new Map(records.filter((r) => r.Student?.guardianPhone).map((r) => [r.Student.guardianPhone, r.Student])).values()];
    let sent = 0;
    for (const s of uniqueGuardians) {
      try {
        await api.post("/whatsapp/send", { number: s.guardianPhone, message: messageText });
        sent++;
      } catch { /* continue to next */ }
    }
    setStatus(`Sent to ${sent} of ${uniqueGuardians.length} guardians.`);
  }

  return (
    <div className="space-y-6">
      <Card title="Unpaid Fees">
        <Select value={className} onChange={(e) => setClassName(e.target.value)} className="w-48 mb-4">
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </Select>
        <Table
          columns={[
            { key: "rollNumber", label: "Roll No.", render: (r) => r.Student?.rollNumber },
            { key: "student", label: "Student", render: (r) => r.Student?.fullName },
            { key: "className", label: "Class", render: (r) => r.Student?.className },
            { key: "month", label: "Month" }, { key: "amountDue", label: "Due" }, { key: "amountPaid", label: "Paid" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            { key: "guardianPhone", label: "Guardian Phone", render: (r) => r.Student?.guardianPhone || "—" },
          ]}
          rows={records} empty="No unpaid fees found."
        />
      </Card>
      {records.length > 0 && (
        <Card title="Message All Unpaid Guardians">
          <textarea className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm mb-3" rows={3}
            placeholder="e.g. Reminder: your child's fee is still unpaid. Please clear it soon."
            value={messageText} onChange={(e) => setMessageText(e.target.value)} />
          <Button onClick={handleSendToAllUnpaid} disabled={!messageText}>Send to All Unpaid Guardians</Button>
          {status && <p className="text-sm text-[var(--color-slate)] mt-2">{status}</p>}
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">{label}</label>{children}</div>;
}
