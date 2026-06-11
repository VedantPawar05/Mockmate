// src/components/VoiceAnswerMode.tsx
import { useEffect, useRef, useState } from "react";

interface VoiceAnswerModeProps {
  onTranscriptUpdate: (text: string) => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceAnswerMode: React.FC<VoiceAnswerModeProps> = ({ onTranscriptUpdate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
        else interim += event.results[i][0].transcript;
      }
      setTranscript((prev) => {
        const updated = (prev + final).trim();
        onTranscriptUpdate(updated + (interim ? ` ${interim}` : ""));
        return updated;
      });
    };
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!supported) return (
    <div className="text-red-400 text-sm p-3 bg-red-950/30 rounded-lg border border-red-800/50">
      Voice input not supported in this browser. Try Chrome.
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            isListening
              ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
              : "bg-violet-600 hover:bg-violet-700 text-white"
          }`}
        >
          <span>{isListening ? "🔴" : "🎤"}</span>
          {isListening ? "Stop Recording" : "Start Voice Answer"}
        </button>
        {transcript && (
          <button
            onClick={() => { setTranscript(""); onTranscriptUpdate(""); }}
            className="text-xs text-slate-400 hover:text-red-400 underline"
          >
            Clear
          </button>
        )}
      </div>
      {isListening && (
        <div className="flex gap-1 items-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-1 rounded-full bg-violet-400 animate-bounce`} style={{ height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s` }} />
          ))}
          <span className="text-xs text-slate-400 ml-2">Listening...</span>
        </div>
      )}
      {transcript && (
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 min-h-[60px]">
          {transcript}
        </div>
      )}
    </div>
  );
};

export default VoiceAnswerMode;

