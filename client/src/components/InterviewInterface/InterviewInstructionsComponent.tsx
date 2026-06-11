"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BackButton from "@/components/BackButton";

interface InterviewInfoProps {
  onStartInterview: () => void;
}

export default function InterviewInstructions({
  onStartInterview,
}: InterviewInfoProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto glass text-gray-100 border-white/6 rounded-3xl p-4 sm:p-6 glow-white-sm relative z-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-white">
          Important Interview Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="border-red-950 bg-red-950/40 text-red-200 rounded-2xl p-4">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <AlertDescription className="text-sm leading-relaxed">
              You must maintain fullscreen mode throughout the interview. Exiting
              fullscreen mode multiple times will terminate the interview session.
            </AlertDescription>
          </div>
        </Alert>

        <div className="space-y-3 text-white/70">
          <p className="leading-relaxed font-semibold text-white/95">Please ensure you have:</p>
          <ul className="list-disc pl-6 space-y-2.5 text-sm">
            <li>A stable internet connection to prevent interruptions</li>
            <li>A quiet environment for clear audio recording</li>
            <li>Your camera and microphone properly set up</li>
            <li>Enough time to complete the interview without interruption</li>
            <li>
              Once you proceed to the next question, you will <span className="text-red-400 font-semibold">not be able to
              return to the previous one.</span> Ensure you review and save your
              response before moving forward.
            </li>
          </ul>

          <p className="mt-4 text-amber-300/90 text-sm">
            Note: If you refresh the page, the interview will restart from the
            beginning.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center items-center gap-4 pt-6 border-t border-white/6 mt-6">
        <BackButton to="/dashboard" label="Exit to Dashboard" />
        <Button
          onClick={onStartInterview}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2.5 text-sm font-semibold rounded-xl glass-btn-primary transition-all duration-200"
        >
          Start Interview
        </Button>
      </CardFooter>
    </Card>
  );
}

