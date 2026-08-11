import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TeacherSidebar from "./components/TeacherSidebar";
import TeacherTopbar from "./components/TeacherTopbar";

const API = `${import.meta.env.VITE_API_URL}/attendance`;

export default function LiveAttendance() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAttendance = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API}/live/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setAttendance(data.attendance);
      }
    } catch (err) {
      console.error("Failed to fetch live attendance", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    const interval = setInterval(loadAttendance, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] font-[Inter,system-ui,sans-serif] antialiased">
      <TeacherSidebar activeKey="dashboard" onSelect={(key) => {
        if (key === "dashboard") navigate("/teacher/dashboard");
      }} />

      <div className="flex flex-1 flex-col min-w-0">
        <TeacherTopbar sectionTitle="Live Attendance Session" />

        <main className="flex-1 p-5 md:p-7 lg:p-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Faculty Portal</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            <span className="cursor-pointer hover:text-slate-600 transition-colors" onClick={() => navigate("/teacher/dashboard")}>Start Attendance</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            <span className="text-slate-700">Live View</span>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">Monitoring Active Session</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live Attendance List</h2>
              <p className="mt-1 text-sm text-slate-500">Students joining the session will appear here in real-time.</p>
            </div>
            
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 shadow-sm">
              <span className="text-sm font-semibold text-emerald-800">Total Present:</span>
              <span className="rounded-md bg-white px-2.5 py-1 text-base font-bold text-emerald-700 shadow-sm">{attendance.length}</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    {["Student Name", "Email Address", "Semester", "Division", "Status", "Marked At"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {loading && attendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <svg className="mx-auto h-6 w-6 animate-spin text-slate-300" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="mt-3 text-sm text-slate-500 font-medium">Connecting to session stream…</p>
                      </td>
                    </tr>
                  ) : attendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-900">Waiting for students</p>
                        <p className="mt-1 text-xs text-slate-500">No students have scanned in yet.</p>
                      </td>
                    </tr>
                  ) : (
                    attendance.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#002147]/10 text-xs font-bold text-[#002147]">
                              {item.student.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-slate-900">{item.student.name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-600">{item.student.email}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-600">{item.student.semester}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-600">{item.student.division}</td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            {item.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-xs font-medium text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}