import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface DirectoryProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

export default function Directory({ onNavigate, isLoggedIn }: DirectoryProps) {
  const [search, setSearch] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("ALL");
  const [selectedSetId, setSelectedSetId] = useState("ALL");

  const [faculties, setFaculties] = useState<any[]>([]);
  const [sets, setSets] = useState<any[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlum, setSelectedAlum] = useState<any | null>(null);

  useEffect(() => {
    // Fetch reference data for dropdowns
    Promise.all([
      apiFetch("/api/admin/faculties").catch(() => []),
      apiFetch("/api/admin/sets").catch(() => []),
    ]).then(([facRes, setRes]) => {
      setFaculties(Array.isArray(facRes) ? facRes : []);
      setSets(Array.isArray(setRes) ? setRes : []);
    });
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);

    let url = `/api/members/directory?search=${encodeURIComponent(search)}`;
    if (selectedFacultyId !== "ALL") url += `&facultyId=${encodeURIComponent(selectedFacultyId)}`;
    if (selectedSetId !== "ALL") url += `&setId=${encodeURIComponent(selectedSetId)}`;

    apiFetch(url)
      .then(res => setAlumni(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [isLoggedIn, search, selectedFacultyId, selectedSetId]);

  const filtered = alumni.filter(a => {
    const matchFaculty = selectedFacultyId === "ALL" || a.facultyId === selectedFacultyId || a.faculty?.id === selectedFacultyId;
    const matchSet = selectedSetId === "ALL" || a.graduatingSetId === selectedSetId || a.graduatingSet?.id === selectedSetId;
    return matchFaculty && matchSet;
  });

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Network</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Alumni Directory</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Search and connect with Clifford University graduates across all faculties and sets.
        </p>
      </div>

      {!isLoggedIn && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-amber-500 text-lg">🔒</span>
            <p className="text-sm text-amber-800 flex-1">Full profiles and contact options are available to verified members only.</p>
            <div className="flex gap-2">
              <button onClick={() => onNavigate("login")} className="px-4 py-2 text-xs font-medium border border-amber-400 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">Sign In</button>
              <button onClick={() => onNavigate("register")} className="px-4 py-2 text-xs font-semibold bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--accent)] transition-colors">Join Now</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search & Filters */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="text"
              placeholder="Search by name, profession or department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <button className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--accent)] transition-colors">Search</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={selectedFacultyId} onChange={e => setSelectedFacultyId(e.target.value)} className="px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option value="ALL">All Faculties</option>
              {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <select value={selectedSetId} onChange={e => setSelectedSetId(e.target.value)} className="px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option value="ALL">All Graduating Sets</option>
              {sets.map(s => <option key={s.id} value={s.id}>{s.setName} ({s.graduationYear})</option>)}
            </select>
          </div>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Showing <strong>{filtered.length}</strong> alumni
          {search && ` matching "${search}"`}
        </p>

        {loading ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">Loading directory...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((alum) => {
              const fullName = `${alum.firstName || ''} ${alum.lastName || ''}`.trim() || 'Alumnus';
              const imgUrl = alum.profilePhoto?.secureUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format";
              const setName = alum.graduatingSet?.setName || "Alumni";
              const setYear = alum.graduatingSet?.graduationYear || alum.graduatingSet?.year || "";
              const facName = alum.faculty?.name || "";

              return (
                <div key={alum.id || fullName} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedAlum(alum)}>
                  <div className="h-40 bg-[var(--muted)] overflow-hidden">
                    <img src={imgUrl} alt={fullName} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-0.5">
                      <p className="font-semibold text-sm text-[var(--foreground)] leading-snug">{fullName}</p>
                      <span className="ml-2 flex-shrink-0 w-2 h-2 rounded-full mt-1.5 bg-green-500" />
                    </div>
                    <p className="text-[11px] text-[var(--primary)] font-medium">{setName} {setYear ? `· ${setYear}` : ''}</p>
                    {facName && <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{facName.replace("Faculty of ", "")}</p>}
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{alum.profession || alum.company || "Alumnus"}</p>
                    <button className="mt-3 w-full py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No alumni found</p>
            <p className="text-sm mt-1">{isLoggedIn ? "Try adjusting your search terms or filters." : "Please sign in to view the verified alumni directory."}</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedAlum && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAlum(null)}>
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="h-48 bg-[var(--muted)] overflow-hidden relative">
              <img src={selectedAlum.profilePhoto?.secureUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format"} alt={`${selectedAlum.firstName} ${selectedAlum.lastName}`} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedAlum(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70">✕</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-xl font-bold text-[var(--secondary)]">{selectedAlum.firstName} {selectedAlum.lastName}</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-green-100 text-green-700">Verified</span>
              </div>
              <p className="text-[var(--primary)] font-medium text-sm mb-3">
                {selectedAlum.graduatingSet?.setName} ({selectedAlum.graduatingSet?.graduationYear}) · {selectedAlum.faculty?.name}
              </p>
              <div className="space-y-1.5 text-sm">
                <p><span className="font-medium">Profession:</span> <span className="text-[var(--muted-foreground)]">{selectedAlum.profession || 'N/A'}</span></p>
                <p><span className="font-medium">Company:</span> <span className="text-[var(--muted-foreground)]">{selectedAlum.company || 'N/A'}</span></p>
                {selectedAlum.email && <p><span className="font-medium">Email:</span> <span className="text-[var(--muted-foreground)]">{selectedAlum.email}</span></p>}
                {selectedAlum.phone && <p><span className="font-medium">Phone:</span> <span className="text-[var(--muted-foreground)]">{selectedAlum.phone}</span></p>}
              </div>
              {isLoggedIn ? (
                <button onClick={() => setSelectedAlum(null)} className="mt-5 w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors">
                  Close Profile
                </button>
              ) : (
                <button onClick={() => { onNavigate("login"); setSelectedAlum(null); }} className="mt-5 w-full py-3 border border-[var(--primary)] text-[var(--primary)] font-semibold rounded-lg text-sm hover:bg-[var(--primary)] hover:text-white transition-colors">
                  Sign in to Contact
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
