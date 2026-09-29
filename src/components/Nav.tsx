import { useState, useRef, useEffect } from "react";
import cuaaLogo from "@/imports/CUAA.jpg";

type Page =
  | "home" | "about" | "directory" | "events" | "news"
  | "career" | "business" | "welfare" | "leadership" | "gallery"
  | "finance" | "donate" | "contact" | "login" | "register"
  | "dashboard" | "admin";

interface NavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

interface DropdownItem { label: string; page: Page; icon?: string; }

const financeItems: DropdownItem[] = [
  { label: "Pay Dues", page: "finance", icon: "💳" },
  { label: "Renew Dues", page: "finance", icon: "🔄" },
  { label: "Dues History", page: "finance", icon: "📋" },
  { label: "Levies", page: "finance", icon: "📌" },
  { label: "Donations", page: "donate", icon: "❤️" },
  { label: "Receipts", page: "finance", icon: "🧾" },
];

const careerItems: DropdownItem[] = [
  { label: "Job Board", page: "career", icon: "💼" },
  { label: "Business Directory", page: "business", icon: "🏪" },
  { label: "Internships & Freelance", page: "career", icon: "🎯" },
  { label: "Mentorship", page: "career", icon: "🤝" },
];

const moreItems: DropdownItem[] = [
  { label: "Welfare Center", page: "welfare", icon: "❤️" },
  { label: "Gallery", page: "gallery", icon: "📸" },
  { label: "Contact Us", page: "contact", icon: "✉️" },
];

