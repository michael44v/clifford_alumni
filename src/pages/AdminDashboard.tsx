import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface AdminDashboardProps { onNavigate: (page: Page) => void; onLogout: () => void; }

type AdminTab = "overview" | "members" | "welfare" | "payments" | "content" | "settings";

const pendingMembers = [
  { name: "Chukwudi Nnaji", email: "chukwudi@email.com", gradYear: "2015", faculty: "Engineering", submitted: "Nov 28, 2024" },
  { name: "Blessing Okonkwo", email: "blessing@email.com", gradYear: "2012", faculty: "Law", submitted: "Nov 27, 2024" },
  { name: "Tolu Adeyemi", email: "tolu@email.com", gradYear: "2018", faculty: "Medicine", submitted: "Nov 26, 2024" },
  { name: "Nnamdi Okeke", email: "nnamdi@email.com", gradYear: "2009", faculty: "Business Admin", submitted: "Nov 25, 2024" },
  { name: "Chiamaka Uche", email: "chiamaka@email.com", gradYear: "2020", faculty: "Science", submitted: "Nov 24, 2024" },
];

const welfareCases = [
  { id: "WLF-2024-041", member: "Emeka Obi (Set 2007)", category: "Medical Emergency", status: "Urgent", officer: "Miss Adaeze Okafor", date: "Nov 29, 2024" },
  { id: "WLF-2024-040", member: "Sarah Eze (Set 2010)", category: "Bereavement Support", status: "Active", officer: "Miss Adaeze Okafor", date: "Nov 27, 2024" },
  { id: "WLF-2024-039", member: "Kelechi Nwosu (Set 2013)", category: "Financial Distress", status: "Pending", officer: "Unassigned", date: "Nov 25, 2024" },
  { id: "WLF-2024-038", member: "Amara Igwe (Set 2008)", category: "Emergency Assistance", status: "Resolved", officer: "Miss Adaeze Okafor", date: "Nov 20, 2024" },
];

const recentPayments = [
  { name: "Adaeze Nwachukwu", type: "Annual Dues 2025", amount: 5000, date: "Nov 28" },
  { name: "Emeka Okafor", type: "Welfare Donation", amount: 20000, date: "Nov 27" },
  { name: "Ngozi Eze", type: "AGM Registration", amount: 2000, date: "Nov 27" },
  { name: "Chidi Obiora", type: "Annual Dues 2025", amount: 5000, date: "Nov 26" },
  { name: "Kayode Fashola", type: "Scholarship Fund", amount: 50000, date: "Nov 25" },
];

