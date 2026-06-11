import { createInterview } from "@/api/mockinterview.api";
import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { ExperienceLevel } from "@/vite-env";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const KNOWN_COMPANIES = [
  { companyName: "Google", focusTopics: ["Algorithms", "System Design", "Go", "Python"] },
  { companyName: "Amazon", focusTopics: ["AWS", "System Design", "Java", "Leadership Principles"] },
  { companyName: "Microsoft", focusTopics: ["C#", ".NET", "System Design", "Azure"] },
  { companyName: "TCS", focusTopics: ["Java", "SQL", "Aptitude", "OOP"] },
  { companyName: "Infosys", focusTopics: ["Python", "DBMS", "Java", "Software Engineering"] }
];

const TOPICS = ["DSA", "System Design", "OOP", "DBMS", "OS", "Networking", "Frontend", "Backend", "Full Stack"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const Form = () => {
  const { addNotification } = useNotification();
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
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [selectedCompanyConfig, setSelectedCompanyConfig] = useState<any>(null);

  // Fetch company configs on mount
  useEffect(() => {
    const fetchConfigs = async () => {
      setLoadingConfigs(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/companies`, { withCredentials: true });
        setCompanyConfigs(res.data);
      } catch {
        // silently fail — configs are optional
      } finally {
        setLoadingConfigs(false);
      }
    };
    fetchConfigs();
  }, []);

  // When a preset company is picked, auto-fill the form
  const handleCompanyPreset = (config: any) => {
    setSelectedCompanyConfig(config);
    setTargetCompany(config.companyName);
    // Auto-fill job profile if not set
    if (!jobProfile) setJobProfile("Software Engineer");
    // Suggest skills from focus topics
    const newTags = config.focusTopics.slice(0, 4);
    setTags(newTags);
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "info",
      message: `Loaded ${config.companyName} interview mode!`,
    };
    addNotification(newNotification);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      setTags([...tags, input.trim()]);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      e.preventDefault();
      const newTags = [...tags];
      const poppedTag = newTags.pop();
      setTags(newTags);
      setInput(poppedTag || "");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  const handleCreateInterview = async () => {
    try {
      let validateForm = true;
      if (jobProfile === "" || tags.length === 0 || targetCompany === "") {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "warning",
          message: "Please fill all the fields",
        };
        addNotification(newNotification);
        validateForm = false;
      }
      if (validateForm) {
        const skills = tags;
        const formData = {
          jobRole: jobProfile,
          experienceLevel,
          skills,
          targetCompany,
          topic: selectedTopic || undefined,
          difficulty: selectedDifficulty || undefined,
          overallReview: "",
          overallRating: 0,
          dsaQuestions: [],
          technicalQuestions: [],
          coreSubjectQuestions: [],
          numQuestions: numQuestions,
        };
        await createInterview(formData);
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "success",
          message: "Interview Created Successfully",
        };
        addNotification(newNotification);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message 
        ? (typeof error.response.data.message === 'string' ? error.response.data.message : JSON.stringify(error.response.data.message))
        : error.message || "Error creating interview";
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "error",
        message: `Failed to create: ${errorMsg}`,
      };
      addNotification(newNotification);
    }
  };

  return (
    <div className="w-screen h-screen fixed p-10 z-10 bg-black/80 flex justify-center items-center overflow-auto">
      <div className="relative flex w-full max-w-md flex-col rounded-xl bg-white border border-slate-200 shadow-xl my-auto">
        {/* Header */}
        <div className="relative m-2.5 items-center flex flex-col justify-center text-white h-28 rounded-lg bg-gradient-to-r from-green-500 to-teal-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white mb-2">
            <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
            <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
          </svg>
          <h5 className="text-white text-lg font-bold">Create New Interview</h5>
        </div>

        <div className="p-6 space-y-4">
          {/* Company Preset Buttons */}
          <div>
            <label className="block mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              🏢 Quick Company Mode
            </label>
            <div className="flex flex-wrap gap-2">
              {loadingConfigs ? (
                <span className="text-xs text-slate-400">Loading presets…</span>
              ) : (
                (companyConfigs.length > 0 ? companyConfigs : KNOWN_COMPANIES).map((config: any) => (
                  <button
                    key={config.companyName}
                    type="button"
                    onClick={() => handleCompanyPreset(config)}
                    className={`px-3 py-1 text-xs rounded-full border font-medium transition-all ${
                      selectedCompanyConfig?.companyName === config.companyName
                        ? "bg-teal-600 text-white border-teal-600"
                        : "border-slate-300 text-slate-600 hover:border-teal-400 hover:text-teal-600"
                    }`}
                  >
                    {config.companyName}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Job Profile */}
          <div>
            <label className="block mb-1 text-sm text-slate-600">Job Profile</label>
            <input
              type="text"
              value={jobProfile}
              onChange={(e) => setJobProfile(e.target.value)}
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm"
              placeholder="e.g. Software Engineer"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="mb-1 block text-sm text-slate-600">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full bg-transparent text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm appearance-none cursor-pointer"
            >
              <option value="Fresher">Fresher</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          {/* Topic & Difficulty Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Focus Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-transparent text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm appearance-none cursor-pointer"
              >
                <option value="">All Topics</option>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-transparent text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm appearance-none cursor-pointer"
              >
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="mb-1 block text-sm text-slate-600">Number of Questions (Min 5)</label>
            <input
              type="number"
              min="5"
              value={numQuestions}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setNumQuestions(isNaN(val) ? 5 : Math.max(5, val));
              }}
              className="w-full bg-transparent text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm appearance-none"
            />
          </div>

          {/* Skills Tags */}
          <div>
            <label className="mb-1 block text-sm text-slate-600">Skills</label>
            <div className="border-2 border-gray-200 text-sm rounded-md p-1 focus-within:border-gray-400 min-h-[40px] flex flex-wrap content-start gap-1">
              {tags.map((tag, index) => (
                <span key={index} className="bg-teal-100 text-teal-800 text-sm font-medium px-2.5 py-0.5 rounded-md flex items-center">
                  {tag}
                  <button type="button" onClick={() => removeTag(index)} className="ml-1.5 text-teal-600 hover:text-teal-800 focus:outline-none">
                    &times;
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow outline-none text-gray-700 min-w-[50px] h-8"
                placeholder={tags.length === 0 ? "Type and press Enter" : ""}
              />
            </div>
          </div>

          {/* Target Company */}
          <div>
            <label className="block mb-1 text-sm text-slate-600">Target Company</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm"
              placeholder="e.g. Google"
            />
            {selectedCompanyConfig?.description && (
              <p className="mt-1 text-xs text-slate-400 italic">{selectedCompanyConfig.description}</p>
            )}
          </div>

          {/* Difficulty badge preview */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Mode:</span>
            <span className={`px-2 py-0.5 rounded-full font-semibold ${
              selectedDifficulty === "Hard" ? "bg-red-100 text-red-700" :
              selectedDifficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
              "bg-green-100 text-green-700"
            }`}>{selectedDifficulty}</span>
            {selectedTopic && <><span>·</span><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{selectedTopic}</span></>}
          </div>

          <button
            type="button"
            onClick={handleCreateInterview}
            className="w-full mt-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 py-2.5 px-4 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg"
          >
            Create Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;

