import { useState } from "react";
import { showToast } from "../components/Toast";

type Page = "home" | "about" | "directory" | "events" | "news" | "career" | "business" | "welfare" | "leadership" | "gallery" | "finance" | "donate" | "contact" | "login" | "register" | "dashboard" | "admin" | "passcode" | "study" | "exam";

interface StudyModeProps {
  onNavigate?: (page: Page) => void;
}

interface Topic {
  id: string;
  name: string;
  questionCount: number;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
}

const SUBJECT_DATA: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: "📐",
    topics: [
      { id: "m1", name: "Algebra & Polynomials", questionCount: 45 },
      { id: "m2", name: "Trigonometry & Identities", questionCount: 38 },
      { id: "m3", name: "Calculus (Differentiation & Integration)", questionCount: 50 },
      { id: "m4", name: "Probability & Statistics", questionCount: 40 },
      { id: "m5", name: "Matrices & Determinants", questionCount: 30 },
      { id: "m6", name: "Logarithms & Indices", questionCount: 35 },
      { id: "m7", name: "Coordinate Geometry", questionCount: 42 },
    ],
  },
  {
    id: "eng",
    name: "English Language",
    icon: "📚",
    topics: [
      { id: "e1", name: "Comprehension & Passages", questionCount: 60 },
      { id: "e2", name: "Lexis and Structure", questionCount: 85 },
      { id: "e3", name: "Synonyms & Antonyms", questionCount: 50 },
      { id: "e4", name: "Oral English & Phonetics", questionCount: 40 },
      { id: "e5", name: "Sentence Completion & Idioms", questionCount: 45 },
    ],
  },
  {
    id: "phy",
    name: "Physics",
    icon: "⚡",
    topics: [
      { id: "p1", name: "Motion, Force & Momentum", questionCount: 40 },
      { id: "p2", name: "Work, Energy & Power", questionCount: 35 },
      { id: "p3", name: "Electricity & Magnetism", questionCount: 55 },
      { id: "p4", name: "Waves & Optics", questionCount: 45 },
      { id: "p5", name: "Thermal Physics & Heat", questionCount: 30 },
      { id: "p6", name: "Atomic & Nuclear Physics", questionCount: 38 },
    ],
  },
  {
    id: "chem",
    name: "Chemistry",
    icon: "🧪",
    topics: [
      { id: "c1", name: "Atomic Structure & Bonding", questionCount: 50 },
      { id: "c2", name: "Organic Chemistry & Hydrocarbons", questionCount: 65 },
      { id: "c3", name: "Stoichiometry & Chemical Equations", questionCount: 40 },
      { id: "c4", name: "Electrochemistry & Redox", questionCount: 35 },
      { id: "c5", name: "Periodic Table & Trends", questionCount: 30 },
      { id: "c6", name: "Acids, Bases & Salts", questionCount: 42 },
    ],
  },
  {
    id: "bio",
    name: "Biology",
    icon: "🧬",
    topics: [
      { id: "b1", name: "Cell Structure & Function", questionCount: 45 },
      { id: "b2", name: "Genetics & Inheritance", questionCount: 50 },
      { id: "b3", name: "Ecology & Ecosystems", questionCount: 40 },
      { id: "b4", name: "Plant & Animal Nutrition", questionCount: 38 },
      { id: "b5", name: "Transport System in Organisms", questionCount: 35 },
    ],
  },
];

