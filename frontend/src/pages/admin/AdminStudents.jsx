import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Table, Badge } from "../../components/ui";

const emptyForm = {
  rollNumber: "", fullName: "", fatherName: "", className: "", section: "",
  guardianName: "", guardianPhone: "", whatsappNumber: "", familyNumber: "", guardianCnic: "", status: "active",
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [importResult, setImportResult] = useState(null);

  function load() {
    api.get("/students", { params: { ...(search ? {search} : {}), ...(status !== "all" ? {status} : {}) } }).then((res) => setStudents(res.data));
  }

  useEffect(load, [search, status]);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(student) {
    setForm(student);
    setEditingId(student.id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, form);
        setMessage("Student updated.");
      } else {
        await api.post("/students", form);
        setMessage("Student added.");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save student.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this student?")) return;
    await api.delete(`/students/${id}`);
    load();
  }

  async function handleWithdraw(id) {
    const reason = prompt("Reason for withdrawal (optional):");
    if (reason === null) return; // cancelled
    await api.put(`/students/${id}/withdraw`, { withdrawalReason: reason });
    load();
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/students/import", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setImportResult(res.data);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Import failed.");
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {message && <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">{message}</div>}
      {importResult && (
        <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">
          Imported {importResult.importedCount} students. {importResult.failedCount > 0 && `${importResult.failedCount} rows failed.`}
        </div>
      )}

      <Card
        title="Students"
        action={
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <span className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-[var(--color-line)] hover:bg-gray-50 inline-block">
                Import from Excel
              </span>
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
            </label>
            <Button onClick={openNew}>+ Add Student</Button>
          </div>
        }
      >
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
          <Input placeholder="Search by name or roll number..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          {["active","inactive","withdrawn","graduated","all"].map(x=><button key={x} onClick={()=>setStatus(x)} className={`px-3 py-2 rounded-lg text-xs border capitalize ${status===x?"bg-[var(--color-brand)] text-white":"bg-white"}`}>{x}</button>)}
        </div>
        </div>

        <Table
          columns={[
            { key: "rollNumber", label: "Roll No." },
            { key: "fullName", label: "Name" },
            { key: "className", label: "Class" },
            { key: "section", label: "Section" },
            { key: "guardianPhone", label: "Guardian Phone" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <div className="flex gap-3">
                  <button className="text-xs text-[var(--color-brand)] hover:underline" onClick={() => openEdit(r)}>Edit</button>
                  {r.status === "active" && <button className="text-xs text-amber-700 hover:underline" onClick={() => handleWithdraw(r.id)}>Withdraw</button>}
                  <button className="text-xs text-red-600 hover:underline" onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              ),
            },
          ]}
          rows={students}
          empty="No students yet — add one or import from Excel."
        />
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold mb-4">{editingId ? "Edit Student" : "Add Student"}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <Field label="Roll Number"><Input required value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} /></Field>
              <Field label="Full Name"><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></Field>
              <Field label="Father Name"><Input value={form.fatherName || ""} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} /></Field>
              <Field label="Class"><Input required value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} /></Field>
              <Field label="Section"><Input value={form.section || ""} onChange={(e) => setForm({ ...form, section: e.target.value })} /></Field>
              <Field label="Guardian Name"><Input value={form.guardianName || ""} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></Field>
              <Field label="Guardian Phone"><Input value={form.guardianPhone || ""} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value, whatsappNumber: e.target.value })} placeholder="923001234567" /></Field>
              <Field label="Family Number (groups siblings)"><Input value={form.familyNumber || ""} onChange={(e) => setForm({ ...form, familyNumber: e.target.value })} placeholder="F001" /></Field>
              <Field label="Status">
                <select className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </Field>

              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">{editingId ? "Save Changes" : "Add Student"}</Button>
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
