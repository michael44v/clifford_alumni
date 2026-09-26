import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface DirectoryProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

export const GRADUATION_SETS = [
  { set: "Alpha Set",   year: "2016" },
  { set: "Beta Set",    year: "2017" },
  { set: "Gamma Set",   year: "2018" },
  { set: "Delta Set",   year: "2019" },
  { set: "Epsilon Set", year: "2020" },
  { set: "Zeta Set",    year: "2021" },
  { set: "Eta Set",     year: "2022" },
  { set: "Theta Set",   year: "2023" },
  { set: "Iota Set",    year: "2024" },
  { set: "Kappa Set",   year: "2025" },
  { set: "Lambda Set",  year: "2026" },
];

export const CLU_FACULTIES = [
  "Faculty of Science",
  "Faculty of Basic Medical Sciences",
  "Faculty of Management & Social Sciences",
  "Faculty of Humanities/Education",
  "Law Faculty",
  "JUPEB Program",
  "OTHERS",
];

export const NIGERIAN_LOCATIONS = [
  "FCT (Abuja)", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Diaspora",
];

export default function Directory({ onNavigate, isLoggedIn }: DirectoryProps) {
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("All Faculties");
  const [gradSet, setGradSet] = useState("All Sets");
  const [location, setLocation] = useState("All Locations");
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlum, setSelectedAlum] = useState<any | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    let url = `/api/members/directory?search=${encodeURIComponent(search)}`;
    if (location !== "All Locations") url += `&state=${encodeURIComponent(location)}`;
    apiFetch(url)
      .then(res => setAlumni(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [isLoggedIn, search, location]);

  const filtered = alumni.filter(a => {
    const facultyName = a.faculty?.name || "";
    const setName = a.graduatingSet?.setName || "";
    const matchFaculty = faculty === "All Faculties" || facultyName === faculty;
    const matchSet = gradSet === "All Sets" || setName === gradSet;
    return matchFaculty && matchSet;
  });

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Network</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Alumni Directory</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Search and connect with Clifford University graduates across all faculties, sets, and locations.
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={faculty} onChange={e => setFaculty(e.target.value)} className="px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option>All Faculties</option>
              {CLU_FACULTIES.map(f => <option key={f}>{f}</option>)}
            </select>
            <select value={gradSet} onChange={e => setGradSet(e.target.value)} className="px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option>All Sets</option>
              {GRADUATION_SETS.map(s => <option key={s.set} value={s.set}>{s.set} ({s.year})</option>)}
            </select>
            <select value={location} onChange={e => setLocation(e.target.value)} className="px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option>All Locations</option>
              {NIGERIAN_LOCATIONS.map(l => <option key={l}>{l}</option>)}
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
              const imgUrl = alum.profilePhoto?.url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format";
              const setName = alum.graduatingSet?.setName || "Alumni";
              const setYear = alum.graduatingSet?.year || "";
              const facName = alum.faculty?.name || "";
              const locState = alum.location?.state || "Nigeria";

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
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">📍 {locState}</p>
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
              <img src={selectedAlum.profilePhoto?.url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format"} alt={`${selectedAlum.firstName} ${selectedAlum.lastName}`} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedAlum(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70">✕</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-xl font-bold text-[var(--secondary)]">{selectedAlum.firstName} {selectedAlum.lastName}</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-green-100 text-green-700">Verified</span>
              </div>
              <p className="text-[var(--primary)] font-medium text-sm mb-3">
                {selectedAlum.graduatingSet?.setName} ({selectedAlum.graduatingSet?.year}) · {selectedAlum.faculty?.name}
              </p>
              <div className="space-y-1.5 text-sm">
                <p><span className="font-medium">Profession:</span> <span className="text-[var(--muted-foreground)]">{selectedAlum.profession || 'N/A'}</span></p>
                <p><span className="font-medium">Company:</span> <span className="text-[var(--muted-foreground)]">{selectedAlum.company || 'N/A'}</span></p>
                <p><span className="font-medium">Location:</span> <span className="text-[var(--muted-foreground)]">📍 {selectedAlum.location?.state || 'Nigeria'}</span></p>
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
