"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Camera,
  SquareMIcon as MicSquare,
  Power,
  Video,
  VideoOff,
  CheckCircle2,
  Circle,
  ChevronLeft,
} from "lucide-react";
import { Timer } from "./InterviewInterface/Timer";
import { ExitButton } from "./InterviewInterface/ExitButton";
import { ScreenRecorder } from "./InterviewInterface/ScreenRecorder";
import { useNavigate } from "react-router-dom";
import AudioVisualizer from "@/components/InterviewInterface/AudioVisualizer";
import { MockInterview, Question } from "@/vite-env";
import CodeEditor from "./CodeEdior/CodeEditor";
import Loader from "./Loader/Loader";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";
import { generateReview } from "@/api/gemini.api";
import { CountdownTimer } from "./InterviewInterface/CountdownTimer";
import { useProctoringMonitor } from "@/hooks/useProctoringMonitor";
import TestResultScreen from "./TestResultScreen";

interface InterviewInterfaceProps {
  interviewDetails: MockInterview;
}

interface QuestionWithType extends Question {
  type: "coreSubjectQuestions" | "technicalQuestions" | "dsaQuestions";
}

const OPTION_LABELS = ["A", "B", "C", "D"];

const InterviewInterface: React.FC<InterviewInterfaceProps> = ({
  interviewDetails,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [isInterviewStarted, setIsInterviewStarted] = useState(!false);
  const [showDialog, setShowDialog] = useState(!true);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const [Questions, setQuestions] = useState<QuestionWithType[]>([]);
  const maxQuestions = Questions.length || 0;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCurrentAnswerSaved, setIsCurrentAnswerSaved] = useState(false);

  // MCQ: track selected option per question index
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  const AZURE_SUBSCRIPTION_KEY = import.meta.env.VITE_AZURE_SUBSCRIPTION_KEY;
  const AZURE_REGION = import.meta.env.VITE_AZURE_REGION;

  const [transcript, setTranscript] = useState("");

  const [partialTranscript, setPartialTranscript] = useState("");
  const language = "en-US";
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);

  const [codeResponse, setCodeResponse] = useState("");
  const [savedInterviewData, setSavedInterviewData] =
    useState<MockInterview>(interviewDetails);

  const { addNotification } = useNotification();
  const [proctoringWarning, setProctoringWarning] = useState("");
  const QUESTION_TIME = 120; // 2 minutes per question
  const TOTAL_SESSION_TIME = Questions.length > 0 ? Questions.length * QUESTION_TIME : 1800;
  const [questionTimerKey, setQuestionTimerKey] = useState(0);

  const handleProctoringViolation = useCallback((msg: string) => {
    setProctoringWarning(msg);
    const n: Notification = { id: Date.now().toString(), type: "error", message: msg };
    addNotification(n);
    setTimeout(() => setProctoringWarning(""), 5000);
  }, [addNotification]);

  const { log: proctoringLog } = useProctoringMonitor(handleProctoringViolation);

  const currentQ = Questions[currentQuestion];
  const isMCQ = currentQ?.questionFormat === "mcq";

  // ── Save response (works for both MCQ and theory) ──────────────────────────
  const handleSaveResponse = useCallback(() => {
    const currentQuestionObj = Questions[currentQuestion];
    const category = currentQuestionObj.type;
    const selectedOpt = selectedOptions[currentQuestion] || "";

    let allResponse = "";
    if (currentQuestionObj.questionFormat === "mcq") {
      allResponse = selectedOpt ? `MCQ Selected: ${selectedOpt}` : "MCQ Selected: (none)";
    } else {
      allResponse = `Text Response: ${transcript}\nCode Response: ${codeResponse}`;
    }

    const updateQuestion = (q: Question) => {
      if (q.question === currentQuestionObj.question) {
        return {
          ...q,
          answer: allResponse,
          selectedOption: selectedOpt,
        };
      }
      return q;
    };

    if (category === "technicalQuestions") {
      const updated = (savedInterviewData as any).technicalQuestions.map(updateQuestion);
      setSavedInterviewData((prev) => ({ ...prev, technicalQuestions: updated }));
    } else if (category === "coreSubjectQuestions") {
      const updated = (savedInterviewData as any).coreSubjectQuestions.map(updateQuestion);
      setSavedInterviewData((prev) => ({ ...prev, coreSubjectQuestions: updated }));
    } else if (category === "dsaQuestions") {
      const updated = (savedInterviewData as any).dsaQuestions.map(updateQuestion);
      setSavedInterviewData((prev) => ({ ...prev, dsaQuestions: updated }));
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "info",
      message: "Saved Successfully",
    };
    addNotification(newNotification);
    setIsCurrentAnswerSaved(true);
  }, [Questions, currentQuestion, selectedOptions, transcript, codeResponse, savedInterviewData, addNotification]);

  // ── MCQ option click ────────────────────────────────────────────────────────
  const handleOptionSelect = (optionLabel: string) => {
    setSelectedOptions((prev) => ({ ...prev, [currentQuestion]: optionLabel }));
    setIsCurrentAnswerSaved(false);
  };

  const handleQuestionTimerExpire = useCallback(() => {
    handleSaveResponse();
    if (currentQuestion < maxQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTranscript("");
      setIsCurrentAnswerSaved(false);
      setQuestionTimerKey((prev) => prev + 1);
    } else {
      handleSetNextQuestion();
    }
  }, [currentQuestion, maxQuestions, handleSaveResponse]);

  const handleSessionTimerExpire = useCallback(async () => {
    const n: Notification = { id: Date.now().toString(), type: "error", message: "Time's up! Auto-submitting interview..." };
    addNotification(n);
    try {
      setLoading(true);
      const generateReviewResponse = await generateReview({ InterviewDetailsObject: savedInterviewData });
      if (generateReviewResponse) navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "error",
        message: error.message || "Failed to generate review",
      };
      addNotification(newNotification);
    } finally {
      setLoading(false);
    }
  }, [savedInterviewData]);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setHasPermission(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
  };

  const handleSetNextQuestion = async () => {
    if (isCurrentAnswerSaved) {
      if (currentQuestion < maxQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTranscript("");
        setIsCurrentAnswerSaved(false);
        setQuestionTimerKey((prev) => prev + 1);
      } else {
        // Show results screen immediately — AI review is separate
        setShowResults(true);
      }
    } else {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "error",
        message: "Save Current Response to move to next Question",
      };
      addNotification(newNotification);
    }
  };

  const handleSetPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setIsCurrentAnswerSaved(false);
      setQuestionTimerKey((prev) => prev + 1);
      // Restore transcript if it was a theory question
      setTranscript("");
    }
  };

  const handleGetAIReview = async () => {
    try {
      setAiLoading(true);
      const resp = await generateReview({ InterviewDetailsObject: savedInterviewData });
      if (resp) navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "error",
        message: error.message || "Failed to generate review",
      };
      addNotification(newNotification);
    } finally {
      setAiLoading(false);
    }
  };

  const startRecognition = () => {
    if (!AZURE_SUBSCRIPTION_KEY || !AZURE_REGION) {
      alert("Azure credentials are missing.");
      return;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      AZURE_SUBSCRIPTION_KEY,
      AZURE_REGION
    );
    speechConfig.speechRecognitionLanguage = language;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(
      speechConfig,
      audioConfig
    );
    recognizerRef.current = recognizer;

    setIsCurrentAnswerSaved(false);
    setTranscript("");
    setPartialTranscript("");

    recognizer.recognizing = (sender, event) => {
      sender;
      setPartialTranscript(event.result.text);
    };

    recognizer.recognized = (sender, event) => {
      sender;
      if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        let finalText = event.result.text;
        setIsCurrentAnswerSaved(false);
        setTranscript((prev) => `${prev} ${finalText}`.trim());
        setPartialTranscript("");
      }
    };

    recognizer.startContinuousRecognitionAsync();
  };

  const stopRecognition = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(() => {
        recognizerRef.current?.close();
        recognizerRef.current = null;
      });
    }
  };

  const handleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      startRecognition();
    } else {
      setIsRecording(false);
      stopRecognition();
    }
  };

  const handleEditorOpen = () => {
    setIsEditorOpen(!isEditorOpen);
  };

  useEffect(() => {
    const handleQuestions = async () => {
      const coreSubjectQuestions =
        interviewDetails.coreSubjectQuestions?.map((q) => ({
          ...q,
          type: "coreSubjectQuestions" as const,
        })) || [];

      const technicalQuestions =
        interviewDetails.technicalQuestions?.map((q) => ({
          ...q,
          type: "technicalQuestions" as const,
        })) || [];

      const dsaQuestions =
        interviewDetails.dsaQuestions?.map((q) => ({
          ...q,
          type: "dsaQuestions" as const,
        })) || [];

      const allQuestions: QuestionWithType[] = [
        ...technicalQuestions,
        ...coreSubjectQuestions,
        ...dsaQuestions,
      ];

      setQuestions(allQuestions);
      setLoading(false);
    };

    handleQuestions();
  }, []);

  if (!isInterviewStarted)
    return (
      <div className="">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Interview</DialogTitle>
            </DialogHeader>
            <p>Do you want to start the interview?</p>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => navigate("/dashboard")}
              >
                No
              </Button>
              <Button
                onClick={() => {
                  setIsInterviewStarted(true);
                  setShowDialog(false);
                }}
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (loading)
    return (
      <div className="">
        <Loader />
      </div>
    );

  if (showResults)
    return (
      <TestResultScreen
        interviewData={savedInterviewData}
        onGetAIReview={handleGetAIReview}
        aiLoading={aiLoading}
      />
    );

  // ── Question type badge ─────────────────────────────────────────────────────
  const qTypeBadge = isMCQ ? (
    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-violet-700/60 text-violet-200 border border-violet-500/50">
      MCQ
    </span>
  ) : (
    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-700/60 text-amber-200 border border-amber-500/50">
      Theory
    </span>
  );

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Proctoring Warning Banner */}
      {proctoringWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm font-semibold animate-pulse">
          {proctoringWarning} (Tab switches: {proctoringLog.tabSwitches}, Fullscreen exits: {proctoringLog.fullscreenExits})
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-zinc-800/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-[#4AE087] via-[#84B7D4] to-[#9D7AEA] bg-clip-text text-transparent">
            AI-Powered
          </span>
          <span className="text-white"> Mock Interview</span>
        </h1>
        <div className="flex items-center gap-4">
          <CountdownTimer
            key={`q-${questionTimerKey}`}
            durationSeconds={QUESTION_TIME}
            onExpire={handleQuestionTimerExpire}
            label="Question"
            colorClass="text-blue-400"
          />
          <CountdownTimer
            durationSeconds={TOTAL_SESSION_TIME}
            onExpire={handleSessionTimerExpire}
            label="Total"
            colorClass="text-violet-400"
          />
          <ScreenRecorder />
          {!isMCQ && (
            <Button
              className="h-[35px]"
              variant="outline"
              onClick={handleEditorOpen}
            >{`${isEditorOpen ? "Close Code Editor" : "Open Code Editor"}`}</Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Question and Response Area */}
        <div className="space-y-6">
          {/* Question Card */}
          <Card className="p-6 bg-zinc-800/50 border-zinc-700">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                Question {currentQuestion + 1} of {maxQuestions}
              </h2>
              {qTypeBadge}
            </div>
            <p className="text-zinc-300 text-base leading-relaxed">
              {Questions.length > 0 ? Questions[currentQuestion].question : ""}
            </p>

            {/* ── MCQ Options ── */}
            {isMCQ && currentQ?.options && currentQ.options.length > 0 && (
              <div className="mt-5 space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const label = OPTION_LABELS[idx];
                  const isSelected = selectedOptions[currentQuestion] === label;
                  return (
                    <button
                      key={idx}
                      id={`mcq-option-${idx}`}
                      onClick={() => handleOptionSelect(label)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 text-sm font-medium
                        ${isSelected
                          ? "border-violet-500 bg-violet-900/40 text-violet-100 shadow-lg shadow-violet-900/30"
                          : "border-zinc-600 bg-zinc-900/50 text-zinc-300 hover:border-zinc-400 hover:bg-zinc-800"
                        }`}
                    >
                      {isSelected
                        ? <CheckCircle2 className="w-5 h-5 text-violet-400 flex-shrink-0" />
                        : <Circle className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                      }
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="w-full mt-4 flex justify-between gap-2">
              {/* Previous */}
              <Button
                onClick={handleSetPreviousQuestion}
                disabled={currentQuestion === 0}
                className={`mt-2 ${currentQuestion === 0 ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" : "bg-zinc-600 hover:bg-zinc-500"}`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveResponse}
                  className={`mt-2 ${isCurrentAnswerSaved ? "bg-amber-900" : "bg-amber-600"}`}
                >
                  {isCurrentAnswerSaved ? "Saved ✓" : "Save Response"}
                </Button>
                <Button
                  onClick={handleSetNextQuestion}
                  className={`mt-2 ${
                    currentQuestion === maxQuestions - 1
                      ? "bg-green-700"
                      : "bg-green-600"
                  } hover:bg-green-800`}
                >
                  {`${currentQuestion === maxQuestions - 1 ? "Finish & See Results →" : "Next →"}`}
                </Button>
              </div>
            </div>
          </Card>

          {/* Theory-only: Text Response */}
          {!isMCQ && (
            <>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700 min-h-[300px]">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Your Text Response
                </h2>
                <textarea
                  className="w-full h-full min-h-[200px] bg-zinc-900/50 border border-zinc-700 text-zinc-200 p-4 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Type your answer here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700 min-h-[200px]">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Code Submission
                </h2>
                <div className="">
                  <textarea
                    value={codeResponse}
                    onChange={(e) => {
                      setCodeResponse(e.target.value);
                    }}
                    placeholder="Write or paste your code here..."
                    className="w-full bg-zinc-800 text-white h-full p-2 placeholder:italic min-h-[150px]"
                  />
                </div>
              </Card>
            </>
          )}

          {/* MCQ: show selected indicator summary */}
          {isMCQ && (
            <Card className="p-4 bg-zinc-800/50 border-zinc-700">
              <p className="text-zinc-400 text-sm">
                {selectedOptions[currentQuestion]
                  ? <>✅ You selected option <span className="font-bold text-violet-300">{selectedOptions[currentQuestion]}</span>. Click <span className="font-bold text-amber-300">Save Response</span> to confirm.</>
                  : "👆 Click an option above to select your answer."}
              </p>
            </Card>
          )}
        </div>

        {/* Right Side - Camera and Controls */}
        <div className="space-y-4">
          <Card className="aspect-video relative bg-zinc-800/50 border-zinc-700 overflow-hidden">
            {isCameraOn && hasPermission ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                {hasPermission === false ? (
                  <p className="text-red-500">Camera permission denied</p>
                ) : (
                  <Camera className="w-16 h-16 text-zinc-600" />
                )}
              </div>
            )}
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              variant={isCameraOn ? "default" : "destructive"}
              size="lg"
              onClick={toggleCamera}
              className="w-40"
            >
              {isCameraOn ? (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Camera On
                </>
              ) : (
                <>
                  <VideoOff className="mr-2 h-4 w-4" />
                  Camera Off
                </>
              )}
            </Button>

            {/* Only show mic for theory questions */}
            {!isMCQ && (
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="lg"
                onClick={handleRecording}
                className="w-40"
              >
                {isRecording ? (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <MicSquare className="mr-2 h-4 w-4" />
                    Record
                  </>
                )}
              </Button>
            )}
          </div>

          {!isMCQ && (
            <>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700 min-h-[70px]">
                <div className="text-zinc-400">{partialTranscript}</div>
              </Card>
              <Card className="p-6 bg-zinc-800/50 border-zinc-700 min-h-[70px]">
                {isRecording && <AudioVisualizer />}
              </Card>
            </>
          )}

          {/* Question progress dots */}
          <Card className="p-4 bg-zinc-800/50 border-zinc-700">
            <p className="text-zinc-400 text-xs mb-2">Question Progress</p>
            <div className="flex flex-wrap gap-2">
              {Questions.map((q, i) => {
                const isMCQQ = q.questionFormat === "mcq";
                const isAnswered = isMCQQ ? !!selectedOptions[i] : false;
                const isCurrent = i === currentQuestion;
                return (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                      ${isCurrent ? "border-blue-400 bg-blue-900/50 text-blue-200 scale-110" :
                        isAnswered ? "border-green-500 bg-green-900/40 text-green-200" :
                        isMCQQ ? "border-violet-600/50 bg-zinc-800 text-zinc-400" :
                        "border-amber-600/50 bg-zinc-800 text-zinc-400"
                      }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-zinc-500">
              <span><span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-1"></span>MCQ</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span>Theory</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>Answered</span>
            </div>
          </Card>
        </div>
      </div>
      <Timer />
      <ExitButton />
      {isEditorOpen && <CodeEditor />}
    </div>
  );
};

export default InterviewInterface;

