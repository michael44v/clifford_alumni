import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../lib/api";
import { CardSkeleton, Skeleton } from "../components/Skeleton";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";

interface LeadershipProps {
  onNavigate: (page: Page) => void;
}

const DEFAULT_AVATAR = "https://static.vecteezy.com/system/resources/previews/055/582/028/non_2x/gray-circle-user-icon-profile-avatar-simple-symbol-vector.jpg";

const getPhoto = (m: any): string => m?.photoUrl || m?.memberPhotoUrl || m?.photo?.secureUrl || "";
const getInitials = (name?: string) =>
  name ? name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "EX";

// Shows `lines` lines of text, with a "Read more..." / "Show less" toggle when the text is longer
function ExpandableText({ text, lines = 5 }: { text: string; lines?: number }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const check = () => {
      const el = ref.current;
      if (el && !expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text, expanded]);

  const clampStyle: React.CSSProperties = expanded
    ? {}
    : {
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      };

  return (
    <div>
      <p
        ref={ref}
        style={clampStyle}
        className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line"
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-2 text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          {expanded ? "Show less" : "Read more..."}
        </button>
      )}
    </div>
  );
}

export default function Leadership({ onNavigate }: LeadershipProps) {
  const [leadership, setLeadership] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiFetch("/api/admin/leadership")
      .then((res) => {
        if (Array.isArray(res)) {
          setLeadership(res);
        }
      })
      .catch(() => setLeadership([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Lock page scroll and allow Esc to close while the full profile is open
  useEffect(() => {
    if (!selectedMember) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedMember(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedMember]);

  const president = leadership.find((l) => l.position?.toLowerCase().includes("president") && !l.position?.toLowerCase().includes("vice")) || leadership[0];
  const otherExcos = president ? leadership.filter((l) => l.id !== president.id) : leadership;

  const selectedBio: string = selectedMember ? (selectedMember.biography || "").toString().trim() : "";

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Governing Body</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">EXCO Leadership</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Meet the executive council steering the Clifford University Alumni Association.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {isLoading ? (
          <div className="space-y-8">
            <div className="bg-white border border-[var(--border)] rounded-lg p-6 flex flex-col md:flex-row gap-6">
              <Skeleton className="w-full md:w-64 h-64 rounded-lg" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        ) : leadership.length === 0 ? (
          <div className="bg-white border border-[var(--border)] rounded-lg p-12 text-center text-[var(--muted-foreground)]">
            <p className="text-base">No EXCO leadership profiles have been added yet.</p>
          </div>
        ) : (
          <>
            {/* President feature */}
            {president && (
              <div className="bg-white border border-[var(--border)] rounded overflow-hidden mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div
                    className="aspect-square w-full md:self-start bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => setSelectedMember(president)}
                  >
                    {getPhoto(president) ? (
                      <img
                        src={getPhoto(president)}
                        alt={president.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-3xl">
                        {getInitials(president.name)}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 p-8 flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 bg-[var(--secondary)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest rounded mb-3 self-start">
                      {president.position}
                    </span>
                    <h2 className="font-display text-3xl font-bold text-[var(--secondary)] mb-1">{president.name}</h2>
                    {president.termStart && (
                      <p className="text-[var(--primary)] font-medium text-sm mb-4">
                        Term: {president.termStart} {president.termEnd ? `- ${president.termEnd}` : "Present"}
                      </p>
                    )}
                    {president.biography && (
                      <div className="mb-4">
                        <ExpandableText key={president.id || president.name} text={president.biography} lines={5} />
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedMember(president)}
                      className="self-start px-5 py-2 border border-[var(--primary)] text-[var(--primary)] rounded text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other EXCO */}
            {otherExcos.length > 0 && (
              <>
                <h3 className="font-display text-xl font-bold text-[var(--secondary)] mb-6">Executive Council Members</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherExcos.map((member) => (
                    <div
                      key={member.id || member.name}
                      onClick={() => setSelectedMember(member)}
                      className="bg-white border border-[var(--border)] rounded overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        {getPhoto(member) ? (
                          <img
                            src={getPhoto(member)}
                            alt={member.name}
                            className="w-full h-full object-cover object-top"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_AVATAR;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-2xl">
                            {getInitials(member.name)}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <span className="inline-block px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] font-semibold uppercase tracking-wide rounded mb-2">
                          {member.position}
                        </span>
                        <h4 className="font-semibold text-[var(--foreground)] mb-1">{member.name}</h4>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3">{member.biography}</p>
                        <button className="mt-3 w-full py-1.5 border border-[var(--border)] rounded text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className="mt-10 bg-[var(--muted)] rounded p-6 text-center">
          <p className="text-sm text-[var(--muted-foreground)] mb-3">Are you an EXCO member and need to update your profile? Contact the platform administrator.</p>
          <button onClick={() => onNavigate("contact")} className="px-6 py-2 border border-[var(--primary)] text-[var(--primary)] font-medium rounded text-sm hover:bg-[var(--primary)] hover:text-white transition-colors">
            Contact Administration
          </button>
        </div>
      </div>

      {/* Full-Page Profile View */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-[var(--background)] overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[var(--border)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => setSelectedMember(null)}
                className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                ← Back to Leadership
              </button>
              <button
                onClick={() => setSelectedMember(null)}
                aria-label="Close profile"
                className="w-8 h-8 rounded-full bg-[var(--muted)] hover:bg-[var(--border)] flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {/* Header card */}
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[var(--secondary)] h-28 sm:h-36" />
              <div className="px-5 sm:px-8 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 sm:-mt-16">
                  {getPhoto(selectedMember) ? (
                    <img
                      src={getPhoto(selectedMember)}
                      alt={selectedMember.name}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover object-top border-4 border-white shadow-md bg-[var(--muted)]"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-4 border-white shadow-md bg-slate-200 text-slate-400 font-bold text-3xl flex items-center justify-center">
                      {getInitials(selectedMember.name)}
                    </div>
                  )}
                  <div className="flex-1 sm:pb-1">
                    {selectedMember.position && (
                      <span className="inline-block px-3 py-1 bg-[var(--secondary)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest rounded mb-2">
                        {selectedMember.position}
                      </span>
                    )}
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--secondary)]">{selectedMember.name}</h1>
                    {selectedMember.termStart && (
                      <p className="text-[var(--primary)] font-medium text-sm mt-1">
                        Term: {selectedMember.termStart} {selectedMember.termEnd ? `- ${selectedMember.termEnd}` : "Present"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About (5 lines, then Read more...) */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-5 sm:p-8 mt-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-[var(--secondary)] mb-3">About</h2>
              {selectedBio ? (
                <ExpandableText key={selectedMember.id || selectedMember.name} text={selectedBio} lines={5} />
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">No biography has been added yet.</p>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent)] transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}