import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface AdminDashboardProps { onNavigate: (page: Page) => void; onLogout: () => void; }

type AdminTab = "overview" | "roster" | "members" | "welfare" | "payments" | "content" | "settings";

export default function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [welfareCases, setWelfareCases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [leadership, setLeadership] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search/Filters
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilterStatus, setMemberFilterStatus] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");

  // Modals state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showLeadershipModal, setShowLeadershipModal] = useState(false);
  const [showAOTWModal, setShowAOTWModal] = useState<any | null>(null);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState<any | null>(null);

  // Forms
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "", time: "", venue: "", category: "General", organizer: "CUAA" });
  const [newsForm, setNewsForm] = useState({ title: "", content: "", category: "OFFICIAL_ANNOUNCEMENT" });
  const [leadershipForm, setLeadershipForm] = useState({ name: "", position: "", biography: "", termStart: new Date().getFullYear() });
  const [aotwBio, setAotwBio] = useState("");
  const [rosterForm, setRosterForm] = useState({ matricNumber: "", firstName: "", lastName: "", facultyId: "", graduatingSetId: "", department: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, membersRes, rosterRes, welfareRes, paymentsRes, facultiesRes, setsRes, eventsRes, newsRes, leadershipRes] = await Promise.all([
        apiFetch("/api/admin/stats").catch(() => null),
        apiFetch(`/api/admin/members?search=${encodeURIComponent(memberSearch)}&status=${memberFilterStatus}`).catch(() => []),
        apiFetch(`/api/admin/official-directory?search=${encodeURIComponent(rosterSearch)}`).catch(() => []),
        apiFetch("/api/welfare/admin/cases").catch(() => []),
        apiFetch("/api/admin/payments").catch(() => []),
        apiFetch("/api/admin/faculties").catch(() => []),
        apiFetch("/api/admin/sets").catch(() => []),
        apiFetch("/api/events?limit=50").catch(() => []),
        apiFetch("/api/news?limit=50").catch(() => []),
        apiFetch("/api/admin/leadership").catch(() => []),
      ]);

      if (statsRes) setAdminStats(statsRes);
      setMembers(Array.isArray(membersRes) ? membersRes : []);
      setRoster(Array.isArray(rosterRes) ? rosterRes : []);
      setWelfareCases(Array.isArray(welfareRes) ? welfareRes : []);
      setPayments(Array.isArray(paymentsRes) ? paymentsRes : []);
      setFaculties(Array.isArray(facultiesRes) ? facultiesRes : []);
      setSets(Array.isArray(setsRes) ? setsRes : []);
      setEvents(Array.isArray(eventsRes) ? eventsRes : eventsRes?.data || []);
      setNews(Array.isArray(newsRes) ? newsRes : newsRes?.data || []);
      setLeadership(Array.isArray(leadershipRes) ? leadershipRes : []);
    } catch (err) {
      console.error("Admin fetchData error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [memberSearch, memberFilterStatus, rosterSearch]);

  const updateMemberStatus = async (id: string, verificationStatus: string) => {
    try {
      await apiFetch(`/api/admin/members/${id}`, {
        method: "PUT",
        body: JSON.stringify({ verificationStatus }),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update member status");
    }
  };

  const handleSetAlumniOfWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAOTWModal) return;
    try {
      await apiFetch(`/api/admin/members/${showAOTWModal.id}/alumni-of-the-week`, {
        method: "PUT",
        body: JSON.stringify({
          isAlumniOfWeek: true,
          alumniOfWeekBio: aotwBio,
        }),
      });
      alert(`Set ${showAOTWModal.firstName} ${showAOTWModal.lastName} as Alumni of the Week!`);
      setShowAOTWModal(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to set Alumni of the Week");
    }
  };

  const handleUnsetAlumniOfWeek = async (m: any) => {
    try {
      await apiFetch(`/api/admin/members/${m.id}/alumni-of-the-week`, {
        method: "PUT",
        body: JSON.stringify({ isAlumniOfWeek: false }),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to unset Alumni of the Week");
    }
  };

  const updateWelfareStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/welfare/admin/cases/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (showWelfareModal && showWelfareModal.id === id) {
        setShowWelfareModal({ ...showWelfareModal, status });
      }
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update welfare case status");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description,
          eventDate: new Date(eventForm.date).toISOString(),
          time: eventForm.time || "10:00 AM",
          venue: eventForm.venue,
          category: eventForm.category,
          organizer: eventForm.organizer,
        }),
      });
      alert("Event created successfully!");
      setShowEventModal(false);
      setEventForm({ title: "", description: "", date: "", time: "", venue: "", category: "General", organizer: "CUAA" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to create event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await apiFetch(`/api/events/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete event");
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/news", {
        method: "POST",
        body: JSON.stringify(newsForm),
      });
      alert("Announcement posted successfully!");
      setShowNewsModal(false);
      setNewsForm({ title: "", content: "", category: "OFFICIAL_ANNOUNCEMENT" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to post announcement");
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await apiFetch(`/api/news/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete announcement");
    }
  };

  const handleCreateLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/admin/leadership", {
        method: "POST",
        body: JSON.stringify({
          ...leadershipForm,
          termStart: Number(leadershipForm.termStart),
        }),
      });
      alert("EXCO leadership profile added!");
      setShowLeadershipModal(false);
      setLeadershipForm({ name: "", position: "", biography: "", termStart: new Date().getFullYear() });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to create leadership profile");
    }
  };

  const handleDeleteLeadership = async (id: string) => {
    if (!confirm("Delete this leadership profile?")) return;
    try {
      await apiFetch(`/api/admin/leadership/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete leadership profile");
    }
  };

  const handleAddRosterEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/admin/official-directory", {
        method: "POST",
        body: JSON.stringify(rosterForm),
      });
      alert("Matriculation entry added to official directory roster!");
      setShowRosterModal(false);
      setRosterForm({ matricNumber: "", firstName: "", lastName: "", facultyId: "", graduatingSetId: "", department: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to add roster entry");
    }
  };

  const handleDeleteRosterEntry = async (id: string) => {
    if (!confirm("Remove this entry from the official directory roster?")) return;
    try {
      await apiFetch(`/api/admin/official-directory/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete entry");
    }
  };

  const stats = [
    { label: "Total Alumni", value: adminStats?.totalMembers || members.length || "0", color: "text-[var(--secondary)]" },
    { label: "Verified Members", value: adminStats?.verifiedMembers || members.filter(m => m.verificationStatus === "VERIFIED").length || "0", color: "text-green-600" },
    { label: "Official Directory Roster", value: roster.length || "0", color: "text-purple-600" },
    { label: "Pending Verification", value: adminStats?.pendingVerifications || members.filter(m => m.verificationStatus === "PENDING").length || "0", color: "text-amber-600" },
    { label: "Welfare Cases", value: adminStats?.activeWelfareCases || welfareCases.filter(w => w.status !== "RESOLVED").length || "0", color: "text-red-600" },
    { label: "Total Dues (₦)", value: `₦${Number(adminStats?.financials?.totalDuesCollected || 0).toLocaleString()}`, color: "text-[var(--primary)]" },
  ];

  const pendingMembers = members.filter(m => m.verificationStatus === "PENDING");

  return (
    <div className="bg-[var(--muted)] min-h-screen">
      {/* Header */}
      <div className="bg-[var(--secondary)] border-b border-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest">CUAA Realtime Admin</p>
            <h1 className="font-display text-xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="px-3 py-1.5 text-xs text-white/80 hover:text-white border border-white/20 rounded">🔄 Refresh</button>
            <button onClick={() => onNavigate("home")} className="px-3 py-1.5 text-xs text-white/80 hover:text-white border border-white/20 rounded">View Site</button>
            <button onClick={onLogout} className="px-3 py-1.5 text-xs text-white/80 hover:text-white border border-white/20 rounded">Sign Out</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-1 bg-white border border-[var(--border)] p-1 rounded mb-6">
          {(["overview", "roster", "members", "welfare", "payments", "content", "settings"] as AdminTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-2 rounded text-xs font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? "bg-[var(--secondary)] text-white" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {tab === "roster" ? "Official Roster" : tab} {tab === "members" && pendingMembers.length > 0 ? `(${pendingMembers.length})` : ""}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {stats.map(s => (
                <div key={s.label} className="bg-white border border-[var(--border)] rounded p-4 text-center">
                  <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-tight">{s.label}</p>
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
                {pendingMembers.length > 0 ? (
                  <div className="divide-y divide-[var(--border)]">
                    {pendingMembers.slice(0, 4).map((m) => (
                      <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{m.email} · {m.graduatingSet?.setName || "Alumni"}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => updateMemberStatus(m.id, "VERIFIED")} className="px-2.5 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700">Approve</button>
                          <button onClick={() => updateMemberStatus(m.id, "SUSPENDED")} className="px-2.5 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">No pending verifications.</div>
                )}
                <div className="px-5 py-3 border-t border-[var(--border)]">
                  <button onClick={() => setActiveTab("members")} className="text-xs text-[var(--primary)] hover:underline">View all members ({members.length}) →</button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-[var(--border)] rounded p-5">
                <h3 className="font-semibold text-[var(--foreground)] mb-4">Realtime Control Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setShowRosterModal(true)} className="p-3 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] text-left">
                    <span className="text-lg block mb-1">🎓</span>
                    <strong>Add Official Matric</strong>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Add to Official Alumni Directory</p>
                  </button>
                  <button onClick={() => setShowNewsModal(true)} className="p-3 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] text-left">
                    <span className="text-lg block mb-1">📣</span>
                    <strong>Post Announcement</strong>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Publish news to Home page</p>
                  </button>
                  <button onClick={() => setShowEventModal(true)} className="p-3 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] text-left">
                    <span className="text-lg block mb-1">📅</span>
                    <strong>Create Event</strong>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Schedule upcoming event</p>
                  </button>
                  <button onClick={() => setShowLeadershipModal(true)} className="p-3 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] text-left">
                    <span className="text-lg block mb-1">🏛️</span>
                    <strong>Add EXCO Leader</strong>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Update governing body</p>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Official Directory Roster Tab */}
        {activeTab === "roster" && (
          <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search roster by matric, name, department..."
                  value={rosterSearch}
                  onChange={e => setRosterSearch(e.target.value)}
                  className="px-3 py-1.5 border border-[var(--border)] rounded text-xs w-full sm:w-64"
                />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-xs text-[var(--muted-foreground)]">Total Entries: <strong>{roster.length}</strong></p>
                <button onClick={() => setShowRosterModal(true)} className="px-3 py-1.5 bg-[var(--primary)] text-white rounded text-xs font-semibold hover:bg-[var(--accent)] transition-colors">
                  + Add Matric Entry
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Matric Number</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Name</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Faculty / Department</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Graduating Set</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Is Registered?</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {roster.map(r => (
                    <tr key={r.id} className="text-xs hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-[var(--primary)]">{r.matricNumber}</td>
                      <td className="p-3 font-medium text-[var(--foreground)]">{r.firstName} {r.lastName}</td>
                      <td className="p-3 text-[var(--muted-foreground)]">{r.faculty?.name}<br />{r.department}</td>
                      <td className="p-3 text-[var(--muted-foreground)]">{r.graduatingSet?.setName} ({r.graduatingSet?.graduationYear})</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.isRegistered ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {r.isRegistered ? "Registered" : "Unclaimed"}
                        </span>
                      </td>
                      <td className="p-3">
                        <button onClick={() => handleDeleteRosterEntry(r.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-semibold hover:bg-red-200">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {roster.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-xs text-[var(--muted-foreground)]">No official directory roster entries found. Click "+ Add Matric Entry" above to add valid alumni matriculation numbers.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search alumni by name, email, matric..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="px-3 py-1.5 border border-[var(--border)] rounded text-xs w-full sm:w-64"
                />
                <select value={memberFilterStatus} onChange={e => setMemberFilterStatus(e.target.value)} className="px-3 py-1.5 border border-[var(--border)] rounded text-xs">
                  <option value="">All Statuses</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">Total: <strong>{members.length}</strong> members</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Name</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Email / Phone</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Matric / Type</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Status</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Alumni of Week</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {members.map(m => (
                    <tr key={m.id} className="text-xs hover:bg-slate-50">
                      <td className="p-3 font-medium text-[var(--foreground)]">{m.firstName} {m.lastName}</td>
                      <td className="p-3 text-[var(--muted-foreground)]">{m.email}<br />{m.phone || '—'}</td>
                      <td className="p-3 text-[var(--muted-foreground)]">{m.matricNumber || 'N/A'}<br /><span className="text-[10px] font-semibold">{m.memberType}</span></td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-700" : m.verificationStatus === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                          {m.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {m.isAlumniOfWeek ? (
                          <div className="flex items-center gap-1 text-amber-600 font-bold">
                            <span>🏆 Active</span>
                            <button onClick={() => handleUnsetAlumniOfWeek(m)} className="text-[10px] text-red-500 underline ml-1">Remove</button>
                          </div>
                        ) : (
                          <button onClick={() => { setShowAOTWModal(m); setAotwBio(m.alumniOfWeekBio || m.bio || ""); }} className="px-2 py-1 bg-amber-50 border border-amber-300 text-amber-800 rounded text-[10px] font-semibold hover:bg-amber-100">
                            Set as AOTW
                          </button>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {m.verificationStatus !== "VERIFIED" && (
                            <button onClick={() => updateMemberStatus(m.id, "VERIFIED")} className="px-2 py-1 bg-green-600 text-white rounded text-[10px] font-semibold hover:bg-green-700">Approve</button>
                          )}
                          {m.verificationStatus !== "SUSPENDED" && (
                            <button onClick={() => updateMemberStatus(m.id, "SUSPENDED")} className="px-2 py-1 bg-red-500 text-white rounded text-[10px] font-semibold hover:bg-red-600">Suspend</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-xs text-[var(--muted-foreground)]">No members found matching filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Welfare Tab */}
        {activeTab === "welfare" && (
          <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm">Welfare Requests</h3>
                <p className="text-[11px] text-[var(--muted-foreground)]">Click any row to view full request details and member information.</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">Total: {welfareCases.length}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Member</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Category</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Urgency</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Description</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Status</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {welfareCases.map(w => (
                    <tr key={w.id} className="text-xs hover:bg-amber-50 cursor-pointer" onClick={() => setShowWelfareModal(w)}>
                      <td className="p-3 font-medium text-[var(--primary)] underline">{w.member?.firstName} {w.member?.lastName}</td>
                      <td className="p-3">{w.category}</td>
                      <td className="p-3"><span className="font-semibold text-red-600">{w.urgency}</span></td>
                      <td className="p-3 max-w-xs truncate">{w.description}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{w.status}</span>
                      </td>
                      <td className="p-3" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowWelfareModal(w)} className="px-2 py-1 bg-[var(--primary)] text-white rounded text-[10px] font-semibold">View Details</button>
                      </td>
                    </tr>
                  ))}
                  {welfareCases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-xs text-[var(--muted-foreground)]">No welfare requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-sm">Realtime Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Member</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Item / Campaign</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Amount</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Status</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {payments.map(p => (
                    <tr key={p.id} className="text-xs hover:bg-slate-50">
                      <td className="p-3 font-medium">{p.member?.firstName} {p.member?.lastName}</td>
                      <td className="p-3">{p.duesItem?.title || p.donationCampaign?.title || "Dues/Donation"}</td>
                      <td className="p-3 font-bold text-green-600">₦{Number(p.amount).toLocaleString()}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">{p.status}</span></td>
                      <td className="p-3 text-[var(--muted-foreground)]">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs text-[var(--muted-foreground)]">No payment records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-8">
            {/* Quick Create buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => setShowNewsModal(true)} className="p-5 bg-white border border-[var(--border)] rounded-lg hover:border-[var(--primary)] text-left shadow-sm">
                <span className="text-3xl block mb-2">📣</span>
                <h4 className="font-bold text-sm text-[var(--foreground)]">+ Post Announcement</h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Publish to homepage and news feed</p>
              </button>
              <button onClick={() => setShowEventModal(true)} className="p-5 bg-white border border-[var(--border)] rounded-lg hover:border-[var(--primary)] text-left shadow-sm">
                <span className="text-3xl block mb-2">📅</span>
                <h4 className="font-bold text-sm text-[var(--foreground)]">+ Create Event</h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Add to event calendar and homepage</p>
              </button>
              <button onClick={() => setShowLeadershipModal(true)} className="p-5 bg-white border border-[var(--border)] rounded-lg hover:border-[var(--primary)] text-left shadow-sm">
                <span className="text-3xl block mb-2">🏛️</span>
                <h4 className="font-bold text-sm text-[var(--foreground)]">+ Add EXCO Leader</h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Add profile to governing body</p>
              </button>
            </div>

            {/* List of Events */}
            <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                <h3 className="font-bold text-sm text-[var(--foreground)]">All Events ({events.length})</h3>
                <button onClick={() => setShowEventModal(true)} className="px-3 py-1 bg-[var(--primary)] text-white rounded text-xs font-semibold">+ New Event</button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {events.map((e) => (
                  <div key={e.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-sm text-[var(--foreground)]">{e.title}</p>
                      <p className="text-[var(--muted-foreground)]">📅 {new Date(e.eventDate).toLocaleDateString()} at {e.time || '10:00 AM'} · 📍 {e.venue}</p>
                      <p className="text-[var(--muted-foreground)] mt-0.5 line-clamp-1">{e.description}</p>
                    </div>
                    <button onClick={() => handleDeleteEvent(e.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded font-semibold hover:bg-red-200">Delete</button>
                  </div>
                ))}
                {events.length === 0 && <p className="p-5 text-center text-xs text-[var(--muted-foreground)]">No events created yet.</p>}
              </div>
            </div>

            {/* List of News & Announcements */}
            <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                <h3 className="font-bold text-sm text-[var(--foreground)]">All News & Announcements ({news.length})</h3>
                <button onClick={() => setShowNewsModal(true)} className="px-3 py-1 bg-[var(--primary)] text-white rounded text-xs font-semibold">+ New Announcement</button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {news.map((n) => (
                  <div key={n.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="px-2 py-0.5 bg-[var(--muted)] text-[var(--primary)] text-[10px] font-bold rounded mb-1 inline-block">{n.category?.replace('_', ' ')}</span>
                      <p className="font-semibold text-sm text-[var(--foreground)]">{n.title}</p>
                      <p className="text-[var(--muted-foreground)] line-clamp-2 mt-0.5">{n.content}</p>
                    </div>
                    <button onClick={() => handleDeleteNews(n.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded font-semibold hover:bg-red-200">Delete</button>
                  </div>
                ))}
                {news.length === 0 && <p className="p-5 text-center text-xs text-[var(--muted-foreground)]">No news or announcements created yet.</p>}
              </div>
            </div>

            {/* List of EXCO Leadership */}
            <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                <h3 className="font-bold text-sm text-[var(--foreground)]">EXCO Leadership Governing Body ({leadership.length})</h3>
                <button onClick={() => setShowLeadershipModal(true)} className="px-3 py-1 bg-[var(--primary)] text-white rounded text-xs font-semibold">+ Add Leader</button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {leadership.map((l) => (
                  <div key={l.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-sm text-[var(--foreground)]">{l.name}</p>
                      <p className="text-[var(--primary)] font-medium">{l.position} · Term Start: {l.termStart}</p>
                      <p className="text-[var(--muted-foreground)] mt-0.5 line-clamp-1">{l.biography}</p>
                    </div>
                    <button onClick={() => handleDeleteLeadership(l.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded font-semibold hover:bg-red-200">Delete</button>
                  </div>
                ))}
                {leadership.length === 0 && <p className="p-5 text-center text-xs text-[var(--muted-foreground)]">No leadership profiles created yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white border border-[var(--border)] rounded p-6 max-w-xl">
            <h3 className="font-bold text-sm mb-3">Realtime Admin Controls</h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              All member approvals, announcements, events, official roster management, and Alumni of the Week settings operate live against the Neon PostgreSQL database.
            </p>
          </div>
        )}
      </div>

      {/* Welfare Detail Modal */}
      {showWelfareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowWelfareModal(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">CASE ID: {showWelfareModal.id}</span>
                <h3 className="font-bold text-lg text-[var(--secondary)]">Welfare Request Details</h3>
              </div>
              <button onClick={() => setShowWelfareModal(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <div className="bg-[var(--muted)] rounded-lg p-3 text-xs space-y-1">
              <p><strong className="text-[var(--foreground)]">Member:</strong> {showWelfareModal.member?.firstName} {showWelfareModal.member?.lastName}</p>
              <p><strong className="text-[var(--foreground)]">Email:</strong> {showWelfareModal.member?.email || 'N/A'}</p>
              <p><strong className="text-[var(--foreground)]">Phone:</strong> {showWelfareModal.member?.phone || 'N/A'}</p>
              <p><strong className="text-[var(--foreground)]">Category:</strong> {showWelfareModal.category}</p>
              <p><strong className="text-[var(--foreground)]">Urgency:</strong> <span className="font-bold text-red-600">{showWelfareModal.urgency}</span></p>
              <p><strong className="text-[var(--foreground)]">Submitted:</strong> {new Date(showWelfareModal.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]">Full Request Content / Description:</label>
              <div className="p-3 bg-slate-50 border border-[var(--border)] rounded text-xs leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
                {showWelfareModal.description}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Update Status:</span>
                <select value={showWelfareModal.status} onChange={e => updateWelfareStatus(showWelfareModal.id, e.target.value)} className="px-2 py-1 border border-[var(--border)] rounded text-xs bg-white font-semibold">
                  <option value="NEW">NEW</option>
                  <option value="PENDING">PENDING</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <button onClick={() => setShowWelfareModal(null)} className="px-4 py-1.5 bg-[var(--primary)] text-white rounded text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Roster Entry Modal */}
      {showRosterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-2">Add Official Alumni Directory Record</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">Pre-authorize a graduate's matriculation number for instant registration verification.</p>
            <form onSubmit={handleAddRosterEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Matriculation Number *</label>
                <input required type="text" placeholder="e.g. CLU/2021/LAW/005" value={rosterForm.matricNumber} onChange={e => setRosterForm({...rosterForm, matricNumber: e.target.value})} className="w-full p-2 border rounded font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">First Name *</label>
                  <input required type="text" value={rosterForm.firstName} onChange={e => setRosterForm({...rosterForm, firstName: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Last Name *</label>
                  <input required type="text" value={rosterForm.lastName} onChange={e => setRosterForm({...rosterForm, lastName: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Faculty *</label>
                  <select required value={rosterForm.facultyId} onChange={e => setRosterForm({...rosterForm, facultyId: e.target.value})} className="w-full p-2 border rounded bg-white">
                    <option value="">Select Faculty</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Graduating Set *</label>
                  <select required value={rosterForm.graduatingSetId} onChange={e => setRosterForm({...rosterForm, graduatingSetId: e.target.value})} className="w-full p-2 border rounded bg-white">
                    <option value="">Select Set</option>
                    {sets.map(s => <option key={s.id} value={s.id}>{s.setName} ({s.graduationYear})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Department / Programme *</label>
                <input required type="text" placeholder="e.g. Computer Science" value={rosterForm.department} onChange={e => setRosterForm({...rosterForm, department: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowRosterModal(false)} className="px-4 py-2 border rounded font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded font-semibold">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alumni of the Week Modal */}
      {showAOTWModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-2">Set Alumni of the Week</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">
              Member: <strong>{showAOTWModal.firstName} {showAOTWModal.lastName}</strong>
            </p>
            <form onSubmit={handleSetAlumniOfWeek} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Recognition Citation / Biography</label>
                <textarea
                  required
                  rows={4}
                  value={aotwBio}
                  onChange={e => setAotwBio(e.target.value)}
                  placeholder="Explain why this alumnus is recognized this week..."
                  className="w-full p-2.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAOTWModal(null)} className="px-4 py-2 border rounded text-xs font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded text-xs font-semibold">Confirm AOTW</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-4">Create Upcoming Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Event Title *</label>
                <input required type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Date *</label>
                  <input required type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Time</label>
                  <input type="text" placeholder="10:00 AM" value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Venue / Location *</label>
                <input required type="text" placeholder="e.g. Main Auditorium, CLI" value={eventForm.venue} onChange={e => setEventForm({...eventForm, venue: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-medium mb-1">Description *</label>
                <textarea required rows={3} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 border rounded font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded font-semibold">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-4">Post Announcement / News</h3>
            <form onSubmit={handleCreateNews} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Title *</label>
                <input required type="text" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-medium mb-1">Category *</label>
                <select value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})} className="w-full p-2 border rounded">
                  <option value="OFFICIAL_ANNOUNCEMENT">Official Announcement</option>
                  <option value="ASSOCIATION_NEWS">Association News</option>
                  <option value="ALUMNI_ACHIEVEMENT">Alumni Achievement</option>
                  <option value="IMPORTANT_NOTICE">Important Notice</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Content *</label>
                <textarea required rows={4} value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowNewsModal(false)} className="px-4 py-2 border rounded font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded font-semibold">Post Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leadership Modal */}
      {showLeadershipModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-4">Add EXCO Leader Profile</h3>
            <form onSubmit={handleCreateLeadership} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Full Name *</label>
                <input required type="text" value={leadershipForm.name} onChange={e => setLeadershipForm({...leadershipForm, name: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-medium mb-1">Position / Office *</label>
                <input required type="text" placeholder="e.g. President, General Secretary" value={leadershipForm.position} onChange={e => setLeadershipForm({...leadershipForm, position: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-medium mb-1">Biography *</label>
                <textarea required rows={3} value={leadershipForm.biography} onChange={e => setLeadershipForm({...leadershipForm, biography: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-medium mb-1">Term Start Year *</label>
                <input required type="number" value={leadershipForm.termStart} onChange={e => setLeadershipForm({...leadershipForm, termStart: Number(e.target.value)})} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowLeadershipModal(false)} className="px-4 py-2 border rounded font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded font-semibold">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
