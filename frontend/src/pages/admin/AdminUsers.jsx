import { useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select } from "../../components/ui";

export default function AdminUsers() {
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "staff", linkedStudentId: "", linkedEmployeeId: "" });
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (form.role !== "student") delete payload.linkedStudentId;
      if (form.role !== "staff") delete payload.linkedEmployeeId;
      await api.post("/auth/users", payload);
      setMessage(`Login account created for ${form.name}.`);
      setForm({ name: "", username: "", password: "", role: "staff", linkedStudentId: "", linkedEmployeeId: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not create login.");
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {message && <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">{message}</div>}

      <Card title="Create Login Account">
        <p className="text-sm text-[var(--color-slate)] mb-4">
          Give a staff member or student their own login. Link it to their existing employee/student profile so they see the right data.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Full Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Username"><Input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
          <Field label="Password"><Input required type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="staff">Staff</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          {form.role === "student" && (
            <Field label="Linked Student ID"><Input type="number" value={form.linkedStudentId} onChange={(e) => setForm({ ...form, linkedStudentId: e.target.value })} /></Field>
          )}
          {form.role === "staff" && (
            <Field label="Linked Employee ID"><Input type="number" value={form.linkedEmployeeId} onChange={(e) => setForm({ ...form, linkedEmployeeId: e.target.value })} /></Field>
          )}
          <Button type="submit" className="w-full">Create Login</Button>
        </form>
      </Card>
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
