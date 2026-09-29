import { useState, useEffect } from "react";
import { getSavedTerminalProfiles, SavedProfile } from "./PasscodeLogin";
import { showToast } from "../components/Toast";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin" | "passcode" | "study" | "exam";

interface ExamInterfaceProps {
  onNavigate?: (page: Page) => void;
  candidateProfile?: SavedProfile | null;
}

interface Question {
  id: number;
  subject: string;
  topic: string;
  questionText: string;
  options: string[];
}

const SAMPLE_EXAM_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "Mathematics",
    topic: "Algebra & Polynomials",
    questionText: "If f(x) = 2x^2 - 3x + 1, what is the value of f(3)?",
    options: ["10", "16", "13", "8"],
  },
  {
    id: 2,
    subject: "Mathematics",
    topic: "Calculus",
    questionText: "Find the derivative \\frac{d}{dx}(3x^3 - 5x + 7).",
    options: ["9x^2 - 5", "6x^2 - 5", "9x^2 + 7", "3x^2 - 5"],
  },
  {
    id: 3,
    subject: "English Language",
    topic: "Lexis and Structure",
    questionText: "Choose the word opposite in meaning to 'METICULOUS':",
    options: ["Careless", "Thorough", "Detailed", "Precise"],
  },
  {
    id: 4,
    subject: "Physics",
    topic: "Motion & Force",
    questionText: "A body of mass 5 kg accelerates at 4 m/s^2. What is the net force acting on it?",
    options: ["20 N", "1.25 N", "9 N", "25 N"],
  },
  {
    id: 5,
    subject: "Chemistry",
    topic: "Atomic Structure",
    questionText: "What is the atomic number of Nitrogen?",
    options: ["7", "14", "6", "8"],
  },
];

export default function ExamInterface({ onNavigate, candidateProfile }: ExamInterfaceProps) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60); // 45 minutes countdown
  const [activeCandidate, setActiveCandidate] = useState<SavedProfile | null>(candidateProfile || null);

  useEffect(() => {
    if (!activeCandidate) {
      const saved = getSavedTerminalProfiles();
      if (saved.length > 0) {
        setActiveCandidate(saved[0]);
      } else {
        // Fallback default candidate profile
        setActiveCandidate({
          id: "cand_demo",
          name: "Candidate User",
          email: "candidate@examterminal.ng",
          passcode: "PASS-DEMO",
          photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format",
          lastLoginAt: new Date().toISOString(),
        });
      }
    }
  }, [candidateProfile]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showToast("Time expired! Your exam has been automatically submitted.", "info");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remSecs.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (qIndex: number, option: string) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmitExam = () => {
    const answeredCount = Object.keys(userAnswers).length;
    if (confirm(`Are you sure you want to submit your exam? You answered ${answeredCount} of ${SAMPLE_EXAM_QUESTIONS.length} questions.`)) {
      showToast("Exam submitted successfully! Score report generated.", "success");
      if (onNavigate) onNavigate("dashboard");
    }
  };

  const currentQ = SAMPLE_EXAM_QUESTIONS[currentQIndex];
  const candidateImage = activeCandidate?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format";

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col">
      {/* Exam Header */}
      <header className="bg-[var(--secondary)] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h1 className="font-display font-bold text-lg sm:text-xl leading-tight">
              CBT Computer Based Testing Terminal
            </h1>
            <p className="text-xs text-[var(--accent)] font-medium">
              Official Session Examination
            </p>
          </div>
        </div>

        {/* Live Timer Badge */}
        <div className="bg-red-600/90 text-white px-4 py-2 rounded-xl font-mono text-lg font-bold shadow-inner flex items-center gap-2">
          <span className="animate-pulse">⏱</span>
          <span>{formatTime(timeLeftSeconds)}</span>
        </div>
      </header>

      {/* Main Exam Area with Right Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Area: Question content */}
        <div className="lg:col-span-3 bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  Subject: {currentQ.subject}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Topic: {currentQ.topic}
                </p>
              </div>
              <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                Question {currentQIndex + 1} / {SAMPLE_EXAM_QUESTIONS.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
              <p className="text-base font-medium text-gray-900 leading-relaxed font-mono">
                {currentQ.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = userAnswers[currentQIndex] === option;

                return (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(currentQIndex, option)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      isSelected
                        ? "bg-amber-100 border-amber-400 font-semibold text-amber-950 shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {letter}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Navigation Controls */}
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((prev) => prev - 1)}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous
            </button>

            <button
              disabled={currentQIndex === SAMPLE_EXAM_QUESTIONS.length - 1}
              onClick={() => setCurrentQIndex((prev) => prev + 1)}
              className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl text-xs font-semibold hover:bg-[var(--accent)] disabled:opacity-40"
            >
              Next Question →
            </button>
          </div>
        </div>

        {/* Right Sidebar: Candidate Profile Picture & Exam Status */}
        <aside className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Candidate Photo & Details */}
            <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-[var(--primary)] shadow-md mb-3 bg-white">
                <img
                  src={candidateImage}
                  alt={activeCandidate?.name || "Candidate"}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-sm text-gray-900 leading-snug">
                {activeCandidate?.name || "Candidate"}
              </h3>
              <p className="text-xs text-[var(--primary)] font-semibold mt-0.5">
                {activeCandidate?.email || "candidate@exam.ng"}
              </p>
              <div className="mt-2 inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                PASSCODE: {activeCandidate?.passcode || "VERIFIED"}
              </div>
            </div>

            {/* Question Palette Grid */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Question Navigator
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {SAMPLE_EXAM_QUESTIONS.map((q, idx) => {
                  const isAnswered = userAnswers[idx] !== undefined;
                  const isCurrent = currentQIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                        isCurrent
                          ? "ring-2 ring-[var(--accent)] bg-[var(--primary)] text-white shadow-sm"
                          : isAnswered
                          ? "bg-emerald-500 text-white font-extrabold"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              onClick={handleSubmitExam}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow transition-colors"
            >
              Submit Final Exam
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
