import { useState } from "react";
type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface GalleryProps { onNavigate: (page: Page) => void; }

const albums = [
  {
    title: "AGM 2024",
    count: 48,
    date: "December 2024",
    cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format",
    category: "AGM",
  },
  {
    title: "Homecoming Reunion 2023",
    count: 127,
    date: "November 2023",
    cover: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop&auto=format",
    category: "Reunion",
  },
  {
    title: "Career Fair 2023",
    count: 34,
    date: "September 2023",
    cover: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop&auto=format",
    category: "Events",
  },
  {
    title: "Graduation Ceremony 2023",
    count: 215,
    date: "July 2023",
    cover: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop&auto=format",
    category: "Graduation",
  },
  {
    title: "Welfare Outreach 2023",
    count: 22,
    date: "May 2023",
    cover: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&h=400&fit=crop&auto=format",
    category: "Welfare",
  },
  {
    title: "Alumni Networking Night",
    count: 61,
    date: "March 2023",
    cover: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&h=400&fit=crop&auto=format",
    category: "Networking",
  },
  {
    title: "Campus Memories Archive",
    count: 340,
    date: "2001 – 2022",
    cover: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=400&fit=crop&auto=format",
    category: "Historical",
  },
  {
    title: "University Founders Day 2022",
    count: 88,
    date: "October 2022",
    cover: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=400&fit=crop&auto=format",
    category: "Events",
  },
];

const albums2 = [
  {
    title: "Alpha Set — Class Photo 2016",
    count: 95,
    date: "July 2016",
    cover: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop&auto=format",
    category: "Class Photos",
  },
  {
    title: "Individual Alumni Portraits",
    count: 420,
    date: "Ongoing",
    cover: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&auto=format",
    category: "Individual Photos",
  },
  {
    title: "Alumni Achievement Awards 2023",
    count: 38,
    date: "December 2023",
    cover: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&h=400&fit=crop&auto=format",
    category: "Events",
  },
];

const allAlbums = [...albums, ...albums2];
const categories = ["All", "AGM", "Reunion", "Events", "Graduation", "Welfare", "Networking", "Historical", "Class Photos", "Individual Photos"];

export default function Gallery({ onNavigate }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered = activeCategory === "All" ? allAlbums : allAlbums.filter(a => a.category === activeCategory);

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Memories</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Photo Gallery</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          A visual record of our events, reunions, milestones and shared memories.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Album Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((album) => (
            <div key={album.title} className="bg-white border border-[var(--border)] rounded overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <div className="h-48 bg-[var(--muted)] overflow-hidden relative">
                <img src={album.cover} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                </div>
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--secondary)] text-[var(--accent)] text-[10px] font-semibold uppercase tracking-wide rounded">
                  {album.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1 leading-snug">{album.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{album.date}</p>
                <p className="text-xs text-[var(--primary)] font-medium mt-1">{album.count} photos</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center bg-[var(--muted)] rounded p-8">
          <p className="font-display text-xl font-bold text-[var(--secondary)] mb-2">Have alumni photos to share?</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Submit your photos from events, reunions or university memories to the gallery administrator.</p>
          <button onClick={() => onNavigate("contact")} className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors">
            Submit Photos
          </button>
        </div>
      </div>
    </div>
  );
}
