import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import axios from "axios";
import { Upload, FileText, Loader2, CheckCircle, Target } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ResumeAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/resume/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") { setFile(dropped); setError(""); }
    else setError("Please upload a PDF file.");
  };

  const difficultyStyle: Record<string, string> = {
    Easy: "border-emerald-400/30 text-emerald-400 bg-emerald-400/8",
    Medium: "border-amber-400/30 text-amber-400 bg-amber-400/8",
    Hard: "border-red-400/30 text-red-400 bg-red-400/8",
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

      <div className="max-w-3xl mx-auto px-5 pt-28 pb-20 relative z-10 space-y-8">
        {/* Header */}
        <div className="border-b border-white/6 pb-7">
          <div className="flex items-center gap-4 mb-3">
            <BackButton />
            <div className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Resume Analyzer</h1>
              <p className="text-white/40 text-sm mt-1">AI-generated interview questions tailored to your profile</p>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer ${
            dragOver
              ? "border-white/30 bg-white/4"
              : file
              ? "border-white/20 glass"
              : "border-white/10 hover:border-white/20 glass"
          }`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("resumeFileInput")?.click()}
        >
          <input
            id="resumeFileInput"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setError(""); } }}
          />
          <div className="flex flex-col items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${file ? "glass border border-white/15" : "glass border border-white/8"}`}>
              {file ? <CheckCircle className="w-7 h-7 text-emerald-400" /> : <Upload className="w-7 h-7 text-white/30" />}
            </div>
            {file ? (
              <div>
                <p className="text-white font-semibold text-base">{file.name}</p>
                <p className="text-white/40 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB · PDF ready</p>
              </div>
            ) : (
              <div>
                <p className="text-white font-semibold text-base">Drop your PDF resume here</p>
                <p className="text-white/40 text-sm mt-1">or click to browse · max 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass rounded-xl p-4 border border-red-500/20 bg-red-500/5">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Analyze Button */}
        <button
          id="resume-analyze-btn"
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-4 rounded-xl glass-btn-primary text-sm font-bold flex items-center justify-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing your resume...
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              Analyze & Generate Questions
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Candidate Summary */}
            {result.candidateSummary && (
              <div className="glass rounded-2xl p-6">
                <p className="text-white/40 text-xs font-mono-tech mb-3">Candidate Summary</p>
                <p className="text-white/70 text-sm leading-relaxed">{result.candidateSummary}</p>
              </div>
            )}

            {/* Questions */}
            <div>
              <div className="mb-5">
                <p className="text-white/40 text-xs font-mono-tech">AI Generated</p>
                <h2 className="text-white font-semibold text-lg mt-1">Interview Questions</h2>
              </div>
              <div className="space-y-3">
                {result.questions?.map((q: any, i: number) => (
                  <div key={i} className="glass glass-hover rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <span className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center text-xs font-bold text-white/40 flex-shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm leading-relaxed mb-3">{q.question}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${difficultyStyle[q.difficulty] || "border-white/10 text-white/40"}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-xs text-white/30 border border-white/8 rounded-lg px-2.5 py-1">{q.type}</span>
                          <span className="text-xs text-white/30">· {q.targetSkill}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
