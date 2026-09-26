type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin";
interface LeadershipProps { onNavigate: (page: Page) => void; }

const exco = [
  {
    name: "Prof. Ifeanyi Madubueze",
    role: "President",
    set: "1999",
    faculty: "Law",
    bio: "Prof. Madubueze is a distinguished legal scholar and former Dean of the Faculty of Law at a federal university. He brings over 25 years of administrative and legal expertise to the association's leadership.",
    profession: "Professor of Public Law, Nnamdi Azikiwe University",
    location: "Awka, Anambra State",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Mrs. Chioma Eke",
    role: "Vice President",
    set: "2001",
    faculty: "Business Administration",
    bio: "Mrs. Eke is a seasoned business executive with expertise in organizational management and alumni relations. She champions inclusive membership and active alumni participation.",
    profession: "Chief Operating Officer, First Heritage Holdings",
    location: "Lagos, Lagos State",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Barr. Uche Nwosu",
    role: "General Secretary",
    set: "2003",
    faculty: "Law",
    bio: "Barr. Nwosu is a practicing barrister with over 18 years at the Bar. He leads the secretariat with precision, ensuring proper documentation and institutional continuity.",
    profession: "Managing Partner, Nwosu & Associates Legal Chambers",
    location: "Owerri, Imo State",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Alhaja Fatima Bello",
    role: "Financial Secretary",
    set: "2002",
    faculty: "Accounting",
    bio: "Alhaja Bello is a chartered accountant with extensive experience in financial management, auditing and non-profit governance. She oversees all financial transactions with transparency.",
    profession: "Director of Finance, Abuja Municipal Area Council",
    location: "Abuja, FCT",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Dr. Emeka Chukwu",
    role: "Treasurer",
    set: "2000",
    faculty: "Economics",
    bio: "Dr. Chukwu holds a PhD in Development Economics from the University of Ibadan. He manages the association's treasury and long-term financial planning.",
    profession: "Senior Economist, Central Bank of Nigeria",
    location: "Abuja, FCT",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Miss Adaeze Okafor",
    role: "Welfare Director",
    set: "2006",
    faculty: "Social Work",
    bio: "Miss Okafor coordinates the association's welfare activities, overseeing case management, emergency response and member support with compassion and professionalism.",
    profession: "Social Development Officer, UNICEF Nigeria",
    location: "Lagos, Lagos State",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Engr. Tunde Adeyemi",
    role: "Director of Communications",
    set: "2004",
    faculty: "Electrical Engineering",
    bio: "Engr. Adeyemi oversees all association communications, digital channels and media relations. He championed the development of this digital platform.",
    profession: "Head of ICT, Dangote Industries",
    location: "Lagos, Lagos State",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format",
  },
  {
    name: "Dr. Ngozi Obi",
    role: "Director of Career & Business",
    set: "2005",
    faculty: "Economics",
    bio: "Dr. Obi leads the Career & Business Hub, connecting alumni to job opportunities, mentorship and business partnerships across industries.",
    profession: "Partner, McKinsey & Company West Africa",
    location: "Lagos, Lagos State",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&auto=format",
  },
];

export default function Leadership({ onNavigate }: LeadershipProps) {
  return (
    <div className="bg-[var(--background)]">
      <div className="bg-[var(--secondary)] py-14 px-4 sm:px-6 text-white text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-widest uppercase mb-3">Governing Body</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">EXCO Leadership</h1>
        <p className="text-white/70 text-base max-w-xl mx-auto">
          Meet the executive council steering the Clifford University Alumni Association — 2023–2025 Administration.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* President feature */}
        <div className="bg-white border border-[var(--border)] rounded overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="h-64 md:h-auto bg-[var(--muted)] overflow-hidden">
              <img src={exco[0].img} alt={exco[0].name} className="w-full h-full object-cover" />
            </div>
            <div className="md:col-span-2 p-8 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 bg-[var(--secondary)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest rounded mb-3">President</span>
              <h2 className="font-display text-3xl font-bold text-[var(--secondary)] mb-1">{exco[0].name}</h2>
              <p className="text-[var(--primary)] font-medium text-sm mb-4">Set {exco[0].set} · {exco[0].faculty}</p>
              <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-4">{exco[0].bio}</p>
              <p className="text-sm text-[var(--foreground)]"><span className="font-medium">Current Role:</span> {exco[0].profession}</p>
              <p className="text-sm text-[var(--muted-foreground)]">📍 {exco[0].location}</p>
            </div>
          </div>
        </div>

        {/* Other EXCO */}
        <h3 className="font-display text-xl font-bold text-[var(--secondary)] mb-6">Executive Council Members</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exco.slice(1).map((member) => (
            <div key={member.name} className="bg-white border border-[var(--border)] rounded overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-44 bg-[var(--muted)] overflow-hidden">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <span className="inline-block px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] font-semibold uppercase tracking-wide rounded mb-2">{member.role}</span>
                <h4 className="font-semibold text-[var(--foreground)] mb-0.5">{member.name}</h4>
                <p className="text-[11px] text-[var(--primary)] font-medium mb-3">Set {member.set} · {member.faculty}</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3 line-clamp-3">{member.bio}</p>
                <p className="text-xs text-[var(--foreground)]">{member.profession}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">📍 {member.location}</p>
              </div>
            </div>
          ))}
        </div>

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