export default function StudyMode({ onNavigate }: StudyModeProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("math");
  const [selectedTopicIds, setSelectedTopicIds] = useState<Record<string, string[]>>({
    math: ["m1", "m2"],
  });
  const [isStudying, setIsStudying] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  const activeSubject = SUBJECT_DATA.find((s) => s.id === selectedSubjectId) || SUBJECT_DATA[0];
  const activeTopics = activeSubject.topics;
  const selectedInActiveSubject = selectedTopicIds[selectedSubjectId] || [];

  const handleToggleTopic = (topicId: string) => {
    setSelectedTopicIds((prev) => {
      const currentList = prev[selectedSubjectId] || [];
      const exists = currentList.includes(topicId);
      const updated = exists
        ? currentList.filter((id) => id !== topicId)
        : [...currentList, topicId];
      return { ...prev, [selectedSubjectId]: updated };
    });
  };

  const handleSelectAllTopics = () => {
    setSelectedTopicIds((prev) => ({
      ...prev,
      [selectedSubjectId]: activeTopics.map((t) => t.id),
    }));
  };

  const handleDeselectAllTopics = () => {
    setSelectedTopicIds((prev) => ({
      ...prev,
      [selectedSubjectId]: [],
    }));
  };

  const totalSelectedTopicsCount = Object.values(selectedTopicIds).reduce(
    (acc, list) => acc + list.length,
    0
  );

  const startStudySession = () => {
    if (totalSelectedTopicsCount === 0) {
      showToast("Please select at least one topic under a subject to practice.", "error");
      return;
    }
    setIsStudying(true);
    setCurrentQuestionIndex(0);
    showToast(`Study session started with ${totalSelectedTopicsCount} topic(s) selected!`, "success");
  };

  // Mock study practice questions based on selected topics
  const practiceQuestions = [
    {
      id: 1,
      subject: activeSubject.name,
      topic: activeTopics.find((t) => selectedInActiveSubject.includes(t.id))?.name || "General Topic",
      text: "Solve for x in the quadratic equation: x^2 - 5x + 6 = 0",
      options: ["x = 2 or x = 3", "x = -2 or x = -3", "x = 1 or x = 6", "x = 0 or x = 5"],
      correct: "x = 2 or x = 3",
      explanation: "Factoring: (x - 2)(x - 3) = 0 => x = 2 or x = 3.",
    },
    {
      id: 2,
      subject: activeSubject.name,
      topic: "Core Principles",
      text: "Evaluate \\int (2x + 3) dx",
      options: ["x^2 + 3x + C", "2x^2 + 3x + C", "x^2 + C", "3x^2 + 2 + C"],
      correct: "x^2 + 3x + C",
      explanation: "Using integration power rule: \\int 2x dx = x^2 and \\int 3 dx = 3x, giving x^2 + 3x + C.",
    },
    {
      id: 3,
      subject: activeSubject.name,
      topic: "Formula Practice",
      text: "Calculate the value of sin(30^\\circ) + cos(60^\\circ)",
      options: ["1", "0.5", "\\sqrt{3}", "2"],
      correct: "1",
      explanation: "sin(30°) = 0.5 and cos(60°) = 0.5. Sum = 0.5 + 0.5 = 1.",
    },
  ];

  const currentQ = practiceQuestions[currentQuestionIndex];

  return (
    <div className="bg-[var(--background)] min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-[var(--secondary)] text-white rounded-2xl p-6 sm:p-8 mb-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[var(--accent)] text-xs font-semibold uppercase tracking-widest block mb-1">
              Interactive Study Mode
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Topic-Specific Practice
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              Select your subjects and specific topics under each subject to customize your study session.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("exam")}
              className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--primary)] transition-colors whitespace-nowrap"
            >
              Go to Full Exam Mode →
            </button>
          )}
        </div>

        {!isStudying ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subject List sidebar */}
            <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-sm">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                1. Select Subject
              </h2>
              <div className="space-y-2">
                {SUBJECT_DATA.map((subject) => {
                  const selectedCount = (selectedTopicIds[subject.id] || []).length;
                  const isSelected = subject.id === selectedSubjectId;

                  return (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between border ${
                        isSelected
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm font-semibold"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{subject.icon}</span>
                        <span className="text-sm">{subject.name}</span>
                      </div>
                      {selectedCount > 0 && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isSelected
                              ? "bg-white text-[var(--primary)]"
                              : "bg-[var(--accent)] text-white"
                          }`}
                        >
                          {selectedCount} topic{selectedCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Selection Panel */}
            <div className="lg:col-span-2 bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-4 gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <span>{activeSubject.icon}</span>
                      <span>Topics in {activeSubject.name}</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Check the specific topics you want to practice under this subject.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllTopics}
                      className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium rounded-lg transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllTopics}
                      className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium rounded-lg transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {activeTopics.map((topic) => {
                    const isChecked = selectedInActiveSubject.includes(topic.id);

                    return (
                      <label
                        key={topic.id}
                        onClick={() => handleToggleTopic(topic.id)}
                        className={`p-3.5 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? "bg-amber-50/70 border-amber-300 shadow-sm"
                            : "bg-gray-50/50 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 accent-[var(--accent)] w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`text-xs font-semibold ${isChecked ? "text-amber-900" : "text-gray-800"}`}>
                            {topic.name}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {topic.questionCount} practice questions
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action summary & button */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Selection Summary</p>
                  <p className="text-sm font-bold text-gray-800">
                    {totalSelectedTopicsCount} topic(s) selected across subjects
                  </p>
                </div>

                <button
                  onClick={startStudySession}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl text-sm hover:bg-[var(--accent)] transition-colors shadow-sm"
                >
                  Start Practice Session →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Study Session Screen */
          <div className="bg-white border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  {currentQ.subject} · {currentQ.topic}
                </span>
                <h2 className="text-lg font-bold text-gray-800">
                  Question {currentQuestionIndex + 1} of {practiceQuestions.length}
                </h2>
              </div>
              <button
                onClick={() => setIsStudying(false)}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-lg"
              >
                ← Back to Topic Selection
              </button>
            </div>

            {/* Question Text */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
              <p className="text-base font-medium text-gray-900 leading-relaxed font-mono">
                {currentQ.text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                const optLetter = String.fromCharCode(65 + idx);
                const isSelected = selectedAnswers[currentQuestionIndex] === opt;

                return (
                  <button
                    key={opt}
                    onClick={() =>
                      setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: opt })
                    }
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      isSelected
                        ? "bg-amber-100 border-amber-400 font-semibold text-amber-950"
                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal button */}
            <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={() =>
                  setShowExplanations({
                    ...showExplanations,
                    [currentQuestionIndex]: !showExplanations[currentQuestionIndex],
                  })
                }
                className="text-xs font-bold text-[var(--primary)] hover:underline"
              >
                {showExplanations[currentQuestionIndex] ? "Hide Answer & Explanation" : "💡 Show Answer & Explanation"}
              </button>

              <div className="flex gap-2">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((i) => i - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={currentQuestionIndex === practiceQuestions.length - 1}
                  onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                  className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--accent)]"
                >
                  Next Question →
                </button>
              </div>
            </div>

            {showExplanations[currentQuestionIndex] && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Correct Answer: {currentQ.correct}</p>
                <p className="text-emerald-800">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
