import { useState } from "react";
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

const alumniData = [
  { name: "Adaeze Nwachukwu", gradSet: "Alpha Set", gradYear: "2016", faculty: "Faculty of Law", dept: "Corporate Law", profession: "Senior Counsel", location: "FCT (Abuja)", status: "Verified", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format" },
  { name: "Emeka Okafor", gradSet: "Beta Set", gradYear: "2017", faculty: "Faculty of Natural Sciences", dept: "Computer Science", profession: "Tech Entrepreneur", location: "Lagos", status: "Verified", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format" },
  { name: "Ngozi Eze", gradSet: "Alpha Set", gradYear: "2016", faculty: "Faculty of Management Sciences", dept: "Business Administration", profession: "Business Consultant", location: "Lagos", status: "Verified", img: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=200&fit=crop&auto=format" },
  { name: "Chidi Obiora", gradSet: "Gamma Set", gradYear: "2018", faculty: "Faculty of Social Sciences & Humanities", dept: "Economics", profession: "Investment Analyst", location: "Rivers", status: "Verified", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format" },
  { name: "Fatima Yusuf", gradSet: "Beta Set", gradYear: "2017", faculty: "Faculty of Natural Sciences", dept: "Biochemistry", profession: "Research Scientist", location: "Kano", status: "Verified", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format" },
  { name: "Oluwaseun Adeyemi", gradSet: "Delta Set", gradYear: "2019", faculty: "Faculty of Social Sciences & Humanities", dept: "Mass Communication", profession: "Media Executive", location: "Lagos", status: "Active", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format" },
  { name: "Amaka Okoro", gradSet: "Alpha Set", gradYear: "2016", faculty: "Faculty of Education", dept: "English Education", profession: "University Lecturer", location: "Enugu", status: "Verified", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&auto=format" },
  { name: "Babatunde Oladele", gradSet: "Gamma Set", gradYear: "2018", faculty: "Faculty of Law", dept: "Commercial Law", profession: "Corporate Lawyer", location: "Lagos", status: "Active", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&auto=format" },
  { name: "Chidinma Obi", gradSet: "Epsilon Set", gradYear: "2020", faculty: "Faculty of Natural Sciences", dept: "Biochemistry", profession: "Research Officer", location: "Anambra", status: "Active", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&auto=format" },
  { name: "Kayode Fashola", gradSet: "Delta Set", gradYear: "2019", faculty: "Faculty of Engineering & Technology", dept: "Civil Engineering", profession: "Structural Engineer", location: "FCT (Abuja)", status: "Verified", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&auto=format" },
  { name: "Ifeoma Nwoye", gradSet: "Beta Set", gradYear: "2017", faculty: "Faculty of Social Sciences & Humanities", dept: "Economics", profession: "Economic Analyst", location: "Diaspora", status: "Verified", img: "https://images.unsplash.com/photo-1580894742597-87bc8789db3d?w=200&h=200&fit=crop&auto=format" },
  { name: "Michael Uche", gradSet: "Gamma Set", gradYear: "2018", faculty: "Faculty of Management Sciences", dept: "Agribusiness", profession: "Agribusiness Director", location: "Abia", status: "Active", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format" },
];

export default function Directory({ onNavigate, isLoggedIn }: DirectoryProps) {
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("All Faculties");
  const [gradSet, setGradSet] = useState("All Sets");
  const [location, setLocation] = useState("All Locations");
  const [selectedAlum, setSelectedAlum] = useState<typeof alumniData[0] | null>(null);

  const filtered = alumniData.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.profession.toLowerCase().includes(q) || a.dept.toLowerCase().includes(q);
    const matchFaculty = faculty === "All Faculties" || a.faculty === faculty;
    const matchSet = gradSet === "All Sets" || a.gradSet === gradSet;
    const matchLocation = location === "All Locations" || a.location === location;
    return matchSearch && matchFaculty && matchSet && matchLocation;
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
          Showing <strong>{filtered.length}</strong> of <strong>{alumniData.length}</strong> alumni
          {search && ` matching "${search}"`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((alum) => (
            <div key={alum.name} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedAlum(alum)}>
              <div className="h-40 bg-[var(--muted)] overflow-hidden">
                <img src={alum.img} alt={alum.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-0.5">
                  <p className="font-semibold text-sm text-[var(--foreground)] leading-snug">{alum.name}</p>
                  <span className={`ml-2 flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${alum.status === "Verified" ? "bg-green-500" : "bg-amber-400"}`} />
                </div>
                <p className="text-[11px] text-[var(--primary)] font-medium">{alum.gradSet} · {alum.gradYear}</p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{alum.faculty.replace("Faculty of ", "")}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{alum.profession}</p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">📍 {alum.location}</p>
                <button className="mt-3 w-full py-1.5 border border-[var(--border)] rounded-lg text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No alumni found</p>
            <p className="text-sm mt-1">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedAlum && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAlum(null)}>
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="h-48 bg-[var(--muted)] overflow-hidden relative">
              <img src={selectedAlum.img} alt={selectedAlum.name} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedAlum(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70">✕</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-xl font-bold text-[var(--secondary)]">{selectedAlum.name}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${selectedAlum.status === "Verified" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{selectedAlum.status}</span>
              </div>
              <p className="text-[var(--primary)] font-medium text-sm mb-3">{selectedAlum.gradSet} ({selectedAlum.gradYear}) · {selectedAlum.faculty}</p>
              <div className="space-y-1.5 text-sm">
                <p><span className="font-medium">Department:</span> <span className="text-[var(--muted-foreground)]">{selectedAlum.dept}</span></p>
                <p><span className="font-medium">Profession:</span> <span className="text-[var(--muted-foreground)]">{selectedAlum.profession}</span></p>
                <p><span className="font-medium">Location:</span> <span className="text-[var(--muted-foreground)]">📍 {selectedAlum.location}</span></p>
              </div>
              {isLoggedIn ? (
                <button className="mt-5 w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors">
                  Send Message
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
