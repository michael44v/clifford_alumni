import { useState } from "react";
type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface WelfareCenterProps { onNavigate: (page: Page) => void; isLoggedIn: boolean; }

type FormData = { category: string; urgency: string; details: string; contact: string; };

export default function WelfareCenter({ onNavigate, isLoggedIn }: WelfareCenterProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({ category: "", urgency: "normal", details: "", contact: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { onNavigate("login"); return; }
    setSubmitted(true);
  };

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Community Care</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Welfare Center</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Confidential welfare support for members facing hardship. All requests are reviewed with care and discretion by the CUAA Welfare Team.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: "🏥", title: "Medical Assistance", desc: "Support for medical bills, hospital fees and health emergencies" },
            { icon: "🆘", title: "Emergency Support", desc: "Urgent assistance for unexpected crises and natural disasters" },
            { icon: "🕊️", title: "Bereavement Support", desc: "Financial and emotional support following the death of a member or close family" },
            { icon: "💰", title: "Financial Aid", desc: "Short-term relief for members in genuine financial distress" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white border border-[var(--border)] rounded p-5 text-center">
              <span className="text-3xl block mb-3">{icon}</span>
              <p className="font-semibold text-sm text-[var(--foreground)] mb-1">{title}</p>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Privacy notice */}
        <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-8 flex gap-3">
          <span className="text-amber-500 text-lg flex-shrink-0">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Confidentiality Guarantee</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              All welfare requests are strictly confidential. Only authorized welfare officers can view submissions. Your information will never be shared with other members or third parties without your explicit consent.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-6">Submit a Welfare Request</h2>

            {!isLoggedIn ? (
              <div className="bg-white border border-[var(--border)] rounded p-6 text-center">
                <span className="text-4xl block mb-3">🔒</span>
                <p className="font-semibold text-[var(--foreground)] mb-2">Sign in required</p>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">You must be a verified member to submit a welfare request.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => onNavigate("login")} className="px-5 py-2.5 bg-[var(--primary)] text-white rounded text-sm font-semibold hover:bg-[var(--accent)] transition-colors">Sign In</button>
                  <button onClick={() => onNavigate("register")} className="px-5 py-2.5 border border-[var(--border)] rounded text-sm font-medium hover:border-[var(--primary)] transition-colors">Register</button>
                </div>
              </div>
            ) : submitted ? (
              <div className="bg-green-50 border border-green-200 rounded p-8 text-center">
                <span className="text-4xl block mb-3">✅</span>
                <p className="font-semibold text-green-800 mb-2">Request Submitted</p>
                <p className="text-sm text-green-700 leading-relaxed mb-4">
                  Your welfare request has been submitted confidentially. A welfare officer will review it and contact you within 48 hours. Your case ID is <strong>WLF-2024-{Math.floor(Math.random() * 900) + 100}</strong>.
                </p>
                <button onClick={() => setSubmitted(false)} className="px-5 py-2.5 bg-green-700 text-white rounded text-sm font-semibold">Submit Another Request</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-[var(--border)] rounded p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Request Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] bg-white">
                    <option value="">Select a category</option>
                    <option>Medical Emergency</option>
                    <option>Bereavement Support</option>
                    <option>Financial Distress</option>
                    <option>Emergency Assistance</option>
                    <option>Illness Notification</option>
                    <option>Member in Distress</option>
                    <option>Other Welfare Matter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Urgency Level *</label>
                  <div className="flex gap-3">
                    {["normal", "urgent", "critical"].map(u => (
                      <label key={u} className={`flex-1 py-2.5 border rounded text-xs font-medium text-center cursor-pointer transition-colors ${form.urgency === u ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                        <input type="radio" name="urgency" value={u} checked={form.urgency === u} onChange={e => setForm({...form, urgency: e.target.value})} className="sr-only" />
                        {u.charAt(0).toUpperCase() + u.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Details of Request *</label>
                  <textarea required rows={5} value={form.details} onChange={e => setForm({...form, details: e.target.value})} placeholder="Please describe your situation in detail. Include any relevant dates, amounts or circumstances. This information is strictly confidential." className="w-full px-3 py-2.5 border border-[var(--border)] rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Preferred Contact (optional)</label>
                  <input type="text" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="Phone number or email for follow-up" className="w-full px-3 py-2.5 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                </div>
                <button type="submit" className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors">
                  Submit Request Confidentially
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-5">
            <div className="bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-3">How It Works</h3>
              <ol className="space-y-3">
                {[
                  "Sign in and submit your request via the confidential form",
                  "The Welfare Team receives and reviews your request within 24 hours",
                  "A welfare officer is assigned and contacts you directly",
                  "The case is evaluated and appropriate support is arranged",
                  "Resolution is documented confidentially in the system",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[var(--muted-foreground)]">
                    <span className="flex-shrink-0 w-5 h-5 bg-[var(--primary)] text-white rounded-full text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-3">Welfare Fund Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Current Balance</span>
                  <span className="font-semibold text-green-600">₦2,450,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Cases Resolved (2024)</span>
                  <span className="font-semibold">34</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Avg. Response Time</span>
                  <span className="font-semibold">36 hours</span>
                </div>
              </div>
              <button onClick={() => onNavigate("donate")} className="mt-4 w-full py-2.5 border border-[var(--primary)] text-[var(--primary)] rounded text-sm font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors">
                Contribute to Welfare Fund
              </button>
            </div>

            <div className="bg-[var(--muted)] rounded p-5">
              <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Welfare Contact</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Miss Adaeze Okafor — Welfare Director</p>
              <p className="text-xs text-[var(--muted-foreground)]">welfare@clifforduniversity.edu.ng</p>
              <p className="text-xs text-[var(--primary)] mt-2">For urgent matters, contact directly via email.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
