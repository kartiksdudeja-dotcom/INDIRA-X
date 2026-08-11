import { useState } from "react";
import { useNavigate } from "react-router-dom";

export type TeacherSectionKey = "dashboard" | "classes" | "history" | "profile";

type TeacherSidebarProps = {
  activeKey: TeacherSectionKey;
  onSelect?: (key: TeacherSectionKey) => void;
};

type MenuItem = {
  key: TeacherSectionKey;
  label: string;
  icon: React.ReactNode;
  path?: string;
};

const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Start Attendance",
    path: "/teacher/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      </svg>
    ),
  },
  {
    key: "classes",
    label: "My Classes",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
      </svg>
    ),
  },
  {
    key: "history",
    label: "Attendance History",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "My Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
];

export default function TeacherSidebar({ activeKey, onSelect }: TeacherSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // In a real app, you'd fetch from Context/Redux. Mocking for now.
  const teacherName = "Prof. Sharma"; 
  const teacherDept = "DBMS Faculty";

  const handleSelect = (item: MenuItem) => {
    if (onSelect) onSelect(item.key);
    if (item.path) navigate(item.path);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#800000] shadow-lg">
          <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight">
            Indira Attend X
          </div>
          <div className="text-xs text-slate-400 font-medium">Faculty Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Main Menu
          </span>
        </div>

        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelect(item)}
                className={`
                  group flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                  text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? "bg-[#800000] text-white shadow-[0_2px_8px_rgba(128,0,0,0.35)]"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`
                    flex-shrink-0 transition-transform duration-150
                    ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}
                    group-hover:scale-105
                  `}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#800000]/80 text-sm font-bold text-white">
            {teacherName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {teacherName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {teacherDept}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 flex-shrink-0">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-[#002147] text-white shadow-lg md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 transform bg-[#002147] transition-transform duration-300 ease-in-out md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-72 md:flex-shrink-0 md:flex-col bg-[#002147] min-h-screen">
        <SidebarContent />
      </aside>
    </>
  );
}
