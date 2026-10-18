import { useState, useEffect } from "react";
import { apiFetch, uploadToCloudinary } from "../lib/api";
import { showToast } from "../components/Toast";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface MemberDashboardProps { onNavigate: (page: Page) => void; }

export default function MemberDashboard({ onNavigate }: MemberDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "payments" | "welfare">("overview");
  const [me, setMe] = useState<any | null>(null);
  const [dues, setDues] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [myWelfare, setMyWelfare] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isCompletionDismissed, setIsCompletionDismissed] = useState(false);
  const [setsList, setSetsList] = useState<any[]>([]);
  const [facultiesList, setFacultiesList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
    company: "",
    bio: "",
    profilePhotoUrl: "",
    graduatingSetId: "",
    facultyId: "",
    department: "",
  });

  const loadMemberData = async () => {
    setLoading(true);
    try {
      const [meRes, duesRes, histRes, welfareRes, setsRes, facsRes, deptsRes] = await Promise.all([
        apiFetch("/api/members/me").catch(() => null),
        apiFetch("/api/finance/dues").catch(() => []),
        apiFetch("/api/finance/history").catch(() => []),
        apiFetch("/api/welfare/my-requests").catch(() => []),
        apiFetch("/api/admin/sets").catch(() => []),
        apiFetch("/api/admin/faculties").catch(() => []),
        apiFetch("/api/admin/departments").catch(() => []),
      ]);

      if (Array.isArray(setsRes)) setSetsList(setsRes);
      if (Array.isArray(facsRes)) setFacultiesList(facsRes);
      if (Array.isArray(deptsRes)) setDepartmentsList(deptsRes);

      if (meRes) {
        setMe(meRes);
        setProfileForm({
          firstName: meRes.firstName || "",
          lastName: meRes.lastName || "",
          email: meRes.email || "",
          phone: meRes.phone || "",
          profession: meRes.profession || "",
          company: meRes.company || "",
          bio: meRes.bio || "",
          profilePhotoUrl: meRes.profilePhotoUrl || meRes.profilePhoto?.secureUrl || "",
          graduatingSetId: meRes.graduatingSetId || "",
          facultyId: meRes.facultyId || "",
          department: meRes.department || "",
        });
      }
      setDues(Array.isArray(duesRes) ? duesRes : duesRes.data || []);
      setHistory(Array.isArray(histRes) ? histRes : histRes.data || []);
      setMyWelfare(Array.isArray(welfareRes) ? welfareRes : []);
    } catch (err) {
      console.error("Failed to load member dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await apiFetch("/api/members/me", {
        method: "PUT",
        body: JSON.stringify(profileForm),
      });
      setMe(updated);
      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const DEFAULT_AVATAR = "https://static.vecteezy.com/system/resources/previews/055/582/028/non_2x/gray-circle-user-icon-profile-avatar-simple-symbol-vector.jpg";
  const memberName = me ? `${me.firstName || ''} ${me.lastName || ''}`.trim() : "Member";
  const setName = me?.graduatingSet?.setName || "Alumni";
  const facName = me?.faculty?.name || "";
  const profilePhoto = me?.profilePhotoUrl || me?.profilePhoto?.secureUrl || DEFAULT_AVATAR;
  const status = me?.verificationStatus || "VERIFIED";

  // Calculate profile completion percentage
  const fields = [
    me?.firstName,
    me?.lastName,
    me?.email,
    me?.phone,
    me?.profession,
    me?.company,
    me?.bio,
    me?.profilePhotoUrl,
    me?.graduatingSetId,
    me?.facultyId,
    me?.department,
  ];
  const filledFields = fields.filter(f => f && String(f).trim() !== '').length;
  const profileCompletion = Math.round((filledFields / fields.length) * 100);

  const pendingDuesList = dues.filter(d => d.status !== "PAID");
  const pendingDuesTotal = pendingDuesList.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <div className="bg-[var(--secondary)] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--accent)] flex-shrink-0 bg-slate-200">
            <img
              src={profilePhoto}
              alt={memberName}
              className="w-full h-full object-cover"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
          </div>
          <div className="flex-1">
            <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase">Member Dashboard</p>
            <h1 className="font-display text-2xl font-bold text-white">Welcome, {me?.firstName || "Member"}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs text-white/70">{setName} {facName ? `· ${facName}` : ''}</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-500 text-white rounded">{status}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate("finance")} className="px-4 py-2 bg-[var(--accent)] text-white rounded text-xs font-semibold hover:bg-[var(--primary)] transition-colors">
              Manage Dues & Finance
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Profile completion banner */}
        {!isCompletionDismissed && (
          <div className={`border rounded p-4 mb-6 flex items-center gap-4 relative ${profileCompletion === 100 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-sm font-semibold ${profileCompletion === 100 ? "text-green-800" : "text-amber-800"}`}>
                  {profileCompletion === 100 ? "🎉 Your profile is 100% complete! (Completed)" : `Your profile is ${profileCompletion}% complete`}
                </p>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${profileCompletion === 100 ? "bg-green-200" : "bg-amber-200"}`}>
                <div className={`h-full rounded-full transition-all duration-500 ${profileCompletion === 100 ? "bg-green-600" : "bg-amber-500"}`} style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
            {profileCompletion < 100 && (
              <button onClick={() => setActiveTab("profile")} className="px-4 py-2 bg-amber-500 text-white rounded text-xs font-semibold hover:bg-amber-600 transition-colors whitespace-nowrap">
                Complete Profile
              </button>
            )}
            <button
              onClick={() => setIsCompletionDismissed(true)}
              className="text-gray-400 hover:text-gray-600 font-bold text-sm p-1 ml-1"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 bg-[var(--muted)] p-1 rounded mb-6 hide-scrollbar">
          {(["overview", "profile", "payments", "welfare"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-2 rounded text-xs font-medium capitalize transition-colors whitespace-nowrap ${activeTab === tab ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <p className="font-display text-2xl font-bold text-[var(--primary)]">₦{pendingDuesTotal.toLocaleString()}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Outstanding Dues</p>
              <button onClick={() => onNavigate("finance")} className="mt-3 px-3 py-1.5 bg-[var(--primary)] text-white rounded text-xs font-semibold w-full">Manage Finance</button>
            </div>
            <div className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <p className="font-display text-2xl font-bold text-green-600">{history.length}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Completed Payments</p>
              <button onClick={() => setActiveTab("payments")} className="mt-3 text-xs text-[var(--primary)] hover:underline">View history</button>
            </div>
            <div className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <p className="font-display text-2xl font-bold text-[var(--secondary)]">{myWelfare.length}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">My Welfare Requests</p>
              <button onClick={() => setActiveTab("welfare")} className="mt-3 text-xs text-[var(--primary)] hover:underline">View cases</button>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="bg-white border border-[var(--border)] rounded p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "👤", label: "Edit Profile", action: () => setActiveTab("profile") },
                { icon: "🔍", label: "Find Alumni", action: () => onNavigate("directory") },
                { icon: "💳", label: "Pay Dues", action: () => onNavigate("finance") },
                { icon: "📅", label: "Events", action: () => onNavigate("events") },
                { icon: "💼", label: "Career Hub", action: () => onNavigate("career") },
                { icon: "❤️", label: "Welfare", action: () => onNavigate("welfare") },
                { icon: "💰", label: "Donate", action: () => onNavigate("donate") },
                { icon: "📣", label: "News", action: () => onNavigate("news") },
              ].map(({ icon, label, action }) => (
                <button key={label} onClick={action} className="flex items-center gap-2 p-3 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-[var(--primary)] mb-3 relative group bg-slate-200">
                <img
                  src={profileForm.profilePhotoUrl || profilePhoto}
                  alt={memberName}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">{memberName}</h3>
              <p className="text-xs text-[var(--primary)] font-medium mt-0.5">{setName} · {facName}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{me?.profession || 'Alumnus'}</p>
              <span className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded">{status}</span>
            </div>
            <div className="lg:col-span-2 bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Edit Profile Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="p-3 bg-[var(--muted)] border border-[var(--border)] rounded text-xs space-y-2">
                  <label className="block font-semibold text-[var(--foreground)]">Profile Picture</label>
                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await uploadToCloudinary(file, "alumni/avatars");
                            setProfileForm({ ...profileForm, profilePhotoUrl: res.url });
                          } catch (err) {
                            console.error("Upload failed", err);
                          }
                        }
                      }}
                      className="text-xs w-full bg-white border p-1 rounded"
                    />
                    <span className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">or URL</span>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={profileForm.profilePhotoUrl.startsWith("data:") ? "[File Selected]" : profileForm.profilePhotoUrl}
                      onChange={e => setProfileForm({ ...profileForm, profilePhotoUrl: e.target.value })}
                      className="text-xs p-1.5 border rounded w-full bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">First Name (Read-only)</label>
                    <input type="text" disabled value={profileForm.firstName} className="w-full px-3 py-2 border border-[var(--border)] bg-slate-100 rounded text-sm cursor-not-allowed text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Last Name (Read-only)</label>
                    <input type="text" disabled value={profileForm.lastName} className="w-full px-3 py-2 border border-[var(--border)] bg-slate-100 rounded text-sm cursor-not-allowed text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Email Address (Read-only)</label>
                    <input type="email" disabled value={profileForm.email} className="w-full px-3 py-2 border border-[var(--border)] bg-slate-100 rounded text-sm cursor-not-allowed text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Phone Number</label>
                    <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Graduating Set</label>
                    <select value={profileForm.graduatingSetId} onChange={e => setProfileForm({...profileForm, graduatingSetId: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                      <option value="">Select Graduating Set</option>
                      {setsList.map(s => (
                        <option key={s.id} value={s.id}>{s.setName} ({s.graduationYear})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Faculty</label>
                    <select value={profileForm.facultyId} onChange={e => setProfileForm({...profileForm, facultyId: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                      <option value="">Select Faculty</option>
                      {facultiesList.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Department / Programme</label>
                    <select value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                      <option value="">Select Department</option>
                      {departmentsList.map(d => (
                        <option key={d.id || d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Profession</label>
                    <input type="text" value={profileForm.profession} onChange={e => setProfileForm({...profileForm, profession: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Company / Organization</label>
                    <input type="text" value={profileForm.company} onChange={e => setProfileForm({...profileForm, company: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Short Biography</label>
                  <textarea rows={3} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-[var(--primary)] text-white rounded text-sm font-semibold hover:bg-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Payments tab */}
        {activeTab === "payments" && (
          <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-sm text-[var(--foreground)]">Payment Records</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Receipt Ref</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Date</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Amount</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {history.map(p => (
                    <tr key={p.id} className="text-xs hover:bg-slate-50">
                      <td className="p-3 font-mono text-[var(--muted-foreground)]">{p.receiptNumber || p.id}</td>
                      <td className="p-3 text-[var(--muted-foreground)]">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-green-600">₦{Number(p.amount).toLocaleString()}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">{p.status}</span></td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-xs text-[var(--muted-foreground)]">No payment history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Welfare tab */}
        {activeTab === "welfare" && (
          <div className="bg-white border border-[var(--border)] rounded p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[var(--foreground)]">My Welfare Requests</h3>
              <button onClick={() => onNavigate("welfare")} className="px-3 py-1.5 bg-[var(--primary)] text-white rounded text-xs font-semibold">+ New Request</button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {myWelfare.map(w => (
                <div key={w.id} className="py-3 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--secondary)]">{w.category}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{w.status}</span>
                  </div>
                  <p className="text-[var(--muted-foreground)]">{w.description}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] opacity-75">{new Date(w.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {myWelfare.length === 0 && (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  <span className="text-3xl block mb-2">🕊️</span>
                  <p className="text-sm">No welfare cases submitted.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
