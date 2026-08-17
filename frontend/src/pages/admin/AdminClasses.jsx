import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Table } from "../../components/ui";

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", order: "" });
  const [sectionForms, setSectionForms] = useState({}); // classId -> section name being typed
  const [message, setMessage] = useState("");

  function load() {
    api.get("/classes").then((res) => setClasses(res.data));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post("/classes", { name: form.name, order: form.order ? parseInt(form.order) : 0 });
      setShowForm(false);
      setForm({ name: "", order: "" });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not create class.");
    }
  }

  async function handleDeleteClass(id) {
    if (!confirm("Delete this class and its sections?")) return;
    await api.delete(`/classes/${id}`);
    load();
  }

  async function handleAddSection(classId) {
    const name = sectionForms[classId];
    if (!name) return;
    await api.post(`/classes/${classId}/sections`, { name });
    setSectionForms({ ...sectionForms, [classId]: "" });
    load();
  }

  async function handleDeleteSection(id) {
    await api.delete(`/classes/sections/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      {message && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{message}</div>}

      <Card title="Classes & Sections" action={<Button onClick={() => setShowForm(true)}>+ Add Class</Button>}>
        <p className="text-sm text-[var(--color-slate)] mb-4">
          Define your school's classes once here so Students, Attendance, and Timetable all use the same consistent list.
        </p>

        <div className="space-y-4">
          {classes.map((cls) => (
            <div key={cls.id} className="border border-[var(--color-line)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{cls.name}</h4>
                <button className="text-xs text-red-600 hover:underline" onClick={() => handleDeleteClass(cls.id)}>Delete Class</button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {cls.Sections?.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-xs px-2 py-1 rounded-full">
                    Section {s.name}
                    <button onClick={() => handleDeleteSection(s.id)} className="hover:text-red-600">×</button>
                  </span>
                ))}
                {!cls.Sections?.length && <span className="text-xs text-[var(--color-slate)]">No sections yet</span>}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="New section name, e.g. A"
                  value={sectionForms[cls.id] || ""}
                  onChange={(e) => setSectionForms({ ...sectionForms, [cls.id]: e.target.value })}
                  className="max-w-[160px]"
                />
                <Button variant="secondary" onClick={() => handleAddSection(cls.id)}>+ Add Section</Button>
              </div>
            </div>
          ))}
          {!classes.length && <p className="text-sm text-[var(--color-slate)] text-center py-6">No classes yet — add your first one.</p>}
        </div>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-4">Add Class</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <Field label="Class Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="9th" /></Field>
              <Field label="Display Order (optional)"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="9" /></Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Add Class</Button>
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
