import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface EventsProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

const types = ["All", "AGM", "Networking", "Career", "Reunion", "Fundraising"];

export default function Events({ onNavigate, isLoggedIn }: EventsProps) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [typeFilter, setTypeFilter] = useState("All");
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [registered, setRegistered] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/events")
      .then(res => setEventsList(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = eventsList.filter(e => {
    const isUpcoming = new Date(e.eventDate) >= new Date();
    const matchesTab = tab === "upcoming" ? isUpcoming : !isUpcoming;
    const matchesType = typeFilter === "All" || e.category?.toLowerCase() === typeFilter.toLowerCase();
    return matchesTab && matchesType;
  });

  const handleRegister = async (eventId: string) => {
    if (!isLoggedIn) { onNavigate("login"); return; }
    try {
      await apiFetch(`/api/events/${eventId}/register`, { method: "POST" });
      setRegistered(prev => [...prev, eventId]);
    } catch (err: any) {
      alert(err.message || "Failed to register for event");
    }
  };

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Community</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Events</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Stay informed about AGMs, reunions, career events, networking nights and fundraising activities.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--muted)] p-1 rounded w-fit mb-6">
          {(["upcoming", "past"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded text-sm font-medium capitalize transition-colors ${tab === t ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {t} Events
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${typeFilter === t ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">Loading events...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((event) => {
              const eDate = new Date(event.eventDate);
              const day = eDate.getDate();
              const month = eDate.toLocaleString("default", { month: "short" });
              const year = eDate.getFullYear();
              const regCount = event._count?.registrations || 0;
              const cap = event.capacity || 100;
              const isUpcoming = eDate >= new Date();

              return (
                <div key={event.id} className="bg-white border border-[var(--border)] rounded overflow-hidden hover:border-[var(--primary)] transition-colors">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Date block */}
                      <div className="flex-shrink-0 w-16 sm:w-20 text-center bg-[var(--secondary)] rounded py-3 px-2">
                        <p className="font-display text-xl font-bold text-[var(--accent)] leading-none">{day}</p>
                        <p className="text-[10px] text-white/70 uppercase tracking-wide mt-1">{month}</p>
                        <p className="text-[10px] text-white/50 mt-0.5">{year}</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-700">{event.category || "General"}</span>
                          {isUpcoming && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-green-100 text-green-700">Upcoming</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-[var(--foreground)] mb-1">{event.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)] mb-3">
                          <span>🕐 {event.time || "TBD"}</span>
                          <span>📍 {event.venue || "TBD"}</span>
                          <span>👤 {event.organizer || "CUAA"}</span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2">{event.description}</p>

                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                            <div className="w-24 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${Math.min(100, (regCount / cap) * 100)}%` }} />
                            </div>
                            <span>{regCount}/{cap} registered</span>
                          </div>
                          <div className="ml-auto flex gap-2">
                            <button onClick={() => setSelectedEvent(event)} className="px-4 py-2 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] transition-colors">
                              Details
                            </button>
                            {isUpcoming && (
                              <button
                                onClick={() => handleRegister(event.id)}
                                className={`px-4 py-2 rounded text-xs font-semibold transition-colors ${
                                  registered.includes(event.id)
                                    ? "bg-green-600 text-white"
                                    : "bg-[var(--primary)] text-white hover:bg-[var(--accent)]"
                                }`}
                              >
                                {registered.includes(event.id) ? "✓ Registered" : "Register"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-semibold">No {tab} events</p>
            <p className="text-sm mt-1">Check back soon for updates.</p>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded max-w-lg w-full overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--secondary)] px-6 py-5 flex items-center justify-between">
              <span className="text-[var(--accent)] font-semibold text-sm">{selectedEvent.category || "General"}</span>
              <button onClick={() => setSelectedEvent(null)} className="text-white/70 hover:text-white text-lg">✕</button>
            </div>
            <div className="p-6">
              <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-4">{selectedEvent.title}</h2>
              <div className="space-y-2 text-sm mb-4">
                <p><span className="font-medium">Date:</span> <span className="text-[var(--muted-foreground)]">{new Date(selectedEvent.eventDate).toLocaleDateString()}</span></p>
                <p><span className="font-medium">Time:</span> <span className="text-[var(--muted-foreground)]">{selectedEvent.time || "TBD"}</span></p>
                <p><span className="font-medium">Venue:</span> <span className="text-[var(--muted-foreground)]">{selectedEvent.venue || "TBD"}</span></p>
                <p><span className="font-medium">Organizer:</span> <span className="text-[var(--muted-foreground)]">{selectedEvent.organizer || "CUAA"}</span></p>
                <p><span className="font-medium">Capacity:</span> <span className="text-[var(--muted-foreground)]">{selectedEvent._count?.registrations || 0}/{selectedEvent.capacity || 100}</span></p>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">{selectedEvent.description}</p>
              {new Date(selectedEvent.eventDate) >= new Date() && (
                <button
                  onClick={() => { handleRegister(selectedEvent.id); setSelectedEvent(null); }}
                  className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors"
                >
                  {registered.includes(selectedEvent.id) ? "✓ Registered" : "Register for This Event"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
