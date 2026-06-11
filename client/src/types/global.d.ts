interface Question {
  question: string;
  answer: string;
  review: string;
  correctAns?: string;
  marks?: number;
  timeSpent?: number;
  _id?: string;
  // MCQ fields
  questionFormat?: "mcq" | "theory";
  options?: string[];
  correctAnswer?: string;  // correct option letter: "A" | "B" | "C" | "D"
  selectedOption?: string; // what user picked
}

export interface Interview {
  _id: string;
  jobRole: string;
  overallReview: string;
  overallRating: number;
  experienceLevel: "Fresher" | "Junior" | "Mid-Level" | "Senior";
  targetCompany: string;
  skills?: string[];
  dsaQuestions?: Question[];
  technicalQuestions?: Question[];
  coreSubjectQuestions?: Question[];
  dsaRating?: number;
  technicalRating?: number;
  coreRating?: number;
  weakTopics?: string[];
  totalTimeSpent?: number;
  topic?: string;
  difficulty?: string;
  createdAt?: string;
}
