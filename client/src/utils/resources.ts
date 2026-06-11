// Curated resource links per topic
// Used in TestResultScreen and InterviewDetails for "Read more" suggestions

export interface Resource {
  title: string;
  url: string;
  type: "video" | "article" | "docs" | "practice";
}

const RESOURCES: Record<string, Resource[]> = {
  // OS
  "os": [
    { title: "OS Concepts - GeeksForGeeks", url: "https://www.geeksforgeeks.org/operating-systems/", type: "article" },
    { title: "Operating Systems - YouTube (Neso Academy)", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O", type: "video" },
  ],
  "operating system": [
    { title: "OS Concepts - GeeksForGeeks", url: "https://www.geeksforgeeks.org/operating-systems/", type: "article" },
    { title: "OS Interview Questions", url: "https://www.interviewbit.com/operating-system-interview-questions/", type: "article" },
  ],
  // OOPs
  "oops": [
    { title: "OOP Concepts - GeeksForGeeks", url: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/", type: "article" },
    { title: "OOP in Java - YouTube", url: "https://www.youtube.com/watch?v=7GwptabrYyk", type: "video" },
  ],
  "object oriented": [
    { title: "OOP Concepts - GeeksForGeeks", url: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/", type: "article" },
  ],
  // DBMS
  "dbms": [
    { title: "DBMS - GeeksForGeeks", url: "https://www.geeksforgeeks.org/dbms/", type: "article" },
    { title: "DBMS Interview Questions", url: "https://www.interviewbit.com/dbms-interview-questions/", type: "article" },
    { title: "SQL Tutorial - W3Schools", url: "https://www.w3schools.com/sql/", type: "docs" },
  ],
  "sql": [
    { title: "SQL Practice - LeetCode", url: "https://leetcode.com/problemset/database/", type: "practice" },
    { title: "SQL Tutorial - W3Schools", url: "https://www.w3schools.com/sql/", type: "docs" },
  ],
  // System Design
  "system design": [
    { title: "System Design Primer - GitHub", url: "https://github.com/donnemartin/system-design-primer", type: "article" },
    { title: "System Design Interview - YouTube", url: "https://www.youtube.com/c/SystemDesignInterview", type: "video" },
  ],
  // DSA
  "dsa": [
    { title: "DSA - GeeksForGeeks", url: "https://www.geeksforgeeks.org/data-structures/", type: "article" },
    { title: "LeetCode Practice", url: "https://leetcode.com/", type: "practice" },
    { title: "DSA - Striver's Sheet", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/", type: "practice" },
  ],
  "array": [
    { title: "Array Problems - LeetCode", url: "https://leetcode.com/tag/array/", type: "practice" },
    { title: "Arrays - GeeksForGeeks", url: "https://www.geeksforgeeks.org/array-data-structure/", type: "article" },
  ],
  "linked list": [
    { title: "Linked List - GFG", url: "https://www.geeksforgeeks.org/data-structures/linked-list/", type: "article" },
    { title: "Linked List Problems - LeetCode", url: "https://leetcode.com/tag/linked-list/", type: "practice" },
  ],
  "tree": [
    { title: "Tree Problems - LeetCode", url: "https://leetcode.com/tag/tree/", type: "practice" },
    { title: "Binary Tree - GFG", url: "https://www.geeksforgeeks.org/binary-tree-data-structure/", type: "article" },
  ],
  // Networks
  "networking": [
    { title: "Computer Networks - GFG", url: "https://www.geeksforgeeks.org/computer-network-tutorials/", type: "article" },
    { title: "CN Interview Questions", url: "https://www.interviewbit.com/networking-interview-questions/", type: "article" },
  ],
  // React
  "react": [
    { title: "React Docs", url: "https://react.dev/", type: "docs" },
    { title: "React Interview Questions", url: "https://www.interviewbit.com/react-interview-questions/", type: "article" },
  ],
  // Node.js
  "node": [
    { title: "Node.js Docs", url: "https://nodejs.org/en/docs", type: "docs" },
    { title: "Node.js Interview Questions", url: "https://www.interviewbit.com/node-js-interview-questions/", type: "article" },
  ],
  // Java
  "java": [
    { title: "Java Interview Questions", url: "https://www.interviewbit.com/java-interview-questions/", type: "article" },
    { title: "Java Tutorial - W3Schools", url: "https://www.w3schools.com/java/", type: "docs" },
  ],
  // Python
  "python": [
    { title: "Python Docs", url: "https://docs.python.org/3/", type: "docs" },
    { title: "Python Interview Questions", url: "https://www.interviewbit.com/python-interview-questions/", type: "article" },
  ],
  // Default
  "default": [
    { title: "GeeksForGeeks", url: "https://www.geeksforgeeks.org/", type: "article" },
    { title: "InterviewBit", url: "https://www.interviewbit.com/", type: "practice" },
  ],
};

const ICON: Record<string, string> = {
  video: "🎬",
  article: "📄",
  docs: "📚",
  practice: "💻",
};

export function getResources(topic: string): Resource[] {
  const lower = topic.toLowerCase();
  for (const key of Object.keys(RESOURCES)) {
    if (lower.includes(key)) return RESOURCES[key];
  }
  return RESOURCES["default"];
}

export function getResourceIcon(type: string): string {
  return ICON[type] || "🔗";
}
