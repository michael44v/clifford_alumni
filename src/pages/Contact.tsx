import { useState } from "react";
type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface ContactProps { onNavigate: (page: Page) => void; }

const faqs = [
  { q: "How do I register as an alumni member?", a: "Click 'Join the Network' and complete the registration form with your name, graduation year, faculty and contact details. You will then receive a verification email." },
  { q: "How long does verification take?", a: "Verification typically takes 2–5 business days after you submit your registration. The EXCO administrator will review and approve your account." },
  { q: "How do I pay my annual dues?", a: "Once verified, sign in, go to your Member Dashboard, click 'Payments' and select 'Annual Dues'. You can pay online via card or bank transfer." },
  { q: "Can I keep my profile information private?", a: "Yes. You control what information is visible publicly, to verified alumni only, or completely private. Update your privacy settings in your profile." },
  { q: "How do I submit a welfare request?", a: "Sign in and navigate to the Welfare Center. All submissions are confidential and only visible to authorized welfare officers." },
  { q: "How do I list my business in the Career Hub?", a: "Sign in, go to Career & Business Hub, and click 'List Your Business'. Provide your business details and it will appear after admin approval." },
  { q: "How do I contact a specific alumnus?", a: "Use the Alumni Directory to find members. Once you find someone, click 'Send Message' to contact them through the platform. Their personal contact details remain private unless they choose to share them." },
  { q: "What should I do if I forget my password?", a: "On the login page, click 'Forgot Password' and enter your registered email address. You will receive a password reset link." },
];

export default function Contact({ onNavigate }: ContactProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Get in Touch</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Reach the CUAA secretariat for enquiries, feedback, or technical support.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact form */}
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-6">Send a Message</h2>
            {formSent ? (
              <div className="bg-green-50 border border-green-200 rounded p-8 text-center">
                <span className="text-4xl block mb-3">✅</span>
                <p className="font-semibold text-green-800 mb-2">Message Sent</p>
                <p className="text-sm text-green-700 mb-4">We will respond to your enquiry within 2 business days.</p>
                <button onClick={() => setFormSent(false)} className="px-5 py-2 bg-green-700 text-white rounded text-sm font-semibold">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-[var(--border)] rounded p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Full Name *</label>
                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Subject *</label>
                  <select required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                    <option value="">Select a subject</option>
                    <option>Membership Registration</option>
                    <option>Account Verification</option>
                    <option>Dues & Payments</option>
                    <option>Welfare Enquiry</option>
                    <option>Technical Issue</option>
                    <option>Gallery Submission</option>
                    <option>Media & Partnerships</option>
                    <option>General Enquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-3 py-2.5 border border-[var(--border)] rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                </div>
                <button type="submit" className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact info + FAQ */}
          <div className="space-y-6">
            {/* Info */}
            <div className="bg-white border border-[var(--border)] rounded p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Contact Information</h3>
              <div className="space-y-3">
                {[
                  { icon: "🏛️", label: "Address", value: "Clifford University, Ihie, Isiala Ngwa, Abia State, Nigeria." },
                  { icon: "✉️", label: "Email", value: "alumni@clifforduniversity.edu.ng" },
                  { icon: "📱", label: "Welfare", value: "welfare@clifforduniversity.edu.ng" },
                  { icon: "💼", label: "Finance", value: "finance@clifforduniversity.edu.ng" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex gap-3 items-start text-sm">
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{label}</p>
                      <p className="text-[var(--muted-foreground)]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="bg-white border border-[var(--border)] rounded p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-3">Follow Us</h3>
              <div className="flex gap-3">
                {["Facebook", "Twitter / X", "Instagram", "LinkedIn"].map(s => (
                  <button key={s} className="px-3 py-1.5 border border-[var(--border)] rounded text-xs font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">{s}</button>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-3">Frequently Asked Questions</h3>
              <div className="flex flex-col gap-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white border border-[var(--border)] rounded">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                      <span className="text-sm font-medium text-[var(--foreground)] pr-4">{faq.q}</span>
                      <span className={`text-[var(--muted-foreground)] transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
