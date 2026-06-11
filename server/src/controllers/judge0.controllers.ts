// src/controllers/judge0.controllers.ts
import { Request, Response } from "express";
import axios from "axios";

const JUDGE0_API = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_HOST = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";

// Language IDs: 63=JS, 71=Python3, 54=C++, 62=Java
export const executeCode = async (req: Request, res: Response) => {
  try {
    const { sourceCode, languageId, testCases } = req.body;

    if (!sourceCode || !languageId) {
      return res.status(400).json({ message: "sourceCode and languageId are required" });
    }

    const results: any[] = [];
    const casesToRun = testCases && testCases.length > 0
      ? testCases
      : [{ input: "", expectedOutput: null }];

    for (const tc of casesToRun) {
      // Submit
      const submission = await axios.post(
        `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: sourceCode,
          language_id: parseInt(languageId),
          stdin: tc.input || "",
          expected_output: tc.expectedOutput || undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": JUDGE0_KEY,
            "X-RapidAPI-Host": JUDGE0_HOST,
          },
          timeout: 30000,
        }
      );

      const data = submission.data;
      const stdout = data.stdout || "";
      const stderr = data.stderr || "";
      const compileOutput = data.compile_output || "";
      const status = data.status?.description || "Unknown";
      const passed = tc.expectedOutput
        ? stdout.trim() === tc.expectedOutput.trim()
        : null;

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: stdout,
        stderr,
        compileOutput,
        status,
        passed,
        time: data.time,
        memory: data.memory,
      });
    }

    const allPassed = results.every((r) => r.passed === true || r.passed === null);

    return res.status(200).json({
      results,
      allPassed,
      totalTests: casesToRun.length,
      passedTests: results.filter((r) => r.passed === true).length,
    });
  } catch (error: any) {
    console.error("Judge0 error:", error.response?.data || error.message);
    return res.status(500).json({ message: "Code execution failed", error: error.message });
  }
};
