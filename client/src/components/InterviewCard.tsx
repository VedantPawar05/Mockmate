import React from "react";
import Rating from "./Rating";
import { Interview } from "../types/global";
import { useNavigate } from "react-router-dom";
import { deleteInterview } from "../api/mockinterview.api";
import { Trash2 } from "lucide-react";

interface InterviewCardProps {
  interview: Interview;
  onDelete?: (id: string) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this interview? This will remove all associated progress.")) {
      try {
        await deleteInterview(interview._id);
        if (onDelete) onDelete(interview._id);
      } catch (error) {
        console.error("Failed to delete interview:", error);
        alert("Failed to delete interview.");
      }
    }
  };

  const handleViewDetailsClick = () => {
    navigate(`/interviewdetails/${interview._id}`);
  };

  const handleTakeInterviewClick = () => {
    navigate(`/interviewinterface/${interview._id}`);
  };

  return (
    <div className="relative group flex flex-col my-6 bg-zinc-950/40 backdrop-blur-md shadow-sm border border-zinc-800/60 rounded-lg w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl hover:border-zinc-700/60 transition-all duration-300">
      {/* Image Section */}
      <div className="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
        <img
          className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25, 1, 0.5, 1)] transform group-hover:scale-110"
          src="/interview1.png"
          alt="default-interview"
        />
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors z-10"
          title="Delete Interview"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Overlay for incomplete interviews */}
      {interview.overallRating === 0 && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white p-4 rounded-lg">
          <p className="text-lg font-semibold mb-2 text-center">You have not completed the interview</p>
          <button
            onClick={() => handleTakeInterviewClick()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Take Interview
          </button>
        </div>
      )}

      {/* Details Section */}
      <div className="p-4">
        <h6 className="mb-2 text-slate-50 text-xl font-semibold">
          {interview.jobRole}
        </h6>
        <p className="text-slate-300 leading-normal font-light">
          {interview.overallReview}
        </p>
      </div>

      {/* Rating Section */}
      <div className="px-4 py-4">
        <Rating experienceLevel={interview.experienceLevel} rating={interview.overallRating} />
      </div>

      {/* Action Buttons */}
      <div className="pt-4 pb-6 px-4 flex justify-between rounded-b-lg">
        <button
          onClick={() => handleViewDetailsClick()}
          className="inline-flex items-center justify-center w-full px-3 py-2 mb-2 text-md text-white bg-green-400 rounded-sm sm:w-auto sm:mb-0 hover:bg-green-500"
        >
          View Full Details
        </button>
        <button
          onClick={() => handleTakeInterviewClick()}
          className="inline-flex items-center justify-center w-full px-3 py-2 mb-2 text-md text-white bg-blue-400 rounded-sm sm:w-auto sm:mb-0 hover:bg-blue-500"
        >
          Take Again
        </button>
      </div>
    </div>
  );
};

export default InterviewCard;

