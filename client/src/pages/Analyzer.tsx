import { useEffect, useState } from 'react';
import { getPerformanceAnalytics } from '@/api/analytics.api';
import { saveProject, getUserProjects, updateProjectStatus } from '@/api/projects.api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Loader from '@/components/Loader/Loader';
import Navbar from '@/components/Navbar';
import LearnPanel from '@/components/LearnPanel';
import { getLearningProgress } from '@/api/learning.api';
import { getUser } from '@/api/user.api';
import { useNotification } from '@/components/Notifications/NotificationContext';
import BackButton from '@/components/BackButton';
import { BookOpen, Bookmark, Check, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';

const Analyzer = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { addNotification } = useNotification();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      let uid = null;
      try {
        const userRes = await getUser();
        uid = (userRes as any)._id || (userRes as any).id;
        setUserId(uid);
      } catch {}

      const [analyticsData, projectsData, progressData] = await Promise.all([
        getPerformanceAnalytics(),
        getUserProjects(),
        uid ? getLearningProgress(uid) : Promise.resolve([])
      ]);
      setData(analyticsData);
      setSavedProjects(projectsData);
      setLearningProgress(progressData);
    } catch {
      addNotification({ id: Date.now().toString(), type: 'error', message: 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (project: any) => {
    try {
      const saved = await saveProject(project);
      setSavedProjects([saved, ...savedProjects]);
      addNotification({ id: Date.now().toString(), type: 'success', message: 'Project saved!' });
    } catch {
      addNotification({ id: Date.now().toString(), type: 'error', message: 'Failed to save project' });
    }
  };

  const handleUpdateStatus = async (projectId: string, status: string) => {
    try {
      const updated = await updateProjectStatus(projectId, status);
      setSavedProjects(savedProjects.map(p => p._id === projectId ? updated : p));
      addNotification({ id: Date.now().toString(), type: 'success', message: 'Status updated!' });
    } catch {
      addNotification({ id: Date.now().toString(), type: 'error', message: 'Failed to update' });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#050508]"><Loader /></div>;

  if (!data) return (
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
      <div className="max-w-6xl mx-auto px-5 pt-28 pb-20 relative z-10">
        <div className="mb-8"><BackButton /></div>
        <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-2">
            <TrendingUp className="w-7 h-7 text-white/40" />
          </div>
          <h2 className="text-xl font-bold text-white">No Analytics Yet</h2>
          <p className="text-white/40 text-sm max-w-sm">Complete some interviews first to unlock AI-powered performance insights.</p>
        </div>
      </div>
    </div>
  );

  const healthColor = data.healthScore < 40 ? 'text-red-400' : data.healthScore < 70 ? 'text-amber-400' : 'text-emerald-400';
  const healthBg = data.healthScore < 40 ? 'bg-red-400/10 border-red-400/20' : data.healthScore < 70 ? 'bg-amber-400/10 border-amber-400/20' : 'bg-emerald-400/10 border-emerald-400/20';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) return (
      <div className="glass rounded-xl px-4 py-2.5 text-sm">
        <p className="text-white font-bold">{payload[0].value} / 5</p>
      </div>
    );
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-white/6 pb-7">
          <div>
            <div className="flex items-center gap-3.5">
              <BackButton />
              <h1 className="text-3xl font-bold text-white">AI Analyzer</h1>
            </div>
            <p className="text-white/40 text-sm mt-3">Deep insights and personalized roadmap for your preparation</p>
          </div>
          {/* Health Score Badge */}
          <div className={`glass rounded-2xl px-6 py-4 border text-center flex-shrink-0 ${healthBg}`}>
            <p className="text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">Health Score</p>
            <div className="flex items-end justify-center gap-1">
              <span className={`text-5xl font-black ${healthColor}`}>{data.healthScore}</span>
              <span className="text-white/30 text-xl font-bold mb-1">/100</span>
            </div>
            <p className="text-white/40 text-xs mt-1.5 capitalize">Trend: <span className="text-white/60">{data.trend}</span></p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Radar Chart */}
          <div className="glass rounded-2xl p-6">
            <div className="mb-5">
              <p className="text-white/40 text-xs font-mono-tech">Proficiency Map</p>
              <h2 className="text-white font-semibold text-base mt-1">Skills Radar</h2>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="78%" data={data.topicScores}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Radar name="Score" dataKey="A" stroke="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.1)" strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weak Areas */}
          <div className="glass rounded-2xl p-6">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-white/40 text-xs font-mono-tech">Gap Analysis</p>
              </div>
              <h2 className="text-white font-semibold text-base mt-1">Your Weak Areas</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {data.weakTopics?.map((topic: string) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className="flex items-center gap-2 glass-btn px-3.5 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Learn {topic}
                </button>
              ))}
            </div>

            <div className="glass rounded-xl p-4 text-sm text-white/60 leading-relaxed border border-white/6">
              {data.weaknessExplanation}
            </div>
          </div>
        </div>

        {/* 30-Day Roadmap */}
        <div>
          <div className="mb-5">
            <p className="text-white/40 text-xs font-mono-tech">Structured Plan</p>
            <h2 className="text-white font-semibold text-lg mt-1">30-Day Improvement Roadmap</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.roadmap?.map((week: any, idx: number) => (
              <div key={idx} className="glass glass-hover rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-white/20 rounded-r" />
                <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">{week.week}</span>
                <h3 className="text-white font-semibold text-sm mt-2 mb-4 leading-snug">{week.focus}</h3>
                <ul className="space-y-2.5">
                  {week.tasks?.map((task: string, i: number) => (
                    <li key={i} className="text-white/50 text-xs leading-relaxed flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-0.5 text-white/25 flex-shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Project Recommendations */}
        <div>
          <div className="mb-5">
            <p className="text-white/40 text-xs font-mono-tech">Curated For You</p>
            <h2 className="text-white font-semibold text-lg mt-1">Project Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.projectRecommendations?.map((proj: any, idx: number) => {
              const isSaved = savedProjects.some(sp => sp.projectName === proj.projectName);
              return (
                <div key={idx} className="glass glass-hover rounded-2xl p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-white/40 border border-white/10 rounded-lg px-2.5 py-1">{proj.addressesTopic}</span>
                    <span className="text-xs text-white/30">⏱ {proj.estimatedDays}d</span>
                  </div>
                  <h3 className="text-white font-bold text-base mb-3 leading-tight">{proj.projectName}</h3>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.techStack?.map((tech: string) => (
                      <span key={tech} className="text-xs text-white/40 glass border border-white/8 rounded-lg px-2 py-0.5">{tech}</span>
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Key Features</p>
                  <ul className="space-y-2 flex-1">
                    {proj.keyFeatures?.map((feature: string, i: number) => (
                      <li key={i} className="text-white/50 text-sm flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-white/30 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={isSaved}
                    onClick={() => handleSaveProject(proj)}
                    className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      isSaved ? 'glass text-white/30 cursor-not-allowed border border-white/6' : 'glass-btn-primary'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    {isSaved ? 'Saved' : 'Save Project'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Projects */}
        {savedProjects.length > 0 && (
          <div>
            <div className="mb-5">
              <p className="text-white/40 text-xs font-mono-tech">Your Workspace</p>
              <h2 className="text-white font-semibold text-lg mt-1">Active Projects</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedProjects.map(project => (
                <div key={project._id} className="glass glass-hover rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{project.projectName}</h3>
                    <p className="text-white/40 text-xs mt-1">Focus: {project.addressesTopic}</p>
                  </div>
                  <select
                    value={project.status}
                    onChange={e => handleUpdateStatus(project._id, e.target.value)}
                    className="glass-input rounded-xl px-3 py-2 text-sm text-white/70 cursor-pointer min-w-[130px]"
                  >
                    <option value="not started">Not Started</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <LearnPanel
        topic={selectedTopic}
        userId={userId || ''}
        onClose={() => setSelectedTopic(null)}
        initialWatched={learningProgress.find(p => p.topic === selectedTopic)?.watchedVideos || []}
        onProgressUpdate={() => userId && getLearningProgress(userId).then(setLearningProgress)}
      />
    </div>
  );
};

export default Analyzer;
