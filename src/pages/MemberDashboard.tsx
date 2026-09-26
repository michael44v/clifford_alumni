import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface MemberDashboardProps { onNavigate: (page: Page) => void; }

export default function MemberDashboard({ onNavigate }: MemberDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "payments" | "notifications" | "welfare">("overview");
  const [me, setMe] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    profession: "",
    company: "",
    bio: "",
  });

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/members/me")
      .then(res => {
        setMe(res);
        setProfileForm({
          firstName: res.firstName || "",
          lastName: res.lastName || "",
          phone: res.phone || "",
          profession: res.profession || "",
          company: res.company || "",
          bio: res.bio || "",
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiFetch("/api/members/me", {
        method: "PUT",
        body: JSON.stringify(profileForm),
      });
      setMe(updated);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
  };

  const memberName = me ? `${me.firstName || ''} ${me.lastName || ''}`.trim() : "Member";
  const setName = me?.graduatingSet?.setName || "Alumni";
  const facName = me?.faculty?.name || "";
  const profilePhoto = me?.profilePhoto?.url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format";
  const status = me?.verificationStatus || "VERIFIED";

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <div className="bg-[var(--secondary)] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--accent)] flex-shrink-0">
            <img src={profilePhoto} alt={memberName} className="w-full h-full object-cover" />
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
        {/* Profile completion */}
        <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 mb-1">Your profile is {memberData.profileCompletion}% complete</p>
            <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${memberData.profileCompletion}%` }} />
            </div>
          </div>
          <button onClick={() => setActiveTab("profile")} className="px-4 py-2 bg-amber-500 text-white rounded text-xs font-semibold hover:bg-amber-600 transition-colors whitespace-nowrap">
            Complete Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 bg-[var(--muted)] p-1 rounded mb-6 hide-scrollbar">
          {(["overview", "profile", "payments", "notifications", "welfare"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-2 rounded text-xs font-medium capitalize transition-colors whitespace-nowrap ${activeTab === tab ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {tab === "notifications" && unreadCount > 0 ? `Notifications (${unreadCount})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <p className="font-display text-2xl font-bold text-[var(--primary)]">₦{pendingDues.toLocaleString()}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Outstanding Dues</p>
              {pendingDues > 0 && <button onClick={() => setActiveTab("payments")} className="mt-3 px-3 py-1.5 bg-[var(--primary)] text-white rounded text-xs font-semibold w-full">Pay Now</button>}
            </div>
            <div className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <p className="font-display text-2xl font-bold text-green-600">{payments.filter(p => p.status === "Paid").length}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Completed Payments</p>
              <button onClick={() => setActiveTab("payments")} className="mt-3 text-xs text-[var(--primary)] hover:underline">View history</button>
            </div>
            <div className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <p className="font-display text-2xl font-bold text-[var(--secondary)]">{upcomingEvents.length}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Upcoming Events</p>
              <button onClick={() => onNavigate("events")} className="mt-3 text-xs text-[var(--primary)] hover:underline">View events</button>
            </div>
            <div className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <p className="font-display text-2xl font-bold text-amber-600">{unreadCount}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Unread Notifications</p>
              <button onClick={() => setActiveTab("notifications")} className="mt-3 text-xs text-[var(--primary)] hover:underline">View all</button>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick actions */}
            <div className="bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "👤", label: "Edit Profile", action: () => setActiveTab("profile") },
                  { icon: "🔍", label: "Find Alumni", action: () => onNavigate("directory") },
                  { icon: "💳", label: "Pay Dues", action: () => onNavigate("finance") },
                  { icon: "📅", label: "Events", action: () => onNavigate("events") },
                  { icon: "💼", label: "Career Hub", action: () => onNavigate("career") },
                  { icon: "❤️", label: "Welfare", action: () => setActiveTab("welfare") },
                  { icon: "💰", label: "Donate", action: () => onNavigate("donate") },
                  { icon: "📣", label: "News", action: () => onNavigate("news") },
                ].map(({ icon, label, action }) => (
                  <button key={label} onClick={action} className="flex items-center gap-2 px-3 py-2.5 border border-[var(--border)] rounded text-sm font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming events */}
            <div className="bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Your Upcoming Events</h3>
              <div className="flex flex-col gap-3">
                {upcomingEvents.map(e => (
                  <div key={e.title} className="flex gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-[var(--secondary)] rounded flex items-center justify-center text-[var(--accent)] text-xs font-bold">📅</div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{e.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{e.date} · {e.venue}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate("events")} className="mt-4 w-full py-2 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] transition-colors">Browse More Events</button>
            </div>
          </div>
        )}

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[var(--primary)] mb-3">
                <img src={memberData.img} alt={memberData.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">{memberData.name}</h3>
              <p className="text-xs text-[var(--primary)] font-medium mt-0.5">Set {memberData.set} · {memberData.faculty}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{memberData.profession}</p>
              <span className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded">{memberData.status}</span>
              <button className="mt-3 w-full py-2 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] transition-colors">Change Photo</button>
            </div>
            <div className="lg:col-span-2 bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Edit Profile Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", value: memberData.name, type: "text" },
                  { label: "Email Address", value: memberData.email, type: "email" },
                  { label: "Phone Number", value: memberData.phone, type: "tel" },
                  { label: "Graduation Year", value: memberData.set, type: "text" },
                  { label: "Faculty", value: memberData.faculty, type: "text" },
                  { label: "Department / Course", value: memberData.dept, type: "text" },
                  { label: "Profession", value: memberData.profession, type: "text" },
                  { label: "Location", value: memberData.location, type: "text" },
                ].map(({ label, value, type }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">{label}</label>
                    <input type={type} defaultValue={value} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Short Biography</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" defaultValue="Senior Counsel with 15+ years of practice in corporate and property law." />
              </div>
              <div className="mt-5 flex gap-2">
                <button className="px-6 py-2.5 bg-[var(--primary)] text-white rounded text-sm font-semibold hover:bg-[var(--accent)] transition-colors">Save Changes</button>
                <button className="px-6 py-2.5 border border-[var(--border)] rounded text-sm font-medium hover:border-[var(--primary)] transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Payments tab */}
        {activeTab === "payments" && (
          <div>
            <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[var(--foreground)]">{p.desc}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{p.id}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--muted-foreground)] hidden sm:table-cell">{p.date}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--foreground)]">₦{p.amount.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${p.status === "Paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        {p.status === "Pending" ? (
                          <button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded text-xs font-semibold hover:bg-[var(--accent)] transition-colors">Pay Now</button>
                        ) : p.receipt ? (
                          <button className="text-xs text-[var(--primary)] hover:underline">Receipt</button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications tab */}
        {activeTab === "notifications" && (
          <div className="flex flex-col gap-3">
            {notifs.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)} className={`bg-white border rounded p-4 cursor-pointer transition-colors ${n.read ? "border-[var(--border)]" : "border-[var(--primary)] bg-amber-50/30"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">
                    {n.type === "payment" ? "💳" : n.type === "event" ? "📅" : n.type === "welfare" ? "❤️" : "📣"}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${n.read ? "text-[var(--foreground)]" : "text-[var(--secondary)]"}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-[var(--primary)] rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1.5">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Welfare tab */}
        {activeTab === "welfare" && (
          <div className="max-w-lg">
            <div className="bg-white border border-[var(--border)] rounded p-5 mb-4">
              <h3 className="font-semibold text-[var(--foreground)] mb-3">Your Welfare Cases</h3>
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <span className="text-3xl block mb-2">🕊️</span>
                <p className="text-sm">No active welfare cases</p>
                <p className="text-xs mt-1">Submit a confidential request if you need support</p>
              </div>
            </div>
            <button onClick={() => onNavigate("welfare")} className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors">
              Submit Welfare Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
