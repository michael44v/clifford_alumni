import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface AdminDashboardProps { onNavigate: (page: Page) => void; onLogout: () => void; }

type AdminTab = "overview" | "roster" | "members" | "media" | "welfare" | "payments" | "donations" | "content" | "settings";

export default function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [welfareCases, setWelfareCases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [leadership, setLeadership] = useState<any[]>([]);
  const [duesItems, setDuesItems] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [impactStats, setImpactStats] = useState<any | null>(null);
  const [scholarshipsForm, setScholarshipsForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<any | null>(null);

  // Search/Filters
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilterStatus, setMemberFilterStatus] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");

  // Modals state
  const [showSetModal, setShowSetModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showLeadershipModal, setShowLeadershipModal] = useState(false);
  const [showAOTWModal, setShowAOTWModal] = useState<any | null>(null);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState<any | null>(null);
  const [showDuesModal, setShowDuesModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState<any | null>(null);

  // Admin Upload Modal state
  const [showAdminUploadModal, setShowAdminUploadModal] = useState(false);
  const [adminUploadAlbumTitle, setAdminUploadAlbumTitle] = useState("");
  const [adminUploadCategory, setAdminUploadCategory] = useState("ALUMNI_EVENT");
  const [adminSelectedAlbumId, setAdminSelectedAlbumId] = useState("");
  const [adminImageUrls, setAdminImageUrls] = useState<string[]>([""]);
  const [adminCaptions, setAdminCaptions] = useState<string[]>([""]);
  const [adminSetLandingPage, setAdminSetLandingPage] = useState(true);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  // Forms
  const [setForm, setSetForm] = useState({ setName: "", graduationYear: new Date().getFullYear(), description: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "", time: "", venue: "", category: "General", organizer: "CUAA" });
  const [newsForm, setNewsForm] = useState({ title: "", content: "", category: "OFFICIAL_ANNOUNCEMENT" });
  const [leadershipForm, setLeadershipForm] = useState({ name: "", position: "", biography: "", termStart: new Date().getFullYear() });
  const [aotwBio, setAotwBio] = useState("");
  const [rosterForm, setRosterForm] = useState({ matricNumber: "", firstName: "", lastName: "", facultyId: "", graduatingSetId: "", department: "" });
  const [duesForm, setDuesForm] = useState({ title: "", amount: "", type: "ANNUAL_DUES", academicYear: "2024/2025", description: "" });
  const [campaignForm, setCampaignForm] = useState({ title: "", description: "", targetAmount: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, membersRes, rosterRes, mediaRes, welfareRes, paymentsRes, facultiesRes, setsRes, eventsRes, newsRes, leadershipRes, duesRes, campaignsRes, impactRes] = await Promise.all([
        apiFetch("/api/admin/stats").catch(() => null),
        apiFetch(`/api/admin/members?search=${encodeURIComponent(memberSearch)}&status=${memberFilterStatus}`).catch(() => []),
        apiFetch(`/api/admin/official-directory?search=${encodeURIComponent(rosterSearch)}`).catch(() => []),
        apiFetch("/api/gallery/admin/photos").catch(() => []),
        apiFetch("/api/welfare/admin/cases").catch(() => []),
        apiFetch("/api/admin/payments").catch(() => []),
        apiFetch("/api/admin/faculties").catch(() => []),
        apiFetch("/api/admin/sets").catch(() => []),
        apiFetch("/api/events?limit=50").catch(() => []),
        apiFetch("/api/news?limit=50").catch(() => []),
        apiFetch("/api/admin/leadership").catch(() => []),
        apiFetch("/api/finance/dues").catch(() => []),
        apiFetch("/api/finance/campaigns?all=true").catch(() => []),
        apiFetch("/api/finance/impact-stats").catch(() => null),
      ]);

      if (statsRes) setAdminStats(statsRes);
      setMembers(Array.isArray(membersRes) ? membersRes : []);
      setRoster(Array.isArray(rosterRes) ? rosterRes : []);
      setGalleryPhotos(Array.isArray(mediaRes) ? mediaRes : []);
      setWelfareCases(Array.isArray(welfareRes) ? welfareRes : []);
      setPayments(Array.isArray(paymentsRes) ? paymentsRes : []);
      setFaculties(Array.isArray(facultiesRes) ? facultiesRes : []);
      setSets(Array.isArray(setsRes) ? setsRes : []);
      setEvents(Array.isArray(eventsRes) ? eventsRes : eventsRes?.data || []);
      setNews(Array.isArray(newsRes) ? newsRes : newsRes?.data || []);
      setLeadership(Array.isArray(leadershipRes) ? leadershipRes : []);
      setDuesItems(Array.isArray(duesRes) ? duesRes : duesRes?.data || []);
      setCampaigns(Array.isArray(campaignsRes) ? campaignsRes : []);
      if (impactRes) {
        setImpactStats(impactRes);
        setScholarshipsForm(String(impactRes.scholarshipsAwarded || 0));
      }
    } catch (err) {
      console.error("Admin fetchData error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [memberSearch, memberFilterStatus, rosterSearch]);

  const handleToggleFeaturedMember = async (m: any) => {
    try {
      await apiFetch(`/api/admin/members/${m.id}/featured`, {
        method: "PUT",
        body: JSON.stringify({ isFeatured: !m.isFeatured }),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update featured status");
    }
  };

  const updateMemberStatus = async (id: string, verificationStatus: string) => {
    try {
      await apiFetch(`/api/admin/members/${id}`, {
        method: "PUT",
        body: JSON.stringify({ verificationStatus }),
      });
      if (selectedMemberDetail && selectedMemberDetail.id === id) {
        setSelectedMemberDetail({ ...selectedMemberDetail, verificationStatus });
      }
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update member status");
    }
  };

  const handleFetchMemberDetails = async (id: string) => {
    try {
      const data = await apiFetch(`/api/admin/members/${id}/details`);
      setSelectedMemberDetail(data);
    } catch (err: any) {
      alert(err.message || "Failed to fetch member details");
    }
  };

  const handleToggleFeaturedPhoto = async (photo: any) => {
    try {
      await apiFetch(`/api/admin/gallery/photos/${photo.id}/featured`, {
        method: "PUT",
        body: JSON.stringify({ isFeatured: !photo.isFeatured }),
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update photo showcase status");
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo from the gallery?")) return;
    try {
      await apiFetch(`/api/admin/gallery/photos/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete photo");
    }
  };

  const handleAdminUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validPhotos = adminImageUrls
      .map((url, idx) => ({
        url: url.trim(),
        caption: adminCaptions[idx] ? adminCaptions[idx].trim() : "",
        isFeatured: adminSetLandingPage,
      }))
      .filter(p => p.url.length > 0);

    if (validPhotos.length === 0) {
      alert("Please enter at least one photo URL or upload an image file.");
      return;
    }

    setIsAdminSubmitting(true);
    try {
      await apiFetch("/api/gallery/upload-multiple", {
        method: "POST",
        body: JSON.stringify({
          albumId: adminSelectedAlbumId || undefined,
          albumTitle: adminUploadAlbumTitle || undefined,
          category: adminUploadCategory,
          photos: validPhotos,
          isFeatured: adminSetLandingPage,
        }),
      });

      alert(`Successfully uploaded ${validPhotos.length} photo(s)!`);
      setShowAdminUploadModal(false);
      setAdminUploadAlbumTitle("");
      setAdminImageUrls([""]);
      setAdminCaptions([""]);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to upload photos");
    } finally {
      setIsAdminSubmitting(false);
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

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/admin/sets", {
        method: "POST",
        body: JSON.stringify({
          setName: setForm.setName,
          graduationYear: Number(setForm.graduationYear),
          description: setForm.description,
        }),
      });
      alert("Graduating set created successfully!");
      setShowSetModal(false);
      setSetForm({ setName: "", graduationYear: new Date().getFullYear(), description: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to create graduating set");
    }
  };

  const handleDeleteSet = async (id: string) => {
    if (!confirm("Are you sure you want to delete this graduating set?")) return;
    try {
      await apiFetch(`/api/admin/sets/${id}`, { method: "DELETE" });
      alert("Graduating set deleted.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete graduating set");
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

  const handleCreateDues = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/finance/dues", {
        method: "POST",
        body: JSON.stringify({
          title: duesForm.title,
          amount: Number(duesForm.amount),
          type: duesForm.type,
          academicYear: duesForm.academicYear,
          description: duesForm.description,
        }),
      });
      alert("Dues item created successfully!");
      setShowDuesModal(false);
      setDuesForm({ title: "", amount: "", type: "ANNUAL_DUES", academicYear: "2024/2025", description: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to create dues item");
    }
  };

  const handleDeleteDues = async (id: string) => {
    if (!confirm("Delete this dues item?")) return;
    try {
      await apiFetch(`/api/finance/dues/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete dues item");
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await apiFetch(`/api/finance/campaigns/${editingCampaign.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title: campaignForm.title,
            description: campaignForm.description,
            targetAmount: Number(campaignForm.targetAmount),
          }),
        });
        alert("Donation cause updated!");
      } else {
        await apiFetch("/api/finance/campaigns", {
          method: "POST",
          body: JSON.stringify({
            title: campaignForm.title,
            description: campaignForm.description,
            targetAmount: Number(campaignForm.targetAmount),
          }),
        });
        alert("Donation cause created!");
      }
      setShowCampaignModal(false);
      setEditingCampaign(null);
      setCampaignForm({ title: "", description: "", targetAmount: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save donation cause");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Delete this donation cause?")) return;
    try {
      await apiFetch(`/api/finance/campaigns/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete donation cause");
    }
  };

  const handleUpdateImpactStats = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/admin/impact-stats", {
        method: "PUT",
        body: JSON.stringify({ scholarshipsAwarded: Number(scholarshipsForm) }),
      });
      alert("Impact statistics updated!");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update impact statistics");
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
          {(["overview", "roster", "members", "media", "welfare", "payments", "donations", "content", "settings"] as AdminTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-4 py-2 rounded text-xs font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? "bg-[var(--secondary)] text-white" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {tab === "roster" ? "Official Roster" : tab === "media" ? "Media Gallery" : tab} {tab === "members" && pendingMembers.length > 0 ? `(${pendingMembers.length})` : ""}
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
                  <button onClick={() => setShowSetModal(true)} className="p-3 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] text-left">
                    <span className="text-lg block mb-1">🏛️</span>
                    <strong>Manage Sets ({sets.length})</strong>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Add/Delete Graduating Sets</p>
                  </button>
                  <button onClick={() => { setEditingCampaign(null); setCampaignForm({ title: "", description: "", targetAmount: "" }); setShowCampaignModal(true); }} className="p-3 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] text-left">
                    <span className="text-lg block mb-1">❤️</span>
                    <strong>Add Donation Cause</strong>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Create new fundraising campaign</p>
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
              <p className="text-xs text-[var(--muted-foreground)]">Total: <strong>{members.length}</strong> members (Click row to view full details)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Name</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Email / Phone</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Matric / Type</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Status</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Featured / AOTW</th>
                    <th className="p-3 text-xs font-semibold text-[var(--muted-foreground)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {members.map(m => (
                    <tr key={m.id} className="text-xs hover:bg-amber-50 cursor-pointer transition-colors" onClick={() => handleFetchMemberDetails(m.id)}>
                      <td className="p-3 font-semibold text-[var(--primary)] underline">{m.firstName} {m.lastName}</td>
                      <td className="p-3 text-[var(--muted-foreground)]">{m.email}<br />{m.phone || '—'}</td>
                      <td className="p-3 text-[var(--muted-foreground)]">{m.matricNumber || 'N/A'}<br /><span className="text-[10px] font-semibold">{m.memberType}</span></td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-700" : m.verificationStatus === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                          {m.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            onClick={() => handleToggleFeaturedMember(m)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.isFeatured
                                ? "bg-purple-100 text-purple-700 border border-purple-300"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {m.isFeatured ? "⭐ Featured" : "+ Feature"}
                          </button>

                          {m.isAlumniOfWeek ? (
                            <div className="flex items-center gap-1 text-amber-600 font-bold text-[10px]">
                              <span>🏆 AOTW</span>
                              <button onClick={() => handleUnsetAlumniOfWeek(m)} className="text-[10px] text-red-500 underline">Unset</button>
                            </div>
                          ) : (
                            <button onClick={() => { setShowAOTWModal(m); setAotwBio(m.alumniOfWeekBio || m.bio || ""); }} className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 rounded text-[10px] font-semibold hover:bg-amber-100">
                              Set AOTW
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <button onClick={() => handleFetchMemberDetails(m.id)} className="px-2.5 py-1 bg-[var(--primary)] text-white rounded text-[10px] font-semibold">View Details</button>
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

        {/* Media Tab */}
        {activeTab === "media" && (
          <div className="bg-white border border-[var(--border)] rounded overflow-hidden p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="font-bold text-base text-[var(--secondary)]">Uploaded Photos Media Manager</h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Review all user-uploaded photos. Upload pictures directly and set them for the public landing page showcase or delete inappropriate uploads.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAdminUploadModal(true)}
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded text-xs font-bold hover:bg-[var(--accent)] transition-colors shadow-sm"
                >
                  📷 + Upload Admin Photos
                </button>
                <span className="px-3 py-1.5 bg-[var(--muted)] text-[var(--primary)] font-bold text-xs rounded">
                  Total Photos: {galleryPhotos.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="border border-[var(--border)] rounded-lg overflow-hidden bg-slate-50 flex flex-col hover:shadow-md transition-shadow">
                  <div className="h-44 bg-[var(--muted)] relative overflow-hidden">
                    <img src={photo.media?.secureUrl} alt={photo.caption || "Showcase photo"} className="w-full h-full object-cover" />
                    {photo.isFeatured && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded shadow uppercase tracking-wide">
                        🌟 Landing Page Featured
                      </span>
                    )}
                  </div>
                  <div className="p-3 text-xs flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-[var(--foreground)] line-clamp-1">{photo.album?.title || "Gallery Showcase"}</p>
                      {photo.caption && <p className="text-[var(--muted-foreground)] italic line-clamp-2">"{photo.caption}"</p>}
                      <div className="pt-2 border-t border-[var(--border)] text-[11px]">
                        <p className="text-[var(--primary)] font-bold">
                          Uploader: {photo.uploadedBy?.firstName} {photo.uploadedBy?.lastName}
                        </p>
                        <p className="text-[var(--muted-foreground)] text-[10px]">{photo.uploadedBy?.email} · {photo.uploadedBy?.matricNumber || 'No Matric'}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{new Date(photo.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[var(--border)] flex gap-2">
                      <button
                        onClick={() => handleToggleFeaturedPhoto(photo)}
                        className={`flex-1 py-1.5 rounded text-[11px] font-bold transition-colors ${
                          photo.isFeatured
                            ? "bg-amber-100 border border-amber-400 text-amber-800 hover:bg-amber-200"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {photo.isFeatured ? "Unfeature" : "+ Add to Landing Page"}
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="px-2.5 py-1.5 bg-red-100 text-red-700 font-bold rounded text-[11px] hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {galleryPhotos.length === 0 && (
                <div className="col-span-full text-center py-12 text-[var(--muted-foreground)]">
                  <p className="text-4xl mb-2">🖼️</p>
                  <p className="font-semibold text-sm">No photos uploaded to the gallery showcase yet.</p>
                </div>
              )}
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

        {/* Payments & Dues Tab */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            {/* Dues Manager Card */}
            <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-[var(--foreground)]">Annual Dues & Levies Manager</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Create dues items and mandatory amounts to apply to all members.</p>
                </div>
                <button onClick={() => setShowDuesModal(true)} className="px-3 py-1.5 bg-[var(--primary)] text-white rounded text-xs font-semibold hover:bg-[var(--accent)]">
                  + Create Dues Amount
                </button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {duesItems.map((d) => (
                  <div key={d.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="px-2 py-0.5 bg-[var(--muted)] text-[var(--primary)] text-[10px] font-bold rounded mb-1 inline-block">{d.type || 'ANNUAL_DUES'}</span>
                      <p className="font-bold text-sm text-[var(--foreground)]">{d.title}</p>
                      <p className="text-[var(--muted-foreground)]">Academic Year: {d.academicYear || '2024/2025'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-base text-[var(--primary)]">₦{Number(d.amount).toLocaleString()}</p>
                      <button onClick={() => handleDeleteDues(d.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded font-semibold hover:bg-red-200">Delete</button>
                    </div>
                  </div>
                ))}
                {duesItems.length === 0 && <p className="p-5 text-center text-xs text-[var(--muted-foreground)]">No active dues items created. Click "+ Create Dues Amount" above to set dues for members.</p>}
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
              <div className="p-4 border-b border-[var(--border)]">
                <h3 className="font-semibold text-sm">Realtime Payment Transactions</h3>
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
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <div className="space-y-6">
            {/* Impact Statistics Editor Card */}
            <div className="bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-1">Live Impact Statistics</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">View real-time figures displayed on the public donation page.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-[var(--muted)] rounded text-center">
                  <p className="text-xs text-[var(--muted-foreground)]">Members Supported (Resolved Welfare)</p>
                  <p className="font-bold text-lg text-[var(--primary)]">{impactStats?.membersSupported || 0}</p>
                </div>
                <div className="p-3 bg-[var(--muted)] rounded text-center">
                  <p className="text-xs text-[var(--muted-foreground)]">Total Donations Received</p>
                  <p className="font-bold text-lg text-green-600">₦{Number(impactStats?.totalDonationsAmount || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[var(--muted)] rounded text-center">
                  <p className="text-xs text-[var(--muted-foreground)]">Donors This Year</p>
                  <p className="font-bold text-lg text-blue-600">{impactStats?.donorsThisYear || 0}</p>
                </div>
                <div className="p-3 bg-[var(--muted)] rounded text-center">
                  <p className="text-xs text-[var(--muted-foreground)]">Scholarships Awarded</p>
                  <p className="font-bold text-lg text-purple-600">{impactStats?.scholarshipsAwarded || 0}</p>
                </div>
              </div>
              <form onSubmit={handleUpdateImpactStats} className="flex gap-3 items-end max-w-sm">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Set Scholarships Awarded Figure</label>
                  <input type="number" min="0" value={scholarshipsForm} onChange={e => setScholarshipsForm(e.target.value)} className="w-full p-2 border rounded text-xs" />
                </div>
                <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded text-xs font-semibold hover:bg-[var(--accent)]">
                  Save Figure
                </button>
              </form>
            </div>

            <div className="bg-white border border-[var(--border)] rounded overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)]">Donation Causes & Campaigns</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Manage causes, goals, descriptions, and view live raised totals.</p>
              </div>
              <button onClick={() => { setEditingCampaign(null); setCampaignForm({ title: "", description: "", targetAmount: "" }); setShowCampaignModal(true); }} className="px-3 py-1.5 bg-[var(--primary)] text-white rounded text-xs font-semibold hover:bg-[var(--accent)]">
                + Create Donation Cause
              </button>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {campaigns.map((c) => {
                const raised = Number(c.raisedAmount || 0);
                const target = Number(c.targetAmount || 1);
                const pct = Math.min(100, Math.round((raised / target) * 100));
                return (
                  <div key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex-1">
                      <h4 className="font-bold text-base text-[var(--foreground)]">{c.title}</h4>
                      <p className="text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{c.description}</p>
                      <div className="mt-2 w-full max-w-md h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[11px] font-semibold text-[var(--primary)] mt-1">
                        ₦{raised.toLocaleString()} raised ({pct}%) of ₦{target.toLocaleString()} goal
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCampaign(c);
                          setCampaignForm({ title: c.title, description: c.description, targetAmount: String(c.targetAmount) });
                          setShowCampaignModal(true);
                        }}
                        className="px-3 py-1.5 border border-[var(--border)] rounded text-xs font-semibold hover:border-[var(--primary)]"
                      >
                        Edit Cause
                      </button>
                      <button onClick={() => handleDeleteCampaign(c.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {campaigns.length === 0 && (
                <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
                  No donation campaigns created yet. Click "+ Create Donation Cause" above.
                </div>
              )}
            </div>
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
                {events.map((e) => {
                  const regList = e.registrations || [];
                  return (
                    <div key={e.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[var(--foreground)]">{e.title}</p>
                        <p className="text-[var(--muted-foreground)]">📅 {new Date(e.eventDate).toLocaleDateString()} at {e.time || '10:00 AM'} · 📍 {e.venue}</p>
                        <p className="text-[var(--muted-foreground)] mt-0.5 line-clamp-1">{e.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-semibold text-[var(--primary)]">{regList.length} Registered Attendees</span>
                          {regList.length > 0 && (
                            <button onClick={() => setSelectedEventAttendees(e)} className="text-[10px] text-[var(--primary)] underline font-medium">View Attendees List →</button>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteEvent(e.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded font-semibold hover:bg-red-200">Delete</button>
                    </div>
                  );
                })}
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

      {/* Admin Photo Upload Modal */}
      {showAdminUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-3">
              <div>
                <h2 className="font-display text-xl font-bold text-[var(--secondary)]">Admin Upload Showcase Photos</h2>
                <p className="text-xs text-[var(--muted-foreground)]">Upload pictures to the media gallery and set them to display on the landing page showcase.</p>
              </div>
              <button onClick={() => setShowAdminUploadModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>

            <form onSubmit={handleAdminUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Select Album or Create New</label>
                  <select
                    value={adminSelectedAlbumId}
                    onChange={e => {
                      setAdminSelectedAlbumId(e.target.value);
                      if (e.target.value) setAdminUploadAlbumTitle("");
                    }}
                    className="w-full p-2 border border-[var(--border)] rounded bg-white"
                  >
                    <option value="">-- Create New Album --</option>
                    {Array.from(new Map(galleryPhotos.map(p => [p.album?.id, p.album])).values())
                      .filter(Boolean)
                      .map((a: any) => (
                        <option key={a.id} value={a.id}>{a.title} ({a.category})</option>
                      ))}
                  </select>
                </div>
                {!adminSelectedAlbumId && (
                  <div>
                    <label className="block font-medium mb-1">New Album Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Official University Campus Showcase"
                      value={adminUploadAlbumTitle}
                      onChange={e => setAdminUploadAlbumTitle(e.target.value)}
                      className="w-full p-2 border border-[var(--border)] rounded"
                    />
                  </div>
                )}
              </div>

              {!adminSelectedAlbumId && (
                <div>
                  <label className="block font-medium mb-1">Album Category</label>
                  <select
                    value={adminUploadCategory}
                    onChange={e => setAdminUploadCategory(e.target.value)}
                    className="w-full p-2 border border-[var(--border)] rounded bg-white"
                  >
                    <option value="ALUMNI_EVENT">ALUMNI_EVENT</option>
                    <option value="INDIVIDUAL_ALUMNI">INDIVIDUAL_ALUMNI</option>
                    <option value="GRADUATING_SET">GRADUATING_SET</option>
                    <option value="REUNION">REUNION</option>
                    <option value="AGM">AGM</option>
                    <option value="UNIVERSITY_MEMORIES">UNIVERSITY_MEMORIES</option>
                    <option value="HISTORICAL_ARCHIVE">HISTORICAL_ARCHIVE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              )}

              {/* Showcase Checkbox */}
              <div className="p-3 bg-amber-50 border border-amber-300 rounded flex items-center gap-2">
                <input
                  type="checkbox"
                  id="adminSetLandingPage"
                  checked={adminSetLandingPage}
                  onChange={e => setAdminSetLandingPage(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="adminSetLandingPage" className="font-bold text-amber-900 cursor-pointer">
                  🌟 Set these uploaded photos to appear on the public Landing Page Showcase
                </label>
              </div>

              {/* Photos List */}
              <div>
                <label className="block font-semibold text-sm mb-2 text-[var(--foreground)]">Select Images / Provide Photo URLs ({adminImageUrls.length})</label>
                <div className="space-y-3">
                  {adminImageUrls.map((url, idx) => (
                    <div key={idx} className="p-3 bg-[var(--muted)] border border-[var(--border)] rounded space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--primary)]">Photo #{idx + 1}</span>
                        {adminImageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdminImageUrls(adminImageUrls.filter((_, i) => i !== idx));
                              setAdminCaptions(adminCaptions.filter((_, i) => i !== idx));
                            }}
                            className="text-red-500 text-xs font-semibold hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-[var(--muted-foreground)] mb-1">Upload File (Image File)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const newUrls = [...adminImageUrls];
                                  newUrls[idx] = reader.result as string;
                                  setAdminImageUrls(newUrls);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full text-[11px] bg-white border rounded p-1"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[var(--muted-foreground)] mb-1">Or Direct Image URL</label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={url.startsWith("data:") ? "[Local File Uploaded]" : url}
                            onChange={e => {
                              const newUrls = [...adminImageUrls];
                              newUrls[idx] = e.target.value;
                              setAdminImageUrls(newUrls);
                            }}
                            className="w-full p-2 border rounded bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[var(--muted-foreground)] mb-1">Caption / Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Official Graduation ceremony highlights"
                          value={adminCaptions[idx]}
                          onChange={e => {
                            const newCaps = [...adminCaptions];
                            newCaps[idx] = e.target.value;
                            setAdminCaptions(newCaps);
                          }}
                          className="w-full p-2 border rounded bg-white"
                        />
                      </div>

                      {url && (
                        <div className="mt-1 h-20 w-20 rounded overflow-hidden border border-[var(--border)]">
                          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAdminImageUrls([...adminImageUrls, ""]);
                    setAdminCaptions([...adminCaptions, ""]);
                  }}
                  className="mt-3 px-4 py-2 bg-white border border-[var(--primary)] text-[var(--primary)] rounded text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  + Add Another Photo
                </button>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--border)]">
                <button type="button" onClick={() => setShowAdminUploadModal(false)} className="px-4 py-2 border rounded font-medium">Cancel</button>
                <button type="submit" disabled={isAdminSubmitting} className="px-6 py-2 bg-[var(--primary)] text-white rounded font-bold hover:bg-[var(--accent)] transition-colors">
                  {isAdminSubmitting ? "Uploading..." : `Upload & Save ${adminImageUrls.filter(Boolean).length} Photo(s)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Member Profile Modal */}
      {selectedMemberDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMemberDetail(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--primary)] bg-[var(--muted)] flex-shrink-0">
                  <img src={selectedMemberDetail.profilePhoto?.secureUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format"} alt={selectedMemberDetail.firstName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-[var(--secondary)]">{selectedMemberDetail.firstName} {selectedMemberDetail.lastName}</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">{selectedMemberDetail.email} · {selectedMemberDetail.phone || 'No phone'}</p>
                  <div className="flex gap-2 mt-1.5 items-center">
                    <span className="font-mono text-[11px] font-bold text-[var(--primary)] bg-[var(--muted)] px-2 py-0.5 rounded">
                      Matric: {selectedMemberDetail.matricNumber || 'N/A'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedMemberDetail.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {selectedMemberDetail.verificationStatus}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedMemberDetail(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between bg-[var(--muted)] p-3 rounded text-xs">
              <span className="font-semibold text-[var(--foreground)]">Admin Actions for Member:</span>
              <div className="flex gap-2">
                {selectedMemberDetail.verificationStatus !== "VERIFIED" && (
                  <button onClick={() => updateMemberStatus(selectedMemberDetail.id, "VERIFIED")} className="px-3 py-1 bg-green-600 text-white rounded font-bold hover:bg-green-700">
                    Approve Member
                  </button>
                )}
                {selectedMemberDetail.verificationStatus !== "SUSPENDED" && (
                  <button onClick={() => updateMemberStatus(selectedMemberDetail.id, "SUSPENDED")} className="px-3 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700">
                    Suspend Member
                  </button>
                )}
              </div>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 border border-[var(--border)] rounded-lg">
              <div>
                <p className="text-[var(--muted-foreground)] text-[10px]">Graduating Set</p>
                <p className="font-bold">{selectedMemberDetail.graduatingSet?.setName || 'N/A'} ({selectedMemberDetail.graduatingSet?.graduationYear || ''})</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)] text-[10px]">Faculty & Department</p>
                <p className="font-bold">{selectedMemberDetail.faculty?.name || 'N/A'} - {selectedMemberDetail.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)] text-[10px]">Profession / Company</p>
                <p className="font-bold">{selectedMemberDetail.profession || 'N/A'} {selectedMemberDetail.company ? `@ ${selectedMemberDetail.company}` : ''}</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)] text-[10px]">Location</p>
                <p className="font-bold">{selectedMemberDetail.location?.state || selectedMemberDetail.diasporaCountry || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)] text-[10px]">Account Role</p>
                <p className="font-bold text-[var(--primary)]">{selectedMemberDetail.role}</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)] text-[10px]">Member Type</p>
                <p className="font-bold">{selectedMemberDetail.memberType}</p>
              </div>
              {selectedMemberDetail.bio && (
                <div className="col-span-full pt-2 border-t border-[var(--border)]">
                  <p className="text-[var(--muted-foreground)] text-[10px]">Short Bio</p>
                  <p className="italic text-[var(--foreground)] mt-0.5">{selectedMemberDetail.bio}</p>
                </div>
              )}
            </div>

            {/* Uploaded Gallery Photos */}
            <div>
              <h3 className="font-bold text-sm text-[var(--secondary)] mb-2">Uploaded Gallery Photos ({(selectedMemberDetail.galleryPhotosUploaded || []).length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(selectedMemberDetail.galleryPhotosUploaded || []).map((p: any) => (
                  <div key={p.id} className="h-28 rounded border border-[var(--border)] overflow-hidden relative bg-[var(--muted)]">
                    <img src={p.media?.secureUrl} alt={p.caption || "Photo"} className="w-full h-full object-cover" />
                    {p.isFeatured && (
                      <span className="absolute top-1 left-1 px-1 bg-amber-500 text-white text-[9px] font-bold rounded">Featured</span>
                    )}
                  </div>
                ))}
                {(selectedMemberDetail.galleryPhotosUploaded || []).length === 0 && (
                  <p className="col-span-full text-xs text-[var(--muted-foreground)] py-2">No photos uploaded by this member.</p>
                )}
              </div>
            </div>

            {/* Payment Records */}
            <div>
              <h3 className="font-bold text-sm text-[var(--secondary)] mb-2">Payment Records ({(selectedMemberDetail.paymentRecords || []).length})</h3>
              <div className="overflow-x-auto border border-[var(--border)] rounded">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                      <th className="p-2 text-[var(--muted-foreground)] font-medium">Item / Campaign</th>
                      <th className="p-2 text-[var(--muted-foreground)] font-medium">Amount</th>
                      <th className="p-2 text-[var(--muted-foreground)] font-medium">Status</th>
                      <th className="p-2 text-[var(--muted-foreground)] font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {(selectedMemberDetail.paymentRecords || []).map((p: any) => (
                      <tr key={p.id}>
                        <td className="p-2 font-medium">{p.duesItem?.title || p.donationCampaign?.title || 'Dues/Donation'}</td>
                        <td className="p-2 font-bold text-green-600">₦{Number(p.amount).toLocaleString()}</td>
                        <td className="p-2"><span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">{p.status}</span></td>
                        <td className="p-2 text-[var(--muted-foreground)]">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(selectedMemberDetail.paymentRecords || []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-xs text-[var(--muted-foreground)]">No payments recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Welfare Cases */}
            <div>
              <h3 className="font-bold text-sm text-[var(--secondary)] mb-2">Welfare Requests ({(selectedMemberDetail.welfareRequests || []).length})</h3>
              <div className="space-y-2">
                {(selectedMemberDetail.welfareRequests || []).map((w: any) => (
                  <div key={w.id} className="p-3 border border-[var(--border)] rounded bg-slate-50 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[var(--primary)]">{w.category}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">{w.status}</span>
                    </div>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">{w.description}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{new Date(w.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                {(selectedMemberDetail.welfareRequests || []).length === 0 && (
                  <p className="text-xs text-[var(--muted-foreground)] py-1">No welfare cases submitted.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <button onClick={() => setSelectedMemberDetail(null)} className="px-5 py-2 bg-[var(--primary)] text-white rounded text-xs font-semibold">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Graduating Sets Modal */}
      {showSetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSetModal(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="font-bold text-lg text-[var(--secondary)]">Manage Graduating Sets</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Add new graduating set or remove existing sets.</p>
              </div>
              <button onClick={() => setShowSetModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            {/* Add Set Form */}
            <form onSubmit={handleCreateSet} className="bg-[var(--muted)] p-3 rounded-lg space-y-2 text-xs">
              <p className="font-bold text-[var(--foreground)]">+ Add New Graduating Set</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-0.5">Set Name *</label>
                  <input required type="text" placeholder="e.g. Omicron Set" value={setForm.setName} onChange={e => setSetForm({ ...setForm, setName: e.target.value })} className="w-full p-1.5 border rounded bg-white" />
                </div>
                <div>
                  <label className="block font-medium mb-0.5">Graduation Year *</label>
                  <input required type="number" placeholder="2027" value={setForm.graduationYear} onChange={e => setSetForm({ ...setForm, graduationYear: Number(e.target.value) })} className="w-full p-1.5 border rounded bg-white font-bold" />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-0.5">Description (Optional)</label>
                <input type="text" placeholder="e.g. Class of 2027" value={setForm.description} onChange={e => setSetForm({ ...setForm, description: e.target.value })} className="w-full p-1.5 border rounded bg-white" />
              </div>
              <button type="submit" className="w-full py-1.5 bg-[var(--primary)] text-white rounded font-bold hover:bg-[var(--accent)]">
                Create Graduating Set
              </button>
            </form>

            {/* Sets List */}
            <div>
              <p className="font-bold text-xs text-[var(--foreground)] mb-2">Existing Graduating Sets ({sets.length}):</p>
              <div className="divide-y divide-[var(--border)] max-h-48 overflow-y-auto border rounded">
                {sets.map(s => (
                  <div key={s.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[var(--foreground)]">{s.setName} ({s.graduationYear})</p>
                      {s.description && <p className="text-[10px] text-[var(--muted-foreground)]">{s.description}</p>}
                    </div>
                    <button onClick={() => handleDeleteSet(s.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold hover:bg-red-200">
                      Delete
                    </button>
                  </div>
                ))}
                {sets.length === 0 && <p className="p-4 text-center text-xs text-[var(--muted-foreground)]">No graduating sets found.</p>}
              </div>
            </div>

            <button onClick={() => setShowSetModal(false)} className="w-full py-2 bg-[var(--primary)] text-white rounded text-xs font-semibold">Close</button>
          </div>
        </div>
      )}

      {/* Event Attendees Modal */}
      {selectedEventAttendees && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEventAttendees(null)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="font-bold text-lg text-[var(--secondary)]">Registered Attendees</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{selectedEventAttendees.title}</p>
              </div>
              <button onClick={() => setSelectedEventAttendees(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div className="divide-y divide-[var(--border)] max-h-60 overflow-y-auto">
              {(selectedEventAttendees.registrations || []).map((r: any, i: number) => (
                <div key={r.id || i} className="py-2.5 text-xs">
                  <p className="font-semibold text-[var(--foreground)]">{r.member?.firstName} {r.member?.lastName}</p>
                  <p className="text-[var(--muted-foreground)]">{r.member?.email} · {r.member?.phone || 'No phone'}</p>
                </div>
              ))}
              {(selectedEventAttendees.registrations || []).length === 0 && (
                <p className="py-4 text-center text-xs text-[var(--muted-foreground)]">No members registered yet.</p>
              )}
            </div>
            <button onClick={() => setSelectedEventAttendees(null)} className="w-full py-2 bg-[var(--primary)] text-white rounded text-xs font-semibold">Close</button>
          </div>
        </div>
      )}

      {/* Create/Edit Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-2">{editingCampaign ? "Edit Donation Cause" : "Create Donation Cause"}</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">Set title, description and target fundraising goal.</p>
            <form onSubmit={handleSaveCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Cause / Campaign Title *</label>
                <input required type="text" placeholder="e.g. Welfare Fund, Alumni Scholarship" value={campaignForm.title} onChange={e => setCampaignForm({...campaignForm, title: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-medium mb-1">Target Fundraising Goal (₦) *</label>
                <input required type="number" min="1000" placeholder="5000000" value={campaignForm.targetAmount} onChange={e => setCampaignForm({...campaignForm, targetAmount: e.target.value})} className="w-full p-2 border rounded font-bold" />
              </div>
              <div>
                <label className="block font-medium mb-1">Description *</label>
                <textarea required rows={3} placeholder="Describe the cause purpose..." value={campaignForm.description} onChange={e => setCampaignForm({...campaignForm, description: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCampaignModal(false)} className="px-4 py-2 border rounded font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded font-semibold">{editingCampaign ? "Update Cause" : "Create Cause"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Create Dues Item Modal */}
      {showDuesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-2">Create Annual Dues / Levy Amount</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">Set mandatory dues title and amount to apply to all members.</p>
            <form onSubmit={handleCreateDues} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Dues Title *</label>
                <input required type="text" placeholder="e.g. 2025 Annual Membership Dues" value={duesForm.title} onChange={e => setDuesForm({...duesForm, title: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Amount (₦) *</label>
                  <input required type="number" min="100" placeholder="5000" value={duesForm.amount} onChange={e => setDuesForm({...duesForm, amount: e.target.value})} className="w-full p-2 border rounded font-bold" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Academic Year</label>
                  <input type="text" placeholder="2024/2025" value={duesForm.academicYear} onChange={e => setDuesForm({...duesForm, academicYear: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Dues Type</label>
                <select value={duesForm.type} onChange={e => setDuesForm({...duesForm, type: e.target.value})} className="w-full p-2 border rounded bg-white">
                  <option value="ANNUAL_DUES">ANNUAL_DUES</option>
                  <option value="SPECIAL_LEVY">SPECIAL_LEVY</option>
                  <option value="PROJECT_LEVY">PROJECT_LEVY</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Description (Optional)</label>
                <textarea rows={2} placeholder="Optional details or instructions for members..." value={duesForm.description} onChange={e => setDuesForm({...duesForm, description: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowDuesModal(false)} className="px-4 py-2 border rounded font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-white rounded font-semibold">Publish Dues</button>
              </div>
            </form>
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
                <input required type="text" placeholder="e.g. CLU/16/SC/MCB/007" value={rosterForm.matricNumber} onChange={e => setRosterForm({...rosterForm, matricNumber: e.target.value})} className="w-full p-2 border rounded font-mono" />
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
