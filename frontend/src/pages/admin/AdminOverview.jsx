import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { StatCard, Card } from "../../components/ui";

export default function AdminOverview() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [unpaid, setUnpaid] = useState([]);

  useEffect(() => {
    api
      .get("/reports/dashboard-summary")
      .then((res) => setSummary(res.data))
      .catch(() => setError("Could not load dashboard summary."));
    api
      .get("/fees/unpaid")
      .then((res) => setUnpaid(res.data.slice(0, 5)))
      .catch(() => {});
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

      {summary?.birthdaysToday?.length > 0 && (
        <Card title="🎂 Birthdays Today">
          <div className="flex flex-wrap gap-2">
            {summary.birthdaysToday.map((b, i) => (
              <span key={i} className="text-sm bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] rounded-full px-3 py-1.5">
                {b.name}
                {b.detail && <span className="opacity-70"> — {b.detail}</span>}
              </span>
            ))}
          </div>
        </Card>
      )}

      {(summary?.latestRecognitionWeek || summary?.latestRecognitionMonth) && (
        <div className="grid md:grid-cols-2 gap-4">
          {summary?.latestRecognitionWeek && (
            <Card title="🌟 Student of the Week">
              <p className="text-sm font-semibold">{summary.latestRecognitionWeek.name}</p>
              {summary.latestRecognitionWeek.reason && (
                <p className="text-xs text-[var(--color-slate)] mt-1">{summary.latestRecognitionWeek.reason}</p>
              )}
            </Card>
          )}
          {summary?.latestRecognitionMonth && (
            <Card title="🏆 Student of the Month">
              <p className="text-sm font-semibold">{summary.latestRecognitionMonth.name}</p>
              {summary.latestRecognitionMonth.reason && (
                <p className="text-xs text-[var(--color-slate)] mt-1">{summary.latestRecognitionMonth.reason}</p>
              )}
            </Card>
          )}
        </div>
      )}

      {unpaid.length > 0 && (
        <Card
          title="🔔 Unpaid Fee Notifications"
          action={
            <Link to="/admin/fees?tab=unpaid" className="text-sm text-[var(--color-brand)] hover:underline">
              View &amp; Message →
            </Link>
          }
        >
          <div className="space-y-1.5">
            {unpaid.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm border-b border-[var(--color-line)]/60 py-1.5 last:border-0">
                <span>
                  {r.Student?.fullName}{" "}
                  <span className="text-[var(--color-slate)]">
                    ({r.Student?.className}
                    {r.Student?.section ? ` - ${r.Student.section}` : ""})
                  </span>
                </span>
                <span className="text-[var(--color-slate)]">{r.month} — Due {r.amountDue}</span>
              </div>
            ))}
          </div>
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
