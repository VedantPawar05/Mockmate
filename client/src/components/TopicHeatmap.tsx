import { useMemo } from "react";
import { Interview } from "@/types/global";

interface Props {
  interviews: Interview[];
}

export default function TopicHeatmap({ interviews }: Props) {
  const topicCounts = useMemo(() => {
    const counts: Record<string, { wrong: number; total: number }> = {};
    for (const iv of interviews) {
      // Collect weak topics
      (iv.weakTopics || []).forEach((t) => {
        counts[t] = counts[t] || { wrong: 0, total: 0 };
        counts[t].wrong += 1;
        counts[t].total += 1;
      });
      // Collect from skills
      (iv.skills || []).forEach((s) => {
        counts[s] = counts[s] || { wrong: 0, total: 0 };
        counts[s].total += 1;
      });
      // Collect MCQ wrong topics
      const allQs = [
        ...(iv.dsaQuestions || []),
        ...(iv.technicalQuestions || []),
        ...(iv.coreSubjectQuestions || []),
      ];
      for (const q of allQs) {
        const topic = String((q as any).technology || "General");
        counts[topic] = counts[topic] || { wrong: 0, total: 0 };
        counts[topic].total += 1;
        if ((q as any).questionFormat === "mcq" && (q as any).selectedOption && (q as any).selectedOption !== (q as any).correctAnswer) {
          counts[topic].wrong += 1;
        }
      }
    }
    return Object.entries(counts)
      .map(([topic, data]) => ({ topic, ...data, ratio: data.total > 0 ? data.wrong / data.total : 0 }))
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 20);
  }, [interviews]);

  if (topicCounts.length === 0) return null;

  const getColor = (ratio: number) => {
    if (ratio >= 0.7) return "bg-red-600/80 border-red-500 text-white";
    if (ratio >= 0.4) return "bg-orange-600/70 border-orange-500 text-white";
    if (ratio >= 0.2) return "bg-yellow-600/60 border-yellow-500 text-yellow-100";
    return "bg-green-700/50 border-green-600 text-green-200";
  };

  const getLabel = (ratio: number) => {
    if (ratio >= 0.7) return "Weak 🔴";
    if (ratio >= 0.4) return "Needs Work 🟠";
    if (ratio >= 0.2) return "Fair 🟡";
    return "Strong 🟢";
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">🗺️ Topic Heatmap</h2>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-600 inline-block"></span> Strong</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-600 inline-block"></span> Fair</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-600 inline-block"></span> Needs Work</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-600 inline-block"></span> Weak</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {topicCounts.map(({ topic, wrong, total, ratio }) => (
          <div
            key={topic}
            title={`${wrong} wrong / ${total} total — ${getLabel(ratio)}`}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-default transition-all hover:scale-105 ${getColor(ratio)}`}
          >
            {topic}
            {wrong > 0 && <span className="ml-1 opacity-75">({wrong}✗)</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

