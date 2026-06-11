import { editInterview, getInterviewByID } from "@/api/mockinterview.api";
import InterviewInterface from "@/components/InterviewInterface";
import Loader from "@/components/Loader/Loader";
import { useEffect, useState, useRef } from "react";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { MockInterview, Notification } from "@/vite-env";
import { useParams } from "react-router-dom";
import { generateQuestions } from "@/api/gemini.api";
import InterviewInstructions from "@/components/InterviewInterface/InterviewInstructionsComponent";

const InterviewInterfacePage = () => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const [interviewData, setInterviewData] = useState<MockInterview>();
  const fetchedRef = useRef(false);


  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  useEffect(() => {
    const startInterview = async () => {
      try {
        const response = await getInterviewByID(id || "");
        setInterviewData(response);

        if (response.dsaQuestions.length === 0 && response.technicalQuestions.length === 0 && response.coreSubjectQuestions.length === 0) {
          const resposne2 = await generateQuestions({ interviewID: response._id, skills: response.skills });
          
          const dsa = resposne2.data.dsaQuestions || [];
          const tech = resposne2.data.techStackQuestions || [];
          const core = resposne2.data.coreSubjectQuestions || [];
          
          if (dsa.length === 0 && tech.length === 0 && core.length === 0) {
             throw new Error("AI failed to generate questions. Please try again.");
          }

          response.dsaQuestions = dsa;
          response.coreSubjectQuestions = core;
          response.technicalQuestions = tech;
          response.overallRating = 0;
          response.overallReview = "";

          const editedInterview = await editInterview(id || "", response);
          setInterviewData(editedInterview);
        }
        
        setLoading(false);
      } catch (error) {
        console.error(error);
        const errorMsg = error instanceof Error ? error.message : "Interview not found";
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "error",
          message: errorMsg,
        };
        addNotification(newNotification);
        setTimeout(() => {
          window.location.href = "/dashboard";
          setLoading(false);
        }, 5000);
      }
    };

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      startInterview();
    }
  }, []);


  const enterFullScreen = () => {
    const elem = document.documentElement as HTMLElement & {
      mozRequestFullScreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const handleStartInterview = () => {
    enterFullScreen();
    setIsInterviewStarted(true);
  };

  // useScreenMonitor();

  if (loading) return <Loader />;

  if (!isInterviewStarted)
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <InterviewInstructions onStartInterview={handleStartInterview} />
      </div>
    );

  return (
    <div>
      {!loading && interviewData && (
        <InterviewInterface interviewDetails={interviewData} />
      )}
    </div>
  );
};

export default InterviewInterfacePage;