export default function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [memberStatuses, setMemberStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/admin/stats")
      .then(res => setAdminStats(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Alumni", value: adminStats?.totalMembers || "0", change: "All registered", color: "text-[var(--secondary)]" },
    { label: "Verified Members", value: adminStats?.verifiedMembers || "0", change: "Verified status", color: "text-green-600" },
    { label: "Pending Verification", value: adminStats?.pendingVerifications || "0", change: "Awaiting review", color: "text-amber-600" },
    { label: "Welfare Cases", value: adminStats?.activeWelfareCases || "0", change: "Active requests", color: "text-red-600" },
    { label: "Total Dues (₦)", value: `₦${Number(adminStats?.financials?.totalDuesCollected || 0).toLocaleString()}`, change: "Collected", color: "text-[var(--primary)]" },
    { label: "Total Donations (₦)", value: `₦${Number(adminStats?.financials?.totalDonationsCollected || 0).toLocaleString()}`, change: "Collected", color: "text-blue-600" },
  ];

  const approveMember = (i: number) => setMemberStatuses(s => ({...s, [i]: "approved"}));
  const rejectMember = (i: number) => setMemberStatuses(s => ({...s, [i]: "rejected"}));

  return (
    <div className="bg-[var(--muted)] min-h-screen">
      {/* Admin header */}
      <div className="bg-[var(--secondary)] border-b border-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest">CUAA</p>
            <h1 className="font-display text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate("home")} className="px-3 py-1.5 text-xs text-white/70 hover:text-white border border-white/20 rounded">View Site</button>
            <button onClick={onLogout} className="px-3 py-1.5 text-xs text-white/70 hover:text-white border border-white/20 rounded">Sign Out</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Admin nav */}
        <div className="flex overflow-x-auto gap-1 bg-white border border-[var(--border)] p-1 rounded mb-6">
          {(["overview", "members", "welfare", "payments", "content", "settings"] as AdminTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-2 rounded text-xs font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? "bg-[var(--secondary)] text-white" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {stats.map(s => (
                <div key={s.label} className="bg-white border border-[var(--border)] rounded p-4 text-center">
                  <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-tight">{s.label}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-1 opacity-70">{s.change}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending verifications */}
              <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--foreground)]">Pending Verifications</h3>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">{pendingMembers.length}</span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {pendingMembers.slice(0, 3).map((m, i) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">{m.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Set {m.gradYear} · {m.faculty}</p>
                      </div>
                      {memberStatuses[i] ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${memberStatuses[i] === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {memberStatuses[i] === "approved" ? "Approved" : "Rejected"}
                        </span>
                      ) : (
                        <div className="flex gap-1.5">
                          <button onClick={() => approveMember(i)} className="px-2.5 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors">✓</button>
                          <button onClick={() => rejectMember(i)} className="px-2.5 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-colors">✕</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-[var(--border)]">
                  <button onClick={() => setActiveTab("members")} className="text-xs text-[var(--primary)] hover:underline">View all {pendingMembers.length} pending →</button>
                </div>
              </div>

              {/* Recent payments */}
              <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--foreground)]">Recent Payments</h3>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {recentPayments.map((p, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{p.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{p.type} · {p.date}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">₦{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-[var(--border)]">
                  <button onClick={() => setActiveTab("payments")} className="text-xs text-[var(--primary)] hover:underline">View all payments →</button>
                </div>
              </div>

              {/* Welfare summary */}
              <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--foreground)]">Active Welfare Cases</h3>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {welfareCases.filter(w => w.status !== "Resolved").map((w) => (
                    <div key={w.id} className="px-5 py-3">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-medium text-[var(--foreground)]">{w.member}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${w.status === "Urgent" ? "bg-red-100 text-red-700" : w.status === "Active" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{w.status}</span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">{w.category} · {w.id}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-[var(--border)]">
                  <button onClick={() => setActiveTab("welfare")} className="text-xs text-[var(--primary)] hover:underline">Manage welfare cases →</button>
                </div>
              </div>

              {/* Quick admin actions */}
              <div className="bg-white border border-[var(--border)] rounded p-5">
                <h3 className="font-semibold text-[var(--foreground)] mb-4">Admin Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "📣", label: "Post Announcement" },
                    { icon: "📅", label: "Create Event" },
                    { icon: "📸", label: "Add to Gallery" },
                    { icon: "💼", label: "Approve Job Post" },
                    { icon: "📊", label: "Export Reports" },
                    { icon: "✉️", label: "Send Notification" },
                  ].map(({ icon, label }) => (
                    <button key={label} className="flex items-center gap-2 px-3 py-2.5 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Members tab */}
        {activeTab === "members" && (
          <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-semibold">Member Management — Pending Verification</h3>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">{pendingMembers.length} pending</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                    {["Name", "Email", "Grad Year", "Faculty", "Submitted", "Action"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingMembers.map((m, i) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-5 py-3 text-sm font-medium text-[var(--foreground)]">{m.name}</td>
                      <td className="px-5 py-3 text-sm text-[var(--muted-foreground)]">{m.email}</td>
                      <td className="px-5 py-3 text-sm text-[var(--muted-foreground)]">{m.gradYear}</td>
                      <td className="px-5 py-3 text-sm text-[var(--muted-foreground)]">{m.faculty}</td>
                      <td className="px-5 py-3 text-sm text-[var(--muted-foreground)] whitespace-nowrap">{m.submitted}</td>
                      <td className="px-5 py-3">
                        {memberStatuses[i] ? (
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${memberStatuses[i] === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {memberStatuses[i] === "approved" ? "✓ Approved" : "✕ Rejected"}
                          </span>
                        ) : (
                          <div className="flex gap-1.5">
                            <button onClick={() => approveMember(i)} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors">Approve</button>
                            <button onClick={() => rejectMember(i)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-colors">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Welfare tab */}
        {activeTab === "welfare" && (
          <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h3 className="font-semibold">Welfare Case Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                    {["Case ID", "Member", "Category", "Status", "Officer", "Date", "Action"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {welfareCases.map((w) => (
                    <tr key={w.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3 text-xs font-mono text-[var(--muted-foreground)]">{w.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">{w.member}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{w.category}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${w.status === "Urgent" ? "bg-red-100 text-red-700" : w.status === "Active" ? "bg-blue-100 text-blue-700" : w.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{w.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{w.officer}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] whitespace-nowrap">{w.date}</td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-[var(--primary)] hover:underline">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments tab */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Collected (2024)", value: "₦6.35M", bg: "bg-green-50 border-green-200" },
                { label: "Annual Dues Paid", value: "2,841", bg: "bg-blue-50 border-blue-200" },
                { label: "Pending Dues", value: "301", bg: "bg-amber-50 border-amber-200" },
                { label: "Total Donations", value: "₦2.1M", bg: "bg-purple-50 border-purple-200" },
              ].map(({ label, value, bg }) => (
                <div key={label} className={`border rounded p-4 text-center ${bg}`}>
                  <p className="font-display text-xl font-bold text-[var(--secondary)]">{value}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-semibold">Recent Transactions</h3>
                <button className="text-xs text-[var(--primary)] hover:underline">Export CSV</button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {recentPayments.map((p, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{p.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{p.type} · {p.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">₦{p.amount.toLocaleString()}</p>
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content tab */}
        {activeTab === "content" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "📣", title: "Announcements", desc: "Create, edit, schedule and publish news and announcements", count: "8 published" },
              { icon: "📅", title: "Events Manager", desc: "Manage events, registrations and attendee lists", count: "3 upcoming" },
              { icon: "📸", title: "Gallery Manager", desc: "Upload and organize photo albums", count: "8 albums" },
              { icon: "💼", title: "Job Approvals", desc: "Review and approve job and opportunity postings", count: "4 pending" },
              { icon: "🏪", title: "Business Listings", desc: "Approve and manage alumni business directory entries", count: "6 active" },
              { icon: "✉️", title: "Mass Notifications", desc: "Send announcements to all or selected member groups", count: "—" },
            ].map(({ icon, title, desc, count }) => (
              <div key={title} className="bg-white border border-[var(--border)] rounded p-5 hover:border-[var(--primary)] transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-medium">{count}</span>
                </div>
                <p className="font-semibold text-sm text-[var(--foreground)] mb-1">{title}</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
                <button className="mt-3 px-3 py-1.5 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                  Manage
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Administrative Roles</h3>
              <div className="space-y-2">
                {[
                  { role: "Super Administrator", user: "System Admin", access: "Full system access" },
                  { role: "EXCO Administrator", user: "Prof. Ifeanyi Madubueze", access: "Members, events, announcements" },
                  { role: "Finance Administrator", user: "Alhaja Fatima Bello", access: "Payments, dues, donations" },
                  { role: "Welfare Administrator", user: "Miss Adaeze Okafor", access: "Welfare cases only" },
                  { role: "Content Administrator", user: "Engr. Tunde Adeyemi", access: "News, gallery, jobs" },
                ].map(({ role, user, access }) => (
                  <div key={role} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{role}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{user} · {access}</p>
                    </div>
                    <button className="text-xs text-[var(--primary)] hover:underline">Edit</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-3">Platform Settings</h3>
              <div className="space-y-3">
                {[
                  "Enable member registration",
                  "Require email verification on registration",
                  "Allow public alumni directory browsing",
                  "Enable welfare request submissions",
                  "Show EXCO profiles publicly",
                ].map((setting) => (
                  <label key={setting} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-[var(--foreground)]">{setting}</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--primary)]" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
