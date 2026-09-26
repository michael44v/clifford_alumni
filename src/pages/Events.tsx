import { useState } from "react";
type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface EventsProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

const events = [
  { id: 1, title: "Annual General Meeting (AGM) 2024", date: "December 14, 2024", time: "10:00 AM", venue: "Clifford University Auditorium, Owerrinta", type: "AGM", status: "upcoming", registered: 128, capacity: 500, description: "The 2024 Annual General Meeting of the Clifford University Alumni Association. Mandatory for all EXCO members and open to all verified alumni. Agenda includes financial reports, welfare updates, election of committee chairs and strategic planning for 2025.", organizer: "CUAA Executive Council" },
  { id: 2, title: "Alumni Homecoming & Networking Gala", date: "January 18, 2025", time: "5:00 PM", venue: "Merit House Events Centre, Abuja", type: "Networking", status: "upcoming", registered: 74, capacity: 200, description: "An exclusive evening of networking, celebration and reconnection for Clifford University alumni in the FCT and surrounding areas. Dress code is Smart Formal.", organizer: "CUAA FCT Chapter" },
  { id: 3, title: "Career Fair & Alumni Business Expo", date: "February 22, 2025", time: "9:00 AM", venue: "Online via Zoom", type: "Career", status: "upcoming", registered: 56, capacity: 300, description: "A virtual career fair connecting employers with talented Clifford alumni. Companies can post jobs, alumni can pitch businesses, and mentors can offer guidance.", organizer: "CUAA Career & Business Directorate" },
  { id: 4, title: "AGM 2023", date: "December 10, 2023", time: "10:00 AM", venue: "Clifford University Main Hall", type: "AGM", status: "past", registered: 310, capacity: 500, description: "The 2023 Annual General Meeting. Reviewed the association's activities, financials and welfare programs.", organizer: "CUAA Executive Council" },
  { id: 5, title: "Reunion — Set 2010 & 2011", date: "October 5, 2023", time: "2:00 PM", venue: "Oriental Hotel, Lagos", type: "Reunion", status: "past", registered: 88, capacity: 150, description: "A special reunion celebration for the graduating sets of 2010 and 2011.", organizer: "Set 2010/2011 Organizing Committee" },
  { id: 6, title: "Welfare Fundraising Dinner", date: "September 1, 2023", time: "6:00 PM", venue: "Transcorp Hilton, Abuja", type: "Fundraising", status: "past", registered: 142, capacity: 200, description: "Annual fundraising dinner in support of the CUAA Welfare Fund and scholarship programme.", organizer: "CUAA Finance & Welfare Committees" },
];

const types = ["All", "AGM", "Networking", "Career", "Reunion", "Fundraising"];

export default function Events({ onNavigate, isLoggedIn }: EventsProps) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [registered, setRegistered] = useState<number[]>([]);

  const filtered = events.filter(e => {
    return e.status === tab && (typeFilter === "All" || e.type === typeFilter);
  });

  const handleRegister = (id: number) => {
    if (!isLoggedIn) { onNavigate("login"); return; }
    setRegistered(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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

        <div className="flex flex-col gap-4">
          {filtered.map((event) => (
            <div key={event.id} className="bg-white border border-[var(--border)] rounded overflow-hidden hover:border-[var(--primary)] transition-colors">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Date block */}
                  <div className="flex-shrink-0 w-16 sm:w-20 text-center bg-[var(--secondary)] rounded py-3 px-2">
                    <p className="font-display text-xl font-bold text-[var(--accent)] leading-none">
                      {event.date.split(" ")[1].replace(",", "")}
                    </p>
                    <p className="text-[10px] text-white/70 uppercase tracking-wide mt-1">
                      {event.date.split(" ")[0].slice(0, 3)}
                    </p>
                    <p className="text-[10px] text-white/50 mt-0.5">
                      {event.date.split(" ")[2]}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                        event.type === "AGM" ? "bg-[var(--secondary)] text-white" :
                        event.type === "Career" ? "bg-blue-100 text-blue-700" :
                        event.type === "Fundraising" ? "bg-purple-100 text-purple-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{event.type}</span>
                      {event.status === "upcoming" && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-green-100 text-green-700">Upcoming</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">{event.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)] mb-3">
                      <span>🕐 {event.time}</span>
                      <span>📍 {event.venue}</span>
                      <span>👤 {event.organizer}</span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2">{event.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                        <div className="w-24 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${Math.min(100, (event.registered / event.capacity) * 100)}%` }} />
                        </div>
                        <span>{event.registered}/{event.capacity} registered</span>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => setSelectedEvent(event)} className="px-4 py-2 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] transition-colors">
                          Details
                        </button>
                        {event.status === "upcoming" && (
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
          ))}
        </div>

        {filtered.length === 0 && (
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
              <span className="text-[var(--accent)] font-semibold text-sm">{selectedEvent.type}</span>
              <button onClick={() => setSelectedEvent(null)} className="text-white/70 hover:text-white text-lg">✕</button>
            </div>
            <div className="p-6">
              <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-4">{selectedEvent.title}</h2>
              <div className="space-y-2 text-sm mb-4">
                <p><span className="font-medium">Date:</span> <span className="text-[var(--muted-foreground)]">{selectedEvent.date}</span></p>
                <p><span className="font-medium">Time:</span> <span className="text-[var(--muted-foreground)]">{selectedEvent.time}</span></p>
                <p><span className="font-medium">Venue:</span> <span className="text-[var(--muted-foreground)]">{selectedEvent.venue}</span></p>
                <p><span className="font-medium">Organizer:</span> <span className="text-[var(--muted-foreground)]">{selectedEvent.organizer}</span></p>
                <p><span className="font-medium">Capacity:</span> <span className="text-[var(--muted-foreground)]">{selectedEvent.registered}/{selectedEvent.capacity}</span></p>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">{selectedEvent.description}</p>
              {selectedEvent.status === "upcoming" && (
                <button
                  onClick={() => { handleRegister(selectedEvent.id); setSelectedEvent(null); }}
                  className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors"
                >
                  {registered.includes(selectedEvent.id) ? "Cancel Registration" : "Register for This Event"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
