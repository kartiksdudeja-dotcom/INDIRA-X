import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FaceCapture from "../../components/FaceCapture";
import { getFaceDescriptor } from "../../utils/faceRecognition";
import { listenForToken } from "../../utils/ultrasonicDecoder";

const API = `${import.meta.env.VITE_API_URL}/attendance`;

interface Session {
  id: string; college: string; course: string; semester: string;
  division: string; qrToken: string;
  subject: { name: string };
  teacher: { name: string };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="w-28 flex-shrink-0 text-xs font-semibold uppercase tracking-[0.05em] text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value || "—"}</span>
    </div>
  );
}

export default function AttendancePage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [audioBuffer, setAudioBuffer] = useState("");
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    if (!session) return;
    listenForToken((char) => {
      setAudioBuffer((old) => {
        const updated = (old + char).slice(-20);
        if (session.qrToken && updated.includes(session.qrToken.toUpperCase())) {
          console.log("✅ Ultrasonic token matched session!");
        }
        return updated;
      });
    }).catch((err) => console.error("Ultrasonic listener failed to start:", err));
  }, [session]);

  useEffect(() => {
    const tokenData = localStorage.getItem("token");
    const student = JSON.parse(localStorage.getItem("user") || "{}");
    if (!tokenData || !student.id || student.role !== "STUDENT") {
      navigate(`/student/login?token=${token}`);
      return;
    }
    loadSession();
    loadFaceStatus();
  }, []);

  const loadSession = async () => {
    try {
      const res = await fetch(`${API}/session/${token}`);
      const data = await res.json();
      if (data.success) setSession(data.session);
      else alert(data.message);
    } catch { alert("Unable to load attendance session"); }
    finally { setLoading(false); }
  };

  const loadFaceStatus = async () => {
    try {
      const tokenData = localStorage.getItem("token");
      const student = JSON.parse(localStorage.getItem("user") || "{}");
      if (student?.name) setStudentName(student.name);
      if (!tokenData || !student.id) return;
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/student/face-status/${student.id}`,
        { headers: { Authorization: `Bearer ${tokenData}` } }
      );
      const data = await res.json();
      if (data.success) setRegistered(data.registered);
    } catch (err) { console.error("Failed to fetch face status:", err); }
  };

  const getLocation = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject("Geolocation not supported"); return; }
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    });

  const registerFace = async (image: string, descriptor: number[]) => {
    const tokenData = localStorage.getItem("token");
    const student = JSON.parse(localStorage.getItem("user") || "{}");
    if (!tokenData || !student.id || student.role !== "STUDENT") {
      navigate(`/student/login?token=${token}`); return;
    }
    const res = await fetch(`${import.meta.env.VITE_API_URL}/student/register-face`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenData}` },
      body: JSON.stringify({ studentId: student.id, image, descriptor }),
    });
    const data = await res.json();
    if (data.success) {
      setRegistered(true); setShowCamera(false); await loadFaceStatus();
    } else { alert(data.message || "Face registration failed"); }
  };

  const markAttendance = async (faceImage: string, faceDescriptor: number[]) => {
    if (marking) return;
    setMarking(true);
    try {
      const tokenData = localStorage.getItem("token");
      const student = JSON.parse(localStorage.getItem("user") || "{}");
      if (!tokenData || !student.id || student.role !== "STUDENT") {
        navigate(`/student/login?token=${token}`); return;
      }
      const position = await getLocation();
      const res = await fetch(`${API}/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenData}` },
        body: JSON.stringify({
          studentId: student.id, studentName: student.name, sessionId: session?.id,
          latitude: position.coords.latitude, longitude: position.coords.longitude,
          faceImage, faceDescriptor,
        }),
      });
      const data = await res.json();
      if (data.success) navigate("/attendance/success");
      else alert(data.message);
    } catch { alert("Unable to mark attendance."); }
    finally { setMarking(false); }
  };

  // ── Loading Screen ────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff] font-[Inter,system-ui,sans-serif]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#002147] shadow-lg">
            <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <svg className="h-5 w-5 animate-spin text-[#800000]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-medium text-slate-500">Loading attendance session…</p>
        </div>
      </div>
    );
  }

  // ── Not Found ─────────────────────────────────────────────
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff] px-4 font-[Inter,system-ui,sans-serif]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-rose-600">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Session Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">This attendance session is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  // ── Main Page ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9ff] px-4 py-8 font-[Inter,system-ui,sans-serif]">
      <div className="mx-auto max-w-lg">
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002147] shadow-md">
            <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#800000]">Indira Attend X</p>
            <p className="text-sm font-bold text-slate-900">Mark Attendance</p>
          </div>
        </div>

        {/* Student Status Card */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002147]/10 text-sm font-bold text-[#002147]">
                {studentName ? studentName.charAt(0).toUpperCase() : "S"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{studentName || "Student"}</p>
                <p className="text-xs text-slate-400">Logged In</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${registered ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${registered ? "bg-emerald-500" : "bg-amber-500"}`} />
              {registered ? "Face Registered" : "Face Not Registered"}
            </div>
          </div>
        </div>

        {/* Session Info Card */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-[0.05em] text-slate-500">Live Session</span>
            </div>
            <p className="mt-1 text-base font-bold text-slate-900">{session.subject?.name}</p>
          </div>
          <div className="divide-y divide-slate-50 px-5">
            <InfoRow label="Teacher" value={session.teacher?.name} />
            <InfoRow label="College" value={session.college} />
            <InfoRow label="Course" value={session.course} />
            <InfoRow label="Semester" value={session.semester} />
            <InfoRow label="Division" value={session.division} />
          </div>
        </div>

        {/* Camera error */}
        {cameraError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
            {cameraError}
          </div>
        )}

        {/* Action Button */}
        {!showCamera && (
          <button
            type="button"
            onClick={() => { setCameraError(""); setShowCamera(true); }}
            disabled={marking}
            className="w-full rounded-xl bg-[#800000] py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#700000] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {marking ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Marking Attendance…
              </span>
            ) : registered ? "Mark Attendance" : "Register Face"}
          </button>
        )}

        {/* Face Camera */}
        {showCamera && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                {registered ? "Position your face to mark attendance" : "Position your face for registration"}
              </p>
              <button type="button" onClick={() => setShowCamera(false)} className="text-slate-400 hover:text-slate-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
              </button>
            </div>
            <div className="p-4">
              <FaceCapture
                onCapture={async (image) => {
                  if (!image || image.length < 1000) {
                    setCameraError("Captured frame is empty. Please check camera access.");
                    return;
                  }
                  const descriptor = await getFaceDescriptor(image);
                  if (!descriptor) {
                    setCameraError("Face not detected. Align your face clearly with the camera.");
                    return;
                  }
                  const spoofRes = await fetch(`${import.meta.env.VITE_API_URL}/anti-spoof/check`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image }),
                  });
                  const spoof = await spoofRes.json();
                  if (!spoof.real) {
                    setCameraError("Fake face or photo spoof detected!");
                    setShowCamera(false);
                    return;
                  }
                  if (!registered) {
                    await registerFace(image, descriptor);
                  } else {
                    setShowCamera(false);
                    await markAttendance(image, descriptor);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Audio buffer debug - hidden in production */}
        {audioBuffer && (
          <p className="mt-3 text-center text-[10px] font-mono text-slate-300">
            Audio: {audioBuffer}
          </p>
        )}
      </div>
    </div>
  );
}