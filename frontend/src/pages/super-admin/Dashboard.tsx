import { useEffect, useState } from "react";
import Sidebar, { type SectionKey } from "./Sidebar";
import DashboardCards from "./components/DashboardCards";
import Topbar from "./components/Topbar";

const BASE_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api";
const API = `${BASE_URL}/super-admin`;
const AUTH_API = `${BASE_URL}/auth`;
const RAW_API = BASE_URL;

type UserRow = {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
  college?: string;
  department?: string;
  course?: string;
  semester?: string;
  division?: string;
  password?: string;
};

type AttendanceRow = {
  id: string;
  createdAt: string;
  student: { id: string; name: string; email: string; division?: string; semester?: string };
  session: { id: string; subject?: { name: string }; classModel?: { name: string } };
};

type SubjectRow = { id: string; name: string };

// ── Shared UI atoms ──────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-400">—</span>;
  const s = status.toUpperCase();
  let cls = "bg-slate-100 text-slate-600";
  if (s === "PENDING") cls = "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  if (s === "APPROVED" || s === "ACTIVE") cls = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (s === "REJECTED") cls = "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
        <svg className="h-5 w-5 animate-spin text-[#800000]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Fetching records…
      </div>
    </div>
  );
}

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

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

const thClass = "px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500 whitespace-nowrap";
const tdClass = "whitespace-nowrap px-5 py-3.5 text-sm text-slate-600";

