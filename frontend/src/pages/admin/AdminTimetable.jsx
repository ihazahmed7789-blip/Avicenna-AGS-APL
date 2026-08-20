import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select, Table } from "../../components/ui";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminTimetable() {
  const [classes, setClasses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ className: "", section: "", day: "Monday", period: "", startTime: "", endTime: "", subject: "", teacherId: "" });

  useEffect(() => {
    api.get("/classes").then((res) => setClasses(res.data));
    api.get("/employees").then((res) => setEmployees(res.data));
  }, []);

  function load() {
    if (!className) return setEntries([]);
    api.get("/timetable", { params: { className, section: section || undefined } }).then((res) => setEntries(res.data));
  }
  useEffect(load, [className, section]);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/timetable", { ...form, period: parseInt(form.period) });
    setShowForm(false);
    setForm({ className, section, day: "Monday", period: "", startTime: "", endTime: "", subject: "", teacherId: "" });
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/timetable/${id}`);
    load();
  }

  const grouped = DAYS.map((day) => ({ day, items: entries.filter((e) => e.day === day).sort((a, b) => a.period - b.period) }));

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Select value={className} onChange={(e) => setClassName(e.target.value)} className="w-48">
          <option value="">Select class...</option>
          {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </Select>
        <Input placeholder="Section (optional)" value={section} onChange={(e) => setSection(e.target.value)} className="w-32" />
        {className && <Button onClick={() => { setForm({ ...form, className, section }); setShowForm(true); }}>+ Add Period</Button>}
      </div>

      {!className ? (
        <p className="text-sm text-[var(--color-slate)] text-center py-12">Select a class to view its timetable.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {grouped.map(({ day, items }) => (
            <Card key={day} title={day}>
              {items.length ? (
                <div className="space-y-2">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm border-b border-[var(--color-line)]/60 py-1.5">
                      <span>P{it.period} · {it.startTime}-{it.endTime} · <strong>{it.subject}</strong> {it.teacherName && `(${it.teacherName})`}</span>
                      <button className="text-xs text-red-600 hover:underline" onClick={() => handleDelete(it.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-[var(--color-slate)]">No periods set.</p>}
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Add Timetable Period</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              <Field label="Day">
                <Select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
              <Field label="Period #"><Input required type="number" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></Field>
              <Field label="Start Time"><Input value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} placeholder="08:00" /></Field>
              <Field label="End Time"><Input value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} placeholder="08:40" /></Field>
              <Field label="Subject"><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
              <Field label="Teacher">
                <Select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                  <option value="">None</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                </Select>
              </Field>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
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
