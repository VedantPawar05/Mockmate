import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader/Loader";
import Navbar from "@/components/Navbar";
import { Brain, Mic, ClipboardList, TrendingUp, Database, ArrowRight } from "lucide-react";

const LandingPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const features = [
    { title: "Cognitive Load Analysis", description: "Real-time tracking of physiological stress markers during complex technical problem-solving scenarios.", icon: Brain },
    { title: "Vocal Prosody Mapping", description: "Detailed spectral analysis of pitch, tone, and pacing to ensure optimal communication clarity.", icon: Mic },
    { title: "Algorithmic Audits", description: "Automated benchmarking of code efficiency and style against established industry standards.", icon: ClipboardList },
    { title: "Trajectory Forecasting", description: "Predictive modeling of career progression based on interview performance telemetry.", icon: TrendingUp },
    { title: "Comprehensive Data Vault", description: "A secure, encrypted repository for all session transcripts, audio logs, and performance metadata. Designed for granular post-mortem analysis and continuous iterative improvement.", icon: Database, isLarge: true },
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#050508]"><Loader /></div>
  );

  return (
    <div className="bg-[#050508] text-white min-h-screen relative overflow-x-hidden">
      {/* Ambient */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-violet-900/20 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full bg-blue-900/15 blur-[120px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none z-0" />

      <Navbar />

      {/* Hero */}
      <section className="pt-44 pb-24 relative z-10 flex flex-col items-center text-center px-5">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/60 text-xs font-medium">AI-Powered Interview Practice</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.02] max-w-4xl mb-6">
          <span className="text-white">Ace Your Next</span>
          <br />
          <span className="text-outline">Interview.</span>
        </h1>

        <p className="text-white/40 text-base max-w-md mb-10 leading-relaxed">
          Practice with AI interviewers, get real feedback, and track your growth — all in one platform.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="glass-btn-primary flex items-center gap-3 px-7 py-3.5 rounded-2xl text-base font-semibold"
        >
          Start Practicing Free
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Features */}
      <section className="py-20 relative z-10 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-white/30 text-xs font-mono-tech mb-3">Platform Features</p>
            <h2 className="text-3xl font-bold text-white">Everything you need to prepare</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`glass glass-hover rounded-2xl p-7 flex flex-col justify-between ${
                    feature.isLarge ? "md:col-span-6 lg:col-span-4" : "md:col-span-3 lg:col-span-2"
                  }`}
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl glass border border-white/12 flex items-center justify-center mb-5">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                  {feature.isLarge && (
                    <div className="flex items-end gap-2 mt-8 h-10">
                      {[2, 4, 3, 6, 5, 4, 3].map((h, i) => (
                        <div key={i} className="w-3 bg-white/40 rounded-t animate-pulse" style={{ height: `${h * 8}px`, animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/6 relative z-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs">
          <div className="flex items-center gap-2 font-bold text-white/50">
            <span className="text-white text-[8px]">●</span> MockMate
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div>© 2026 MockMate. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
