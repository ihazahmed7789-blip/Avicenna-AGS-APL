import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import AdminOverview from "./admin/AdminOverview";
import AdminStudents from "./admin/AdminStudents";
import AdminEmployees from "./admin/AdminEmployees";
import AdminFees from "./admin/AdminFees";
import AdminResults from "./admin/AdminResults";
import AdminAdmissions from "./admin/AdminAdmissions";
import AdminWhatsApp from "./admin/AdminWhatsApp";
import AdminReports from "./admin/AdminReports";
import AdminUsers from "./admin/AdminUsers";
import AdminClasses from "./admin/AdminClasses";
import AdminAttendance from "./admin/AdminAttendance";
import AdminFamilyList from "./admin/AdminFamilyList";
import AdminFrontdesk from "./admin/AdminFrontdesk";
import AdminRecruitment from "./admin/AdminRecruitment";
import AdminRecognition from "./admin/AdminRecognition";
import AdminTimetable from "./admin/AdminTimetable";
import AdminDateSheet from "./admin/AdminDateSheet";
import AdminCertificates from "./admin/AdminCertificates";
import AdminIDCards from "./admin/AdminIDCards";
import AdminPTM from "./admin/AdminPTM";
import AdminGallery from "./admin/AdminGallery";

const navItems = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/frontdesk", label: "Frontdesk" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/family-list", label: "Family List" },
  { to: "/admin/employees", label: "Employees" },
  { to: "/admin/recruitment", label: "Recruitment" },
  { to: "/admin/certificates", label: "Certificates" },
  { to: "/admin/id-cards", label: "ID Cards" },
  { to: "/admin/classes", label: "Classes & Sections" },
  { to: "/admin/timetable", label: "Timetable" },
  { to: "/admin/datesheet", label: "Date Sheet" },
  { to: "/admin/attendance", label: "Attendance" },
  { to: "/admin/admissions", label: "Admissions" },
  { to: "/admin/ptm", label: "PTM Sheet" },
  { to: "/admin/fees", label: "Fees" },
  { to: "/admin/results", label: "Results" },
  { to: "/admin/recognition", label: "Student of the Week/Month" },
  { to: "/admin/gallery", label: "Photo Gallery" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/whatsapp", label: "WhatsApp" },
  { to: "/admin/users", label: "User Logins" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Panel" navItems={navItems} showHomeLink>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="frontdesk" element={<AdminFrontdesk />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="family-list" element={<AdminFamilyList />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="recruitment" element={<AdminRecruitment />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="id-cards" element={<AdminIDCards />} />
        <Route path="classes" element={<AdminClasses />} />
        <Route path="timetable" element={<AdminTimetable />} />
        <Route path="datesheet" element={<AdminDateSheet />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="admissions" element={<AdminAdmissions />} />
        <Route path="ptm" element={<AdminPTM />} />
        <Route path="fees" element={<AdminFees />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="recognition" element={<AdminRecognition />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="whatsapp" element={<AdminWhatsApp />} />
        <Route path="users" element={<AdminUsers />} />
      </Routes>
    </DashboardLayout>
  );
}
