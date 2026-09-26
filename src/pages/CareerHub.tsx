import { useState } from "react";
type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface CareerHubProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

const jobs = [

  { id: 1, title: "Senior Legal Counsel", company: "First Bank of Nigeria", location: "Lagos", type: "Full-time", posted: "Nov 25, 2024", deadline: "Dec 20, 2024", by: "Adaeze Nwachukwu (Set 2005)", category: "Jobs", salary: "₦600,000 – ₦900,000/month" },
  { id: 2, title: "Software Engineer (Backend)", company: "Flutterwave", location: "Lagos / Remote", type: "Full-time", posted: "Nov 22, 2024", deadline: "Dec 15, 2024", by: "Emeka Okafor (Set 2008)", category: "Jobs", salary: "Competitive" },
  { id: 3, title: "Graduate Intern — Economics", company: "CBN Research Department", location: "Abuja", type: "Internship", posted: "Nov 20, 2024", deadline: "Dec 10, 2024", by: "Dr. Emeka Chukwu (Set 2000)", category: "Internships", salary: "Stipend: ₦80,000/month" },
  { id: 4, title: "Medical Officer", company: "Lagos University Teaching Hospital", location: "Lagos", type: "Full-time", posted: "Nov 18, 2024", deadline: "Dec 5, 2024", by: "Dr. Ngozi Eze (Set 2003)", category: "Jobs", salary: "CONMESS Scale" },
  { id: 5, title: "Freelance Content Writer — Legal", company: "Self-employed", location: "Remote", type: "Freelance", posted: "Nov 15, 2024", deadline: "Open", by: "Barr. Uche Nwosu (Set 2003)", category: "Freelance", salary: "₦15,000 per article" },
  { id: 6, title: "Business Development Manager", company: "Nnamdi Azikiwe University Business School", location: "Awka", type: "Full-time", posted: "Nov 12, 2024", deadline: "Nov 30, 2024", by: "Prof. Ifeanyi Madubueze (Set 1999)", category: "Jobs", salary: "Negotiable" },
];

const categories = ["All", "Jobs", "Internships", "Freelance"];

export default function CareerHub({ onNavigate, isLoggedIn }: CareerHubProps) {
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredJobs = jobs.filter(j => categoryFilter === "All" || j.category === categoryFilter);

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Opportunities</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Career & Business Hub</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Jobs, internships, freelance opportunities and a curated directory of alumni-owned businesses.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--muted)] p-1 rounded w-fit mb-8">
          <button className="px-5 py-2 rounded text-sm font-medium bg-white shadow-sm">Job Board</button>
          <button onClick={() => onNavigate("business")} className="px-5 py-2 rounded text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Business Directory ↗</button>
        </div>

        <>
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(c => (
                <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${categoryFilter === c ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--border)] hover:border-[var(--primary)]"}`}>{c}</button>
              ))}
              {isLoggedIn && (
                <button className="ml-auto px-4 py-1.5 bg-[var(--secondary)] text-white rounded text-xs font-semibold hover:bg-[var(--primary)] transition-colors">
                  + Post Opportunity
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {filteredJobs.map(job => (
                <div key={job.id} className="bg-white border border-[var(--border)] rounded p-5 hover:border-[var(--primary)] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                          job.type === "Full-time" ? "bg-green-100 text-green-700" :
                          job.type === "Internship" ? "bg-blue-100 text-blue-700" :
                          "bg-purple-100 text-purple-700"
                        }`}>{job.type}</span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">Posted {job.posted}</span>
                      </div>
                      <h3 className="font-semibold text-[var(--foreground)] mb-0.5">{job.title}</h3>
                      <p className="text-sm text-[var(--primary)] font-medium">{job.company}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)] mt-2">
                        <span>📍 {job.location}</span>
                        <span>💰 {job.salary}</span>
                        <span>⏰ Deadline: {job.deadline}</span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Posted by: <span className="text-[var(--foreground)]">{job.by}</span></p>
                    </div>
                    <button
                      onClick={() => !isLoggedIn && onNavigate("login")}
                      className="flex-shrink-0 px-5 py-2.5 bg-[var(--primary)] text-white rounded text-sm font-semibold hover:bg-[var(--accent)] transition-colors"
                    >
                      Apply / Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
        </>

        <div className="mt-10 bg-[var(--muted)] rounded p-6 text-center">
          <h3 className="font-display text-xl font-bold text-[var(--secondary)] mb-2">Mentorship Programme</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Senior alumni can register as mentors. Junior alumni can request mentorship in their field of interest.</p>
          <button onClick={() => !isLoggedIn && onNavigate("login")} className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors">
            {isLoggedIn ? "Join Mentorship Programme" : "Sign in to Access Mentorship"}
          </button>
        </div>
      </div>
    </div>
  );
}