// ── Main Component ───────────────────────────────────────────────
export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [dashboard, setDashboard] = useState<any>(null);
  const [admins, setAdmins] = useState<UserRow[]>([]);
  const [students, setStudents] = useState<UserRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchDashboardCounts(); }, []);
  useEffect(() => {
    if (activeSection === "admins") fetchAdmins();
    if (activeSection === "students") fetchStudents();
    if (activeSection === "subjects") fetchSubjects();
    if (activeSection === "attendance") fetchAttendance();
  }, [activeSection]);

  const fetchDashboardCounts = async () => {
    try {
      const res = await fetch(`${API}/dashboard`);
      const result = await res.json();
      setDashboard(result.data || {});
    } catch {
      setError("Unable to load dashboard counts.");
      setDashboard({});
    }
  };

  const fetchAdmins = async (force = false) => {
    if (!force && admins.length > 0) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_API}/admins`);
      setAdmins(await res.json() || []);
    } catch { setError("Unable to load admin data."); }
    finally { setLoading(false); }
  };

  const fetchStudents = async () => {
    if (students.length > 0) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${RAW_API}/students`);
      setStudents(await res.json() || []);
    } catch { setError("Unable to load student data."); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    if (subjects.length > 0) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${RAW_API}/subjects`);
      setSubjects(await res.json() || []);
    } catch { setError("Unable to load subject data."); }
    finally { setLoading(false); }
  };

  const fetchAttendance = async (force = false) => {
    if (!force && attendanceRecords.length > 0) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${RAW_API}/attendance/today`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setAttendanceRecords(await res.json() || []);
    } catch { setError("Unable to load today's attendance."); }
    finally { setLoading(false); }
  };

  const approveAdmin = async (id: string) => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_API}/admin/${id}/approve`, { method: "POST" });
      if (!res.ok) { const e = await res.json(); throw new Error(e?.message || "Failed"); }
      await fetchAdmins(true); await fetchDashboardCounts();
      showToast("Admin approved successfully.", "success");
    } catch (err) {
      setError((err as Error).message || "Unable to approve admin.");
      showToast("Failed to approve admin.", "error");
    } finally { setLoading(false); }
  };

  const rejectAdmin = async (id: string) => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_API}/admin/${id}/reject`, { method: "POST" });
      if (!res.ok) { const e = await res.json(); throw new Error(e?.message || "Failed"); }
      await fetchAdmins(true); await fetchDashboardCounts();
      showToast("Admin rejected.", "success");
    } catch (err) {
      setError((err as Error).message || "Unable to reject admin.");
      showToast("Failed to reject admin.", "error");
    } finally { setLoading(false); }
  };

  // Section titles
  const sectionTitles: Record<SectionKey, string> = {
    dashboard: "Dashboard Overview",
    admins: "Admin Approvals",
    students: "Student Management",
    subjects: "Subjects",
    attendance: "Today's Attendance",
  };

  const renderAdminsSection = () => (
    <TableWrapper>
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {["ID", "Name", "Email", "Role", "Status", "College", "Dept", "Course", "Semester", "Division", "Actions"].map(h => (
              <th key={h} className={thClass}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {admins.length === 0 ? (
            <tr><td colSpan={11}><EmptyState message="No admin records available." /></td></tr>
          ) : admins.map(a => (
            <tr key={a.id} className="transition-colors hover:bg-slate-50/60">
              <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-slate-400">{a.id}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-slate-900">{a.name}</td>
              <td className={tdClass}>{a.email}</td>
              <td className={tdClass}>{a.role || "—"}</td>
              <td className="whitespace-nowrap px-5 py-3.5"><StatusBadge status={a.status} /></td>
              <td className={tdClass}>{a.college ?? "—"}</td>
              <td className={tdClass}>{a.department ?? "—"}</td>
              <td className={tdClass}>{a.course ?? "—"}</td>
              <td className={tdClass}>{a.semester ?? "—"}</td>
              <td className={tdClass}>{a.division ?? "—"}</td>
              <td className="whitespace-nowrap px-5 py-3.5">
                {a.status === "PENDING" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveAdmin(a.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-sm"
                    >Approve</button>
                    <button
                      onClick={() => rejectAdmin(a.id)}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-rose-500 active:scale-95 shadow-sm"
                    >Reject</button>
                  </div>
                ) : <span className="text-xs text-slate-400">No actions</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderStudentsSection = () => (
    <TableWrapper>
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {["ID", "Name", "Email", "Role", "Status", "College", "Dept", "Course", "Semester", "Division"].map(h => (
              <th key={h} className={thClass}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {students.length === 0 ? (
            <tr><td colSpan={10}><EmptyState message="No student records available." /></td></tr>
          ) : students.map((s, i) => (
            <tr key={s.id ?? i} className="transition-colors hover:bg-slate-50/60">
              <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-slate-400">{s.id}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-slate-900">{s.name}</td>
              <td className={tdClass}>{s.email}</td>
              <td className={tdClass}>{s.role || "—"}</td>
              <td className="whitespace-nowrap px-5 py-3.5"><StatusBadge status={s.status} /></td>
              <td className={tdClass}>{s.college ?? "—"}</td>
              <td className={tdClass}>{s.department ?? "—"}</td>
              <td className={tdClass}>{s.course ?? "—"}</td>
              <td className={tdClass}>{s.semester ?? "—"}</td>
              <td className={tdClass}>{s.division ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderSubjectsSection = () => (
    <TableWrapper>
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {["ID", "Name"].map(h => <th key={h} className={thClass}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {subjects.length === 0 ? (
            <tr><td colSpan={2}><EmptyState message="No subjects found." /></td></tr>
          ) : subjects.map((s, i) => (
            <tr key={s.id ?? i} className="transition-colors hover:bg-slate-50/60">
              <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-slate-400">{s.id}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-slate-800">{s.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderAttendanceSection = () => (
    <TableWrapper>
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {["Student", "Email", "Semester", "Division", "Subject", "Class", "Marked At"].map(h => (
              <th key={h} className={thClass}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {attendanceRecords.length === 0 ? (
            <tr><td colSpan={7}><EmptyState message="No attendance records for today." /></td></tr>
          ) : attendanceRecords.map(r => (
            <tr key={r.id} className="transition-colors hover:bg-slate-50/60">
              <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-slate-900">{r.student.name}</td>
              <td className={tdClass}>{r.student.email}</td>
              <td className={tdClass}>{r.student.semester ?? "—"}</td>
              <td className={tdClass}>{r.student.division ?? "—"}</td>
              <td className={tdClass}>{r.session.subject?.name ?? "—"}</td>
              <td className={tdClass}>{r.session.classModel?.name ?? "—"}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-400 font-medium">
                {new Date(r.createdAt).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderSection = () => {
    if (loading) return <LoadingSpinner />;
    switch (activeSection) {
      case "dashboard": return <DashboardCards data={dashboard || {}} />;
      case "admins": return renderAdminsSection();
      case "students": return renderStudentsSection();
      case "subjects": return renderSubjectsSection();
      case "attendance": return renderAttendanceSection();
      default: return null;
    }
  };

  // Initial loading screen
  if (dashboard === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#002147] shadow-xl">
            <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Indira Attendance X</p>
            <p className="mt-1 text-xs text-slate-400">Initializing Super Admin Portal…</p>
          </div>
          <svg className="h-5 w-5 animate-spin text-[#800000]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] font-[Inter,system-ui,sans-serif] antialiased">
      <Sidebar activeKey={activeSection} onSelect={setActiveSection} />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar sectionTitle={sectionTitles[activeSection]} />

        <main className="flex-1 p-5 md:p-7 lg:p-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Super Admin</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            <span className="text-slate-700 capitalize">{sectionTitles[activeSection]}</span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-shrink-0 text-rose-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
              <button onClick={() => setError("")} className="ml-auto text-rose-400 hover:text-rose-600">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
              </button>
            </div>
          )}

          {/* Section content */}
          {renderSection()}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all
          ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}>
          {toast.type === "success" ? (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}