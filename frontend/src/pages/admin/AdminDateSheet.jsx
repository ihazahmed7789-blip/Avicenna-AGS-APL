import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select, Table } from "../../components/ui";

export default function AdminDateSheet() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [examName, setExamName] = useState("");
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ className: "", section: "", examName: "", subject: "", examDate: "", startTime: "", room: "" });

  useEffect(() => { api.get("/classes").then((res) => setClasses(res.data)); }, []);

  function load() {
    const params = {};
    if (className) params.className = className;
    if (examName) params.examName = examName;
    api.get("/datesheet", { params }).then((res) => setEntries(res.data));
  }
  useEffect(load, [className, examName]);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/datesheet", form);
    setShowForm(false);
    setForm({ className, section: "", examName, subject: "", examDate: "", startTime: "", room: "" });
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/datesheet/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        <Select value={className} onChange={(e) => setClassName(e.target.value)} className="w-48">
          <option value="">All classes</option>
          {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </Select>
        <Input placeholder="Exam name filter" value={examName} onChange={(e) => setExamName(e.target.value)} className="w-48" />
        <Button onClick={() => { setForm({ ...form, className }); setShowForm(true); }}>+ Add Exam Slot</Button>
      </div>

      <Card title="Date Sheet">
        <Table
          columns={[
            { key: "className", label: "Class" },
            { key: "examName", label: "Exam" },
            { key: "subject", label: "Subject" },
            { key: "examDate", label: "Date" },
            { key: "startTime", label: "Time" },
            { key: "room", label: "Room" },
            { key: "actions", label: "", render: (r) => <button className="text-xs text-red-600 hover:underline" onClick={() => handleDelete(r.id)}>Remove</button> },
          ]}
          rows={entries}
          empty="No exam schedule entries yet."
        />
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Add Exam Slot</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <Field label="Class">
                <Select required value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}>
                  <option value="">Select class...</option>
                  {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Section (optional)"><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></Field>
              <Field label="Exam Name"><Input required value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} placeholder="Mid Term 2026" /></Field>
              <Field label="Subject"><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
              <Field label="Exam Date"><Input required type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} /></Field>
              <Field label="Start Time"><Input value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} placeholder="09:00" /></Field>
              <Field label="Room (optional)"><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></Field>
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
