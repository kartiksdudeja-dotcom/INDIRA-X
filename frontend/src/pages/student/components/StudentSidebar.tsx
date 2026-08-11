import { useState } from "react";

export type StudentSectionKey = "dashboard" | "attendance" | "timetable" | "profile";

type StudentSidebarProps = {
  activeKey: StudentSectionKey;
  onSelect: (key: StudentSectionKey) => void;
};

type MenuItem = {
  key: StudentSectionKey;
  label: string;
  icon: React.ReactNode;
};

const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    key: "attendance",
    label: "My Attendance",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
      </svg>
    ),
  },
  {
    key: "timetable",
    label: "Timetable",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
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

export default function StudentSidebar({ activeKey, onSelect }: StudentSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentName = user?.name || "Student";

  const handleSelect = (key: StudentSectionKey) => {
    onSelect(key);
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
          <div className="text-xs text-slate-400 font-medium">Student Portal</div>
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
                onClick={() => handleSelect(item.key)}
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
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleSelect("profile")}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#800000]/80 text-sm font-bold text-white">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {studentName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.course || "Student"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/student/login";
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
