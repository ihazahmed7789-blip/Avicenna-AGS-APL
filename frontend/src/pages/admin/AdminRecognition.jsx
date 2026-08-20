import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select } from "../../components/ui";

export default function AdminRecognition() {
  const [students, setStudents] = useState([]);
  const [weekList, setWeekList] = useState([]);
  const [monthList, setMonthList] = useState([]);
  const [form, setForm] = useState({ studentId: "", type: "week", periodLabel: "", reason: "" });
  const [message, setMessage] = useState("");

  function load() {
    api.get("/students").then((res) => setStudents(res.data));
    api.get("/recognitions", { params: { type: "week" } }).then((res) => setWeekList(res.data));
    api.get("/recognitions", { params: { type: "month" } }).then((res) => setMonthList(res.data));
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/recognitions", form);
      setMessage(`Student of the ${form.type} added.`);
      setForm({ studentId: "", type: "week", periodLabel: "", reason: "" });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save.");
    }
  }

  async function handleDelete(id) {
    await api.delete(`/recognitions/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      {message && <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">{message}</div>}

      <Card title="Add Recognition">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 max-w-lg">
          <Field label="Student">
            <Select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
              <option value="">Select a student...</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.fullName} — {s.rollNumber}</option>)}
            </Select>
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="week">Student of the Week</option>
              <option value="month">Student of the Month</option>
            </Select>
          </Field>
          <Field label="Period Label"><Input required value={form.periodLabel} onChange={(e) => setForm({ ...form, periodLabel: e.target.value })} placeholder={form.type === "week" ? "2026-W32" : "2026-08"} /></Field>
          <Field label="Reason"><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Best attendance, top marks..." /></Field>
          <div className="col-span-2">
            <Button type="submit">Add Recognition</Button>
          </div>
        </form>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Students of the Week">
          <RecognitionList list={weekList} onDelete={handleDelete} />
        </Card>
        <Card title="Students of the Month">
          <RecognitionList list={monthList} onDelete={handleDelete} />
        </Card>
      </div>
    </div>
  );
}

function RecognitionList({ list, onDelete }) {
  if (!list.length) return <p className="text-sm text-[var(--color-slate)] text-center py-6">None added yet.</p>;
  return (
    <div className="space-y-2">
      {list.map((r) => (
        <div key={r.id} className="flex items-center justify-between border border-[var(--color-line)] rounded-lg p-3">
          <div>
            <p className="font-medium text-sm">{r.Student?.fullName} <span className="text-[var(--color-slate)]">({r.periodLabel})</span></p>
            {r.reason && <p className="text-xs text-[var(--color-slate)]">{r.reason}</p>}
          </div>
          <button className="text-xs text-red-600 hover:underline" onClick={() => onDelete(r.id)}>Remove</button>
        </div>
      ))}
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
