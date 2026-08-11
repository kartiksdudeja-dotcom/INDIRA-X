import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/auth`;

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-600";

export default function AdminRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
    department: "",
    course: "",
    semester: "",
    division: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const register = async () => {
    setError("");
    setSuccessMsg("");

    if (
      !form.name || !form.email || !form.password || !form.confirmPassword ||
      !form.college || !form.department || !form.course || !form.semester || !form.division
    ) {
      setError("Please fill all required fields before proceeding.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          college: form.college,
          department: form.department,
          course: form.course,
          semester: form.semester,
          division: form.division,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Registration Successful. Please wait for Super Admin approval.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff] px-4 py-12 font-[Inter,system-ui,sans-serif] antialiased">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.1)]">
        
        {/* Header Section */}
        <div className="bg-[#002147] px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#800000]/30 blur-2xl"></div>
          
          <div className="relative z-10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-[#002147]">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <h2 className="relative z-10 text-2xl font-bold tracking-tight text-white">AttendX Administrator Registry</h2>
          <p className="relative z-10 mt-2 text-sm font-medium text-slate-300">Request elevated administrative privileges</p>
        </div>

        {/* Form Section */}
        <div className="px-6 py-8 md:px-10">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-shrink-0 text-rose-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-shrink-0 text-emerald-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {successMsg}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" placeholder="e.g. John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" placeholder="admin@indira.edu.in" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={inputClass} />
            </div>

            {/* Divider */}
            <div className="col-span-full my-2 border-t border-slate-100"></div>

            <div>
              <label className={labelClass}>College</label>
              <input type="text" placeholder="e.g. Indira College of Engineering" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Department</label>
              <input type="text" placeholder="e.g. Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Course</label>
              <input type="text" placeholder="e.g. B.Tech" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Semester</label>
              <input type="text" placeholder="e.g. 5" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Division</label>
              <input type="text" placeholder="e.g. A" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              onClick={register}
              disabled={loading || !!successMsg}
              className="w-full rounded-xl bg-[#002147] px-4 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#001a38] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed md:w-auto md:min-w-[240px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting Application...
                </span>
              ) : "Submit Registration Request"}
            </button>
            
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-[#800000] font-bold hover:underline transition-all">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}