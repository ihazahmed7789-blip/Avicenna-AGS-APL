import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select, Table, Badge } from "../../components/ui";

export default function AdminRecruitment() {
  const [applicants, setApplicants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", appliedFor: "", interviewDate: "" });

  function load() {
    api.get("/recruitment").then((res) => setApplicants(res.data));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/recruitment", form);
    setShowForm(false);
    setForm({ fullName: "", phone: "", email: "", appliedFor: "", interviewDate: "" });
    load();
  }

  async function handleStatus(id, status) {
    await api.put(`/recruitment/${id}`, { status });
    load();
  }

  return (
    <div className="space-y-6">
      <Card title="Recruitment" action={<Button onClick={() => setShowForm(true)}>+ Add Applicant</Button>}>
        <Table
          columns={[
            { key: "fullName", label: "Name" },
            { key: "appliedFor", label: "Applied For" },
            { key: "phone", label: "Phone" },
            { key: "interviewDate", label: "Interview Date" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status === "hired" ? "approved" : r.status} /> },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <Select value={r.status} onChange={(e) => handleStatus(r.id, e.target.value)} className="text-xs py-1">
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </Select>
              ),
            },
          ]}
          rows={applicants}
          empty="No applicants yet."
        />
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Add Applicant</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <Field label="Full Name"><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></Field>
              <Field label="Applied For (Position)"><Input value={form.appliedFor} onChange={(e) => setForm({ ...form, appliedFor: e.target.value })} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Interview Date"><Input type="date" value={form.interviewDate} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} /></Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
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