function Dropdown({ label: triggerLabel, items, currentPage, onNavigate, isActive }: {
  label: string; items: DropdownItem[]; currentPage: Page; onNavigate: (p: Page) => void; isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded transition-colors ${
          isActive ? "text-[var(--primary)] bg-[var(--muted)]" : "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
        }`}
      >
        {triggerLabel}
        <span className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg border border-[var(--border)] shadow-lg py-1 z-50"
        >
          {items.map(({ label, page, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => { onNavigate(page); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
                currentPage === page ? "bg-[var(--muted)] text-[var(--primary)]" : "text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)]"
              }`}
            >
              {icon && <span className="text-sm">{icon}</span>}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Nav({ currentPage, onNavigate, isLoggedIn, onLogout }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const nav = (page: Page) => { onNavigate(page); setMobileOpen(false); setMobileExpanded(null); };

  return (
    <header className="bg-white border-b border-[var(--border)] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => nav("home")} className="flex items-center gap-3 group flex-shrink-0" aria-label="CUAA Home">
            <img src={cuaaLogo} alt="CUAA logo" className="h-11 w-11 object-contain" />
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold tracking-[0.15em] text-[var(--primary)] uppercase leading-none">Clifford University</p>
              <p className="text-[10px] text-[var(--accent)] font-semibold tracking-wider leading-tight mt-0.5">Alumni Association</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <button onClick={() => nav("home")} className={`px-3 py-2 text-[13px] font-medium rounded transition-colors ${currentPage === "home" ? "text-[var(--primary)] bg-[var(--muted)]" : "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"}`}>Home</button>
            <button onClick={() => nav("about")} className={`px-3 py-2 text-[13px] font-medium rounded transition-colors ${currentPage === "about" ? "text-[var(--primary)] bg-[var(--muted)]" : "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"}`}>About</button>
            <button onClick={() => nav("directory")} className={`px-3 py-2 text-[13px] font-medium rounded transition-colors ${currentPage === "directory" ? "text-[var(--primary)] bg-[var(--muted)]" : "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"}`}>Alumni</button>
            <button onClick={() => nav("events")} className={`px-3 py-2 text-[13px] font-medium rounded transition-colors ${currentPage === "events" ? "text-[var(--primary)] bg-[var(--muted)]" : "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"}`}>Events</button>
            <button onClick={() => nav("news")} className={`px-3 py-2 text-[13px] font-medium rounded transition-colors ${currentPage === "news" ? "text-[var(--primary)] bg-[var(--muted)]" : "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"}`}>News</button>
            <Dropdown label="Career" items={careerItems} currentPage={currentPage} onNavigate={nav} isActive={currentPage === "career" || currentPage === "business"} />
            <Dropdown label="Finance" items={financeItems} currentPage={currentPage} onNavigate={nav} isActive={currentPage === "finance" || currentPage === "donate"} />
            <button onClick={() => nav("leadership")} className={`px-3 py-2 text-[13px] font-medium rounded transition-colors ${currentPage === "leadership" ? "text-[var(--primary)] bg-[var(--muted)]" : "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"}`}>Leadership</button>
            <Dropdown label="More" items={moreItems} currentPage={currentPage} onNavigate={nav} isActive={currentPage === "welfare" || currentPage === "gallery" || currentPage === "contact"} />
          </nav>

          {/* Auth CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <button onClick={() => nav("dashboard")} className="px-3 py-2 text-[13px] font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">Dashboard</button>
                <button onClick={onLogout} className="px-4 py-2 text-[13px] font-medium border border-[var(--border)] rounded-md text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => nav("login")} className="px-3 py-2 text-[13px] font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">Sign In</button>
                <button onClick={() => nav("register")} className="px-5 py-2 text-[13px] font-semibold bg-[var(--primary)] text-white rounded-md hover:bg-[var(--accent)] transition-colors">Join Network</button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="lg:hidden p-2 rounded-md hover:bg-[var(--muted)] transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-[var(--foreground)] transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 bg-[var(--foreground)] transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-[var(--foreground)] transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[var(--border)] max-h-[80vh] overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
            {[
              { label: "Home", page: "home" as Page },
              { label: "About CUAA", page: "about" as Page },
              { label: "Alumni Directory", page: "directory" as Page },
              { label: "Events", page: "events" as Page },
              { label: "News & Announcements", page: "news" as Page },
              { label: "Leadership / EXCO", page: "leadership" as Page },
              { label: "Gallery", page: "gallery" as Page },
              { label: "Welfare Center", page: "welfare" as Page },
              { label: "Contact Us", page: "contact" as Page },
            ].map(({ label, page }) => (
              <button key={page} onClick={() => nav(page)} className={`px-4 py-3 text-sm font-medium text-left rounded-md transition-colors ${currentPage === page ? "text-[var(--primary)] bg-[var(--muted)]" : "text-[var(--foreground)] hover:bg-[var(--muted)]"}`}>
                {label}
              </button>
            ))}

            {/* Mobile Finance section */}
            <div>
              <button onClick={() => setMobileExpanded(mobileExpanded === "finance" ? null : "finance")} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left rounded-md hover:bg-[var(--muted)] transition-colors">
                <span>Finance</span>
                <span className={`text-[9px] transition-transform ${mobileExpanded === "finance" ? "rotate-180" : ""}`}>▼</span>
              </button>
              {mobileExpanded === "finance" && (
                <div className="ml-4 border-l-2 border-[var(--border)] pl-3">
                  {financeItems.map(({ label, page, icon }) => (
                    <button key={label} onClick={() => nav(page)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-[var(--foreground)] hover:text-[var(--primary)] rounded-md transition-colors">
                      <span>{icon}</span>{label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Career section */}
            <div>
              <button onClick={() => setMobileExpanded(mobileExpanded === "career" ? null : "career")} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left rounded-md hover:bg-[var(--muted)] transition-colors">
                <span>Career & Business</span>
                <span className={`text-[9px] transition-transform ${mobileExpanded === "career" ? "rotate-180" : ""}`}>▼</span>
              </button>
              {mobileExpanded === "career" && (
                <div className="ml-4 border-l-2 border-[var(--border)] pl-3">
                  {careerItems.map(({ label, page, icon }) => (
                    <button key={label} onClick={() => nav(page)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-[var(--foreground)] hover:text-[var(--primary)] rounded-md transition-colors">
                      <span>{icon}</span>{label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border)] mt-2 pt-3 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <button onClick={() => nav("dashboard")} className="px-4 py-3 text-sm font-medium text-left text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md">Dashboard</button>
                  <button onClick={() => { onLogout(); setMobileOpen(false); }} className="px-4 py-3 text-sm font-medium text-left text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md">Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => nav("login")} className="px-4 py-3 text-sm font-medium text-left text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md">Sign In</button>
                  <button onClick={() => nav("register")} className="px-5 py-3 text-sm font-semibold bg-[var(--primary)] text-white rounded-md text-center">Join the Network</button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
