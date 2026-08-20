import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Table, Badge } from "../../components/ui";

const emptyForm = {
  employeeCode: "", fullName: "", designation: "", department: "",
  phone: "", email: "", monthlySalary: "", basicPay: "", allowances: "", standardDeductions: "", status: "active",
};

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [importResult, setImportResult] = useState(null);

  function load() {
    api.get("/employees").then((res) => setEmployees(res.data));
  }
  useEffect(load, []);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }
  function openEdit(emp) {
    setForm(emp);
    setEditingId(emp.id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, form);
        setMessage("Employee updated.");
      } else {
        await api.post("/employees", form);
        setMessage("Employee added.");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save employee.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this employee?")) return;
    await api.delete(`/employees/${id}`);
    load();
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post("/employees/import", fd, { headers: { "Content-Type": "multipart/form-data" } });
    setImportResult(res.data);
    load();
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {message && <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">{message}</div>}
      {importResult && (
        <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">
          Imported {importResult.importedCount} employees. {importResult.failedCount > 0 && `${importResult.failedCount} rows failed.`}
        </div>
      )}

      <Card
        title="Employees"
        action={
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <span className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-[var(--color-line)] hover:bg-gray-50 inline-block">
                Import from Excel
              </span>
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
            </label>
            <Button onClick={openNew}>+ Add Employee</Button>
          </div>
        }
      >
        <Table
          columns={[
            { key: "employeeCode", label: "Code" },
            { key: "fullName", label: "Name" },
            { key: "designation", label: "Designation" },
            { key: "department", label: "Department" },
            { key: "monthlySalary", label: "Salary" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            {
              key: "actions",
              label: "",
              render: (r) => (
                <div className="flex gap-3">
                  <button className="text-xs text-[var(--color-brand)] hover:underline" onClick={() => openEdit(r)}>Edit</button>
                  <button className="text-xs text-red-600 hover:underline" onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              ),
            },
          ]}
          rows={employees}
          empty="No employees yet — add one or import from Excel."
        />
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold mb-4">{editingId ? "Edit Employee" : "Add Employee"}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <Field label="Employee Code"><Input required value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} /></Field>
              <Field label="Full Name"><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></Field>
              <Field label="Designation"><Input value={form.designation || ""} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Field>
              <Field label="Department"><Input value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
              <Field label="Phone"><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Monthly Salary"><Input type="number" value={form.monthlySalary || ""} onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })} /></Field>
              <Field label="Basic Pay"><Input type="number" value={form.basicPay || ""} onChange={(e) => setForm({ ...form, basicPay: e.target.value })} /></Field>
              <Field label="Allowances"><Input type="number" value={form.allowances || ""} onChange={(e) => setForm({ ...form, allowances: e.target.value })} /></Field>
              <Field label="Standard Deductions"><Input type="number" value={form.standardDeductions || ""} onChange={(e) => setForm({ ...form, standardDeductions: e.target.value })} /></Field>
              <Field label="Status">
                <select className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>

              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">{editingId ? "Save Changes" : "Add Employee"}</Button>
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
