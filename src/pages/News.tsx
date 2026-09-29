import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface NewsProps { onNavigate: (page: Page) => void; }

const categories = ["All", "GENERAL", "ALUMNI_ACHIEVEMENT", "UNIVERSITY_NEWS", "WELFARE", "CAREER", "EVENT_RECAP", "CHAPTER_NEWS"];

export default function News({ onNavigate }: NewsProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    // Configurable news endpoint placeholder (VITE_NEWS_API_ENDPOINT or default /api/news)
    const newsEndpointBase = import.meta.env.VITE_NEWS_API_ENDPOINT || "/api/news";
    let url = newsEndpointBase;
    if (activeCategory !== "All") {
      const paramChar = url.includes("?") ? "&" : "?";
      url += `${paramChar}category=${encodeURIComponent(activeCategory)}`;
    }

    apiFetch(url)
      .then(res => setArticles(res.data || (Array.isArray(res) ? res : [])))
      .catch(err => {
        console.error("Failed to fetch news from endpoint:", url, err);
        setArticles([]);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered = articles;
  const featured = filtered.slice(0, 2);
  const regular = filtered.slice(2);

  const categoryColor = (cat: string) => {
    const map: Record<string, string> = {
      "Official Announcement": "bg-[var(--secondary)] text-white",
      "Alumni Achievement": "bg-amber-100 text-amber-800",
      "Welfare": "bg-red-50 text-red-700",
      "School Management": "bg-blue-50 text-blue-700",
      "Career Milestone": "bg-green-50 text-green-700",
      "Wedding": "bg-pink-50 text-pink-700",
      "Bereavement": "bg-gray-100 text-gray-600",
      "Important Notice": "bg-orange-50 text-orange-700",
    };
    return map[cat] || "bg-[var(--muted)] text-[var(--muted-foreground)]";
  };

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Communication</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">News & Announcements</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Official updates, alumni achievements, community notices and important announcements.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeCategory === cat ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">Loading news...</div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {featured.map(article => (
                  <div key={article.id} className="bg-white border border-[var(--border)] rounded overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(article)}>
                    {article.banner?.url && (
                      <div className="h-44 bg-[var(--muted)] overflow-hidden">
                        <img src={article.banner.url} alt={article.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${categoryColor(article.category)}`}>{article.category}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--accent)] text-white">Latest</span>
                        <span className="text-[11px] text-[var(--muted-foreground)] ml-auto">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold text-[var(--foreground)] mb-2 leading-snug">{article.title}</h3>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2">{article.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regular articles */}
            <div className="flex flex-col gap-3">
              {regular.map(article => (
                <div key={article.id} className="bg-white border border-[var(--border)] rounded p-5 hover:border-[var(--primary)] transition-colors cursor-pointer" onClick={() => setSelected(article)}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${categoryColor(article.category)}`}>{article.category}</span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1 leading-snug">{article.title}</h3>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">{article.content}</p>
                    </div>
                    <span className="text-[var(--primary)] text-lg flex-shrink-0 mt-1">→</span>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-[var(--muted-foreground)]">
                <p className="text-4xl mb-3">📰</p>
                <p className="font-semibold">No news articles found</p>
                <p className="text-sm mt-1">Check back later for official announcements and news.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Article Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded max-w-lg w-full overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {selected.banner?.url && (
              <div className="h-48 bg-[var(--muted)] overflow-hidden">
                <img src={selected.banner.url} alt={selected.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${categoryColor(selected.category)}`}>{selected.category}</span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">{new Date(selected.publishedAt || selected.createdAt).toLocaleDateString()}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-lg">✕</button>
              </div>
              <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-4">{selected.title}</h2>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">{selected.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
