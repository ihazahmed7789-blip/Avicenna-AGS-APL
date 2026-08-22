import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Select } from "../../components/ui";

export default function AdminIDCards() {
  const [type, setType] = useState("student");
  const [students, setStudents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    api.get("/students").then((res) => setStudents(res.data));
    api.get("/employees").then((res) => setEmployees(res.data));
  }, []);

  const people = type === "student" ? students : employees;
  const selected = people.find((p) => String(p.id) === String(selectedId));

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <Card title="Generate ID Card">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Card Type</label>
            <Select value={type} onChange={(e) => { setType(e.target.value); setSelectedId(""); }} className="w-40">
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Select {type === "student" ? "Student" : "Staff"}</label>
            <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-64">
              <option value="">Select...</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.fullName} — {p.rollNumber || p.employeeCode}</option>)}
            </Select>
          </div>
          {selected && <Button variant="secondary" onClick={handlePrint}>Print Card</Button>}
        </div>
      </Card>

      {selected && (
        <div className="max-w-xs mx-auto">
          <div className="border-2 border-[var(--color-brand)] rounded-xl overflow-hidden bg-white">
            <div className="bg-[var(--color-brand)] text-white text-center py-3">
              <p className="font-bold text-sm">AVICENNA APL</p>
              <p className="text-xs opacity-80">{type === "student" ? "Student ID Card" : "Staff ID Card"}</p>
            </div>
            <div className="p-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-[var(--color-slate)]">
                {selected.fullName?.[0]}
              </div>
              <p className="font-semibold">{selected.fullName}</p>
              <p className="text-sm text-[var(--color-slate)]">
                {type === "student" ? `${selected.className} - ${selected.section || ""}` : selected.designation}
              </p>
              <p className="text-xs text-[var(--color-slate)] mt-2">
                {type === "student" ? `Roll No: ${selected.rollNumber}` : `Code: ${selected.employeeCode}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
