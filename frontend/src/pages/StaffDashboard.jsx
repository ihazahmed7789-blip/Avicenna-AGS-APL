import { useEffect, useState } from "react";
import api from "../api/client";
import DashboardLayout from "../components/DashboardLayout";
import { Card, Button, Input, Table } from "../components/ui";

export default function StaffDashboard() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", examName: "", subject: "", marksObtained: "", totalMarks: "", examDate: "" });
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);

  function load() {
    api.get("/students").then((res) => setStudents(res.data));
    api.get("/results").then((res) => setResults(res.data));
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/results", form);
      setMessage("Result saved.");
      setShowForm(false);
      setForm({ studentId: "", examName: "", subject: "", marksObtained: "", totalMarks: "", examDate: "" });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save result.");
    }
  }

  return (
    <DashboardLayout
      title="Staff Panel"
      navItems={[{ to: "/staff", label: "Overview", end: true }]}
    >
      <div className="space-y-6">
        {message && <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">{message}</div>}

        <Card title="Students" action={<Button onClick={() => setShowForm(true)}>+ Enter Result</Button>}>
          <Table
            columns={[
              { key: "rollNumber", label: "Roll No." },
              { key: "fullName", label: "Name" },
              { key: "className", label: "Class" },
              { key: "section", label: "Section" },
            ]}
            rows={students}
            empty="No students found."
          />
        </Card>

        <Card title="Results You've Entered">
          <Table
            columns={[
              { key: "student", label: "Student", render: (r) => r.Student?.fullName || r.studentId },
              { key: "examName", label: "Exam" },
              { key: "subject", label: "Subject" },
              { key: "marksObtained", label: "Obtained" },
              { key: "totalMarks", label: "Total" },
              { key: "grade", label: "Grade" },
            ]}
            rows={results}
            empty="No results entered yet."
          />
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Enter Result</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Student ID"><Input required type="number" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} /></Field>
              <Field label="Exam Name"><Input required value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} placeholder="Mid Term" /></Field>
              <Field label="Subject"><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marks Obtained"><Input required type="number" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: e.target.value })} /></Field>
                <Field label="Total Marks"><Input required type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} /></Field>
              </div>
              <Field label="Exam Date"><Input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} /></Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Result</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
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
