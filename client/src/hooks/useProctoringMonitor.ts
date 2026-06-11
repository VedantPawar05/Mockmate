// src/hooks/useProctoringMonitor.ts
import { useEffect, useRef, useState } from "react";

interface ProctoringLog {
  tabSwitches: number;
  fullscreenExits: number;
  violations: { type: string; timestamp: string }[];
}

export const useProctoringMonitor = (onViolation: (msg: string) => void) => {
  const [log, setLog] = useState<ProctoringLog>({
    tabSwitches: 0,
    fullscreenExits: 0,
    violations: [],
  });
  const logRef = useRef(log);
  logRef.current = log;

  const addViolation = (type: string) => {
    const violation = { type, timestamp: new Date().toISOString() };
    setLog((prev) => ({
      ...prev,
      tabSwitches: type === "tab_switch" ? prev.tabSwitches + 1 : prev.tabSwitches,
      fullscreenExits: type === "fullscreen_exit" ? prev.fullscreenExits + 1 : prev.fullscreenExits,
      violations: [...prev.violations, violation],
    }));
    onViolation(type === "tab_switch" ? "⚠ Tab switch detected!" : "⚠ Fullscreen exited!");
  };

  useEffect(() => {
    // Tab visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) addViolation("tab_switch");
    };
    // Fullscreen change detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) addViolation("fullscreen_exit");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  return { log };
};
