// src/components/HintReveal.tsx
import { useState } from "react";

interface Hint {
  level: 1 | 2 | 3;
  text: string;
}

interface HintRevealProps {
  hints?: Hint[] | string[];
}

const HINT_META = [
  { level: 1, label: "Nudge", color: "text-blue-400", border: "border-blue-700", bg: "bg-blue-950/30" },
  { level: 2, label: "Approach / Algorithm", color: "text-yellow-400", border: "border-yellow-700", bg: "bg-yellow-950/30" },
  { level: 3, label: "Full Solution", color: "text-green-400", border: "border-green-700", bg: "bg-green-950/30" },
];

const HintReveal: React.FC<HintRevealProps> = ({ hints }) => {
  const [revealLevel, setRevealLevel] = useState(0);

  if (!hints || hints.length === 0) return null;

  // Normalize to array of strings
  const hintTexts: string[] = hints.map((h) =>
    typeof h === "string" ? h : (h as Hint).text
  );

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-400 text-sm font-medium">Hints:</span>
        {HINT_META.map((meta, i) => (
          <button
            key={i}
            onClick={() => setRevealLevel(i + 1)}
            disabled={revealLevel >= i + 1 || !hintTexts[i]}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all
              ${revealLevel >= i + 1 
                ? `${meta.bg} ${meta.border} ${meta.color}` 
                : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400 disabled:opacity-40"
              }`}
          >
            Hint {i + 1}: {meta.label}
          </button>
        ))}
        {revealLevel > 0 && (
          <button onClick={() => setRevealLevel(0)} className="text-xs text-slate-500 underline ml-2">
            Reset
          </button>
        )}
      </div>

      {revealLevel > 0 && (
        <div className="space-y-2 mt-2">
          {HINT_META.slice(0, revealLevel).map((meta, i) => (
            hintTexts[i] && (
              <div key={i} className={`p-3 rounded-lg border ${meta.border} ${meta.bg}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${meta.color}`}>
                  Level {i + 1}: {meta.label}
                </p>
                <p className="text-slate-200 text-sm whitespace-pre-wrap">{hintTexts[i]}</p>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default HintReveal;

