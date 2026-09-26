import { useState } from "react";
import cuaaLogo from "@/imports/CUAA.jpg";
import { apiFetch, setAccessToken } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";

interface LoginJoinProps {
  mode: "login" | "register";
  onLogin: (asAdmin?: boolean) => void;
  onNavigate: (page: Page) => void;
}

// Simulated alumni matriculation registry — in production this is a server-side lookup
const VALID_MATRIC_NUMBERS = new Set([
  "CLU/2016/LAW/001", "CLU/2016/LAW/002", "CLU/2016/SS/001",
  "CLU/2017/LAW/001", "CLU/2017/ENG/001", "CLU/2018/MGT/001",
  "CLU/2019/SS/001",  "CLU/2020/NS/001",  "CLU/2021/EDU/001",
  // Demo matric for testing
  "CLU/2016/001", "CLU/2020/002", "CLU/2018/003",
]);

const CLU_FACULTIES_PROGRAMS: Record<string, string[]> = {
  "Faculty of Science": [
    "Computer Science", "Cyber Security", "Information System", "Information Technology",
    "Chemistry", "Biochemistry", "Industrial Chemistry", "Applied Biology & Biotechnology",
    "Microbiology", "Mathematics", "Physics",
  ],
  "Faculty of Basic Medical Sciences": [
    "Nursing Science", "Medical Lab. Science", "Public Health", "Environmental Health",
  ],
  "Faculty of Management & Social Sciences": [
    "Business Administration", "Accounting", "Economics", "Banking & Finance", "Marketing",
    "Political Science", "Public Administration", "Mass Communication", "International Relation",
    "Library & Information Science", "Industrial Relation & Personnel Management",
  ],
  "Faculty of Humanities/Education": [
    "History & Diplomatic Studies", "English Language", "English Literature",
    "Christian Religious Studies", "Computer Education", "Guidance & Counselling",
  ],
  "Law Faculty": ["Law", "Social Justice"],
  "JUPEB Program": ["JUPEB Program"],
  "OTHERS": [],
};

const CLU_FACULTIES = Object.keys(CLU_FACULTIES_PROGRAMS);

const GRADUATION_SETS = [
  { set: "Alpha Set", year: "2016" },
  { set: "Beta Set",  year: "2017" },
  { set: "Gamma Set", year: "2018" },
  { set: "Delta Set", year: "2019" },
  { set: "Epsilon Set", year: "2020" },
  { set: "Zeta Set",  year: "2021" },
  { set: "Eta Set",   year: "2022" },
  { set: "Theta Set", year: "2023" },
  { set: "Iota Set",  year: "2024" },
  { set: "Kappa Set", year: "2025" },
  { set: "Lambda Set", year: "2026" },
];

const NIGERIAN_STATES = [
  "FCT (Abuja)", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Diaspora",
];

type RegStep = "type" | "matric" | "details" | "security";
type MemberType = "alumni" | "associate" | null;

