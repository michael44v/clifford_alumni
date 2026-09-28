import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface CareerHubProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

const categories = ["All", "General", "Career", "Internship", "Freelance"];

export default function CareerHub({ onNavigate, isLoggedIn }: CareerHubProps) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "Career" });

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    let url = "/api/community/posts";
    if (categoryFilter !== "All") url += `?category=${encodeURIComponent(categoryFilter)}`;
    apiFetch(url)
      .then(res => setPosts(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [isLoggedIn, categoryFilter]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await apiFetch(`/api/community/posts/${editingJob.id}`, {
          method: "PUT",
          body: JSON.stringify(newPost),
        });
        alert("Opportunity post updated successfully!");
      } else {
        await apiFetch("/api/community/posts", {
          method: "POST",
          body: JSON.stringify(newPost),
        });
        alert("Post created successfully!");
      }
      setShowPostModal(false);
      setEditingJob(null);
      setNewPost({ title: "", content: "", category: "Career" });
      const res = await apiFetch("/api/community/posts");
      setPosts(res.data || []);
    } catch (err: any) {
      alert(err.message || "Failed to save post");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity post?")) return;
    try {
      await apiFetch(`/api/community/posts/${id}`, { method: "DELETE" });
      alert("Post deleted successfully.");
      const res = await apiFetch("/api/community/posts");
      setPosts(res.data || []);
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    }
  };

  const filteredJobs = posts;

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Opportunities</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Career & Business Hub</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Jobs, internships, freelance opportunities and a curated directory of alumni-owned businesses.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--muted)] p-1 rounded w-fit mb-8">
          <button className="px-5 py-2 rounded text-sm font-medium bg-white shadow-sm">Job Board</button>
          <button onClick={() => onNavigate("business")} className="px-5 py-2 rounded text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Business Directory ↗</button>
        </div>

        <>
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(c => (
                <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${categoryFilter === c ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--border)] hover:border-[var(--primary)]"}`}>{c}</button>
              ))}
              {isLoggedIn && (
                <button onClick={() => setShowPostModal(true)} className="ml-auto px-4 py-1.5 bg-[var(--secondary)] text-white rounded text-xs font-semibold hover:bg-[var(--primary)] transition-colors">
                  + Post Opportunity
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">Loading career opportunities...</div>
            ) : !isLoggedIn ? (
              <div className="text-center py-12 text-[var(--muted-foreground)] bg-white rounded border border-[var(--border)]">
                <p className="font-semibold mb-2">Sign in to view career opportunities</p>
                <button onClick={() => onNavigate("login")} className="px-5 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded hover:bg-[var(--accent)] transition-colors">Sign In</button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted-foreground)] bg-white rounded border border-[var(--border)]">
                <p className="font-semibold">No career opportunities found</p>
                <p className="text-xs mt-1">Be the first to post an opportunity for fellow alumni!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredJobs.map(job => {
                  const authorName = job.author ? `${job.author.firstName || ''} ${job.author.lastName || ''}`.trim() : "Alumnus";

                  return (
                    <div key={job.id} className="bg-white border border-[var(--border)] rounded p-5 hover:border-[var(--primary)] transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-green-100 text-green-700">{job.category || "Career"}</span>
                            <span className="text-[11px] text-[var(--muted-foreground)]">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-semibold text-[var(--foreground)] mb-0.5">{job.title}</h3>
                          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mt-2 whitespace-pre-wrap">{job.content}</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-3">Posted by: <span className="text-[var(--foreground)] font-medium">{authorName}</span></p>
                        </div>

                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingJob(job);
                              setNewPost({ title: job.title, content: job.content, category: job.category || "Career" });
                              setShowPostModal(true);
                            }}
                            className="px-3 py-1 border border-[var(--border)] rounded text-xs font-semibold hover:border-[var(--primary)] text-[var(--foreground)]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(job.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </>

        <div className="mt-10 bg-[var(--muted)] rounded p-6 text-center">
          <h3 className="font-display text-xl font-bold text-[var(--secondary)] mb-2">Mentorship Programme</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Senior alumni can register as mentors. Junior alumni can request mentorship in their field of interest.</p>
          <button onClick={() => !isLoggedIn && onNavigate("login")} className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors">
            {isLoggedIn ? "Join Mentorship Programme" : "Sign in to Access Mentorship"}
          </button>
        </div>
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPostModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-[var(--secondary)]">{editingJob ? "Edit Opportunity Post" : "Post Opportunity"}</h3>
              <button onClick={() => setShowPostModal(false)} className="text-lg">✕</button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Title *</label>
                <input required type="text" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm" placeholder="Job Title / Opportunity" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Category</label>
                <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm bg-white">
                  <option value="Career">Career / Job</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Details & Description *</label>
                <textarea required rows={4} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm" placeholder="Provide details, requirements, application contact..." />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 py-2 border border-[var(--border)] rounded text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-[var(--primary)] text-white rounded text-sm font-semibold hover:bg-[var(--accent)]">Submit Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
