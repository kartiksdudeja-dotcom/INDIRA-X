import { useState, useEffect } from "react";
import StudentSidebar, { type StudentSectionKey } from "./components/StudentSidebar";
import StudentTopbar from "./components/StudentTopbar";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-52 flex-col items-center justify-center gap-3 text-slate-400">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 opacity-30">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
      </svg>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState<StudentSectionKey>("dashboard");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/student/login";
    }
  }, []);

  const sectionTitles: Record<StudentSectionKey, string> = {
    dashboard: "Student Dashboard",
    attendance: "My Attendance",
    timetable: "Timetable",
    profile: "My Profile",
  };

  const renderDashboard = () => (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-slate-500">Overall Attendance</p>
            <p className="text-2xl font-bold text-slate-900">—</p>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-slate-500">Total Subjects</p>
            <p className="text-2xl font-bold text-slate-900">—</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="rounded-xl border border-slate-200 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)] overflow-hidden max-w-3xl">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
      </div>
      <div className="divide-y divide-slate-100">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-slate-500">Full Name</span>
          <span className="text-sm font-semibold text-slate-900">{user.name || "—"}</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-slate-500">Email Address</span>
          <span className="text-sm font-semibold text-slate-900">{user.email || "—"}</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-slate-500">College</span>
          <span className="text-sm font-semibold text-slate-900">{user.college || "—"}</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-slate-500">Department</span>
          <span className="text-sm font-semibold text-slate-900">{user.department || "—"}</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-slate-500">Course & Semester</span>
          <span className="text-sm font-semibold text-slate-900">{user.course || "—"} (Sem {user.semester || "—"})</span>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return renderDashboard();
      case "profile": return renderProfile();
      case "attendance": 
      case "timetable": 
        return (
          <div className="rounded-xl border border-slate-200 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
            <EmptyState message={`${sectionTitles[activeSection]} data will be available soon.`} />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] font-[Inter,system-ui,sans-serif] antialiased">
      <StudentSidebar activeKey={activeSection} onSelect={setActiveSection} />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <StudentTopbar sectionTitle={sectionTitles[activeSection]} />

        <main className="flex-1 p-5 md:p-7 lg:p-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Student Portal</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            <span className="text-slate-700 capitalize">{sectionTitles[activeSection]}</span>
          </div>

          {/* Section content */}
          {renderSection()}
        </main>
      </div>
    </div>
  );
}