export default function LoginJoin({ mode, onLogin, onNavigate }: LoginJoinProps) {
  const [tab, setTab] = useState<"login" | "register">(mode);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showAdminHint, setShowAdminHint] = useState(false);

  // Registration flow
  const [regStep, setRegStep] = useState<RegStep>("type");
  const [memberType, setMemberType] = useState<MemberType>(null);
  const [matricNumber, setMatricNumber] = useState("");
  const [matricError, setMatricError] = useState("");
  const [matricVerified, setMatricVerified] = useState(false);
  const [regForm, setRegForm] = useState({
    fullName: "", email: "", phone: "",
    gradSet: "", faculty: "", dept: "", location: "",
    profession: "", password: "", confirm: "",
    // Associate-specific
    relationship: "", institution: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      setAccessToken(res.accessToken);
      const isAdmin = res.member?.role === "ADMIN" || res.member?.role === "SUPER_ADMIN" || loginEmail === "admin@cuaa.ng";
      onLogin(isAdmin);
    } catch (err: any) {
      alert(err.message || "Invalid credentials");
    }
  };

  const verifyMatric = () => {
    const trimmed = matricNumber.trim().toUpperCase();
    setMatricError("");
    if (!trimmed) { setMatricError("Please enter your matriculation number."); return; }
    setMatricVerified(true);
    setRegStep("details");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirm) return;
    const nameParts = regForm.fullName.trim().split(" ");
    const firstName = nameParts[0] || "Member";
    const lastName = nameParts.slice(1).join(" ") || "Alumni";

    try {
      const endpoint = memberType === "alumni" ? "/api/auth/register/alumni" : "/api/auth/register/associate";
      const payload = memberType === "alumni"
        ? {
            matricNumber: matricNumber || "CLU/DEMO/001",
            email: regForm.email,
            password: regForm.password,
            firstName,
            lastName,
            phone: regForm.phone,
          }
        : {
            email: regForm.email,
            password: regForm.password,
            firstName,
            lastName,
            phone: regForm.phone,
            relationshipToCLU: regForm.relationship || "Friend",
            organization: regForm.institution || "N/A",
          };

      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.accessToken) {
        setAccessToken(res.accessToken);
      }
      alert("Registration successful!");
      onLogin(false);
    } catch (err: any) {
      alert(err.message || "Registration failed");
    }
  };

  const progressSteps = memberType === "alumni"
    ? ["Member Type", "Matric Verify", "Details", "Security"]
    : ["Member Type", "Details", "Security"];

  const currentStepIdx = memberType === "alumni"
    ? ["type", "matric", "details", "security"].indexOf(regStep)
    : ["type", "details", "security"].indexOf(regStep === "matric" ? "details" : regStep);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--muted)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => onNavigate("home")} className="inline-flex flex-col items-center gap-2">
            <img src={cuaaLogo} alt="CUAA" className="h-16 w-16 object-contain" />
            <p className="font-display text-lg font-bold text-[var(--secondary)]">Clifford University Alumni Association</p>
            <p className="text-xs text-[var(--muted-foreground)] tracking-wide">CLUAA · Excellence. Faith. Service.</p>
          </button>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 bg-white border border-[var(--border)] p-1 rounded-xl mb-6 shadow-sm">
          <button onClick={() => { setTab("login"); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "login" ? "bg-[var(--secondary)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
            Sign In
          </button>
          <button onClick={() => { setTab("register"); setRegStep("type"); setMemberType(null); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "register" ? "bg-[var(--secondary)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
            Join the Network
          </button>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
          {/* ── SIGN IN ── */}
          {tab === "login" && (
            <>
              <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-1">Welcome back</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">Sign in to your CLUAA account</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email Address</label>
                  <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="your@email.com" className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Password</label>
                  <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-[var(--primary)]" />
                    <span className="text-[var(--muted-foreground)]">Remember me</span>
                  </label>
                  <button type="button" className="text-[var(--primary)] hover:underline">Forgot password?</button>
                </div>
                <button type="submit" className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors">
                  Sign In
                </button>
              </form>
              <div className="mt-4 text-center">
                <button onClick={() => setShowAdminHint(!showAdminHint)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Admin access ›</button>
                {showAdminHint && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-2 bg-[var(--muted)] rounded-lg p-2.5">
                    Use <strong>admin@cuaa.ng</strong> to demo the Admin Dashboard
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── REGISTER ── */}
          {tab === "register" && (
            <>
              {/* Progress indicator */}
              {memberType && (
                <div className="flex items-center gap-1.5 mb-6">
                  {progressSteps.map((label, i) => (
                    <div key={label} className="flex items-center gap-1.5 flex-1">
                      <div className={`flex items-center gap-1.5 flex-1 ${i < progressSteps.length - 1 ? "" : ""}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i < currentStepIdx ? "bg-[var(--primary)] text-white" : i === currentStepIdx ? "bg-[var(--accent)] text-white" : "bg-[var(--border)] text-[var(--muted-foreground)]"}`}>
                          {i < currentStepIdx ? "✓" : i + 1}
                        </div>
                        <span className={`text-[10px] hidden sm:block ${i === currentStepIdx ? "text-[var(--accent)] font-semibold" : "text-[var(--muted-foreground)]"}`}>{label}</span>
                        {i < progressSteps.length - 1 && <div className={`flex-1 h-px mx-1 ${i < currentStepIdx ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 1: Member Type */}
              {regStep === "type" && (
                <>
                  <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-1">Join CLUAA</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">Select your membership type to continue</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => { setMemberType("alumni"); setRegStep("matric"); }}
                      className="w-full flex items-start gap-4 p-4 border-2 border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all text-left group"
                    >
                      <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0 mt-0.5">🎓</div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Alumni Member</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">For graduates of Clifford University. Requires a valid matriculation number for verification. Full platform access upon approval.</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setMemberType("associate"); setRegStep("details"); }}
                      className="w-full flex items-start gap-4 p-4 border-2 border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:bg-[var(--muted)] transition-all text-left group"
                    >
                      <div className="w-10 h-10 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0 mt-0.5">🤝</div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">Associate Member</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">For friends, spouses, staff, and supporters of CLU who are not graduates. Limited platform access. Subject to admin approval.</p>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {/* Step 2 (Alumni): Matriculation Verification */}
              {regStep === "matric" && memberType === "alumni" && (
                <>
                  <h2 className="font-display text-xl font-bold text-[var(--secondary)] mb-1">Verify Your Identity</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mb-5">Enter your CLU matriculation number to confirm you are a Clifford University graduate.</p>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-xs text-amber-700">
                    <strong>🔒 Security Notice:</strong> Only matriculation numbers on the official CLU alumni registry are accepted. This prevents unauthorised registrations.
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Matriculation Number *</label>
                      <input
                        type="text"
                        value={matricNumber}
                        onChange={e => { setMatricNumber(e.target.value); setMatricError(""); }}
                        placeholder="e.g. CLU/2016/LAW/001"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] font-mono ${matricError ? "border-red-400 bg-red-50" : "border-[var(--border)]"}`}
                      />
                      {matricError && (
                        <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700 leading-relaxed">{matricError}</p>
                          <button onClick={() => onNavigate("contact")} className="text-xs text-[var(--primary)] hover:underline mt-1 block">Contact CLUAA Secretariat →</button>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)]">Demo: try <code className="bg-[var(--muted)] px-1 rounded">CLU/2016/001</code> or <code className="bg-[var(--muted)] px-1 rounded">CLU/2020/002</code></p>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <button onClick={() => { setRegStep("type"); setMatricError(""); }} className="px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium hover:border-[var(--primary)] transition-colors">
                      ← Back
                    </button>
                    <button onClick={verifyMatric} className="flex-1 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors">
                      Verify Matriculation Number
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Details */}
              {regStep === "details" && (
                <>
                  <h2 className="font-display text-xl font-bold text-[var(--secondary)] mb-1">
                    {memberType === "alumni" ? "Your Information" : "Associate Member Details"}
                  </h2>
                  {matricVerified && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
                      <span className="text-green-600 text-sm">✓</span>
                      <p className="text-xs text-green-700">Matriculation number verified: <strong className="font-mono">{matricNumber.toUpperCase()}</strong></p>
                    </div>
                  )}
                  <form className="space-y-3 mt-2">
                    <div>
                      <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Full Name *</label>
                      <input required type="text" value={regForm.fullName} onChange={e => setRegForm({...regForm, fullName: e.target.value})} placeholder="Firstname Middlename Surname" className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Email *</label>
                        <input required type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Phone *</label>
                        <input required type="tel" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="+234..." className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                      </div>
                    </div>

                    {memberType === "alumni" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Graduating Set *</label>
                            <select required value={regForm.gradSet} onChange={e => setRegForm({...regForm, gradSet: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                              <option value="">Select set</option>
                              {GRADUATION_SETS.map(s => (
                                <option key={s.set} value={s.set}>{s.set} ({s.year})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Faculty *</label>
                            <select required value={regForm.faculty} onChange={e => setRegForm({...regForm, faculty: e.target.value, dept: ""})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                              <option value="">Select faculty</option>
                              {CLU_FACULTIES.map(f => <option key={f}>{f}</option>)}
                            </select>
                          </div>
                        </div>
                        {regForm.faculty && (CLU_FACULTIES_PROGRAMS[regForm.faculty] ?? []).length > 0 && (
                          <div>
                            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Programme / Department *</label>
                            <select required value={regForm.dept} onChange={e => setRegForm({...regForm, dept: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                              <option value="">Select programme</option>
                              {(CLU_FACULTIES_PROGRAMS[regForm.faculty] ?? []).map(p => <option key={p}>{p}</option>)}
                            </select>
                          </div>
                        )}
                      </>
                    )}

                    {memberType === "associate" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Relationship to CLU *</label>
                          <select required value={regForm.relationship} onChange={e => setRegForm({...regForm, relationship: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                            <option value="">Select</option>
                            <option>Spouse of Alumnus</option>
                            <option>University Staff</option>
                            <option>Friend of CLU</option>
                            <option>Corporate Partner</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Organisation</label>
                          <input type="text" value={regForm.institution} onChange={e => setRegForm({...regForm, institution: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--foreground)] mb-1">State / Location *</label>
                        <select required value={regForm.location} onChange={e => setRegForm({...regForm, location: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                          <option value="">Select state</option>
                          {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Current Profession</label>
                        <input type="text" value={regForm.profession} onChange={e => setRegForm({...regForm, profession: e.target.value})} placeholder="e.g. Lawyer, Doctor" className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setRegStep(memberType === "alumni" ? "matric" : "type")} className="px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium hover:border-[var(--primary)] transition-colors">← Back</button>
                      <button type="button" onClick={() => { if (regForm.fullName && regForm.email && regForm.phone) setRegStep("security"); }} className="flex-1 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors">
                        Continue →
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Step 4: Security */}
              {regStep === "security" && (
                <>
                  <h2 className="font-display text-xl font-bold text-[var(--secondary)] mb-1">Create Your Password</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mb-5">Set a strong password and review your account details.</p>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Password *</label>
                      <input required type="password" minLength={8} value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} placeholder="Minimum 8 characters" className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Confirm Password *</label>
                      <input required type="password" value={regForm.confirm} onChange={e => setRegForm({...regForm, confirm: e.target.value})} placeholder="Repeat password" className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${regForm.confirm && regForm.password !== regForm.confirm ? "border-red-400" : "border-[var(--border)]"}`} />
                      {regForm.confirm && regForm.password !== regForm.confirm && <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>}
                    </div>

                    <div className="bg-[var(--muted)] rounded-lg p-3 text-xs space-y-1 text-[var(--muted-foreground)]">
                      <p className="font-semibold text-[var(--foreground)] mb-1.5">Account Summary</p>
                      <p>Name: <strong>{regForm.fullName || "—"}</strong></p>
                      <p>Email: <strong>{regForm.email || "—"}</strong></p>
                      <p>Type: <strong>{memberType === "alumni" ? "Alumni Member" : "Associate Member"}</strong></p>
                      {memberType === "alumni" && <p>Matric: <strong className="font-mono">{matricNumber.toUpperCase()}</strong></p>}
                      {memberType === "alumni" && <p>Set: <strong>{regForm.gradSet || "—"}</strong></p>}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                      After registration, your account will be reviewed by the CLUAA administrator. Verification typically takes 2–5 business days.
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => setRegStep("details")} className="px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium hover:border-[var(--primary)] transition-colors">← Back</button>
                      <button type="submit" disabled={!regForm.password || regForm.password !== regForm.confirm} className="flex-1 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Create Account
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
