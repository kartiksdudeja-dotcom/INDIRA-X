import { useState } from "react";
import { getFaceDescriptor } from "../../utils/faceRecognition";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FaceCapture from "../../components/FaceCapture";

const API = `${import.meta.env.VITE_API_URL}/student`;

type FormState = {
  name: string; email: string; password: string; confirmPassword: string;
  college: string; department: string; course: string; semester: string; division: string;
};

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-500";

export default function StudentRegister() {
  const [searchParams] = useSearchParams();
  const attendanceToken = searchParams.get("token");
  const navigate = useNavigate();

  const [faceDescriptor, setFaceDescriptor] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [faceImage, setFaceImage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    name: "", email: "", password: "", confirmPassword: "",
    college: "", department: "", course: "", semester: "", division: "",
  });

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const register = async () => {
    if (!faceImage) { setError("Please capture your face first."); return; }
    if (faceDescriptor.length === 0) { setError("Face descriptor not generated. Retake photo."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (!form.name || !form.email || !form.password) { setError("Please fill all required fields."); return; }

    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, faceImage, faceDescriptor }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Registration failed."); return; }
      localStorage.setItem("user", JSON.stringify(data.user));
      if (attendanceToken) navigate(`/attendance/${attendanceToken}`);
      else navigate("/student/dashboard");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] px-4 py-10 font-[Inter,system-ui,sans-serif]">
      <div className="mx-auto max-w-2xl">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#002147] shadow-lg">
            <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Indira Attend X</h1>
          <p className="mt-1 text-sm text-slate-500">Student Registration</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500">Fill in your details and register your face to get started.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-rose-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Section: Account Details */}
          <div className="mb-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#800000]">Account Details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Full Name *</label><input placeholder="e.g. Priya Sharma" className={inputClass} onChange={set("name")} /></div>
              <div><label className={labelClass}>Email Address *</label><input type="email" placeholder="student@indira.edu.in" className={inputClass} onChange={set("email")} /></div>
              <div><label className={labelClass}>Password *</label><input type="password" placeholder="Create a password" className={inputClass} onChange={set("password")} /></div>
              <div><label className={labelClass}>Confirm Password *</label><input type="password" placeholder="Repeat password" className={inputClass} onChange={set("confirmPassword")} /></div>
            </div>
          </div>

          {/* Section: Academic Details */}
          <div className="mb-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#800000]">Academic Details</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><label className={labelClass}>College</label><input placeholder="Indira College" className={inputClass} onChange={set("college")} /></div>
              <div><label className={labelClass}>Department</label><input placeholder="e.g. Computer Science" className={inputClass} onChange={set("department")} /></div>
              <div><label className={labelClass}>Course</label><input placeholder="e.g. BCA" className={inputClass} onChange={set("course")} /></div>
              <div><label className={labelClass}>Semester</label><input placeholder="e.g. 3" className={inputClass} onChange={set("semester")} /></div>
              <div><label className={labelClass}>Division</label><input placeholder="e.g. A" className={inputClass} onChange={set("division")} /></div>
            </div>
          </div>

          {/* Section: Face Registration */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#800000]">Face Registration</p>
            <p className="mb-4 text-xs text-slate-500">Your face is used for secure biometric attendance verification.</p>

            {!faceImage && !showCamera && (
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="flex items-center gap-2 rounded-lg border border-[#002147] bg-[#002147] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#001a38] active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2S13.77 8.8 12 8.8 8.8 10.23 8.8 12s1.43 3.2 3.2 3.2zm6.4-9.6h-2.28l-1.12-2H8.98L7.86 5.6H5.6C4.08 5.6 2.8 6.88 2.8 8.4v9.6c0 1.52 1.28 2.8 2.8 2.8h12.8c1.52 0 2.8-1.28 2.8-2.8V8.4c0-1.52-1.28-2.8-2.6-2.8z" />
                </svg>
                Capture Face
              </button>
            )}

            {showCamera && (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <FaceCapture
                  onCapture={async (image) => {
                    const descriptor = await getFaceDescriptor(image);
                    if (!descriptor) { setError("Face not detected. Please align your face clearly."); return; }
                    setFaceImage(image);
                    setFaceDescriptor(descriptor);
                    setShowCamera(false);
                  }}
                />
              </div>
            )}

            {faceImage && (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={faceImage} alt="Captured face" className="h-20 w-20 rounded-xl border-2 border-emerald-200 object-cover shadow-sm" />
                  <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Face captured successfully</p>
                  <button type="button" onClick={() => { setFaceImage(""); setShowCamera(true); }} className="mt-1 text-xs font-medium text-slate-400 hover:text-slate-600 underline">
                    Retake photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={register}
            disabled={loading}
            className="w-full rounded-lg bg-[#800000] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#700000] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Registering…
              </span>
            ) : "Create Student Account"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to={attendanceToken ? `/student/login?token=${attendanceToken}` : "/student/login"}
              className="font-semibold text-[#800000] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}