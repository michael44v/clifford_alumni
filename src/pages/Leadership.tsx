import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { CardSkeleton, Skeleton } from "../components/Skeleton";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";

interface LeadershipProps {
  onNavigate: (page: Page) => void;
}

export default function Leadership({ onNavigate }: LeadershipProps) {
  const [leadership, setLeadership] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const president = leadership.find((l) => l.position?.toLowerCase().includes("president") && !l.position?.toLowerCase().includes("vice")) || leadership[0];
  const otherExcos = president ? leadership.filter((l) => l.id !== president.id) : leadership;

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
                  <div className="h-64 md:h-auto bg-slate-100 flex items-center justify-center overflow-hidden">
                    {president.photoUrl || president.memberPhotoUrl || president.photo?.secureUrl ? (
                      <img
                        src={president.photoUrl || president.memberPhotoUrl || president.photo?.secureUrl}
                        alt={president.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://static.vecteezy.com/system/resources/previews/055/582/028/non_2x/gray-circle-user-icon-profile-avatar-simple-symbol-vector.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-3xl">
                        {president.name ? president.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "EX"}
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
                    <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-4">{president.biography}</p>
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
                    <div key={member.id || member.name} className="bg-white border border-[var(--border)] rounded overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                        {member.photoUrl || member.memberPhotoUrl || member.photo?.secureUrl ? (
                          <img
                            src={member.photoUrl || member.memberPhotoUrl || member.photo?.secureUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://static.vecteezy.com/system/resources/previews/055/582/028/non_2x/gray-circle-user-icon-profile-avatar-simple-symbol-vector.jpg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-2xl">
                            {member.name ? member.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "EX"}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <span className="inline-block px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] font-semibold uppercase tracking-wide rounded mb-2">
                          {member.position}
                        </span>
                        <h4 className="font-semibold text-[var(--foreground)] mb-1">{member.name}</h4>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3">{member.biography}</p>
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
    </div>
  );
}
