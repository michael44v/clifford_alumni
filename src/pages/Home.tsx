import campusPhoto from "@/imports/ChatGPT_Image_Sep_11__2026__04_05_20_PM.png";
import cuaaLogo from "@/imports/CUAA.jpg";

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

const upcomingEvents = [
  { date: "Dec 14", month: "2024", title: "Annual General Meeting (AGM) 2024", location: "Clifford University, Ihie, Isiala Ngwa", type: "AGM", registered: 128 },
  { date: "Jan 18", month: "2025", title: "Alumni Homecoming & Networking Gala", location: "Merit House Events Centre, Abuja", type: "Networking", registered: 74 },
  { date: "Feb 22", month: "2025", title: "Career Fair & Alumni Business Expo", location: "Online / Zoom", type: "Career", registered: 56 },
];

const announcements = [
  { category: "Official", date: "Nov 28, 2024", title: "2024 Annual Dues Payment Deadline — December 31st", excerpt: "All verified members are reminded to settle the ₦5,000 annual dues before year-end to retain Active Member status." },
  { category: "Achievement", date: "Nov 20, 2024", title: "Dr. Chukwuemeka Obi (Alpha Set) Appointed Minister of Education", excerpt: "The association congratulates our distinguished alumnus on this prestigious national appointment." },
  { category: "Welfare", date: "Nov 15, 2024", title: "Welfare Support Programme Now Open for Applications", excerpt: "Members facing medical emergencies, bereavement or financial distress can now submit confidential applications." },
];

