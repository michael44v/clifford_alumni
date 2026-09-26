import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface BusinessProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

const categories = ["All Categories", "Technology & ICT", "Legal & Professional", "Finance & Investment", "Agriculture & Food", "Education & Training", "Health & Wellness", "Construction & Engineering", "Media & Creative", "Retail & Commerce", "Transport & Logistics"];

export default function BusinessDirectory({ onNavigate, isLoggedIn }: BusinessProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const [showListForm, setShowListForm] = useState(false);
  const [newBiz, setNewBiz] = useState({
    businessName: "",
    category: "Technology & ICT",
    industry: "Services",
    description: "",
    services: "",
    stateCity: "",
    website: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    setLoading(true);
    let url = `/api/business?search=${encodeURIComponent(search)}`;
    if (category !== "All Categories") url += `&category=${encodeURIComponent(category)}`;
    apiFetch(url)
      .then(res => setBusinesses(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [search, category]);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/business", {
        method: "POST",
        body: JSON.stringify(newBiz),
      });
      alert("Business listing submitted! It will appear once approved by admin.");
      setShowListForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to submit business listing");
    }
  };

  const filtered = businesses;

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Support Alumni Businesses</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Business & Services Directory</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Discover products, services, and professional expertise from Clifford University alumni. Support your own community.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Search & filter bar */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search businesses, services, or alumni name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            {isLoggedIn ? (
              <button onClick={() => setShowListForm(true)} className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--accent)] transition-colors whitespace-nowrap">
                + List Your Business
              </button>
            ) : (
              <button onClick={() => onNavigate("login")} className="px-5 py-2.5 border border-[var(--primary)] text-[var(--primary)] rounded-lg text-sm font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors whitespace-nowrap">
                List Your Business
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.slice(0, 8).map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === c ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Featured */}
        {category === "All Categories" && !search && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold text-[var(--secondary)] mb-4">Featured Businesses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {businesses.filter(b => b.featured).map(b => (
                <div key={b.id} onClick={() => setSelectedBusiness(b)} className="bg-white border border-[var(--primary)] rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-40 bg-[var(--muted)] overflow-hidden relative">
                    <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-[var(--accent)] text-white text-[10px] font-bold rounded-md">⭐ Featured</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-display text-lg font-bold text-[var(--secondary)]">{b.name}</h3>
                      <span className="px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] rounded-md font-medium flex-shrink-0">{b.category}</span>
                    </div>
                    <p className="text-xs text-[var(--primary)] font-medium mb-2">{b.owner} · {b.set}</p>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-2">{b.services}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">📍 {b.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All listings */}
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Showing <strong>{filtered.length}</strong> listing{filtered.length !== 1 ? "s" : ""}
        </p>

        {loading ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">Loading business directory...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(b => {
              const ownerName = b.owner ? `${b.owner.firstName || ''} ${b.owner.lastName || ''}` : "Verified Alumnus";
              const logo = b.logo?.url || b.banner?.url || "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=200&fit=crop&auto=format";

              return (
                <div key={b.id} onClick={() => setSelectedBusiness(b)} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md hover:border-[var(--primary)] transition-all cursor-pointer">
                  <div className="h-36 bg-[var(--muted)] overflow-hidden">
                    <img src={logo} alt={b.businessName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm text-[var(--foreground)] leading-snug">{b.businessName}</h3>
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                    </div>
                    <p className="text-[11px] text-[var(--primary)] font-medium">{ownerName}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 font-medium">{b.category}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed line-clamp-2">{b.services || b.description}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-1.5">📍 {b.stateCity || "Nigeria"}</p>
                    <button className="mt-3 w-full py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-semibold">No businesses found</p>
            <p className="text-sm mt-1">Try a different search or category.</p>
          </div>
        )}

        <div className="mt-10 bg-[var(--muted)] rounded-xl p-6 text-center">
          <p className="font-display text-xl font-bold text-[var(--secondary)] mb-2">Own a Business or Offer a Service?</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">List your business in the CLUAA directory and get discovered by over 3,000 verified alumni members.</p>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">All listings are subject to admin approval before going live.</p>
          <button onClick={() => isLoggedIn ? setShowListForm(true) : onNavigate("login")} className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors">
            Submit Your Business Listing
          </button>
        </div>
      </div>

      {/* Business Detail Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBusiness(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="h-48 bg-[var(--muted)] overflow-hidden relative">
              <img src={selectedBusiness.logo?.url || selectedBusiness.banner?.url || "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=200&fit=crop&auto=format"} alt={selectedBusiness.businessName} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedBusiness(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70">✕</button>
            </div>
            <div className="p-6">
              <span className="inline-block px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] font-semibold rounded-md mb-3">{selectedBusiness.category}</span>
              <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-1">{selectedBusiness.businessName}</h2>
              <p className="text-[var(--primary)] text-sm font-medium mb-4">{selectedBusiness.owner ? `${selectedBusiness.owner.firstName} ${selectedBusiness.owner.lastName}` : 'Verified Alumnus'}</p>
              <div className="space-y-2 text-sm mb-5">
                <p><span className="font-medium">Services:</span> <span className="text-[var(--muted-foreground)]">{selectedBusiness.services || selectedBusiness.description}</span></p>
                <p><span className="font-medium">Location:</span> <span className="text-[var(--muted-foreground)]">📍 {selectedBusiness.stateCity || 'Nigeria'}</span></p>
                {selectedBusiness.phone && <p><span className="font-medium">Phone:</span> <span className="text-[var(--muted-foreground)]">{selectedBusiness.phone}</span></p>}
                {selectedBusiness.email && <p><span className="font-medium">Email:</span> <span className="text-[var(--muted-foreground)]">{selectedBusiness.email}</span></p>}
                {selectedBusiness.website && <p><span className="font-medium">Website:</span> <span className="text-[var(--primary)]">{selectedBusiness.website}</span></p>}
              </div>
              <button onClick={() => setSelectedBusiness(null)} className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List Business Modal */}
      {showListForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowListForm(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold text-[var(--secondary)]">List Your Business</h3>
              <button onClick={() => setShowListForm(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-lg">✕</button>
            </div>
            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Business Name *</label>
                <input required type="text" value={newBiz.businessName} onChange={e => setNewBiz({...newBiz, businessName: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Category *</label>
                <select value={newBiz.category} onChange={e => setNewBiz({...newBiz, category: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                  {categories.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Description *</label>
                <textarea required rows={2} value={newBiz.description} onChange={e => setNewBiz({...newBiz, description: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" placeholder="Brief overview of your business..." />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Services Offered *</label>
                <input required type="text" value={newBiz.services} onChange={e => setNewBiz({...newBiz, services: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" placeholder="e.g. Consulting, Web Design" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">State / City</label>
                <input type="text" value={newBiz.stateCity} onChange={e => setNewBiz({...newBiz, stateCity: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" placeholder="Lagos, Nigeria" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">Website (optional)</label>
                <input type="text" value={newBiz.website} onChange={e => setNewBiz({...newBiz, website: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" placeholder="https://example.com" />
              </div>

              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                Your listing will be reviewed by the CLUAA admin team before going live.
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowListForm(false)} className="flex-1 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium hover:border-[var(--primary)] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--accent)] transition-colors">Submit for Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
