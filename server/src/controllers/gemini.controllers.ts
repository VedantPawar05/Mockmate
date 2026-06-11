import axios from "axios";
import { raw, Request, Response } from "express";
import dotenv from "dotenv";
import { Question } from "../types/express";
import MockInterviewModel, { MockInterview } from "../models/mockinterview.model";
import { UserModel } from "../models/user.model";
import exp from "constants";

dotenv.config();

function extractAndParseJSONQuestion(responseText: string) {
  try {
    // Extract JSON content by finding the first '{' and last '}'
    const startIndex = responseText.indexOf("{");
    const endIndex = responseText.lastIndexOf("}");
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON object found in response");
    }
    
    const jsonString = responseText.substring(startIndex, endIndex + 1);
    const parsedData = JSON.parse(jsonString);

    // Add answer and review fields to each question
    if (parsedData.questions && Array.isArray(parsedData.questions)) {
      parsedData.questions = parsedData.questions.map((question: Question) => ({
        ...question,
        answer: "",
        review: "",
      }));
    }

    return parsedData;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

function extractAndParseJSON(responseText: string) {
  try {
    // Extract JSON content by finding the first '{' and last '}'
    const startIndex = responseText.indexOf("{");
    const endIndex = responseText.lastIndexOf("}");
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON object found in response");
    }
    
    const jsonString = responseText.substring(startIndex, endIndex + 1);
    const parsedData = JSON.parse(jsonString);

    // Add answer and review fields to each question
    if (parsedData.questions && Array.isArray(parsedData.questions)) {
      parsedData.questions = parsedData.questions.map((question: Question) => ({
        ...question,
      }));
    }

    return parsedData;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

const generateQuestions = async (
  category: string,
  interviewID: string,
  userId: string,
  skills: string[] = [],
  count: number = 5
) => {
  let jobRole: string | undefined;
  let experienceLevel: string | undefined;
  let company: string | undefined;

  const mockInterview = await MockInterviewModel.findOne({
    _id: interviewID,
    user: userId,
  });

  if (!mockInterview) {
    throw new Error("Mock interview not found");
  }

  jobRole = mockInterview.jobRole;
  skills = mockInterview.skills || [];
  company = mockInterview.targetCompany;
  experienceLevel = mockInterview.experienceLevel;

  if (!jobRole || !company || !experienceLevel) {
    throw new Error("All fields are required");
  }
  
  const mcqCount = count;  // 100% MCQ
  const theoryCount = 0;   // 0% theory

  const prompt = `Generate a JSON response containing EXACTLY ${count} ${category} interview questions for:

  Tech Stack: ${skills.join(", ")}
  Experience Level: ${experienceLevel}
  Company: ${company}
  Job Role: ${jobRole}

  IMPORTANT: YOU MUST RETURN EXACTLY ${count} QUESTIONS. NO MORE. NO LESS.
  All ${count} questions MUST be MCQ questions. Do NOT generate any theory questions.

  For ALL questions:
  - Set "questionFormat": "mcq"
  - Provide exactly 4 options labeled A, B, C, D in "options" array (e.g. ["A. option text", "B. option text", "C. option text", "D. option text"])
  - Set "correctAnswer" to the correct letter: "A", "B", "C", or "D"

  Output Format:
  {
    "questions": [
      {
        "type": "Conceptual",
        "technology": "Node.js",
        "question": "Which of the following best describes the Node.js event loop?",
        "questionFormat": "mcq",
        "options": ["A. A single-threaded blocking I/O model", "B. A multi-threaded model with worker threads", "C. A single-threaded non-blocking I/O model", "D. A process-based concurrency model"],
        "correctAnswer": "C"
      }
    ]
  }

  Ensure questions are relevant and aligned with the technologies. Use appropriate difficulty for the experience level. Return only valid JSON with no extra text or explanation.`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    const responseData = response.data.candidates[0].content.parts[0].text;
    console.log(`[DEBUG] Gemini Model Raw Response for ${category}:\n`, responseData);
    const parsed = extractAndParseJSONQuestion(responseData);
    if (!parsed) console.log(`[DEBUG] Parsing returned null for ${category}!`);
    
    if (parsed && Array.isArray(parsed.questions)) {
      parsed.questions = parsed.questions.slice(0, count);
    }
    
    return parsed || { questions: [] };
  } catch (error: any) {
    console.error(`[DEBUG] Error generating ${category} questions:`, error.message);
    if (error.response) {
      console.error(`[DEBUG] Axios error data:`, error.response.data);
      if (error.response.status === 429) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
    }
    return { questions: [] };
  }
};

// **Modified functions that return responses instead of sending them**
export const generateDSAQuestions = async (
  interviewID: string,
  userId: string,
  count: number
) => {
  return generateQuestions("DSA", interviewID, userId, [], count);
};

export const generateTechStackQuestions = async (
  interviewID: string,
  userId: string,
  skills: string[],
  count: number
) => {
  return generateQuestions("Tech Stack", interviewID, userId, skills, count);
};

export const generateCoreSubjectQuestions = async (
  interviewID: string,
  userId: string,
  count: number
) => {
  return generateQuestions("Core Subjects", interviewID, userId, [
    "OS",
    "OOPs",
    "System Design",
  ], count);
};

// **Parent function that generates all questions at once in a single, robust Gemini query to prevent 429/503 rate-limits**
export const GenerateIntervieQuestions = async (
  req: Request,
  res: Response
) => {
  const { interviewID, skills } = req.body as {
    interviewID: string;
    skills: string[];
  };
  const userId = req.user._id;

  if (!interviewID) {
    return res.status(400).json({ error: "Interview ID is required" });
  }

  try {
    const mockInterview = await MockInterviewModel.findOne({ _id: interviewID, user: userId });
    if (!mockInterview) {
      return res.status(404).json({ error: "Mock interview not found" });
    }

    const jobRole = mockInterview.jobRole;
    const company = mockInterview.targetCompany;
    const experienceLevel = mockInterview.experienceLevel;

    if (!jobRole || !company || !experienceLevel) {
      return res.status(400).json({ error: "Job role, target company, and experience level are required on the mock interview" });
    }

    const numQuestions = mockInterview.numQuestions || 15;
    const dsaCount = Math.floor(numQuestions / 3);
    const techCount = Math.floor(numQuestions / 3);
    const coreCount = numQuestions - dsaCount - techCount;

    const prompt = `Generate a JSON response containing EXACTLY ${numQuestions} interview questions divided into three categories for the candidate:
  
    Tech Stack / Skills: ${skills && skills.length > 0 ? skills.join(", ") : "general software development"}
    Experience Level: ${experienceLevel}
    Company: ${company}
    Job Role: ${jobRole}

    You must distribute the questions exactly as follows. ALL questions MUST be MCQs (no theory questions):
    - DSA Questions (dsaQuestions): EXACTLY ${dsaCount} questions (100% MCQs with exactly 4 options)
    - Tech Stack Questions (techStackQuestions): EXACTLY ${techCount} questions (100% MCQs with exactly 4 options, highly relevant to tech stack: ${skills && skills.length > 0 ? skills.join(", ") : "general software development"})
    - Core Subject Questions (coreSubjectQuestions): EXACTLY ${coreCount} questions (100% MCQs with exactly 4 options, focused on OS, DBMS, OOPs, Computer Networks, and System Design)

    For ALL questions:
    - Set "questionFormat" to "mcq"
    - Provide exactly 4 options labeled A, B, C, D in "options" array (e.g. ["A. option text", "B. option text", "C. option text", "D. option text"])
    - Set "correctAnswer" to the correct letter: "A", "B", "C", or "D"

    Output Format:
    {
      "dsaQuestions": [
        {
          "type": "Conceptual",
          "technology": "Data Structures",
          "question": "Which of the following data structures has constant time insertion and deletion in all cases?",
          "questionFormat": "mcq",
          "options": ["A. Array", "B. Doubly Linked List", "C. Binary Search Tree", "D. Stack"],
          "correctAnswer": "B"
        }
      ],
      "techStackQuestions": [
        {
          "type": "Conceptual",
          "technology": "React",
          "question": "Which hook is used to perform side effects in React?",
          "questionFormat": "mcq",
          "options": ["A. useState", "B. useEffect", "C. useContext", "D. useReducer"],
          "correctAnswer": "B"
        }
      ],
      "coreSubjectQuestions": [
        {
          "type": "Conceptual",
          "technology": "OS",
          "question": "What is the primary difference between a process and a thread?",
          "questionFormat": "mcq",
          "options": ["A. Threads do not share memory", "B. Processes are lighter than threads", "C. Threads share the same memory space", "D. Processes cannot communicate with each other"],
          "correctAnswer": "C"
        }
      ]
    }

    Return ONLY valid JSON with no extra explanation, conversational text, or markdown code blocks.`;

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    let responseData = "";
    let retries = 2;
    while (retries > 0) {
      try {
        const response = await axios.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
          {
            headers: { "Content-Type": "application/json" },
            params: { key: process.env.GEMINI_API_KEY },
          }
        );
        responseData = response.data.candidates[0].content.parts[0].text;
        break;
      } catch (err: any) {
        retries--;
        console.warn(`[DEBUG] Gemini parent generator failed. Retries left: ${retries}. Error: ${err.message}`);
        if (err.response) {
          console.warn(`[DEBUG] Axios response details:`, err.response.status, err.response.data);
        }
        if (retries === 0) throw err;
        await sleep(2500);
      }
    }

    // Clean markdown blocks if Gemini wraps it in ```json
    const cleanJson = responseData.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    const sanitizeQuestions = (qs: any[]) => {
      if (!Array.isArray(qs)) return [];
      return qs.map((q: any) => ({
        question: q.question || "",
        answer: "",
        review: "",
        correctAns: q.correctAns || "",
        questionFormat: q.questionFormat || "theory",
        options: q.options || [],
        correctAnswer: q.correctAnswer || "",
        selectedOption: "",
      }));
    };

    const mergedQuestions = {
      dsaQuestions: sanitizeQuestions(parsedData.dsaQuestions),
      techStackQuestions: sanitizeQuestions(parsedData.techStackQuestions),
      coreSubjectQuestions: sanitizeQuestions(parsedData.coreSubjectQuestions),
    };

    return res.status(200).json(mergedQuestions);
  } catch (error: any) {
    console.error("[DEBUG] Error generating interview questions:", error);
    if (error.stack) console.error(error.stack);
    
    // In case of any final failure, return a structured fallback of simple questions so the user's interview NEVER fails
    return res.status(200).json({
      dsaQuestions: [
        {
          question: "Explain the difference between an Array and a Linked List, along with their respective time complexities for lookup, insertion, and deletion.",
          answer: "",
          review: "",
          correctAns: "Arrays have O(1) lookup and O(N) insertion/deletion. Linked lists have O(N) lookup and O(1) insertion/deletion.",
          questionFormat: "mcq",
          options: ["A. Array O(1) lookup", "B. Array O(N) lookup", "C. Linked List O(1) lookup", "D. Stack O(N) lookup"],
          correctAnswer: "A",
          selectedOption: ""
        }
      ],
      techStackQuestions: [
        {
          question: "What are some best practices for managing state and optimizing rendering performance in large-scale applications?",
          answer: "",
          review: "",
          correctAns: "Memoization, virtualized lists, debouncing, and keeping state close to where it's used.",
          questionFormat: "mcq",
          options: ["A. Memoization", "B. Context API", "C. Prop drilling", "D. Force Update"],
          correctAnswer: "A",
          selectedOption: ""
        }
      ],
      coreSubjectQuestions: [
        {
          question: "Explain the ACID properties in database management systems and why they are critical for transaction integrity.",
          answer: "",
          review: "",
          correctAns: "Atomicity, Consistency, Isolation, and Durability guarantee transactional safety and data integrity.",
          questionFormat: "mcq",
          options: ["A. ACID", "B. BASE", "C. CAP Theorem", "D. SOLID"],
          correctAnswer: "A",
          selectedOption: ""
        }
      ]
    });
  }
};

