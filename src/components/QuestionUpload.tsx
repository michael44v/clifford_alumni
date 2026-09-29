import { useState } from "react";
import KaTeXPreview from "./KaTeXPreview";
import { showToast } from "./Toast";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export default function QuestionUpload() {
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("Algebra & Equations");
  const [questionText, setQuestionText] = useState("Evaluate \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} for a = 1, b = -5, c = 6");
  const [explanation, setExplanation] = useState("Using quadratic formula x = \\frac{-(-5) \\pm \\sqrt{25 - 24}}{2} = \\frac{5 \\pm 1}{2}");
  const [options, setOptions] = useState<Option[]>([
    { id: "opt1", text: "x = 2 or x = 3", isCorrect: true },
    { id: "opt2", text: "x = -2 or x = -3", isCorrect: false },
    { id: "opt3", text: "x = 1 or x = 6", isCorrect: false },
    { id: "opt4", text: "x = 0 or x = 5", isCorrect: false },
  ]);

  const handleOptionTextChange = (id: string, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleSetCorrect = (id: string) => {
    setOptions(options.map((o) => ({ ...o, isCorrect: o.id === id })));
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      showToast("Question text cannot be empty.", "error");
      return;
    }
    showToast("Question saved successfully with LaTeX formula rendering!", "success");
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Question Upload & Live KaTeX Equation Preview
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Type LaTeX formulas directly into any field (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">\frac&#123;a&#125;&#123;b&#125;</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">x^2 + y^2 = z^2</code>). It will automatically render in the live preview on the right.
        </p>
      </div>

      <form onSubmit={handleSaveQuestion} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form Input Fields (No separate formula editor!) */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Question Text (Type LaTeX directly)
            </label>
            <textarea
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter question text with LaTeX..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Answer Options
            </label>
            <div className="space-y-3">
              {options.map((opt, idx) => {
                const optLetter = String.fromCharCode(65 + idx);

                return (
                  <div key={opt.id} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700 flex-shrink-0">
                      {optLetter}
                    </span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-600">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => handleSetCorrect(opt.id)}
                        className="accent-emerald-600"
                      />
                      Correct
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Answer Explanation (Optional)
            </label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explanation with LaTeX formula..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-xl text-sm hover:bg-[var(--accent)] transition-colors shadow-sm"
          >
            Save & Publish Question
          </button>
        </div>

        {/* Right Column: Live KaTeX Side Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">
                Live Formula & Question Side Preview
              </span>
              <span className="text-[11px] text-gray-500 font-medium">KaTeX Render Engine</span>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {subject} · {topic}
                </span>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <KaTeXPreview text={questionText} className="text-base text-gray-900 font-medium" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Options Preview
                </span>
                <div className="space-y-2">
                  {options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                          opt.isCorrect
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold"
                            : "bg-white border-slate-200 text-gray-800"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            opt.isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {letter}
                        </span>
                        <KaTeXPreview text={opt.text} className="text-sm" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {explanation && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Explanation Preview
                  </span>
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <KaTeXPreview text={explanation} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 text-center">
            <span className="text-[11px] text-slate-500">
              ✓ Formulas typed in inputs automatically render live above.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
