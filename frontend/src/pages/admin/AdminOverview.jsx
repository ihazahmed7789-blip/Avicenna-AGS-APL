import { useEffect, useState } from "react";
import api from "../../api/client";
import { StatCard, Card } from "../../components/ui";

export default function AdminOverview() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/reports/dashboard-summary")
      .then((res) => setSummary(res.data))
      .catch(() => setError("Could not load dashboard summary."));
  }, []);

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Students" value={summary?.totalStudents ?? "—"} />
        <StatCard label="Active Employees" value={summary?.totalEmployees ?? "—"} />
        <StatCard label="Pending Admissions" value={summary?.pendingAdmissions ?? "—"} tone="accent" />
        <StatCard label="Unpaid Fees" value={summary?.unpaidFees ?? "—"} tone="warn" />
        <StatCard label="Overdue Fees" value={summary?.overdueFees ?? "—"} tone="warn" />
        <StatCard label="Open Complaints" value={summary?.openComplaints ?? "—"} tone="accent" />
        <StatCard label="New Admission Inquiries" value={summary?.newInquiries ?? "—"} tone="accent" />
      </div>

      {summary?.latestRecognition && (
        <Card title="🌟 Latest Recognition">
          <p className="text-sm">
            <span className="font-semibold">{summary.latestRecognition.name}</span> — Student of the {summary.latestRecognition.type}
          </p>
        </Card>
      )}

      <Card title="Getting started">
        <ol className="list-decimal list-inside text-sm text-[var(--color-slate)] space-y-2">
          <li>Add students under <span className="font-medium text-[var(--color-ink)]">Students</span> — one by one or bulk import from Excel.</li>
          <li>Add employees under <span className="font-medium text-[var(--color-ink)]">Employees</span> the same way.</li>
          <li>Connect WhatsApp under <span className="font-medium text-[var(--color-ink)]">WhatsApp</span> by scanning the QR code once.</li>
          <li>Create staff/student login accounts from the <span className="font-medium text-[var(--color-ink)]">Users</span> action on each profile.</li>
          <li>Check all reports in one place under <span className="font-medium text-[var(--color-ink)]">Reports</span>.</li>
        </ol>
      </Card>
    </div>
  );
}
