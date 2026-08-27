import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select, Table } from "../../components/ui";

export default function AdminResults() {
  const [tab, setTab] = useState("entry");
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-[var(--color-line)]">
        {[{ key: "entry", label: "Entry" }, { key: "classreport", label: "Class Report" }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "entry" && <ResultEntry />}
      {tab === "classreport" && <ClassReport />}
    </div>
  );
}

function ResultEntry() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", examName: "", subject: "", marksObtained: "", totalMarks: "", examDate: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function load() {
    api.get("/results").then((res) => setResults(res.data));
    api.get("/students").then((res) => setStudents(res.data));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/results", form);
      setMessage("Result entered."); setIsError(false);
      setShowForm(false); setForm({ studentId: "", examName: "", subject: "", marksObtained: "", totalMarks: "", examDate: "" });
      load();
    } catch (err) {
      const serverMsg = err.response?.data?.message || "Could not save result.";
      const detail = err.response?.data?.error;
      setMessage(detail ? `${serverMsg} (${detail})` : serverMsg);
      setIsError(true);
    }
  }

  return (
    <div className="space-y-6">
      {message && <div className={`text-sm rounded-lg px-3 py-2 ${isError ? "bg-red-50 text-red-700" : "bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]"}`}>{message}</div>}
      <Card title="Results" action={<Button onClick={() => setShowForm(true)} disabled={!students.length}>+ Enter Result</Button>}>
        {!students.length && <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-4">No students found yet. Add a student first.</p>}
        <Table
          columns={[
            { key: "student", label: "Student", render: (r) => r.Student?.fullName || r.studentId },
            { key: "examName", label: "Exam" }, { key: "subject", label: "Subject" },
            { key: "marksObtained", label: "Obtained" }, { key: "totalMarks", label: "Total" }, { key: "grade", label: "Grade" },
          ]}
          rows={results} empty="No results entered yet."
        />
      </Card>
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Enter Result</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <Field label="Student">
                <Select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                  <option value="">Select a student...</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.fullName} — {s.rollNumber} ({s.className})</option>)}
                </Select>
              </Field>
              <Field label="Exam Name"><Input required value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} placeholder="Mid Term" /></Field>
              <Field label="Subject"><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marks Obtained"><Input required type="number" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: e.target.value })} /></Field>
                <Field label="Total Marks"><Input required type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} /></Field>
              </div>
              <Field label="Exam Date"><Input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} /></Field>
              <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">Save Result</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassReport() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [examName, setExamName] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/classes").then((res) => setClasses(res.data)); }, []);

  async function handleLoad() {
    if (!className || !examName) return;
    const res = await api.get("/results/class-report", { params: { className, section: section || undefined, examName } });
    setData(res.data);
  }

  function handleExport() {
    const base = api.defaults.baseURL;
    const token = localStorage.getItem("token");
    fetch(`${base}/export/results-report?className=${className}&examName=${examName}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob()).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "results-report.xlsx"; a.click();
      });
  }

  function handlePrint() { window.print(); }

  return (
    <div className="space-y-6">
      <Card title="Class-wise Result Report">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Class</label>
            <Select value={className} onChange={(e) => setClassName(e.target.value)} className="w-40">
              <option value="">Select class...</option>
              {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Section (optional)</label>
            <Select value={section} onChange={(e) => setSection(e.target.value)} className="w-32">
              <option value="">All</option>
              {classes.find((c) => c.name === className)?.Sections?.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Exam Name</label>
            <Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Mid Term" className="w-40" />
          </div>
          <Button onClick={handleLoad} disabled={!className || !examName}>Generate</Button>
          {data && <><Button variant="secondary" onClick={handleExport}>Export Excel</Button><Button variant="secondary" onClick={handlePrint}>Print</Button></>}
        </div>
      </Card>

      {data && (
        <Card title={`${className} ${section || ""} — ${examName}`}>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse w-full">
              <thead>
                <tr>
                  <th className="border border-[var(--color-line)] px-2 py-1">Roll No.</th>
                  <th className="border border-[var(--color-line)] px-2 py-1">Name</th>
                  {data.subjects.map((s) => <th key={s} className="border border-[var(--color-line)] px-2 py-1">{s}</th>)}
                  <th className="border border-[var(--color-line)] px-2 py-1">Total</th>
                  <th className="border border-[var(--color-line)] px-2 py-1">%</th>
                </tr>
              </thead>
              <tbody>
                {data.report.map((r) => (
                  <tr key={r.studentId}>
                    <td className="border border-[var(--color-line)] px-2 py-1">{r.rollNumber}</td>
                    <td className="border border-[var(--color-line)] px-2 py-1">{r.fullName}</td>
                    {data.subjects.map((s) => (
                      <td key={s} className="border border-[var(--color-line)] px-2 py-1 text-center">
                        {r.subjects[s] ? `${r.subjects[s].obtained}/${r.subjects[s].total}` : "-"}
                      </td>
                    ))}
                    <td className="border border-[var(--color-line)] px-2 py-1 text-center">{r.totalObtained}/{r.totalMax}</td>
                    <td className="border border-[var(--color-line)] px-2 py-1 text-center">{r.percentage || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">{label}</label>{children}</div>;
}
