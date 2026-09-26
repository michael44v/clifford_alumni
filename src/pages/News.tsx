import { useState } from "react";
type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface NewsProps { onNavigate: (page: Page) => void; }

const articles = [
  { id: 1, category: "Official Announcement", date: "November 28, 2024", title: "2024 Annual Dues Payment Deadline — December 31st", excerpt: "All verified members are reminded to settle the ₦5,000 annual dues before December 31, 2024 to retain Active Member status. Members who pay before November 30 will receive early-settlement recognition. Contact the Financial Secretary for payment queries.", featured: true, img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop&auto=format" },
  { id: 2, category: "Alumni Achievement", date: "November 20, 2024", title: "Dr. Chukwuemeka Obi (Set 2001) Appointed Minister of Education", excerpt: "The Clifford University Alumni Association congratulates our distinguished alumnus Dr. Chukwuemeka Obi on his appointment as the Minister of Education. Dr. Obi, a faculty of Law graduate, has served in various educational and legal capacities over a 20-year career.", featured: true, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop&auto=format" },
  { id: 3, category: "Welfare", date: "November 15, 2024", title: "Welfare Support Programme — Applications Now Open", excerpt: "The CUAA Welfare Committee has opened applications for the 2024 welfare support cycle. Members facing medical emergencies, bereavement, or financial distress may submit confidential requests through the Welfare Center on this platform.", featured: false, img: null },
  { id: 4, category: "School Management", date: "November 10, 2024", title: "Clifford University Receives NUC Accreditation for 12 Additional Programmes", excerpt: "Clifford University has received full accreditation from the National Universities Commission for 12 additional academic programmes across four faculties, cementing its status as a leading private university in Southeast Nigeria.", featured: false, img: null },
  { id: 5, category: "Career Milestone", date: "November 5, 2024", title: "Three CUAA Members Named in Forbes Africa 30 Under 30", excerpt: "We celebrate Adaeze Nwachukwu (Set 2012), Tunde Fashola (Set 2013), and Chidinma Ogu (Set 2014) on their recognition in this year's Forbes Africa 30 Under 30 list.", featured: false, img: null },
  { id: 6, category: "Wedding", date: "October 28, 2024", title: "Congratulations to Mr. Emeka Okafor and Miss Yetunde Adesanya", excerpt: "The Association extends warm congratulations to our member Emeka Okafor (Set 2008, Engineering) on his marriage to Miss Yetunde Adesanya in Lagos. We wish the couple a lifetime of joy.", featured: false, img: null },
  { id: 7, category: "Bereavement", date: "October 20, 2024", title: "In Memoriam: Engr. Victor Chukwu (Set 1998)", excerpt: "The Clifford University Alumni Association mourns the passing of Engr. Victor Chukwu, a proud member of our Set 1998. We extend our deepest condolences to his family and friends. A condolence register is open on the platform.", featured: false, img: null },
  { id: 8, category: "Important Notice", date: "October 15, 2024", title: "AGM 2024 — Date, Venue and Agenda Confirmed", excerpt: "The Annual General Meeting will hold on December 14, 2024 at the Clifford University Auditorium. All EXCO members are required to attend. Verified alumni are invited. Full agenda will be circulated two weeks prior.", featured: false, img: null },
];

const categories = ["All", "Official Announcement", "Alumni Achievement", "Welfare", "School Management", "Career Milestone", "Wedding", "Bereavement", "Important Notice"];

export default function News({ onNavigate }: NewsProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<typeof articles[0] | null>(null);

  const filtered = activeCategory === "All" ? articles : articles.filter(a => a.category === activeCategory);
  const featured = filtered.filter(a => a.featured);
  const regular = filtered.filter(a => !a.featured);

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

        {/* Featured */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {featured.map(article => (
              <div key={article.id} className="bg-white border border-[var(--border)] rounded overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(article)}>
                {article.img && (
                  <div className="h-44 bg-[var(--muted)] overflow-hidden">
                    <img src={article.img} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${categoryColor(article.category)}`}>{article.category}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--accent)] text-white">Featured</span>
                    <span className="text-[11px] text-[var(--muted-foreground)] ml-auto">{article.date}</span>
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2 leading-snug">{article.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{article.excerpt}</p>
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
                    <span className="text-[11px] text-[var(--muted-foreground)]">{article.date}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1 leading-snug">{article.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{article.excerpt}</p>
                </div>
                <span className="text-[var(--primary)] text-lg flex-shrink-0 mt-1">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded max-w-lg w-full overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {selected.img && (
              <div className="h-48 bg-[var(--muted)] overflow-hidden">
                <img src={selected.img} alt={selected.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${categoryColor(selected.category)}`}>{selected.category}</span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">{selected.date}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-lg">✕</button>
              </div>
              <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-4">{selected.title}</h2>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{selected.excerpt}</p>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mt-3">
                For the full details of this announcement, please contact the association secretariat or check your registered email for the official circular.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
