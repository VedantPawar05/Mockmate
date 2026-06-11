import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader/Loader";
import { getAllInterviews } from "@/api/mockinterview.api";
import { getResources, getResourceIcon } from "@/utils/resources";
import BackButton from "@/components/BackButton";
import { RotateCcw, ChevronRight, Layers } from "lucide-react";

interface Flashcard {
  question: string;
  correctAnswer: string;
  options: string[];
  selectedOption: string;
  topic: string;
  jobRole: string;
}

export default function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<number>>(new Set());
  const [filterMode, setFilterMode] = useState<"wrong" | "all">("wrong");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllInterviews().then(interviews => {
      const result: Flashcard[] = [];
      for (const iv of interviews) {
        const allQs = [...(iv.dsaQuestions || []), ...(iv.technicalQuestions || []), ...(iv.coreSubjectQuestions || [])];
        for (const q of allQs) {
          if ((q as any).questionFormat !== "mcq") continue;
          const isWrong = !(q as any).selectedOption || (q as any).selectedOption !== (q as any).correctAnswer;
          if (filterMode === "wrong" && !isWrong) continue;
          result.push({
            question: String(q.question),
            correctAnswer: (q as any).correctAnswer || "",
            options: (q as any).options || [],
            selectedOption: (q as any).selectedOption || "",
            topic: String((q as any).technology || iv.jobRole || "General"),
            jobRole: iv.jobRole,
          });
        }
      }
      result.sort(() => Math.random() - 0.5);
      setCards(result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filterMode]);

  const currentCard = cards[currentIdx];
  const resources = currentCard ? getResources(currentCard.topic) : [];

  const next = () => {
    setFlipped(false);
    setTimeout(() => {
      if (currentIdx < cards.length - 1) setCurrentIdx(p => p + 1);
      else setCompleted(true);
    }, 200);
  };

  const markKnown = () => { setKnownIds(prev => new Set([...prev, currentIdx])); next(); };

  const restart = () => { setCurrentIdx(0); setFlipped(false); setKnownIds(new Set()); setCompleted(false); };

  const progressPct = cards.length > 0 ? Math.round((currentIdx / cards.length) * 100) : 0;

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#050508]"><Loader /></div>;

  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-x-hidden">
      {/* Premium Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-[0.24] pointer-events-none z-0 mix-blend-screen"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />
      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-violet-900/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-0 w-80 h-80 rounded-full bg-blue-900/10 blur-[100px] pointer-events-none z-0" />
      {/* Grid */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none z-0" />

      <Navbar />

      <div className="max-w-2xl mx-auto px-5 pt-28 pb-20 relative z-10 space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/6 pb-7">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center">
              <Layers className="w-6 h-6 text-white/50" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Flashcards</h1>
              <p className="text-white/40 text-sm mt-0.5">{cards.length} cards · {knownIds.size} mastered</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(["wrong", "all"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => { setFilterMode(mode); restart(); }}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  filterMode === mode ? "bg-white text-black" : "glass-btn text-white/60 hover:text-white"
                }`}
              >
                {mode === "wrong" ? "Wrong Only" : "All MCQs"}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-white/30 text-xs mb-2 font-medium">
            <span>Progress</span>
            <span>{currentIdx} / {cards.length}</span>
          </div>
          <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
            <div className="h-full bg-white/60 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Empty State */}
        {cards.length === 0 && (
          <div className="glass rounded-2xl py-20 text-center">
            <p className="text-white font-semibold text-lg mb-2">All Clear! 🎉</p>
            <p className="text-white/40 text-sm mb-6">No wrong MCQs found. Great job!</p>
            <button onClick={() => setFilterMode("all")} className="glass-btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
              Browse All Cards
            </button>
          </div>
        )}

        {/* Completion */}
        {completed && cards.length > 0 && (
          <div className="glass rounded-2xl py-20 text-center">
            <p className="text-white font-bold text-2xl mb-3">Session Complete!</p>
            <p className="text-white/40 text-sm mb-8">
              Mastered <span className="text-white font-bold">{knownIds.size}</span> of{" "}
              <span className="text-white font-bold">{cards.length}</span> cards
            </p>
            <button onClick={restart} className="glass-btn-primary flex items-center gap-2 mx-auto px-6 py-2.5 rounded-xl text-sm font-semibold">
              <RotateCcw className="w-4 h-4" />
              Restart Session
            </button>
          </div>
        )}

        {/* Active Card */}
        {!completed && currentCard && (
          <div className="space-y-5">
            {/* Meta */}
            <div className="flex items-center gap-3">
              <span className="glass border border-white/8 text-white/40 text-xs font-medium px-3 py-1.5 rounded-lg">{currentCard.topic}</span>
              <span className="text-white/25 text-xs">Card {currentIdx + 1} of {cards.length}</span>
            </div>

            {/* Flip Card */}
            <div
              className="cursor-pointer select-none"
              style={{ perspective: "1200px" }}
              onClick={() => setFlipped(p => !p)}
            >
              <div
                className="grid transition-all duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  minHeight: "340px",
                  gridTemplateColumns: "1fr",
                  gridTemplateRows: "1fr",
                }}
              >
                {/* Front */}
                <div
                  className="glass rounded-2xl p-7 flex flex-col"
                  style={{
                    backfaceVisibility: "hidden",
                    gridArea: "1 / 1",
                  }}
                >
                  <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-5">Question · click to reveal answer</p>
                  <p className="text-white font-semibold text-base leading-relaxed mb-6 flex-1">{currentCard.question}</p>
                  <div className="space-y-2">
                    {currentCard.options.map((opt, i) => {
                      const label = ["A", "B", "C", "D"][i];
                      const wasSelected = label === currentCard.selectedOption;
                      return (
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm border transition-colors ${
                          wasSelected ? "glass-strong border-white/20 text-white" : "glass border-white/6 text-white/40"
                        }`}>
                          <span className="font-bold text-xs w-5 text-white/40">{label}.</span>
                          <span>{opt.replace(/^[A-D]\.\s?/, "")}</span>
                          {wasSelected && <span className="ml-auto text-white/30 text-xs">← Your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Back */}
                <div
                  className="glass rounded-2xl p-7 flex flex-col border border-white/10"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    gridArea: "1 / 1",
                  }}
                >
                  <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-5">✓ Correct Answer</p>
                  <div className="space-y-2 flex-1">
                    {currentCard.options.map((opt, i) => {
                      const label = ["A", "B", "C", "D"][i];
                      const isCorrect = label === currentCard.correctAnswer;
                      const wasWrong = label === currentCard.selectedOption && !isCorrect;
                      return (
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm border ${
                          isCorrect ? "bg-emerald-400/8 border-emerald-400/25 text-white" :
                          wasWrong ? "bg-red-400/5 border-red-400/15 text-white/40 line-through" :
                          "glass border-white/5 text-white/30"
                        }`}>
                          <span className="font-bold text-xs w-5" style={{ color: isCorrect ? "#34d399" : wasWrong ? "#f87171" : "rgba(255,255,255,0.2)" }}>{label}.</span>
                          <span>{opt.replace(/^[A-D]\.\s?/, "")}</span>
                          {isCorrect && <span className="ml-auto text-emerald-400 text-xs font-semibold">✓ Correct</span>}
                          {wasWrong && <span className="ml-auto text-red-400/60 text-xs">✗ Yours</span>}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-white/20 text-xs mt-4">click to flip back</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={next} className="flex-1 py-3.5 rounded-xl glass-btn text-sm font-semibold text-white/70">
                Still Learning →
              </button>
              <button onClick={markKnown} className="flex-1 py-3.5 rounded-xl glass-btn-primary text-sm font-semibold">
                ✓ Got It!
              </button>
            </div>

            {/* Resources */}
            {resources.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
                  Study Resources · {currentCard.topic}
                </p>
                <div className="space-y-2.5">
                  {resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-white/50 hover:text-white text-sm transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                      <span className="mr-1">{getResourceIcon(r.type)}</span>
                      {r.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
