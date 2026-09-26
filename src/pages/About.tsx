type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";

interface AboutProps { onNavigate: (page: Page) => void; }

const milestones = [
  { year: "1994", event: "Clifford University founded with the vision of Excellence, Faith and Service" },
  { year: "2001", event: "First graduating class — 148 alumni from 6 faculties" },
  { year: "2005", event: "Clifford University Alumni Association (CUAA) formally constituted" },
  { year: "2010", event: "First Annual General Meeting (AGM) held on campus" },
  { year: "2016", event: "Alumni Association reaches 1,000 registered members" },
  { year: "2020", event: "CUAA welfare fund established; first set of beneficiaries supported" },
  { year: "2024", event: "Launch of the CUAA Digital Platform — uniting alumni across generations" },
];

export default function About({ onNavigate }: AboutProps) {
  return (
    <div className="bg-[var(--background)]">
      {/* Header */}
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Who We Are</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">About CUAA</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto leading-relaxed">
          The official alumni association of Clifford University, Owerrinta — connecting graduates across generations and geography.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* Motto */}
        <div className="text-center mb-10">
          <div className="inline-block bg-[var(--secondary)] text-white px-8 py-4 rounded">
            <p className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-1">Our Motto</p>
            <p className="font-display text-xl font-bold">"United in Excellence, Driven by Purpose."</p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          <div className="bg-white border border-[var(--border)] rounded p-8">
            <div className="w-10 h-10 bg-[var(--primary)] rounded flex items-center justify-center text-white text-lg mb-4">🎯</div>
            <h2 className="font-display text-xl font-bold text-[var(--secondary)] mb-3">Our Vision</h2>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
              Building a vibrant, inclusive, and supportive community that celebrates our shared heritage, promotes professional growth, and drives positive change in the world.
            </p>
          </div>
          <div className="bg-white border border-[var(--border)] rounded p-8">
            <div className="w-10 h-10 bg-[var(--accent)] rounded flex items-center justify-center text-white text-lg mb-4">🏛️</div>
            <h2 className="font-display text-xl font-bold text-[var(--secondary)] mb-3">Our Mission</h2>
            <ol className="space-y-3 text-sm text-[var(--muted-foreground)] leading-relaxed list-none">
              <li className="flex gap-2.5"><span className="flex-shrink-0 w-5 h-5 bg-[var(--primary)] text-white rounded-full text-[10px] flex items-center justify-center font-bold mt-0.5">1</span>Build an unparalleled, contribution-driven alumni network that elevates our alma mater to new heights of excellence.</li>
              <li className="flex gap-2.5"><span className="flex-shrink-0 w-5 h-5 bg-[var(--primary)] text-white rounded-full text-[10px] flex items-center justify-center font-bold mt-0.5">2</span>Inspire community growth and societal progress through transformative programs and empowering capacity-building initiatives.</li>
              <li className="flex gap-2.5"><span className="flex-shrink-0 w-5 h-5 bg-[var(--primary)] text-white rounded-full text-[10px] flex items-center justify-center font-bold mt-0.5">3</span>Drive nation-building and socio-economic advancement by championing a culture of value-based living among our citizens.</li>
            </ol>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-14">
          <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-6 text-center">Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "⭐", title: "Excellence", desc: "We uphold the highest standards in service delivery, member engagement, and institutional representation." },
              { icon: "✝️", title: "Faith", desc: "Rooted in the founding ethos of Clifford University, our association operates with integrity and moral purpose." },
              { icon: "🤝", title: "Service", desc: "We exist to serve our members, our alma mater, and the broader community through collective action." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[var(--muted)] rounded p-6 text-center">
                <span className="text-3xl block mb-3">{icon}</span>
                <h3 className="font-semibold text-[var(--secondary)] mb-2">{title}</h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* History Timeline */}
        <div className="mb-14">
          <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-8 text-center">Our History</h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--border)] hidden sm:block" />
            <div className="flex flex-col gap-6">
              {milestones.map(({ year, event }) => (
                <div key={year} className="flex gap-4 sm:gap-8 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--secondary)] text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                    {year.slice(2)}
                  </div>
                  <div className="flex-1 bg-white border border-[var(--border)] rounded p-4">
                    <p className="text-[var(--primary)] font-semibold text-sm mb-1">{year}</p>
                    <p className="text-sm text-[var(--foreground)]">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aims & Objectives */}
        <div className="mb-14 bg-white border border-[var(--border)] rounded p-8">
          <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-2">Aims & Objectives of the Association</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">The Clifford University Alumni Association is guided by the following aims and objectives:</p>
          <div className="flex flex-col gap-4">
            {[
              { roman: "I.", text: "To foster a united community among the graduates of Clifford University, promoting cordial relationships." },
              { roman: "II.", text: "To uphold law-abiding behavior among members, ensuring they remain exemplary representatives of Clifford University and its Alumni Association." },
              { roman: "III.", text: "To align with the evolving aspirations of the association's members." },
              { roman: "IV.", text: "To develop and offer resources and opportunities for members to access technical, professional knowledge, and information, aiming to enhance their skills and expertise." },
            ].map(({ roman, text }) => (
              <div key={roman} className="flex items-start gap-4 p-4 bg-[var(--muted)] rounded">
                <span className="flex-shrink-0 font-display text-[var(--primary)] font-bold text-base w-8">{roman}</span>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Org Structure */}
        <div className="bg-[var(--muted)] rounded p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--secondary)] mb-2">Organizational Structure</h2>
          <p className="text-[var(--muted-foreground)] text-sm mb-6">The association operates under a structured governance framework.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["General Assembly", "Executive Council (EXCO)", "Finance Committee", "Welfare Committee", "Technical / Digital Committee", "Disciplinary Committee"].map((body) => (
              <span key={body} className="px-4 py-2 bg-white border border-[var(--border)] rounded text-sm text-[var(--foreground)] font-medium">{body}</span>
            ))}
          </div>
          <button onClick={() => onNavigate("leadership")} className="mt-6 px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded text-sm hover:bg-[var(--accent)] transition-colors">
            Meet the Current EXCO
          </button>
        </div>
      </div>
    </div>
  );
}
