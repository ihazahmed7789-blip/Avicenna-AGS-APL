import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Table, Badge } from "../../components/ui";

export default function AdminAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [strength, setStrength] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ applicantName: "", appliedForClass: "", guardianName: "", guardianPhone: "" });
  const [message, setMessage] = useState("");

  function load() {
    api.get("/admissions").then((res) => setAdmissions(res.data));
    api.get("/admissions/strength-report").then((res) => setStrength(res.data));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/admissions", form);
    setShowForm(false);
    setForm({ applicantName: "", appliedForClass: "", guardianName: "", guardianPhone: "" });
    load();
  }

  async function handleStatus(id, status) {
    await api.put(`/admissions/${id}/status`, { status });
    load();
  }

  async function handleEnroll(admission) {
    const rollNumber = prompt(`Assign a roll number for ${admission.applicantName}:`);
    if (!rollNumber) return;
    const section = prompt("Section (optional):") || "";
    try {
      await api.post(`/admissions/${admission.id}/enroll`, { rollNumber, section });
      setMessage(`${admission.applicantName} enrolled as a student.`);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not enroll.");
    }
  }

  return (
    <div className="space-y-6">
      {message && <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">{message}</div>}

      {strength && (
        <Card title="School Strength">
          <p className="text-sm text-[var(--color-slate)] mb-3">Total active students: <span className="font-semibold text-[var(--color-ink)]">{strength.totalStrength}</span></p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(strength.byClass).map(([cls, data]) => (
              <div key={cls} className="border border-[var(--color-line)] rounded-lg p-3">
                <p className="text-sm font-medium">{cls}</p>
                <p className="text-lg font-semibold text-[var(--color-brand)]">{data.total}</p>
                <p className="text-xs text-[var(--color-slate)]">
                  {Object.entries(data.sections).map(([s, c]) => `${s}: ${c}`).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Admission Applications" action={<Button onClick={() => setShowForm(true)}>+ New Application</Button>}>
        <Table
          columns={[
            { key: "applicantName", label: "Applicant" },
            { key: "appliedForClass", label: "Class" },
            { key: "guardianPhone", label: "Guardian Phone" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <div className="flex gap-3">
                  {r.status === "pending" && (
                    <>
                      <button className="text-xs text-[var(--color-brand)] hover:underline" onClick={() => handleStatus(r.id, "approved")}>Approve</button>
                      <button className="text-xs text-red-600 hover:underline" onClick={() => handleStatus(r.id, "rejected")}>Reject</button>
                    </>
                  )}
                  {r.status === "approved" && (
                    <button className="text-xs text-[var(--color-brand)] hover:underline" onClick={() => handleEnroll(r)}>Enroll as Student</button>
                  )}
                </div>
              ),
            },
          ]}
          rows={admissions}
          empty="No admission applications yet."
        />
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">New Admission Application</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <Field label="Applicant Name"><Input required value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} /></Field>
              <Field label="Applied For Class"><Input required value={form.appliedForClass} onChange={(e) => setForm({ ...form, appliedForClass: e.target.value })} /></Field>
              <Field label="Guardian Name"><Input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></Field>
              <Field label="Guardian Phone"><Input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} /></Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Submit Application</Button>
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
