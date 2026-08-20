import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Select } from "../../components/ui";

export default function AdminCertificates() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState("service");
  const [preview, setPreview] = useState(null);

  useEffect(() => { api.get("/employees").then((res) => setEmployees(res.data)); }, []);

  async function handleGenerate() {
    if (!employeeId) return;
    const res = await api.post("/certificates", { employeeId, type });
    setPreview(res.data);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <Card title="Generate Certificate">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Employee</label>
            <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-56">
              <option value="">Select employee...</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Type</label>
            <Select value={type} onChange={(e) => setType(e.target.value)} className="w-48">
              <option value="service">Service Certificate</option>
              <option value="experience">Experience Certificate</option>
              <option value="relieving">Relieving Letter</option>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={!employeeId}>Generate</Button>
        </div>
      </Card>

      {preview && (
        <Card title="Preview" action={<Button variant="secondary" onClick={handlePrint}>Print</Button>}>
          <div id="certificate-print" className="border-2 border-[var(--color-brand)] rounded-lg p-10 bg-white max-w-2xl mx-auto">
            <h2 className="text-center text-xl font-bold text-[var(--color-brand-dark)] mb-1">Avicenna APL</h2>
            <p className="text-center text-sm text-[var(--color-slate)] mb-8 uppercase tracking-wide">{type.replace("_", " ")} Certificate</p>
            <p className="text-sm leading-relaxed">{preview.content}</p>
            <p className="text-sm mt-8">Issue Date: {new Date(preview.issueDate).toLocaleDateString()}</p>
            <div className="mt-16 flex justify-between text-sm">
              <div className="border-t border-[var(--color-ink)] pt-1 w-40 text-center">Principal Signature</div>
              <div className="border-t border-[var(--color-ink)] pt-1 w-40 text-center">School Stamp</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
