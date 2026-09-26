import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface GalleryProps { onNavigate: (page: Page) => void; }

const categories = ["All", "AGM", "REUNION", "EVENTS", "GRADUATION", "WELFARE", "NETWORKING", "HISTORICAL", "CLASS_PHOTOS"];

export default function Gallery({ onNavigate }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let url = "/api/gallery/albums";
    if (activeCategory !== "All") url += `?category=${encodeURIComponent(activeCategory)}`;
    apiFetch(url)
      .then(res => setAlbums(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered = albums;

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
        {loading ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">Loading photo gallery...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((album) => {
              const coverImg = album.photos?.[0]?.media?.url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format";
              const photoCount = album._count?.photos || album.photos?.length || 0;

              return (
                <div key={album.id || album.title} className="bg-white border border-[var(--border)] rounded overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="h-48 bg-[var(--muted)] overflow-hidden relative">
                    <img src={coverImg} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                    </div>
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--secondary)] text-[var(--accent)] text-[10px] font-semibold uppercase tracking-wide rounded">
                      {album.category || "GALLERY"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1 leading-snug">{album.title}</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">{album.year || new Date(album.createdAt).getFullYear()}</p>
                    <p className="text-xs text-[var(--primary)] font-medium mt-1">{photoCount} photos</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <p className="text-4xl mb-3">🖼️</p>
            <p className="font-semibold">No photo albums found</p>
            <p className="text-sm mt-1">Check back later for newly published albums.</p>
          </div>
        )}

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
