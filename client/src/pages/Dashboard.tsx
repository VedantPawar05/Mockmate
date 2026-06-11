import React, { useEffect, useState } from "react";
import Loader from "../components/Loader/Loader";
import { getAllInterviews, deleteInterview } from "@/api/mockinterview.api";
import Navbar from "@/components/Navbar";
import { getDashboardStats, getUser } from "@/api/user.api";
import { getLearningProgress } from "@/api/learning.api";
import LearnPanel from "@/components/LearnPanel";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { PlayCircle, CheckCircle, ArrowRight, History, Trophy, Plus, TrendingUp, Trash2 } from "lucide-react";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("there");
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const validateLoginAndFetchData = async () => {
      try {
        const userRes = await getUser();
        const uid = (userRes as any)._id || userRes?.id;
        setUserId(uid);
        setUserName((userRes as any).name?.split(" ")[0] || "there");

        const [interviewsData, statsData, progressData] = await Promise.all([
          getAllInterviews({ topic: "All", difficulty: "All" }),
          getDashboardStats(),
          uid ? getLearningProgress(uid) : Promise.resolve([])
        ]);
        setInterviews(interviewsData);
        setStats(statsData);
        setLearningProgress(progressData);
      } catch (error) {
        addNotification({ id: Date.now().toString(), type: "error", message: "Failed to load dashboard. Please login again." } as Notification);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    validateLoginAndFetchData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this interview session?")) return;
    try {
      await deleteInterview(id);
      setInterviews(prev => prev.filter(i => i._id !== id));
      addNotification({ id: Date.now().toString(), type: "success", message: "Session deleted successfully" } as Notification);
    } catch {
      addNotification({ id: Date.now().toString(), type: "error", message: "Failed to delete session" } as Notification);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-black"><Loader /></div>;
  }

  const chartData = stats?.topicScores?.map((item: any) => {
    const short: Record<string, string> = { "DSA": "DSA", "OS": "OS", "DBMS": "DB", "System Design": "SYS", "HR": "HR", "OOP": "OOP", "Aptitude": "APT" };
    return { name: short[item.topic] || item.topic.slice(0, 3).toUpperCase(), score: item.score };
  }) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass rounded-xl px-4 py-2.5 text-sm">
          <p className="text-white/60 text-xs mb-1">{label}</p>
          <p className="text-white font-bold">{payload[0].value} / 5</p>
        </div>
      );
    }
    return null;
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

      <div className="max-w-6xl mx-auto px-5 pt-28 pb-20 relative z-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-sm font-medium">Good day, <span className="text-white">{userName}</span></p>
            <h1 className="text-3xl font-bold text-white mt-1">Dashboard</h1>
          </div>
          <button
            onClick={() => navigate("/create")}
            className="glass-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Interview
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Interviews */}
              <div className="glass glass-hover rounded-2xl p-6 glow-white-sm">
                <p className="text-white/50 text-sm font-medium mb-3">Total Interviews</p>
                <p className="text-5xl font-black text-white">{stats.totalInterviews}</p>
                <div className="w-full h-px bg-white/8 mt-5" />
              </div>

              {/* Avg Score */}
              <div className="glass glass-hover rounded-2xl p-6 glow-white-sm">
                <p className="text-white/50 text-sm font-medium mb-3">Average Score</p>
                <div className="flex items-end gap-1">
                  <p className="text-5xl font-black text-white">{Math.round((stats.averageScore / 5) * 100)}</p>
                  <p className="text-white/40 font-bold mb-1.5">%</p>
                </div>
                <div className="w-full h-px bg-white/8 mt-5" />
              </div>

              {/* Streak */}
              <div className="glass glass-hover rounded-2xl p-6 glow-white-sm">
                <p className="text-white/50 text-sm font-medium mb-3">Current Streak</p>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-black text-white">{stats.streakCount}</p>
                  <p className="text-white/40 font-medium mb-1.5 text-sm">days</p>
                </div>
                <div className="flex gap-1.5 mt-5">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full ${i < stats.streakCount ? "bg-white" : "bg-white/10"}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Charts + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Bar Chart */}
              <div className="lg:col-span-2 glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white/40 text-xs font-mono-tech">Analytics</p>
                    <h2 className="text-white font-semibold text-base mt-1">Performance by Topic</h2>
                  </div>
                  <TrendingUp className="w-4 h-4 text-white/30" />
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={28} margin={{ left: -25, right: 5 }}>
                      <XAxis dataKey="name" stroke="transparent" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="transparent" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} domain={[0, 5]} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="score" fill="rgba(255,255,255,0.7)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/create")}
                  className="glass glass-hover rounded-2xl p-5 flex items-center justify-between group text-left flex-1"
                >
                  <div>
                    <p className="text-white font-semibold text-sm">Practice Now</p>
                    <p className="text-white/40 text-xs mt-1">Start a new session</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl glass-btn flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => navigate("/history")}
                  className="glass glass-hover rounded-2xl p-5 flex items-center justify-between group text-left flex-1"
                >
                  <div>
                    <p className="text-white font-semibold text-sm">Interview History</p>
                    <p className="text-white/40 text-xs mt-1">Review past sessions</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl glass-btn flex items-center justify-center flex-shrink-0">
                    <History className="w-4 h-4 text-white" />
                  </div>
                </button>

                <button
                  onClick={() => navigate("/leaderboard")}
                  className="glass glass-hover rounded-2xl p-5 flex items-center justify-between group text-left flex-1"
                >
                  <div>
                    <p className="text-white font-semibold text-sm">Leaderboard</p>
                    <p className="text-white/40 text-xs mt-1">See global rankings</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl glass-btn flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Learning Roadmaps */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs font-mono-tech">Progress</p>
              <h2 className="text-white font-semibold text-base mt-1">Learning Roadmaps</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {["DSA", "System Design", "OS", "DBMS", "Networking", "HR", "Aptitude"].map((topic) => {
              const progress = learningProgress.find((p) => p.topic === topic);
              const percent = progress?.completionPercent || 0;
              const isCompleted = percent === 100;
              const hasStarted = percent > 0;

              return (
                <div key={topic} className="glass glass-hover rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-base">{topic}</h3>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs bg-white/10 text-white px-2.5 py-1 rounded-full font-medium">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    ) : hasStarted ? (
                      <span className="text-xs text-white bg-white/10 px-2.5 py-1 rounded-full font-medium">{percent}%</span>
                    ) : (
                      <span className="text-xs text-white/40 border border-white/10 px-2.5 py-1 rounded-full">New</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mb-4">Core Domain</p>

                  <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
                  </div>

                  <button
                    onClick={() => setSelectedTopic(topic)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 glass-btn rounded-xl text-sm font-medium text-white"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {hasStarted && !isCompleted ? "Resume" : isCompleted ? "Review" : "Start"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="mb-4">
            <p className="text-white/40 text-xs font-mono-tech">Log</p>
            <h2 className="text-white font-semibold text-base mt-1">Recent Activity</h2>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            {interviews.length === 0 ? (
              <div className="text-white/30 text-center py-12 text-sm">
                No sessions recorded yet. Start practicing now!
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {interviews.slice(0, 5).map((interview: any) => {
                  const job = interview.jobRole || "Developer";
                  const topic = interview.topic || "DSA";
                  const score = interview.overallRating ? Math.round((interview.overallRating / 5) * 100) : null;
                  const date = new Date(interview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <div
                      key={interview._id}
                      onClick={() => {
                        if (interview.overallRating > 0) {
                          navigate(`/interviewdetails/${interview._id}`);
                        } else {
                          navigate(`/interviewinterface/${interview._id}`);
                        }
                      }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-white/4 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center flex-shrink-0">
                          <span className="text-white/50 text-xs font-bold">{topic.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{job}</p>
                          <p className="text-white/40 text-xs mt-0.5">{topic} · {date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {score !== null ? (
                            <span className="text-white font-black text-xl">{score}<span className="text-white/30 text-sm font-normal">%</span></span>
                          ) : (
                            <span className="text-white/30 text-sm">—</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleDelete(interview._id, e)}
                          className="glass-btn p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      <LearnPanel
        topic={selectedTopic}
        userId={userId || ""}
        onClose={() => setSelectedTopic(null)}
        initialWatched={learningProgress.find(p => p.topic === selectedTopic)?.watchedVideos || []}
        onProgressUpdate={() => userId && getLearningProgress(userId).then(setLearningProgress)}
      />
    </div>
  );
};

export default Dashboard;
