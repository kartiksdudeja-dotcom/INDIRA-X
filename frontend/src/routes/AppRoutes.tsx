import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import AdminRegister from "../pages/auth/AdminRegister";

import SuperAdminDashboard from "../pages/super-admin/Dashboard";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import LiveAttendance from "../pages/teacher/LiveAttendance";

import AttendancePage from "../pages/student/AttendancePage";
import StudentLogin from "../pages/student/StudentLogin";
import AttendanceSuccess from "../pages/student/AttendanceSuccess";
import StudentRegister from "../pages/student/StudentRegister";
import StudentDashboard from "../pages/student/StudentDashboard";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Staff Login */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/student/login" element={<StudentLogin />} />
      {/* Dashboards */}
      <Route
        path="/super-admin/dashboard"
        element={<SuperAdminDashboard />}
      />

      <Route
        path="/admin/dashboard"
        element={<TeacherDashboard />}
      />

      {/* Live Attendance - MUST COME BEFORE /attendance/:token */}
      <Route
        path="/attendance/live/:sessionId"
        element={<LiveAttendance />}
      />

      <Route
        path="/attendance/success"
        element={<AttendanceSuccess />}
      />

      <Route
        path="/student/login/:token"
        element={<StudentLogin />}
      />

      {/* QR Attendance - KEEP THIS LAST */}
      <Route
        path="/attendance/:token"
        element={<AttendancePage />}
      />
      <Route
  path="/student/register/:token"
  element={<StudentRegister />}
/>
<Route
  path="/student/register"
  element={<StudentRegister />}
/>
      <Route
  path="/student/dashboard"
  element={<StudentDashboard />}
/>
    </Routes>
  

  );
}