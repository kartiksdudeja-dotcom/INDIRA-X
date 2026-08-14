import { useState } from "react";
import AudioBroadcaster from "../../components/AudioBroadcaster";
import { generateToken } from "../../utils/tokenGenerator";
import VisualFlickerBroadcaster from "../../components/VisualFlickerBroadcaster";
import TeacherSidebar, { type TeacherSectionKey } from "./components/TeacherSidebar";
import TeacherTopbar from "./components/TeacherTopbar";

const API = `${import.meta.env.VITE_API_URL}/attendance`;

interface Session {
  id: string;
  qrToken: string;
  semester: string;
  division: string;
  subject: { name: string };
  teacher: { name: string };
}

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.05em] text-slate-500";

export default function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState<TeacherSectionKey>("dashboard");
  const [form, setForm] = useState({
    college: "Indira College",
    course: "B.Tech",
    semester: "5",
    subject: "DBMS",
    division: "A",
    teacherName: "Prof. Sharma",
  });
  const [audioToken, setAudioToken] = useState("");
  const [qr, setQr] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    let bestPosition: GeolocationPosition | null = null;
    let watchId: number | null = null;

    const startTime = Date.now();
    const maxWaitTime = 15000;

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;

        console.log("📍 GPS Reading:");
        console.log("Latitude:", position.coords.latitude);
        console.log("Longitude:", position.coords.longitude);
        console.log("Accuracy:", accuracy, "meters");

        // Keep the most accurate reading
        if (
          !bestPosition ||
          accuracy < bestPosition.coords.accuracy
        ) {
          bestPosition = position;

          console.log(
            "✅ Best GPS so far:",
            accuracy,
            "meters"
          );
        }

        // Good GPS reading
        if (accuracy <= 20) {
          console.log(
            "🎯 Good GPS found:",
            accuracy,
            "meters"
          );

          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }

          resolve(position);
          return;
        }

        // Stop after 15 seconds
        if (Date.now() - startTime >= maxWaitTime) {
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }

          if (bestPosition) {
            console.log(
              "⚠️ Using best available GPS:",
              bestPosition.coords.accuracy,
              "meters"
            );

            resolve(bestPosition);
          } else {
            reject(
              new Error(
                "Unable to get GPS location"
              )
            );
          }
        }
      },
      (error) => {
        console.error("❌ GPS Error:", error);

        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }

        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};

  const startAttendance = async () => {
    setLoading(true);
    setError("");
    try {
      const position = await getLocation();
      const res = await fetch(`${API}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQr(data.qrDataUrl);
        setSession(data.session);
        const shortCode = generateToken(6);
        setAudioToken(shortCode);
        localStorage.setItem("sessionId", data.session.id);
      } else {
        setError(data.message || "Unable to start attendance");
      }
    } catch (err) {
      console.error("Start attendance error:", err);
      setError("Please enable location permissions before starting attendance.");
    } finally {
      setLoading(false);
    }
  };

  const sectionTitles: Record<TeacherSectionKey, string> = {
    dashboard: "Start Attendance",
    classes: "My Classes",
    history: "Attendance History",
    profile: "My Profile",
  };

  const renderDashboard = () => (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Column: Form or Session Details */}
      <div className="lg:col-span-7 xl:col-span-8">
        {!session ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-xl font-bold text-slate-900">New Attendance Session</h2>
              <p className="mt-1 text-sm text-slate-500">Verify class details to initiate the session broadcast.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-rose-500">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className={labelClass}>Teacher Name</label><input className={inputClass} value={form.teacherName} onChange={(e) => setForm({ ...form, teacherName: e.target.value })} /></div>
              <div><label className={labelClass}>College</label><input className={inputClass} value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} /></div>
              <div><label className={labelClass}>Course</label><input className={inputClass} value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} /></div>
              <div><label className={labelClass}>Semester</label><input className={inputClass} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
              <div><label className={labelClass}>Subject</label><input className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div><label className={labelClass}>Division</label><input className={inputClass} value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} /></div>
            </div>

            <button
              onClick={startAttendance}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-[#800000] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#700000] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Initializing Biometrics…
                </span>
              ) : "Start Attendance"}
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)]">
            <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">Active Session</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{session.subject?.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{session.teacher?.name} • Sem {session.semester} • Div {session.division}</p>
              </div>
              <button
                onClick={() => window.location.href = `/attendance/live/${session.id}`}
                className="rounded-lg bg-[#002147] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#001a38]"
              >
                View Live List
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.05em] text-slate-500">Session Signals</p>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-slate-400">Audio Token</span>
                    <span className="font-mono text-lg font-bold text-slate-900">{audioToken}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">QR Token</span>
                    <span className="font-mono text-xs font-bold text-slate-900">{session.qrToken}</span>
                  </div>
                </div>
              </div>

              {qr && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white p-5">
                  <img src={qr} alt="Attendance QR" className="h-32 w-32 rounded-lg" />
                  <p className="mt-3 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Scan to join</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Broadcasters */}
      <div className="lg:col-span-5 xl:col-span-4">
        {session && (
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Audio Broadcast</h3>
                  <p className="text-xs text-slate-500">Ultrasonic token transmission</p>
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-blue-100">
                <AudioBroadcaster token={audioToken} />
              </div>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.48 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Visual Broadcast</h3>
                  <p className="text-xs text-slate-500">Screen flicker transmission</p>
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-purple-100">
                <VisualFlickerBroadcaster token={audioToken} />
              </div>
            </div>
          </div>
        )}

        {!session && (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">Broadcasters Offline</p>
            <p className="mt-1 text-xs text-slate-400">Start an attendance session to activate audio and visual token transmission.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaceholder = () => (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 opacity-30">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
      </svg>
      <p className="text-sm font-medium">{sectionTitles[activeSection]} will be available soon.</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] font-[Inter,system-ui,sans-serif] antialiased">
      <TeacherSidebar activeKey={activeSection} onSelect={setActiveSection} />

      <div className="flex flex-1 flex-col min-w-0">
        <TeacherTopbar sectionTitle={sectionTitles[activeSection]} />

        <main className="flex-1 p-5 md:p-7 lg:p-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Faculty Portal</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            <span className="text-slate-700 capitalize">{sectionTitles[activeSection]}</span>
          </div>

          {activeSection === "dashboard" ? renderDashboard() : renderPlaceholder()}
        </main>
      </div>
    </div>
  );
}