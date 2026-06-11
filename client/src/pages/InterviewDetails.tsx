import React, { useEffect, useState } from "react";
import { Question, Interview } from "../types/global";
import Rating from "../components/Rating";
import Loader from "../components/Loader/Loader";
import { getInterviewByID } from "@/api/mockinterview.api";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { FileDown } from "lucide-react";

// ── MCQ Result Card ──────────────────────────────────────────────────────────
const MCQResultCard: React.FC<{ q: Question; index: number }> = ({ q, index }) => {
  const options = q.options || [];
  const correct = q.correctAnswer || "";
  const selected = q.selectedOption || "";
  const isCorrect = selected && selected === correct;
  const isWrong = selected && selected !== correct;

  return (
    <div className="glass rounded-2xl border border-white/6 overflow-hidden transition-all duration-300">
      <div className="p-5 bg-white/4 flex justify-between items-start gap-3 border-b border-white/6">
        <span className="text-white font-semibold text-sm flex-1">{index + 1}. {q.question}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isCorrect && <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ Correct</span>}
          {isWrong && <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">✗ Wrong</span>}
          {!selected && <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white/5 text-white/40 border border-white/10">Skipped</span>}
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">MCQ</span>
        </div>
      </div>
      <div className="p-5 space-y-2.5">
        {options.map((opt, oi) => {
          const label = ["A", "B", "C", "D"][oi];
          const isCorrectOpt = label === correct;
          const isSelectedOpt = label === selected;
          return (
            <div
              key={oi}
              className={`px-4 py-3 rounded-xl text-sm border flex items-center gap-3 transition-all duration-200
                ${isCorrectOpt ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 font-semibold" :
                  isSelectedOpt && !isCorrectOpt ? "border-red-500/30 bg-red-500/10 text-red-200" :
                  "border-white/6 bg-white/2 hover:bg-white/4 text-white/50"}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${isCorrectOpt ? "bg-emerald-500 text-black" :
                  isSelectedOpt && !isCorrectOpt ? "bg-red-500 text-white" :
                  "bg-white/10 text-white/70"}`}>{label}</span>
              <span>{opt.replace(/^[A-D]\. ?/, "")}</span>
              {isCorrectOpt && <span className="ml-auto text-emerald-400 text-xs font-bold">✓ Correct</span>}
              {isSelectedOpt && !isCorrectOpt && <span className="ml-auto text-red-400 text-xs font-bold">Your choice</span>}
              {isSelectedOpt && isCorrectOpt && <span className="ml-auto text-emerald-300 text-xs font-bold">✓ Your choice</span>}
            </div>
          );
        })}
        {!selected && (
          <p className="text-white/30 italic text-sm mt-2">No option selected</p>
        )}
        {q.review && (
          <div className="mt-4 border-t border-white/6 pt-4">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">AI Review</p>
            <p className="text-white/70 text-sm leading-relaxed">{q.review}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Score Report Question List ────────────────────────────────────────────────
const QuestionList: React.FC<{ title: string; questions: Question[]; color: string }> = ({
  title, questions, color,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="mt-6">
      <h3 className={`text-lg font-semibold mb-4 ${color}`}>{title}</h3>
      <div className="space-y-3">
        {questions.map((q, i) =>
          q.questionFormat === "mcq" ? (
            <MCQResultCard key={i} q={q} index={i} />
          ) : (
            <div key={i} className="glass rounded-2xl border border-white/6 overflow-hidden transition-all duration-300">
              <button
                className="w-full text-left p-5 bg-white/4 hover:bg-white/6 flex justify-between items-center transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-white font-medium text-sm">{i + 1}. {q.question}</span>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Theory</span>
                  {q.marks !== undefined && (
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                      q.marks >= 7 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                      q.marks >= 4 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                      "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {q.marks}/10
                    </span>
                  )}
                  {q.timeSpent !== undefined && (
                    <span className="text-white/40 text-xs">{Math.floor(q.timeSpent / 60)}m {q.timeSpent % 60}s</span>
                  )}
                  <span className="text-white/30 text-xs">{openIndex === i ? "▲" : "▼"}</span>
                </div>
              </button>
              {openIndex === i && (
                <div className="p-5 bg-black/20 space-y-4 border-t border-white/6">
                  <div>
                    <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mb-1">Your Answer</p>
                    <p className="text-white/80 text-sm leading-relaxed">{q.answer || <span className="italic text-white/30">No answer provided</span>}</p>
                  </div>
                  {q.correctAns && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Model Answer</p>
                      <p className="text-white/80 text-sm leading-relaxed">{q.correctAns}</p>
                    </div>
                  )}
                  {q.review && (
                    <div>
                      <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">AI Review</p>
                      <p className="text-white/80 text-sm leading-relaxed">{q.review}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="glass glass-hover rounded-2xl p-5 flex flex-col items-center justify-center text-center">
    <span className="text-white/45 text-xs uppercase tracking-widest font-semibold mb-2">{label}</span>
    <span className={`text-3xl font-black ${color}`}>{value}</span>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export function InterviewDetails() {
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<Interview>();
  const { id } = useParams();

  useEffect(() => {
    getInterviewByID(id || "")
      .then((r) => { setInterview(r); setLoading(false); })
      .catch((e) => { console.error(e); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#050508]"><Loader /></div>;

  const allQuestions = [
    ...(interview?.dsaQuestions || []),
    ...(interview?.technicalQuestions || []),
    ...(interview?.coreSubjectQuestions || []),
  ];
  const totalMarks = allQuestions.reduce((a, q) => a + (q.marks || 0), 0);
  const maxMarks = allQuestions.length * 10;
  const pct = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;
  const totalTime = interview?.totalTimeSpent || allQuestions.reduce((a, q) => a + (q.timeSpent || 0), 0);
  const mins = Math.floor(totalTime / 60);
  const secs = totalTime % 60;

  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-x-hidden">
      {/* Ambient backgrounds */}
      <div className="fixed top-0 right-1/4 w-96 h-96 rounded-full bg-violet-900/20 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 left-0 w-80 h-80 rounded-full bg-blue-900/15 blur-[100px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none z-0" />

      <Navbar />

      <div className="max-w-5xl mx-auto px-5 pt-28 pb-20 relative z-10 space-y-8">
        <div>
          <BackButton />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/6 pb-7 gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{interview?.jobRole}</h1>
            <p className="text-white/40 text-sm mt-2">{interview?.targetCompany} · {interview?.experienceLevel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Rating experienceLevel={interview?.experienceLevel || ""} rating={interview?.overallRating || 0} />
            <button
              onClick={() => {
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
                window.open(`${API_BASE_URL}/api/reports/pdf/${id}`, "_blank");
              }}
              className="glass-btn-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <FileDown className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Score" value={`${totalMarks}/${maxMarks}`} color="text-blue-400" />
          <StatCard label="Percentage" value={`${pct}%`} color={pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400"} />
          <StatCard label="Questions" value={allQuestions.length} color="text-violet-400" />
          <StatCard label="Time Spent" value={`${mins}m ${secs}s`} color="text-orange-400" />
        </div>

        {/* Overall Review */}
        {interview?.overallReview && (
          <div className="glass rounded-2xl p-6 border border-white/6">
            <h2 className="text-base font-semibold text-white mb-3">Overall AI Review</h2>
            <p className="text-white/60 text-sm leading-relaxed">{interview.overallReview}</p>
          </div>
        )}

        {/* Weak Topics */}
        {interview?.weakTopics && interview.weakTopics.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-red-300 mb-4">⚠️ Weak Topics — Focus Here</h2>
            <div className="flex flex-wrap gap-2">
              {interview.weakTopics.map((t, i) => (
                <span key={i} className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Topic Ratings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "DSA", val: interview?.dsaRating, color: "text-cyan-400" },
            { label: "Technical", val: interview?.technicalRating, color: "text-violet-400" },
            { label: "Core", val: interview?.coreRating, color: "text-amber-400" },
          ].map(({ label, val, color }) => val !== undefined && (
            <div key={label} className="glass rounded-2xl p-5 text-center border border-white/6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{label} Rating</p>
              <p className={`text-3xl font-black ${color}`}>{val}/5</p>
            </div>
          ))}
        </div>

        {/* Question Breakdown */}
        <div>
          <h2 className="text-xl font-semibold text-white">Per-Question Breakdown</h2>
          {interview?.dsaQuestions && interview.dsaQuestions.length > 0 && (
            <QuestionList title="DSA Questions" questions={interview.dsaQuestions} color="text-cyan-400" />
          )}
          {interview?.technicalQuestions && interview.technicalQuestions.length > 0 && (
            <QuestionList title="Technical Questions" questions={interview.technicalQuestions} color="text-violet-400" />
          )}
          {interview?.coreSubjectQuestions && interview.coreSubjectQuestions.length > 0 && (
            <QuestionList title="Core Subject Questions" questions={interview.coreSubjectQuestions} color="text-amber-400" />
          )}
        </div>
      </div>
    </div>
  );
}
