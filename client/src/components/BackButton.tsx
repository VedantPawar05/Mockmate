import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  label?: string;
}

const BackButton = ({ to, label = "Back" }: BackButtonProps) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="flex items-center gap-2 glass-btn px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
      {label}
    </button>
  );
};

export default BackButton;