export const GenerateReview = async (req: Request, res: Response) => {
  const { InterviewDetailsObject } = req.body as {
    InterviewDetailsObject: MockInterview;
  };

  if (!InterviewDetailsObject) {
    return res.status(400).json({ message: "Invalid request format" });
  }

  // const InterviewDetailsObject: any = {
  //   _id: "6795d666dc37ffb7ea41f932",
  //   user: "6795b233e1b51c2c483907ed",
  //   jobRole: "SDE",
  //   overallReview: "",
  //   overallRating: 0,
  //   experienceLevel: "Junior",
  //   targetCompany: "any",
  //   skills: ["C++", "Java"],
  //   dsaQuestions: [
  //     {
  //       question:
  //         "Explain the difference between `const int* ptr` and `int * const ptr` in C++.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827c5",
  //     },
  //     {
  //       question:
  //         "Explain the concept of polymorphism in Java and provide a code example illustrating its use.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827c6",
  //     },
  //     {
  //       question:
  //         "Write a C++ function to reverse a linked list.  Provide example input and output.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827c7",
  //     },
  //     {
  //       question:
  //         "Design a Java class representing a simple bank account. Include methods for deposit, withdrawal, and checking balance.  Handle potential exceptions (e.g., insufficient funds).",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827c8",
  //     },
  //     {
  //       question:
  //         "Explain the difference between a shallow copy and a deep copy in C++ and when you would use each.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827c9",
  //     },
  //     {
  //       question:
  //         "Write a Java program to find the second largest element in an integer array. Handle edge cases like arrays with less than two elements.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827ca",
  //     },
  //     {
  //       question:
  //         "Explain the difference between an interface and an abstract class in Java. When would you choose one over the other?",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827cb",
  //     },
  //     {
  //       question:
  //         "Implement a C++ function that checks if a given string is a palindrome (reads the same forwards and backward).",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827cc",
  //     },
  //     {
  //       question:
  //         "You are given a list of integers. Write a Java function to efficiently find the kth largest element.  Explain the time and space complexity of your solution.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827cd",
  //     },
  //     {
  //       question:
  //         "Explain the concept of RAII (Resource Acquisition Is Initialization) in C++ and its benefits.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827ce",
  //     },
  //   ],
  //   technicalQuestions: [
  //     {
  //       question:
  //         "Explain the difference between `malloc` and `new` in C++ and when you would use each.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827cf",
  //     },
  //     {
  //       question:
  //         "Describe the concept of inheritance in Java. Explain the different types of inheritance and their use cases with examples.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d0",
  //     },
  //     {
  //       question:
  //         "You need to write a C++ function that reverses a given string.  Write the function and explain its time and space complexity.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d1",
  //     },
  //     {
  //       question:
  //         "Design a Java class to represent a simple bank account.  It should include methods to deposit, withdraw, and check the balance.  Consider error handling for insufficient funds.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d2",
  //     },
  //     {
  //       question:
  //         "Explain the difference between a stack and a heap in C++ memory management.  Provide examples of when you would use each.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d3",
  //     },
  //     {
  //       question:
  //         "What is the difference between `==` and `.equals()` when comparing strings in Java? Explain with examples.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d4",
  //     },
  //     {
  //       question:
  //         "Write a C++ function that finds the largest element in an integer array. Explain its efficiency.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d5",
  //     },
  //     {
  //       question:
  //         "You are given a list of integers. Write a Java program to find the sum of all even numbers in the list.  Handle potential exceptions (e.g., null list).",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d6",
  //     },
  //     {
  //       question:
  //         "What are pointers in C++ and how are they used? Explain with examples and potential pitfalls.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d7",
  //     },
  //     {
  //       question:
  //         "Implement a simple Java program that reads a file, counts the number of lines, and prints the count to the console.  Handle potential file I/O exceptions.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d8",
  //     },
  //   ],
  //   coreSubjectQuestions: [
  //     {
  //       question:
  //         "Explain the difference between `const int* ptr` and `int* const ptr` in C++.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827d9",
  //     },
  //     {
  //       question:
  //         "Describe the difference between `==` and `.equals()` when comparing Strings in Java. Provide examples.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827da",
  //     },
  //     {
  //       question:
  //         "You are given a linked list. Write a C++ function to reverse the linked list.  Provide example inputs and outputs.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827db",
  //     },
  //     {
  //       question:
  //         "You need to design a Java program to read data from a CSV file and store it in a database. Describe your approach, including error handling.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827dc",
  //     },
  //     {
  //       question:
  //         "Explain polymorphism in C++ and provide an example using virtual functions.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827dd",
  //     },
  //     {
  //       question:
  //         "Explain the concept of exception handling in Java.  What are checked and unchecked exceptions?",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827de",
  //     },
  //     {
  //       question:
  //         "Write a C++ function to implement a binary search algorithm on a sorted array. Provide example inputs and outputs.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827df",
  //     },
  //     {
  //       question:
  //         "Describe how you would implement a simple queue data structure in Java using an array. Explain potential issues and limitations.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827e0",
  //     },
  //     {
  //       question:
  //         "What are smart pointers in C++ and why are they important?  Give examples of different smart pointer types.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827e1",
  //     },
  //     {
  //       question:
  //         "You are given a string containing multiple words separated by spaces. Write a Java program to count the number of occurrences of each word. Provide example inputs and outputs.",
  //       answer: "",
  //       review: "",
  //       _id: "679dc1cb1c40a9d0af0827e2",
  //     },
  //   ],
  //   createdAt: "2025-01-26T06:29:58.858Z",
  //   updatedAt: "2025-02-01T06:40:11.126Z",
  //   __v: 0,
  // };

  const InterviewDetails = JSON.stringify(InterviewDetailsObject);

  const reviewPrompt = `
  You are an AI designed to evaluate technical interview responses. Given an interview object in JSON format, analyze all answers and generate the following:

  RULES:
  1. For questions where "questionFormat" is "mcq":
     - Compare "selectedOption" with "correctAnswer".
     - If they match, set review to "✓ Correct! [brief explanation of why this answer is right]".
     - If they don't match or selectedOption is missing, set review to "✗ Incorrect. The correct answer is [correctAnswer]: [brief explanation]".
     - Do NOT change the "correctAnswer", "selectedOption", or "options" fields.
  2. For questions where "questionFormat" is "theory" or no questionFormat:
     - Evaluate the "answer" field for correctness, completeness, and clarity.
     - Set the "review" field with constructive feedback.
  3. Set "overallRating" (1-5) based on combined performance across all questions.
  4. Set "overallReview" with a summary of the candidate's performance.
  5. Set "dsaRating", "technicalRating", and "coreRating" (all 1-5) based on performance in those specific sections.
  6. Preserve ALL existing fields in the JSON exactly. Update "review" fields, and add "overallRating", "overallReview", "dsaRating", "technicalRating", and "coreRating" at the root level.
  7. Return ONLY the updated JSON object. No extra text.

  InterviewDetails:
  ${InterviewDetails}
`;

  // console.log("Review Prompt", reviewPrompt);

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: reviewPrompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );
    // console.log(
    //   "Resposnse Data",
    //   response.data.candidates[0].content.parts[0].text
    // );
    const responseData = response.data.candidates[0].content.parts[0].text;
    const generatedResponse = extractAndParseJSON(responseData) || "{}";
    // console.log("Parsed Data ", generatedResponse);
    // const jsonResponse = JSON.parse(generatedResponse);

    // save Interview 
    let interviewId = InterviewDetailsObject._id;
    let interview  = await MockInterviewModel.findOne({"_id":interviewId});
    console.log(interview);
    if (interview) {
      interview.dsaQuestions = generatedResponse.dsaQuestions;
      interview.technicalQuestions = generatedResponse.technicalQuestions;
      interview.coreSubjectQuestions = generatedResponse.coreSubjectQuestions;
      interview.overallRating = generatedResponse.overallRating || 0;
      interview.overallReview = generatedResponse.overallReview || "";
      interview.dsaRating = generatedResponse.dsaRating || 0;
      interview.technicalRating = generatedResponse.technicalRating || 0;
      interview.coreRating = generatedResponse.coreRating || 0;
      await interview.save();

      // Update user streak
      const user = await UserModel.findById(interview.user);
      if (user) {
        const now = new Date();
        const lastPracticed = user.lastPracticed ? new Date(user.lastPracticed) : null;
        
        if (!lastPracticed) {
          user.streakCount = 1;
        } else {
          const msInDay = 24 * 60 * 60 * 1000;
          const diffDays = Math.floor((now.getTime() - lastPracticed.getTime()) / msInDay);
          
          if (diffDays === 1) {
            user.streakCount += 1; // Practiced consecutive day
          } else if (diffDays > 1) {
            user.streakCount = 1; // Streak broken
          }
          // if diffDays === 0, already practiced today, keep streak same
        }
        
        user.lastPracticed = now;
        await user.save();
      }

    } else {
      return res.status(404).json({ error: "Interview not found" });
    }
    return res.status(200).json({"message":"success"});
  } catch (error: any) {
    console.error(
      "Error generating review:",
      error.response?.data || error.message
    );
    if (error.response?.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment and try again." });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};
