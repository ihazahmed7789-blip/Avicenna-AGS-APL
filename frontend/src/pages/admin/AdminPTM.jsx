import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Select } from "../../components/ui";

export default function AdminPTM() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  useEffect(() => { api.get("/classes").then((res) => setClasses(res.data)); }, []);

  async function handleLoad() {
    if (!className) return;
    setError("");
    try {
      const res = await api.get("/students/reports/ptm-sheet", { params: { className, section: section || undefined } });
      setStudents(Array.isArray(res.data) ? res.data : []);
      setGenerated(true);
    } catch (err) {
      setError(err.response?.data?.message || "PTM sheet could not be generated.");
      setGenerated(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
      <Card title="PTM Sheet">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Class</label>
            <Select value={className} onChange={(e) => setClassName(e.target.value)} className="w-48">
              <option value="">Select class...</option>
              {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Section (optional)</label>
            <Select value={section} onChange={(e) => setSection(e.target.value)} className="w-32">
              <option value="">All</option>
              {classes.find((c) => c.name === className)?.Sections?.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </Select>
          </div>
          <Button onClick={handleLoad} disabled={!className}>Generate Sheet</Button>
          {generated && <Button variant="secondary" onClick={handlePrint}>Print / Save PDF</Button>}
        </div>
      </Card>

      {generated && (
        <Card title={`PTM Sheet — ${className} ${section || ""}`}>
          <div className="mb-4 text-sm text-[var(--color-slate)]">Students: <strong>{students.length}</strong> · Class: <strong>{className}</strong> · Section: <strong>{section || "All"}</strong></div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--color-ink)] text-left">
                <th className="py-2 pr-4">Roll No.</th>
                <th className="py-2 pr-4">Student Name</th>
                <th className="py-2 pr-4">Guardian Name</th>
                <th className="py-2 pr-4">Contact</th>
                <th className="py-2 pr-4">Attended (✓)</th>
                <th className="py-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && <tr><td colSpan="6" className="py-8 text-center text-[var(--color-slate)]">No active students found for this class/section.</td></tr>}
              {students.map((s) => (
                <tr key={s.id} className="border-b border-[var(--color-line)]">
                  <td className="py-2 pr-4">{s.rollNumber}</td>
                  <td className="py-2 pr-4">{s.fullName}</td>
                  <td className="py-2 pr-4">{s.guardianName || "—"}</td>
                  <td className="py-2 pr-4">{s.guardianPhone || "—"}</td>
                  <td className="py-2 pr-4">☐</td>
                  <td className="py-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
