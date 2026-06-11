import { createInterview } from "@/api/mockinterview.api";
import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { ExperienceLevel } from "@/vite-env";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { X, Rocket } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const KNOWN_COMPANIES = [
  { companyName: "Google",    focusTopics: ["Algorithms", "System Design", "Go", "Python"] },
  { companyName: "Amazon",    focusTopics: ["AWS", "System Design", "Java", "Leadership Principles"] },
  { companyName: "Microsoft", focusTopics: ["C#", ".NET", "System Design", "Azure"] },
  { companyName: "TCS",       focusTopics: ["Java", "SQL", "Aptitude", "OOP"] },
  { companyName: "Infosys",   focusTopics: ["Python", "DBMS", "Java", "Software Engineering"] },
];

const TOPICS = ["DSA", "System Design", "OOP", "DBMS", "OS", "Networking", "Frontend", "Backend", "Full Stack"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const CreateInterview = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [jobProfile, setJobProfile] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("Fresher");
  const [targetCompany, setTargetCompany] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(15);
  const [companyConfigs, setCompanyConfigs] = useState<any[]>([]);
  const [selectedCompanyConfig, setSelectedCompanyConfig] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/companies`, { withCredentials: true })
      .then(r => setCompanyConfigs(r.data))
      .catch(() => {});
  }, []);

  const handleCompanyPreset = (config: any) => {
    setSelectedCompanyConfig(config);
    setTargetCompany(config.companyName);
    if (!jobProfile) setJobProfile("Software Engineer");
    setTags(config.focusTopics.slice(0, 4));
    addNotification({ id: Date.now().toString(), type: "info", message: `${config.companyName} mode loaded!` } as Notification);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) setTags([...tags, input.trim()]);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      e.preventDefault();
      const newTags = [...tags];
      setInput(newTags.pop() || "");
      setTags(newTags);
    }
  };

  const removeTag = (i: number) => { setTags(tags.filter((_, j) => j !== i)); inputRef.current?.focus(); };

  const handleCreate = async () => {
    if (!jobProfile || tags.length === 0 || !targetCompany) {
      addNotification({ id: Date.now().toString(), type: "warning", message: "Please fill all required fields" } as Notification);
      return;
    }
    setCreating(true);
    try {
      await createInterview({
        jobRole: jobProfile, experienceLevel, skills: tags, targetCompany,
        topic: selectedTopic || undefined, difficulty: selectedDifficulty || undefined,
        overallReview: "", overallRating: 0,
        dsaQuestions: [], technicalQuestions: [], coreSubjectQuestions: [],
        numQuestions,
      });
      addNotification({ id: Date.now().toString(), type: "success", message: "Interview created! Loading..." } as Notification);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      addNotification({ id: Date.now().toString(), type: "error", message: `Failed: ${typeof msg === "string" ? msg : "Try again"}` } as Notification);
    } finally { setCreating(false); }
  };

  const diffBadge = { Easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/8", Medium: "text-amber-400 border-amber-400/30 bg-amber-400/8", Hard: "text-red-400 border-red-400/30 bg-red-400/8" };

  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-x-hidden">
      {/* Orbs */}
      <div className="fixed top-0 right-1/3 w-96 h-96 rounded-full bg-violet-900/15 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full bg-blue-900/12 blur-[100px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none z-0" />

      <Navbar />

      <div className="max-w-xl mx-auto px-5 pt-28 pb-20 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3.5">
            <BackButton to="/dashboard" />
            <h1 className="text-3xl font-bold text-white">New Interview</h1>
          </div>
          <p className="text-white/40 text-sm mt-3">Configure your AI-powered mock interview session</p>
        </div>

        {/* Glass Form Card */}
        <div className="glass rounded-3xl p-6 space-y-6 glow-white-sm">

          {/* Company Presets */}
          <div>
            <label className="block text-white/60 text-sm font-semibold mb-3">Quick Company Mode</label>
            <div className="flex flex-wrap gap-2">
              {(companyConfigs.length > 0 ? companyConfigs : KNOWN_COMPANIES).map((c: any) => (
                <button
                  key={c.companyName}
                  onClick={() => handleCompanyPreset(c)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                    selectedCompanyConfig?.companyName === c.companyName
                      ? "bg-white text-black border-white"
                      : "glass-btn text-white/70 hover:text-white"
                  }`}
                >
                  {c.companyName}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/6" />

          {/* Job Profile */}
          <div>
            <label className="block text-white/60 text-sm font-semibold mb-2">Job Profile <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={jobProfile}
              onChange={e => setJobProfile(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm"
              placeholder="e.g. Software Engineer"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-white/60 text-sm font-semibold mb-2">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={e => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm cursor-pointer appearance-none"
            >
              <option value="Fresher">Fresher</option>
              <option value="Junior">Junior (1-2 yrs)</option>
              <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
              <option value="Senior">Senior (5+ yrs)</option>
            </select>
          </div>

          {/* Topic & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm font-semibold mb-2">Focus Topic</label>
              <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm cursor-pointer appearance-none">
                <option value="">All Topics</option>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-sm font-semibold mb-2">Difficulty</label>
              <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm cursor-pointer appearance-none">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-white/60 text-sm font-semibold mb-2">Questions <span className="text-white/30 font-normal">(min 5)</span></label>
            <input
              type="number"
              min="5"
              value={numQuestions}
              onChange={e => setNumQuestions(Math.max(5, parseInt(e.target.value) || 5))}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm"
            />
          </div>

          {/* Skills Tags */}
          <div>
            <label className="block text-white/60 text-sm font-semibold mb-2">Skills <span className="text-red-400">*</span> <span className="text-white/30 font-normal">(Enter to add)</span></label>
            <div
              className="glass-input rounded-xl p-3 min-h-[52px] flex flex-wrap gap-2 cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              {tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                  {tag}
                  <button type="button" onClick={() => removeTag(i)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow bg-transparent outline-none text-white text-sm min-w-[120px] h-8 placeholder:text-white/25"
                placeholder={tags.length === 0 ? "React, Node.js, Python..." : ""}
              />
            </div>
          </div>

          {/* Target Company */}
          <div>
            <label className="block text-white/60 text-sm font-semibold mb-2">Target Company <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={targetCompany}
              onChange={e => setTargetCompany(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm"
              placeholder="e.g. Google"
            />
          </div>

          {/* Config Preview */}
          <div className="flex items-center flex-wrap gap-2 py-1">
            <span className="text-white/30 text-xs font-mono-tech">Session:</span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${diffBadge[selectedDifficulty as keyof typeof diffBadge] || diffBadge.Medium}`}>
              {selectedDifficulty}
            </span>
            {selectedTopic && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg border glass text-white/60 border-white/10">{selectedTopic}</span>
            )}
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg border glass text-white/60 border-white/10">{numQuestions} Questions</span>
          </div>

          {/* Submit */}
          <button
            id="create-interview-btn"
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-4 rounded-xl glass-btn-primary text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Interview...
              </span>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Launch Interview
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInterview;
