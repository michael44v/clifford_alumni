import { useState, useEffect } from "react";
import campusPhoto from "@/imports/ChatGPT_Image_Sep_11__2026__04_05_20_PM.png";
import { apiFetch } from "../lib/api";
import { CardSkeleton, Skeleton } from "../components/Skeleton";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";

interface HomeProps {
  onNavigate: (page: Page) => void;
  isLoggedIn: boolean;
}

const quickActions = [
  { icon: "🔍", label: "Find an Alumni", desc: "Search our directory", page: "directory" as Page },
  { icon: "📅", label: "Upcoming Events", desc: "Register & attend", page: "events" as Page },
  { icon: "💳", label: "Pay Dues", desc: "View & settle balances", page: "finance" as Page },
  { icon: "💼", label: "Job Opportunities", desc: "Career & business hub", page: "career" as Page },
  { icon: "🏪", label: "Business Directory", desc: "Alumni businesses", page: "business" as Page },
  { icon: "❤️", label: "Donate", desc: "Support the community", page: "donate" as Page },
];

export default function Home({ onNavigate, isLoggedIn }: HomeProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [featuredAlumni, setFeaturedAlumni] = useState<any[]>([]);
  const [alumniOfWeek, setAlumniOfWeek] = useState<any | null>(null);
  const [leadership, setLeadership] = useState<any[]>([]);
  const [showcasePhotos, setShowcasePhotos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Loading States
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingAlumniOfWeek, setIsLoadingAlumniOfWeek] = useState(true);
  const [isLoadingLeadership, setIsLoadingLeadership] = useState(true);
  const [isLoadingShowcase, setIsLoadingShowcase] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // Fetch stats
    setIsLoadingStats(true);
    apiFetch("/api/finance/impact-stats")
      .then(res => setStats(res))
      .catch(() => setStats(null))
      .finally(() => setIsLoadingStats(false));

    // Fetch Events
    setIsLoadingEvents(true);
    apiFetch("/api/events")
      .then(res => setEvents(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setEvents([]))
      .finally(() => setIsLoadingEvents(false));

    // Fetch News
    setIsLoadingAnnouncements(true);
    apiFetch("/api/news")
      .then(res => setAnnouncements(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setAnnouncements([]))
      .finally(() => setIsLoadingAnnouncements(false));

    // Fetch Leadership
    setIsLoadingLeadership(true);
    apiFetch("/api/admin/leadership")
      .then(res => setLeadership(Array.isArray(res) ? res : []))
      .catch(() => setLeadership([]))
      .finally(() => setIsLoadingLeadership(false));

    // Fetch Alumni of the week
    setIsLoadingAlumniOfWeek(true);
    apiFetch("/api/members/alumni-of-the-week")
      .then(res => setAlumniOfWeek(res || null))
      .catch(() => setAlumniOfWeek(null))
      .finally(() => setIsLoadingAlumniOfWeek(false));

    // Fetch Showcase Photos
    setIsLoadingShowcase(true);
    apiFetch("/api/gallery/landing-page")
      .then(res => setShowcasePhotos(Array.isArray(res) ? res : []))
      .catch(() => setShowcasePhotos([]))
      .finally(() => setIsLoadingShowcase(false));

    // Fetch Featured Alumni
    setIsLoadingFeatured(true);
    apiFetch("/api/members/featured")
      .then(res => setFeaturedAlumni(Array.isArray(res) ? res : []))
      .catch(() => setFeaturedAlumni([]))
      .finally(() => setIsLoadingFeatured(false));
  }, [isLoggedIn]);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative text-white overflow-hidden" style={{ minHeight: "90vh" }}>
        {/* Real campus photo */}
        <img
          src={campusPhoto}
          alt="Clifford University campus gate, Ihie, Isiala Ngwa"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Deep gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E4418]/80 via-[#0E4418]/65 to-[#071A09]/90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center" style={{ minHeight: "90vh" }}>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-5 leading-tight max-w-4xl pt-12">
            One Alumni.<br className="hidden sm:block" />
            <span className="text-[var(--accent)]"> One Network.</span>
            <br className="hidden sm:block" />
            One Community.
          </h1>
          <p className="text-white/75 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Connect with Clifford University graduates across Nigeria and the Diaspora. Build your network, grow your career, support your community, and stay connected to your roots.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate("register")}
              className="px-8 py-4 bg-[var(--accent)] text-white font-semibold rounded-lg text-sm tracking-wide hover:bg-[#A87A0A] transition-colors shadow-lg"
            >
              Join the Alumni Network
            </button>
            <button
              onClick={() => onNavigate("directory")}
              className="px-8 py-4 border border-white/40 text-white font-medium rounded-lg text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              Find an Alumnus
            </button>
          </div>

          {/* Dynamic Stats */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 pb-12">
            {isLoadingStats ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center flex flex-col items-center">
                  <Skeleton className="h-8 w-20 bg-white/20 rounded mb-1" />
                  <Skeleton className="h-3 w-24 bg-white/20 rounded" />
                </div>
              ))
            ) : (
              [
                { num: stats?.activeMembers ? `${stats.activeMembers}+` : "1,200+", label: "Registered Alumni" },
                { num: stats?.totalDonations ? `₦${(stats.totalDonations / 1000000).toFixed(0)}M+` : "₦45M+", label: "Raised & Impacted" },
                { num: stats?.projectsFunded ? `${stats.projectsFunded}` : "18", label: "Projects Funded" },
                { num: stats?.countriesCount ? `${stats.countriesCount}` : "12", label: "Countries Reached" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="font-display text-2xl sm:text-3xl font-bold text-[var(--accent)]">{num}</p>
                  <p className="text-xs text-white/60 mt-1 tracking-wide">{label}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── QUICK ACTIONS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ icon, label, desc, page }) => (
            <button
              key={label}
              onClick={() => onNavigate(page)}
              className="bg-white border border-[var(--border)] rounded-lg p-4 text-center hover:border-[var(--primary)] hover:shadow-sm transition-all group"
            >
              <span className="text-2xl block mb-2">{icon}</span>
              <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-snug">{label}</p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── EVENTS + ANNOUNCEMENTS ── */}
      <section className="bg-[var(--muted)] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Events */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-[var(--secondary)]">Upcoming Events</h2>
                <button onClick={() => onNavigate("events")} className="text-sm text-[var(--primary)] hover:underline font-medium">View all</button>
              </div>
              <div className="flex flex-col gap-4">
                {isLoadingEvents ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-[var(--border)] p-4 flex gap-4">
                      <Skeleton className="w-14 h-14 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : events.length > 0 ? (
                  events.slice(0, 3).map((e) => {
                    const eventDateObj = new Date(e.eventDate);
                    const dayStr = isNaN(eventDateObj.getTime()) ? "N/A" : eventDateObj.getDate();
                    const monthStr = isNaN(eventDateObj.getTime()) ? "" : eventDateObj.toLocaleString('default', { month: 'short' });
                    return (
                      <div key={e.id} onClick={() => onNavigate("events")} className="bg-white rounded-lg border border-[var(--border)] p-4 flex gap-4 hover:border-[var(--primary)] transition-colors cursor-pointer">
                        <div className="flex-shrink-0 w-14 text-center bg-[var(--secondary)] rounded-md py-2 px-1">
                          <p className="font-display text-lg font-bold text-[var(--accent)] leading-none">{dayStr}</p>
                          <p className="text-[10px] text-white/70 uppercase tracking-wide mt-0.5">{monthStr}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[var(--foreground)] leading-snug mb-1">{e.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">📍 {e.venue}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white border border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
                    <p className="text-sm">No upcoming events scheduled at this time.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-[var(--secondary)]">Latest Announcements</h2>
                <button onClick={() => onNavigate("news")} className="text-sm text-[var(--primary)] hover:underline font-medium">View all</button>
              </div>
              <div className="flex flex-col gap-4">
                {isLoadingAnnouncements ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-[var(--border)] p-4 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))
                ) : announcements.length > 0 ? (
                  announcements.slice(0, 3).map((a) => (
                    <div key={a.id} onClick={() => onNavigate("news")} className="bg-white rounded-lg border border-[var(--border)] p-4 hover:border-[var(--primary)] transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[var(--secondary)] text-white">{a.category?.replace('_', ' ') || 'Announcement'}</span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">{new Date(a.publishedAt || a.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-semibold text-sm text-[var(--foreground)] leading-snug mb-1">{a.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">{a.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-foreground)]">
                    <p className="text-sm">No announcements posted yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED ALUMNI ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-[var(--primary)] text-xs font-semibold tracking-widest uppercase mb-2">Our Distinguished Members</p>
          <h2 className="font-display text-3xl font-bold text-[var(--secondary)]">Featured Alumni</h2>
        </div>
        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : featuredAlumni.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAlumni.map((a) => {
              const fullName = `${a.firstName || ''} ${a.lastName || ''}`.trim();
              const photo = a.photoUrl || a.profilePhotoUrl || a.profilePhoto?.secureUrl || "https://static.vecteezy.com/system/resources/previews/055/582/028/non_2x/gray-circle-user-icon-profile-avatar-simple-symbol-vector.jpg";
              return (
                <div key={a.id} onClick={() => onNavigate("directory")} className="bg-white border border-[var(--border)] rounded-lg overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={photo}
                      alt={fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://static.vecteezy.com/system/resources/previews/055/582/028/non_2x/gray-circle-user-icon-profile-avatar-simple-symbol-vector.jpg";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-sm text-[var(--foreground)]">{fullName}</p>
                    <p className="text-[11px] text-[var(--primary)] font-medium mt-0.5">{a.setName || a.graduatingSet?.setName || 'Alumni'}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{a.profession || a.company || 'Alumnus'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-lg p-8 text-center text-[var(--muted-foreground)]">
            <p className="text-sm">No featured alumni to display right now.</p>
          </div>
        )}
        <div className="text-center mt-8">
          <button onClick={() => onNavigate("directory")} className="px-8 py-3 border border-[var(--primary)] text-[var(--primary)] font-semibold rounded-lg text-sm hover:bg-[var(--primary)] hover:text-white transition-colors">
            Browse Full Directory
          </button>
        </div>
      </section>

      {/* ── ALUMNI OF THE WEEK ── */}
      <section className="bg-[var(--secondary)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <p className="text-[var(--accent)] text-xs font-bold tracking-widest uppercase mb-2">Recognition</p>
              <h2 className="font-display text-3xl font-bold text-white mb-3">Alumni of the Week</h2>
              <p className="text-white/65 text-sm leading-relaxed">Each week, CLUAA recognises an outstanding alumnus making an impact in their field and community.</p>
            </div>
            <div className="md:col-span-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              {isLoadingAlumniOfWeek ? (
                <div className="w-full space-y-3">
                  <Skeleton className="h-6 w-1/3 bg-white/20" />
                  <Skeleton className="h-4 w-1/2 bg-white/20" />
                  <Skeleton className="h-16 w-full bg-white/20" />
                </div>
              ) : alumniOfWeek ? (
                <>
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[var(--accent)] flex-shrink-0 bg-slate-200 flex items-center justify-center">
                    <img
                      src={alumniOfWeek.photoUrl || alumniOfWeek.profilePhotoUrl || alumniOfWeek.profilePhoto?.secureUrl || "https://static.vecteezy.com/system/resources/previews/055/582/028/non_2x/gray-circle-user-icon-profile-avatar-simple-symbol-vector.jpg"}
                      alt={`${alumniOfWeek.firstName} ${alumniOfWeek.lastName}`}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://static.vecteezy.com/system/resources/previews/055/582/028/non_2x/gray-circle-user-icon-profile-avatar-simple-symbol-vector.jpg";
                      }}
                    />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-[var(--accent)] text-[var(--secondary)] text-[10px] font-bold rounded mb-2">🏆 This Week</span>
                    <h3 className="font-display text-xl font-bold text-white mb-1">{alumniOfWeek.firstName} {alumniOfWeek.lastName}</h3>
                    <p className="text-[var(--accent)] text-sm font-medium mb-2">{alumniOfWeek.setName || alumniOfWeek.graduatingSet?.setName || 'Alumni'}</p>
                    <p className="text-white/70 text-sm leading-relaxed">{alumniOfWeek.alumniOfWeekBio || alumniOfWeek.bio}</p>
                  </div>
                </>
              ) : (
                <div className="w-full text-center py-6 text-white/60">
                  <p className="text-sm">No Alumni of the Week selected for this period.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-[var(--primary)] text-xs font-semibold tracking-widest uppercase mb-2">Governing Body</p>
          <h2 className="font-display text-3xl font-bold text-[var(--secondary)]">EXCO Leadership</h2>
        </div>
        {isLoadingLeadership ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="w-20 h-20 mx-auto rounded-xl" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : leadership.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {leadership.map((l) => (
              <div key={l.id || l.name} onClick={() => onNavigate("leadership")} className="text-center group cursor-pointer">
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-[var(--primary)] bg-slate-100 flex items-center justify-center">
                  {l.photoUrl || l.photo?.secureUrl ? (
                    <img src={l.photoUrl || l.photo?.secureUrl} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-xl">
                      {l.name ? l.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "EX"}
                    </div>
                  )}
                </div>
                <p className="font-semibold text-sm text-[var(--foreground)]">{l.name}</p>
                <p className="text-[11px] text-[var(--primary)] mt-0.5 font-medium">{l.position}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-lg p-8 text-center text-[var(--muted-foreground)]">
            <p className="text-sm">No EXCO leadership profiles added yet.</p>
          </div>
        )}
        <div className="text-center mt-8">
          <button onClick={() => onNavigate("leadership")} className="px-6 py-3 border border-[var(--primary)] text-[var(--primary)] font-medium rounded-lg text-sm hover:bg-[var(--primary)] hover:text-white transition-colors">
            View Full EXCO Profiles
          </button>
        </div>
      </section>

      {/* ── GALLERY PREVIEW ── */}
      <section className="bg-[var(--muted)] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[var(--primary)] text-xs font-semibold tracking-widest uppercase mb-1">Memories & Showcase</p>
              <h2 className="font-display text-3xl font-bold text-[var(--secondary)]">Photo Gallery</h2>
            </div>
            <button onClick={() => onNavigate("gallery")} className="text-sm text-[var(--primary)] hover:underline font-medium">View all</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {isLoadingShowcase ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))
            ) : showcasePhotos.length > 0 ? (
              showcasePhotos.slice(0, 6).map((item, i) => {
                const imgUrl = item.photoUrl || item.media?.secureUrl;
                return (
                  <div key={item.id || i} onClick={() => onNavigate("gallery")} className="group relative aspect-square overflow-hidden rounded-lg bg-[var(--muted)] cursor-pointer border border-[var(--border)] shadow-sm">
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.caption || `Gallery photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col justify-end p-2 text-white">
                      {item.caption && <p className="text-[9px] opacity-0 group-hover:opacity-90 transition-opacity line-clamp-1 italic">{item.caption}</p>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white border border-[var(--border)] rounded-lg p-8 text-center text-[var(--muted-foreground)]">
                <p className="text-sm">No gallery photos showcase available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ── */}
      {!isLoggedIn && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-display text-3xl font-bold text-[var(--secondary)] mb-3">Not yet a member?</h2>
          <p className="text-[var(--muted-foreground)] text-sm mb-6 max-w-md mx-auto">
            Join the Clifford University Alumni Association. Register with your matriculation number, get verified, and unlock the full platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate("register")} className="px-8 py-4 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors">
              Register as Alumni
            </button>
            <button onClick={() => onNavigate("login")} className="px-8 py-4 border border-[var(--border)] font-medium rounded-lg text-sm hover:border-[var(--primary)] transition-colors">
              Sign in to your account
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
