import { useEffect, useState } from "react";
import api from "../api/client";
import DashboardLayout from "../components/DashboardLayout";
import { Card, Table, Badge } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    if (!user?.linkedStudentId) return;
    api.get(`/students/${user.linkedStudentId}`).then((res) => setProfile(res.data));
    api.get("/results", { params: { studentId: user.linkedStudentId } }).then((res) => setResults(res.data));
    api.get("/fees", { params: { studentId: user.linkedStudentId } }).then((res) => setFees(res.data));
  }, [user]);

  return (
    <DashboardLayout title="My Dashboard" navItems={[{ to: "/student", label: "Overview", end: true }]}>
      <div className="space-y-6">
        {!user?.linkedStudentId && (
          <div className="bg-amber-50 text-amber-700 text-sm rounded-lg px-3 py-2">
            Your login isn't linked to a student profile yet. Ask the admin to link it.
          </div>
        )}

        {profile && (
          <Card title="My Profile">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-[var(--color-slate)]">Name</p><p className="font-medium">{profile.fullName}</p></div>
              <div><p className="text-[var(--color-slate)]">Roll Number</p><p className="font-medium">{profile.rollNumber}</p></div>
              <div><p className="text-[var(--color-slate)]">Class</p><p className="font-medium">{profile.className} {profile.section}</p></div>
              <div><p className="text-[var(--color-slate)]">Guardian</p><p className="font-medium">{profile.guardianName}</p></div>
            </div>
          </Card>
        )}

        <Card title="My Results">
          <Table
            columns={[
              { key: "examName", label: "Exam" },
              { key: "subject", label: "Subject" },
              { key: "marksObtained", label: "Obtained" },
              { key: "totalMarks", label: "Total" },
              { key: "grade", label: "Grade" },
            ]}
            rows={results}
            empty="No results published yet."
          />
        </Card>

        <Card title="My Fee Status">
          <Table
            columns={[
              { key: "month", label: "Month" },
              { key: "amountDue", label: "Due" },
              { key: "amountPaid", label: "Paid" },
              { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            ]}
            rows={fees}
            empty="No fee records yet."
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
