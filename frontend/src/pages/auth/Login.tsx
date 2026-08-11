import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/auth`;

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-600";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: "ADMIN", // or "SUPER_ADMIN"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login Failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "SUPER_ADMIN") {
        navigate("/super-admin/dashboard");
      } else if (data.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        setError("Students cannot login here.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] font-[Inter,system-ui,sans-serif] antialiased">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between bg-[#002147] p-12 text-white relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#800000]/20 blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#002147] shadow-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">Indira Attend X</span>
        </div>

        <div className="relative z-10 mt-20 max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-6">
            Institutional Management<br />
            <span className="text-[#800000] drop-shadow-md">Secure Portal</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-medium">
            Access administrative controls, oversee departmental operations, and manage faculty attendance workflows.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-slate-400">
          <span>&copy; {new Date().getFullYear()} Indira College</span>
          <span className="h-1 w-1 rounded-full bg-slate-500"></span>
          <span>Staff & Faculty Only</span>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Header */}
          <div className="mb-10 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#002147] shadow-lg">
              <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Indira Attend X</h2>
            <p className="mt-2 text-sm text-slate-500">Staff & Administrator Login</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
            <p className="mt-2 text-base text-slate-500">Enter your credentials to access the dashboard.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 animate-in fade-in slide-in-from-top-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-shrink-0 text-rose-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@indira.edu.in"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={`${inputClass} pl-11 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={login}
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#002147] px-4 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#001a38] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : "Sign In to Dashboard"}
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an Administrator account?{" "}
              <Link to="/admin/register" className="text-[#800000] hover:underline font-bold transition-all">
                Register as Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}