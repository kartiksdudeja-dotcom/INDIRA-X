import { useNavigate } from "react-router-dom";

export default function AttendanceSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff] px-4 font-[Inter,system-ui,sans-serif]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.1)]">
        
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-inner">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-emerald-600">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">Attendance Marked!</h1>
        <p className="mb-8 text-sm text-slate-500 leading-relaxed">
          Your attendance has been recorded successfully. You can safely close this page or return to your dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            className="w-full rounded-xl bg-[#800000] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#700000] active:scale-[0.98]"
          >
            Go to Dashboard
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}