import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import Loader from "@/components/Loader/Loader";
import axios from "axios";
import { Trophy, Medal } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/leaderboard`, { withCredentials: true })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#050508]"><Loader /></div>;

  const { topScores = [], userRank, userBest } = data || {};

  const medalStyle = (rank: number) => {
    if (rank === 1) return { text: "text-amber-400", bg: "bg-amber-400/15 border-amber-400/25", size: "text-4xl" };
    if (rank === 2) return { text: "text-zinc-300", bg: "bg-zinc-300/10 border-zinc-300/20", size: "text-3xl" };
    if (rank === 3) return { text: "text-amber-700", bg: "bg-amber-700/10 border-amber-700/20", size: "text-2xl" };
    return { text: "text-white/30", bg: "transparent border-transparent", size: "text-xl" };
  };

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

      <div className="max-w-4xl mx-auto px-5 pt-28 pb-20 relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-white/6 pb-7">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="w-12 h-12 rounded-2xl glass border border-amber-400/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
              <p className="text-white/40 text-sm mt-1">Global rankings by interview score</p>
            </div>
          </div>

          {/* Your best */}
          {userBest && (
            <div className="glass rounded-2xl px-6 py-4 border border-white/8 flex-shrink-0 text-right">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">
                Your Best · Global #{userRank}
              </p>
              <p className="text-4xl font-black text-white">
                {userBest.score}<span className="text-white/30 text-xl font-normal">/5</span>
              </p>
              <p className="text-white/40 text-xs mt-1">{userBest.company}</p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-12 items-center px-6 py-3.5 border-b border-white/6">
            <div className="col-span-1 text-white/30 text-xs font-semibold uppercase tracking-wider">#</div>
            <div className="col-span-5 text-white/30 text-xs font-semibold uppercase tracking-wider">Player</div>
            <div className="col-span-3 text-white/30 text-xs font-semibold uppercase tracking-wider">Company</div>
            <div className="col-span-2 text-right text-white/30 text-xs font-semibold uppercase tracking-wider">Score</div>
            <div className="col-span-1 text-right text-white/30 text-xs font-semibold uppercase tracking-wider">Date</div>
          </div>

          {topScores.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-white/30 text-sm">No scores yet. Complete your first interview!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {topScores.map((entry: any, i: number) => {
                const rank = i + 1;
                const ms = medalStyle(rank);
                const isMe = entry.isCurrentUser;
                return (
                  <div
                    key={i}
                    className={`grid grid-cols-12 items-center px-6 py-4 transition-colors ${
                      isMe ? "bg-white/4" : "hover:bg-white/2"
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      {rank <= 3 ? (
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${ms.bg}`}>
                          <span className={ms.text}>{["🥇","🥈","🥉"][rank-1]}</span>
                        </div>
                      ) : (
                        <span className="text-white/30 font-bold text-sm">#{rank}</span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="col-span-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-xs font-bold text-white/50 flex-shrink-0">
                          {entry.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isMe ? "text-white" : "text-white/80"}`}>{entry.name}</p>
                          {isMe && <p className="text-xs text-white/30">← You</p>}
                        </div>
                      </div>
                    </div>

                    {/* Company */}
                    <div className="col-span-3 text-white/40 text-sm">{entry.company}</div>

                    {/* Score */}
                    <div className="col-span-2 text-right">
                      <span className="text-white font-black text-xl">{entry.score}</span>
                      <span className="text-white/30 text-sm">/5</span>
                    </div>

                    {/* Date */}
                    <div className="col-span-1 text-right text-white/30 text-xs">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
