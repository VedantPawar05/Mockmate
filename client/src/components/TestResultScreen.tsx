import { useState } from "react";
import { MockInterview, Question } from "@/vite-env";
import Loader from "./Loader/Loader";

const OPTION_LABELS = ["A", "B", "C", "D"];

interface Props {
  interviewData: MockInterview;
  onGetAIReview: () => Promise<void>;
  aiLoading: boolean;
}

// ── MCQ Question Result Card ─────────────────────────────────────────────────
const MCQCard = ({ q, idx }: { q: Question; idx: number }) => {
  const correct = q.correctAnswer || "";
  const selected = q.selectedOption || "";
  const isCorrect = !!selected && selected === correct;
  const isWrong = !!selected && selected !== correct;

  return (
    <div className="rounded-xl border-2 border-zinc-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4 bg-zinc-800">
        <p className="text-white font-medium text-sm flex-1">
          <span className="text-zinc-400 mr-2">Q{idx + 1}.</span>
          {q.question}
        </p>
        <div className="flex gap-2 flex-shrink-0 items-center">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-900/60 text-violet-300 border border-violet-600/40">MCQ</span>
          {isCorrect && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-900 text-green-300">✓ Correct</span>}
          {isWrong && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-900 text-red-300">✗ Wrong</span>}
          {!selected && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-700 text-zinc-400">Skipped</span>}
        </div>
      </div>

      {/* Options */}
      <div className="p-4 bg-zinc-900 space-y-2">
        {(q.options || []).map((opt, oi) => {
          const label = OPTION_LABELS[oi];
          const isCorrectOpt = label === correct;
          const isSelectedOpt = label === selected;
          return (
            <div
              key={oi}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 text-sm transition-all
                ${isCorrectOpt
                  ? "border-green-500 bg-green-900/30 text-green-100 font-semibold"
                  : isSelectedOpt && !isCorrectOpt
                  ? "border-red-500 bg-red-900/30 text-red-100"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-400"}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${isCorrectOpt ? "bg-green-600 text-white"
                  : isSelectedOpt && !isCorrectOpt ? "bg-red-600 text-white"
                  : "bg-zinc-700 text-zinc-300"}`}>
                {label}
              </span>
              <span className="flex-1">{opt.replace(/^[A-D]\.\s?/, "")}</span>
              {isCorrectOpt && isSelectedOpt && <span className="text-green-400 text-xs font-bold ml-auto">✓ Your Answer (Correct!)</span>}
              {isCorrectOpt && !isSelectedOpt && <span className="text-green-400 text-xs font-bold ml-auto">← Correct Answer</span>}
              {isSelectedOpt && !isCorrectOpt && <span className="text-red-400 text-xs font-bold ml-auto">← Your Answer</span>}
            </div>
          );
        })}
        {!selected && (
          <div className="text-zinc-500 italic text-sm mt-1">
            You did not select any option. Correct answer: <span className="font-bold text-green-400">{correct}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Theory Question Result Card ───────────────────────────────────────────────
const TheoryCard = ({ q, idx }: { q: Question; idx: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border-2 border-zinc-700 overflow-hidden">
      <button
        className="w-full flex items-start justify-between gap-3 p-4 bg-zinc-800 hover:bg-zinc-750 text-left"
        onClick={() => setOpen((p) => !p)}
      >
        <p className="text-white font-medium text-sm flex-1">
          <span className="text-zinc-400 mr-2">Q{idx + 1}.</span>
          {q.question}
        </p>
        <div className="flex gap-2 flex-shrink-0 items-center">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-900/60 text-amber-300 border border-amber-600/40">Theory</span>
          <span className="text-zinc-400 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="p-4 bg-zinc-900 border-t border-zinc-700 space-y-3">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Your Answer</p>
            <p className="text-zinc-300 text-sm whitespace-pre-wrap">
              {q.answer
                ? String(q.answer).replace(/^(Text Response:|Code Response:)/gm, "\n$1")
                : <span className="italic text-zinc-500">No answer provided</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Result Screen ────────────────────────────────────────────────────────
const TestResultScreen: React.FC<Props> = ({ interviewData, onGetAIReview, aiLoading }) => {
  const allQuestions: Question[] = [
    ...(interviewData.technicalQuestions || []),
    ...(interviewData.coreSubjectQuestions || []),
    ...(interviewData.dsaQuestions || []),
  ];

  const mcqQs = allQuestions.filter((q) => q.questionFormat === "mcq");
  const mcqCorrect = mcqQs.filter((q) => q.selectedOption && q.selectedOption === q.correctAnswer).length;
  const mcqWrong = mcqQs.filter((q) => q.selectedOption && q.selectedOption !== q.correctAnswer).length;
  const mcqSkipped = mcqQs.filter((q) => !q.selectedOption).length;
  const theoryQs = allQuestions.filter((q) => q.questionFormat !== "mcq");
  const pct = mcqQs.length > 0 ? Math.round((mcqCorrect / mcqQs.length) * 100) : 0;

  if (aiLoading) return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-4">
      <Loader />
      <p className="text-zinc-300 text-lg">Generating AI Review... Please wait</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="bg-zinc-800/80 backdrop-blur border-b border-zinc-700 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4AE087] via-[#84B7D4] to-[#9D7AEA] bg-clip-text text-transparent">
            Test Completed!
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Review your answers before submitting for AI grading</p>
        </div>
        <button
          onClick={onGetAIReview}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-violet-900/40 transition-all hover:scale-105 active:scale-95"
        >
          🤖 Get Full AI Review →
        </button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Score Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-center">
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-1">MCQ Score</p>
            <p className="text-3xl font-bold text-blue-400">{mcqCorrect}/{mcqQs.length}</p>
          </div>
          <div className={`bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-center`}>
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-1">Accuracy</p>
            <p className={`text-3xl font-bold ${pct >= 70 ? "text-green-400" : pct >= 40 ? "text-yellow-400" : "text-red-400"}`}>
              {mcqQs.length > 0 ? `${pct}%` : "N/A"}
            </p>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-center">
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-1">Correct</p>
            <p className="text-3xl font-bold text-green-400">{mcqCorrect}</p>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-center">
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-1">Wrong / Skipped</p>
            <p className="text-3xl font-bold text-red-400">{mcqWrong + mcqSkipped}</p>
          </div>
        </div>

        {/* Progress bar */}
        {mcqQs.length > 0 && (
          <div className="mb-8 bg-zinc-800 border border-zinc-700 rounded-2xl p-5">
            <div className="flex justify-between text-xs text-zinc-400 mb-2">
              <span>MCQ Performance</span>
              <span>{mcqCorrect} correct · {mcqWrong} wrong · {mcqSkipped} skipped</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-700 overflow-hidden flex">
              <div className="bg-green-500 transition-all" style={{ width: `${(mcqCorrect / mcqQs.length) * 100}%` }} />
              <div className="bg-red-500 transition-all" style={{ width: `${(mcqWrong / mcqQs.length) * 100}%` }} />
              <div className="bg-zinc-600 transition-all" style={{ width: `${(mcqSkipped / mcqQs.length) * 100}%` }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-green-400">■ Correct</span>
              <span className="text-red-400">■ Wrong</span>
              <span className="text-zinc-400">■ Skipped</span>
            </div>
          </div>
        )}

        {/* MCQ Questions */}
        {mcqQs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-violet-300 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center text-xs">{mcqQs.length}</span>
              MCQ Questions
            </h2>
            <div className="space-y-4">
              {allQuestions.map((q, i) =>
                q.questionFormat === "mcq" ? <MCQCard key={i} q={q} idx={i} /> : null
              )}
            </div>
          </div>
        )}

        {/* Theory Questions */}
        {theoryQs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-xs">{theoryQs.length}</span>
              Theory Questions
            </h2>
            <div className="space-y-4">
              {allQuestions.map((q, i) =>
                q.questionFormat !== "mcq" ? <TheoryCard key={i} q={q} idx={i} /> : null
              )}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-violet-900/40 to-blue-900/40 border border-violet-700/50 rounded-2xl p-6 text-center">
          <p className="text-zinc-300 mb-4">Ready for detailed AI feedback on your theory answers and overall performance?</p>
          <button
            onClick={onGetAIReview}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-violet-900/40 transition-all hover:scale-105 active:scale-95"
          >
            🤖 Submit for Full AI Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResultScreen;

