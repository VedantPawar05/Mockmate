
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import NotificationCard from "./components/Notifications/NotificationCard";
import { SignupPage } from "./pages/SignupPage";
import InterviewInterfacePage from "./pages/InterviewInterfacePage";
import CodeEditor from "./components/CodeEdior/CodeEditor";
import { InterviewDetails } from "./pages/InterviewDetails";
import NotFound from "./pages/NotFound";
import Leaderboard from "./pages/Leaderboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Analyzer from "./pages/Analyzer";
import Flashcards from "./pages/Flashcards";
import InterviewHistory from "./pages/InterviewHistory";
import CreateInterview from "./pages/CreateInterview";

function App() {

  return (
    <div className="bg-black min-h-screen">
      <NotificationCard />
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test" element={<CodeEditor />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/history" element={<InterviewHistory />} />
          <Route path="/create" element={<CreateInterview />} />
          <Route
            path="/interviewinterface/:id"
            element={<InterviewInterfacePage />}
          />
          <Route
            path="/interviewdetails/:id"
            element={<InterviewDetails />}
          />
          <Route
            path="/*"
            element={<NotFound />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;

