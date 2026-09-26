import cuaaLogo from "@/imports/CUAA.jpg";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[var(--secondary)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={cuaaLogo} alt="CUAA logo" className="h-14 w-14 object-contain bg-white rounded-lg p-1.5" />
              <div>
                <p className="font-bold text-[var(--accent)] text-sm tracking-wide leading-tight">Clifford University</p>
                <p className="text-xs text-white/70 leading-tight">Alumni Association</p>
                <p className="text-[10px] text-[var(--accent)] font-semibold tracking-wider mt-0.5">CLUAA</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed italic mb-4">"One Alumni. One Network. One Community."</p>
            <p className="text-xs text-white/40">Excellence. Faith. Service.</p>
          </div>

          {/* Association */}
          <div>
            <h4 className="font-semibold text-xs text-[var(--accent)] uppercase tracking-widest mb-4">Association</h4>
            <ul className="space-y-2">
              {[
                { label: "About CUAA", page: "about" as Page },
                { label: "Leadership / EXCO", page: "leadership" as Page },
                { label: "News & Announcements", page: "news" as Page },
                { label: "Gallery", page: "gallery" as Page },
                { label: "Contact Us", page: "contact" as Page },
              ].map(({ label, page }) => (
                <li key={page}><button onClick={() => onNavigate(page)} className="text-sm text-white/65 hover:text-[var(--accent)] transition-colors">{label}</button></li>
              ))}
            </ul>
          </div>

          {/* Members */}
          <div>
            <h4 className="font-semibold text-xs text-[var(--accent)] uppercase tracking-widest mb-4">Members</h4>
            <ul className="space-y-2">
              {[
                { label: "Alumni Directory", page: "directory" as Page },
                { label: "Events", page: "events" as Page },
                { label: "Career & Job Board", page: "career" as Page },
                { label: "Business Directory", page: "business" as Page },
                { label: "Welfare Center", page: "welfare" as Page },
              ].map(({ label, page }) => (
                <li key={page}><button onClick={() => onNavigate(page)} className="text-sm text-white/65 hover:text-[var(--accent)] transition-colors">{label}</button></li>
              ))}
            </ul>
          </div>

          {/* Finance & Contact */}
          <div>
            <h4 className="font-semibold text-xs text-[var(--accent)] uppercase tracking-widest mb-4">Finance & Contact</h4>
            <ul className="space-y-2 mb-5">
              {[
                { label: "Pay Dues", page: "finance" as Page },
                { label: "Donations", page: "donate" as Page },
                { label: "Payment History", page: "finance" as Page },
              ].map(({ label, page }) => (
                <li key={label}><button onClick={() => onNavigate(page)} className="text-sm text-white/65 hover:text-[var(--accent)] transition-colors">{label}</button></li>
              ))}
            </ul>
            <div className="space-y-1.5 text-xs text-white/55">
              <p className="font-semibold text-white/80 text-[11px] uppercase tracking-wide">Address</p>
              <p>Clifford University</p>
              <p>Ihie, Isiala Ngwa</p>
              <p>Abia State, Nigeria.</p>
              <p className="mt-2">alumni@clifforduniversity.edu.ng</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">&copy; {new Date().getFullYear()} Clifford University Alumni Association (CLUAA). All rights reserved.</p>
          <div className="flex gap-4 text-xs text-white/35">
            <button className="hover:text-white/60 transition-colors">Privacy Policy</button>
            <button className="hover:text-white/60 transition-colors">Terms of Use</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
