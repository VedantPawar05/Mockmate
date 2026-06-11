import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  BarChart3,
  Trophy,
  FileText,
  CreditCard,
  History,
  Plus,
  LogOut,
  Sparkles,
  Command,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Actions" | "Help";
  icon: any;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function CommandPalette({ isOpen, onClose, onLogout }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const items: CommandItem[] = [
    // Navigation
    {
      id: "dash",
      title: "Go to Dashboard",
      subtitle: "Overview of your learning progress and roadmaps",
      category: "Navigation",
      icon: LayoutDashboard,
      action: () => { navigate("/dashboard"); onClose(); },
      shortcut: "G D",
    },
    {
      id: "analyzer",
      title: "Performance Analyzer",
      subtitle: "Detailed AI performance insights and key metrics",
      category: "Navigation",
      icon: BarChart3,
      action: () => { navigate("/analyzer"); onClose(); },
      shortcut: "G A",
    },
    {
      id: "leaderboard",
      title: "View Leaderboard",
      subtitle: "Check global ranks and compete with others",
      category: "Navigation",
      icon: Trophy,
      action: () => { navigate("/leaderboard"); onClose(); },
      shortcut: "G L",
    },
    {
      id: "resume",
      title: "Analyze Resume",
      subtitle: "Upload and analyze resume with AI advice",
      category: "Navigation",
      icon: FileText,
      action: () => { navigate("/resume-analyzer"); onClose(); },
      shortcut: "G R",
    },
    {
      id: "flashcards",
      title: "Study Flashcards",
      subtitle: "Review wrong MCQs and practice questions",
      category: "Navigation",
      icon: CreditCard,
      action: () => { navigate("/flashcards"); onClose(); },
      shortcut: "G F",
    },
    {
      id: "history",
      title: "Interview History",
      subtitle: "View performance summaries of past interview sessions",
      category: "Navigation",
      icon: History,
      action: () => { navigate("/history"); onClose(); },
      shortcut: "G H",
    },
    // Actions
    {
      id: "new-interview",
      title: "Start New Mock Interview",
      subtitle: "Configure and initiate a new interview session",
      category: "Actions",
      icon: Plus,
      action: () => { navigate("/create"); onClose(); },
      shortcut: "N I",
    },
    {
      id: "logout",
      title: "Sign Out",
      subtitle: "Safely sign out of your account",
      category: "Actions",
      icon: LogOut,
      action: () => { onLogout(); onClose(); },
    },
    // Help / Quick Tips
    {
      id: "tips",
      title: "AI Prep Tip",
      subtitle: "Consistency is key. Practicing one coding topic daily increases conversion rates by 65%.",
      category: "Help",
      icon: Sparkles,
      action: () => {},
    },
  ];

  // Filtering based on search query
  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/70 backdrop-blur-md transition-all duration-300"
    >
      {/* Search Container */}
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl glass-strong border border-white/10 rounded-2xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.8)] shadow-violet-900/10 flex flex-col relative transition-transform duration-300 scale-100"
      >
        {/* Ambient Top Light */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8 relative">
          <Search className="w-5 h-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search sections..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-0 outline-none text-white placeholder-white/20 text-sm focus:ring-0"
          />
          <div className="flex items-center gap-1 text-[10px] text-white/30 font-mono bg-white/5 border border-white/10 rounded px-1.5 py-0.5 select-none">
            <Command className="w-2.5 h-2.5" />
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[350px] overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm font-medium">
              No results found for "{search}"
            </div>
          ) : (
            <>
              {/* Grouping items by Category */}
              {Array.from(new Set(filtered.map((i) => i.category))).map((category) => {
                const categoryItems = filtered.filter((i) => i.category === category);
                return (
                  <div key={category} className="space-y-1">
                    <div className="text-[10px] text-white/25 font-mono-tech px-3 py-2 uppercase tracking-wider">
                      {category}
                    </div>
                    {categoryItems.map((item) => {
                      const overallIndex = filtered.indexOf(item);
                      const isSelected = overallIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(overallIndex)}
                          className={`w-full text-left flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 relative ${
                            isSelected
                              ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                              : "border border-transparent hover:bg-white/4"
                          }`}
                        >
                          {/* Accent bar on selected */}
                          {isSelected && (
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded bg-violet-500" />
                          )}

                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? "bg-violet-500/20 text-violet-400"
                                : "bg-white/5 text-white/50"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-semibold leading-tight transition-colors ${
                                isSelected ? "text-white" : "text-white/70"
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="text-[11px] text-white/30 mt-0.5 truncate">
                              {item.subtitle}
                            </p>
                          </div>

                          {item.shortcut && (
                            <div className="text-[9px] font-mono bg-white/5 border border-white/5 text-white/30 rounded px-1.5 py-0.5 flex-shrink-0">
                              {item.shortcut}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-t border-white/6 text-[10px] text-white/35 font-medium select-none">
          <div className="flex items-center gap-2">
            <span>↑↓ to navigate</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span>↵ to select</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>MockMate search</span>
            <Command className="w-3 h-3 text-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
