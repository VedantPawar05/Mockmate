import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader/Loader";
import { getAllInterviews, deleteInterview } from "@/api/mockinterview.api";
import { Interview } from "@/types/global";
import BackButton from "@/components/BackButton";
import { Trash2, ExternalLink } from "lucide-react";

export default function InterviewHistory() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllInterviews()
      .then(setInterviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this session?")) return;
    setDeletingId(id);
    try {
      await deleteInterview(id);
      setInterviews(prev => prev.filter(i => i._id !== id));
    } finally { setDeletingId(null); }
  };

  const totalSessions = interviews.length;
  const avgScore = useMemo(() => {
    if (!totalSessions) return "0.0";
    return (interviews.reduce((a, c) => a + (c.overallRating || 0), 0) / totalSessions).toFixed(1);
  }, [interviews, totalSessions]);

  const trendScores = useMemo(() =>
    [...interviews].reverse().slice(-5).map(i => i.overallRating || 0),
    [interviews]
  );

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

      <div className="max-w-6xl mx-auto px-5 pt-28 pb-20 relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/6 pb-7">
          <div>
            <div className="flex items-center gap-3.5">
              <BackButton />
              <h1 className="text-3xl font-bold text-white">Interview History</h1>
            </div>
            <p className="text-white/40 text-sm mt-3">Review and analyze your past sessions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stats */}
          <div className="space-y-4">
            <p className="text-white/40 text-xs font-mono-tech">Aggregate Metrics</p>
            <div className="glass rounded-2xl p-6 space-y-6">
              <div>
                <p className="text-white/50 text-sm font-medium mb-1">Total Sessions</p>
                <p className="text-4xl font-black text-white">{totalSessions}</p>
              </div>
              <div className="h-px bg-white/6" />
              <div>
                <p className="text-white/50 text-sm font-medium mb-1">Avg Score</p>
                <p className="text-4xl font-black text-white">{avgScore}<span className="text-white/30 text-lg font-normal"> / 5</span></p>
              </div>
              {trendScores.length > 0 && (
                <>
                  <div className="h-px bg-white/6" />
                  <div>
                    <p className="text-white/50 text-sm font-medium mb-4">Trend (Last 5)</p>
                    <div className="flex items-end gap-2 h-16">
                      {trendScores.map((score, i) => (
                        <div key={i} className="flex-1 flex items-end h-full">
                          <div className="w-full bg-white/30 rounded-t-sm transition-all" style={{ height: `${Math.max((score / 5) * 100, 8)}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: List */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-white/40 text-xs font-mono-tech">All Records</p>
            {interviews.length === 0 ? (
              <div className="glass rounded-2xl py-20 text-center">
                <p className="text-white/30 text-sm">No interview sessions found yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.map(iv => {
                  const job = iv.jobRole || "Developer";
                  const topic = iv.topic || "DSA";
                  const score = iv.overallRating?.toFixed(1) ?? "—";
                  const date = iv.createdAt ? new Date(iv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
                  return (
                    <div key={iv._id} className="glass glass-hover rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-11 h-11 rounded-xl glass border border-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-white/50 text-xs font-bold">{topic.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-base">{job}</p>
                          <p className="text-white/40 text-xs mt-1">{date} · {topic}</p>
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {iv.experienceLevel && <span className="text-xs text-white/40 border border-white/8 rounded-lg px-2 py-0.5">{iv.experienceLevel}</span>}
                            {iv.targetCompany && <span className="text-xs text-white/40 border border-white/8 rounded-lg px-2 py-0.5">{iv.targetCompany}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-start sm:text-right gap-3 sm:gap-2 sm:border-l sm:border-white/6 sm:pl-5 sm:ml-0">
                        <div>
                          <p className="text-white/40 text-xs mb-0.5">Score</p>
                          <p className="text-3xl font-black text-white leading-none">{score}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/interviewdetails/${iv._id}`)} className="glass-btn p-2 rounded-lg" title="View details">
                            <ExternalLink className="w-3.5 h-3.5 text-white/60" />
                          </button>
                          <button onClick={() => navigate(`/interviewinterface/${iv._id}`)} className="glass-btn px-3 py-1.5 rounded-lg text-xs font-medium text-white/60">
                            Retry
                          </button>
                          <button onClick={e => handleDelete(iv._id, e)} disabled={deletingId === iv._id} className="glass-btn p-2 rounded-lg text-red-400/60 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
