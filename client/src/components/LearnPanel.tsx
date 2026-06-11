import React, { useEffect, useState } from "react";
import { getPlaylistForTopic, saveLearningProgress, resetLearningProgress } from "@/api/learning.api";
import { X, Play, CheckCircle, RotateCcw, AlertCircle } from "lucide-react";
import Loader from "@/components/Loader/Loader";

interface LearnPanelProps {
  topic: string | null;
  userId: string;
  onClose: () => void;
  initialWatched?: string[];
  onProgressUpdate?: () => void;
}

const LearnPanel: React.FC<LearnPanelProps> = ({ topic, userId, onClose, initialWatched = [], onProgressUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [watchedVideos, setWatchedVideos] = useState<string[]>(initialWatched);

  useEffect(() => {
    if (topic) {
      fetchPlaylist();
    }
  }, [topic]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const data = await getPlaylistForTopic(topic!);
      setPlaylist(data.playlist);
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Failed to load playlist", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkWatched = async (videoId: string) => {
    if (watchedVideos.includes(videoId)) return;
    
    // Optimistic UI update
    setWatchedVideos([...watchedVideos, videoId]);
    
    try {
      await saveLearningProgress(topic!, videoId);
      if (onProgressUpdate) onProgressUpdate();
    } catch (error) {
      // Revert on failure
      setWatchedVideos(watchedVideos.filter(v => v !== videoId));
    }
  };

  const handleReset = async () => {
    if (window.confirm("Reset all learning progress for this topic?")) {
      try {
        await resetLearningProgress(userId, topic!);
        setWatchedVideos([]);
        if (onProgressUpdate) onProgressUpdate();
      } catch (error) {
        console.error("Reset failed", error);
      }
    }
  };

  // Drawer CSS Animation Styles
  const drawerClasses = topic 
    ? "translate-x-0 shadow-2xl" 
    : "translate-x-full shadow-none";

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${topic ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 w-full max-w-md md:max-w-lg h-full bg-black border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${drawerClasses}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white">Learn {topic}</h2>
            {playlist.length > 0 && (
              <p className="text-sm text-zinc-400 mt-1">
                {watchedVideos.length} of {playlist.length} watched ({(watchedVideos.length / playlist.length * 100).toFixed(0)}%)
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        {playlist.length > 0 && (
          <div className="w-full h-1 bg-zinc-800">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(watchedVideos.length / playlist.length) * 100}%` }}
            />
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader /></div>
          ) : (
            <>
              {/* Gemini Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                    <AlertCircle size={18} />
                    <span>Focus on these first (AI Suggested)</span>
                  </div>
                  {suggestions.map((sug, idx) => (
                    <div key={idx} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <h4 className="text-amber-300 font-medium text-sm">{sug.concept}</h4>
                      <p className="text-amber-100/70 text-xs mt-1 leading-relaxed">{sug.keyPoint}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Playlist Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Curated Playlist</h3>
                {watchedVideos.length > 0 && (
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <RotateCcw size={12} /> Reset Progress
                  </button>
                )}
              </div>

              {/* Video List */}
              <div className="space-y-4">
                {playlist.map((video, idx) => {
                  const isWatched = watchedVideos.includes(video.videoId);
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-4 p-3 rounded-xl border transition-all ${
                        isWatched 
                          ? "bg-zinc-900/40 border-zinc-800/50 opacity-60" 
                          : "bg-zinc-900 border-zinc-700 hover:border-zinc-500"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                        <img 
                          src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
                          {video.durationMins}:00
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-1 min-w-0 py-0.5">
                        <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                          {video.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">{video.channelName}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-2">
                          {isWatched ? (
                            <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                              <CheckCircle size={14} /> Watched
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleMarkWatched(video.videoId)}
                              className="text-xs text-zinc-300 hover:text-white border border-zinc-700 hover:bg-zinc-800 px-2 py-1 rounded transition-colors"
                            >
                              Mark Watched
                            </button>
                          )}
                          
                          <a 
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                          >
                            <Play size={12} /> Watch
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {playlist.length === 0 && !loading && (
                  <div className="text-center text-zinc-500 py-10">
                    No videos available for this topic.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LearnPanel;

