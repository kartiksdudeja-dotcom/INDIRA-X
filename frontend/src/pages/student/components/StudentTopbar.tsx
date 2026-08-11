import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type StudentTopbarProps = {
  sectionTitle: string;
};

export default function StudentTopbar({ sectionTitle }: StudentTopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentName = user?.name || "Student";
  const studentEmail = user?.email || "student@indira.edu.in";

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md">
      {/* Left: Title */}
      <div className="min-w-0 flex-1 pl-10 md:pl-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#800000]">
            Student Portal
          </span>
          <h1 className="text-lg font-bold leading-tight text-slate-900 tracking-tight truncate">
            {sectionTitle}
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Date Badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-slate-400">
            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
          </svg>
          <span className="text-xs font-medium text-slate-500">{dateStr}</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 h-[18px] w-[18px]">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#800000] text-[9px] font-bold text-white">
              1
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                <span className="rounded-full bg-[#800000]/10 px-2 py-0.5 text-xs font-semibold text-[#800000]">1 new</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <span className="mt-0.5 flex-shrink-0 text-sm text-emerald-600">✓</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">Profile registration successful</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">Today</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 transition-all hover:bg-slate-50 hover:border-slate-300"
            aria-label="Profile menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#002147] text-xs font-bold text-white">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-slate-700 truncate max-w-[100px]">{studentName}</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="hidden sm:block h-3.5 w-3.5 text-slate-400">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900 truncate">{studentName}</p>
                <p className="text-xs text-slate-400 truncate">{studentEmail}</p>
              </div>
              <div className="border-t border-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/student/login");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