const featuredAlumni = [
  { name: "Adaeze Nwachukwu", set: "Alpha Set", faculty: "Law", profession: "Senior Counsel, Supreme Court", location: "Abuja", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&auto=format" },
  { name: "Emeka Okafor", set: "Beta Set", faculty: "Natural Sciences", profession: "Tech Entrepreneur & CEO", location: "Lagos", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format" },
  { name: "Ngozi Eze", set: "Alpha Set", faculty: "Management Sciences", profession: "Consultant & Business Coach", location: "Lagos", img: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=200&fit=crop&auto=format" },
  { name: "Chidi Obiora", set: "Gamma Set", faculty: "Social Sciences", profession: "Investment Analyst, Stanbic IBTC", location: "Port Harcourt", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format" },
];

const leadership = [
  { name: "Prof. Ifeanyi Madubueze", role: "President", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&auto=format" },
  { name: "Mrs. Chioma Eke", role: "Vice President", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&auto=format" },
  { name: "Barr. Uche Nwosu", role: "General Secretary", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format" },
  { name: "Alhaja Fatima Bello", role: "Financial Secretary", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format" },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1580894742597-87bc8789db3d?w=400&h=300&fit=crop&auto=format",
];

export default function Home({ onNavigate, isLoggedIn }: HomeProps) {
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
        {/* Deep gradient overlay — preserves photo visibility while ensuring text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E4418]/80 via-[#0E4418]/65 to-[#071A09]/90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center" style={{ minHeight: "90vh" }}>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-5 leading-tight max-w-4xl" style={{ marginTop: "50px" }}>
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

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10" style={{ paddingBottom: "50px" }}>
            {[
              { num: "4,200+", label: "Registered Alumni" },
              { num: "3,100+", label: "Verified Members" },
              { num: "11", label: "Graduating Sets" },
              { num: "32", label: "Countries Reached" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold text-[var(--accent)]">{num}</p>
                <p className="text-xs text-white/60 mt-1 tracking-wide">{label}</p>
              </div>
            ))}
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
                {upcomingEvents.map((e) => (
                  <div key={e.title} onClick={() => onNavigate("events")} className="bg-white rounded-lg border border-[var(--border)] p-4 flex gap-4 hover:border-[var(--primary)] transition-colors cursor-pointer">
                    <div className="flex-shrink-0 w-14 text-center bg-[var(--secondary)] rounded-md py-2 px-1">
                      <p className="font-display text-lg font-bold text-[var(--accent)] leading-none">{e.date.split(" ")[0]}</p>
                      <p className="text-[10px] text-white/70 uppercase tracking-wide mt-0.5">{e.date.split(" ")[1]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--foreground)] leading-snug mb-1">{e.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">📍 {e.location}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] rounded font-medium">{e.type}</span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">{e.registered} registered</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-[var(--secondary)]">Latest Announcements</h2>
                <button onClick={() => onNavigate("news")} className="text-sm text-[var(--primary)] hover:underline font-medium">View all</button>
              </div>
              <div className="flex flex-col gap-4">
                {announcements.map((a) => (
                  <div key={a.title} onClick={() => onNavigate("news")} className="bg-white rounded-lg border border-[var(--border)] p-4 hover:border-[var(--primary)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        a.category === "Official" ? "bg-[var(--secondary)] text-white" :
                        a.category === "Achievement" ? "bg-amber-100 text-amber-800" :
                        "bg-red-50 text-red-700"
                      }`}>{a.category}</span>
                      <span className="text-[11px] text-[var(--muted-foreground)]">{a.date}</span>
                    </div>
                    <p className="font-semibold text-sm text-[var(--foreground)] leading-snug mb-1">{a.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{a.excerpt}</p>
                  </div>
                ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAlumni.map((a) => (
            <div key={a.name} onClick={() => onNavigate("directory")} className="bg-white border border-[var(--border)] rounded-lg overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
              <div className="h-44 bg-[var(--muted)] overflow-hidden">
                <img src={a.img} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-sm text-[var(--foreground)]">{a.name}</p>
                <p className="text-[11px] text-[var(--primary)] font-medium mt-0.5">{a.set} · {a.faculty}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{a.profession}</p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">📍 {a.location}</p>
              </div>
            </div>
          ))}
        </div>
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
              <button onClick={() => onNavigate("news")} className="mt-4 px-5 py-2.5 border border-[var(--accent)] text-[var(--accent)] rounded-lg text-sm font-medium hover:bg-[var(--accent)] hover:text-[var(--secondary)] transition-colors">
                View All Achievements
              </button>
            </div>
            <div className="md:col-span-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[var(--accent)] flex-shrink-0">
                <img src={featuredAlumni[0].img} alt={featuredAlumni[0].name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 bg-[var(--accent)] text-[var(--secondary)] text-[10px] font-bold rounded mb-2">🏆 This Week</span>
                <h3 className="font-display text-xl font-bold text-white mb-1">{featuredAlumni[0].name}</h3>
                <p className="text-[var(--accent)] text-sm font-medium mb-2">{featuredAlumni[0].set} · {featuredAlumni[0].faculty}</p>
                <p className="text-white/70 text-sm leading-relaxed">Appointed as Senior Counsel at the Supreme Court, {featuredAlumni[0].name} has become one of Nigeria's most respected legal voices — a proud product of Clifford University.</p>
              </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {leadership.map((l) => (
            <div key={l.name} onClick={() => onNavigate("leadership")} className="text-center group cursor-pointer">
              <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-[var(--primary)] bg-[var(--muted)]">
                <img src={l.img} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="font-semibold text-sm text-[var(--foreground)]">{l.name}</p>
              <p className="text-[11px] text-[var(--primary)] mt-0.5 font-medium">{l.role}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button onClick={() => onNavigate("leadership")} className="px-6 py-3 border border-[var(--primary)] text-[var(--primary)] font-medium rounded-lg text-sm hover:bg-[var(--primary)] hover:text-white transition-colors">
            View Full EXCO Profiles
          </button>
        </div>
      </section>

      {/* ── WELFARE HIGHLIGHT ── */}
      <section className="bg-[var(--muted)] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[var(--primary)] text-xs font-semibold tracking-widest uppercase mb-3">Community Care</p>
              <h2 className="font-display text-3xl font-bold text-[var(--secondary)] mb-4">Welfare Center</h2>
              <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-6">
                No alumnus should face hardship alone. Submit confidential requests for medical assistance, emergency support, bereavement care, and more. Our welfare team responds with care and urgency.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Medical Assistance", icon: "🏥" },
                  { label: "Emergency Support", icon: "🆘" },
                  { label: "Bereavement Care", icon: "🕊️" },
                  { label: "Financial Aid", icon: "💰" },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                    <span>{icon}</span><span>{label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate("welfare")} className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors">
                Access Welfare Center
              </button>
            </div>
            <div className="bg-[var(--secondary)] rounded-xl overflow-hidden h-64 lg:h-80">
              <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&h=400&fit=crop&auto=format" alt="Community support" className="w-full h-full object-cover opacity-75" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CAREER & BUSINESS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="bg-[var(--secondary)] rounded-xl overflow-hidden h-64 lg:h-80">
            <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop&auto=format" alt="Career networking" className="w-full h-full object-cover opacity-80" />
          </div>
          <div>
            <p className="text-[var(--primary)] text-xs font-semibold tracking-widest uppercase mb-3">Opportunities</p>
            <h2 className="font-display text-3xl font-bold text-[var(--secondary)] mb-4">Career & Business Hub</h2>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-6">
              Discover jobs, internships, freelance opportunities and mentorship. List your business, hire alumni, and access professional referrals through our curated network.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["Job Board", "Internships", "Business Directory", "Freelance", "Mentorship", "Referrals"].map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-md text-xs font-medium text-[var(--foreground)]">{tag}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => onNavigate("career")} className="px-6 py-3 bg-[var(--secondary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--primary)] transition-colors">
                Explore Career Hub
              </button>
              <button onClick={() => onNavigate("business")} className="px-6 py-3 border border-[var(--primary)] text-[var(--primary)] font-semibold rounded-lg text-sm hover:bg-[var(--primary)] hover:text-white transition-colors">
                Business Directory
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY PREVIEW ── */}
      <section className="bg-[var(--muted)] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[var(--primary)] text-xs font-semibold tracking-widest uppercase mb-1">Memories</p>
              <h2 className="font-display text-3xl font-bold text-[var(--secondary)]">Photo Gallery</h2>
            </div>
            <button onClick={() => onNavigate("gallery")} className="text-sm text-[var(--primary)] hover:underline font-medium">View all</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {galleryImages.map((src, i) => (
              <div key={i} onClick={() => onNavigate("gallery")} className="aspect-square overflow-hidden rounded-lg bg-[var(--muted)] cursor-pointer">
                <img src={src} alt={`Alumni gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="bg-[var(--primary)] py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-3">Stay Connected</h2>
          <p className="text-white/80 text-sm mb-6 leading-relaxed">
            Receive official announcements, event invitations, and association updates directly in your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" className="flex-1 px-4 py-3 rounded-lg text-sm bg-white text-[var(--foreground)] border-0 focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button type="submit" className="px-6 py-3 bg-[var(--secondary)] text-white font-semibold rounded-lg text-sm hover:bg-[#071A09] transition-colors whitespace-nowrap">Subscribe</button>
          </form>
          <p className="text-white/45 text-xs mt-3">Official communications only. No spam.</p>
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
