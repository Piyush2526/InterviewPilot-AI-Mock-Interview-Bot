export type RoleId = "sde-intern" | "data-analyst" | "frontend-developer";

export interface RoleDef {
  id: RoleId;
  title: string;
  blurb: string;
  focus: string;
  duration: string;
  roleName: string;
  roleContext: string;
}

export const ROLES: RoleDef[] = [
  {
    id: "sde-intern",
    title: "SDE Intern",
    blurb: "Data structures, problem solving and CS fundamentals for internship loops.",
    focus: "DSA · Complexity · Projects",
    duration: "~10 min",
    roleName: "Software Development Engineer (SDE) Intern",
    roleContext: `Focus on foundational CS concepts, not deep systems design. Ask a mix of:
- 1 data structures/algorithms question (e.g., array/string/hashmap based, appropriate for intern level)
- 1 basic CS fundamentals question (OOP, time complexity, or database basics)
- 1 project/experience-based question (walk through a project they built)
- 1 problem-solving/behavioral question (e.g., handling a bug, working in a team)
- 1 "why this role/company" or motivation-based question

Keep difficulty appropriate for someone with limited professional experience — no advanced system design.`,
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb: "SQL reasoning, statistics and turning messy data into a clear recommendation.",
    focus: "SQL · Stats · Storytelling",
    duration: "~10 min",
    roleName: "Data Analyst",
    roleContext: `Focus on analytical thinking, SQL/Excel proficiency, and business communication. Ask a mix of:
- 1 SQL or data manipulation question (e.g., how they'd write a query or clean messy data)
- 1 statistics/metrics fundamentals question (e.g., mean vs median, A/B testing basics)
- 1 case-study style question (e.g., "how would you investigate a drop in metric X")
- 1 project/experience-based question (a past analysis they're proud of)
- 1 communication/stakeholder question (explaining data to a non-technical audience)`,
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    blurb: "JavaScript depth, React patterns, performance and accessible UI decisions.",
    focus: "JS · React · Performance",
    duration: "~10 min",
    roleName: "Frontend Developer",
    roleContext: `Focus on core web fundamentals and practical UI development. Ask a mix of:
- 1 JavaScript fundamentals question (e.g., closures, async behavior, event loop)
- 1 CSS/layout question (e.g., flexbox/grid, responsive design approach)
- 1 framework-specific question (React/Vue — state management, component lifecycle, or performance)
- 1 project/experience-based question (a UI challenge they solved)
- 1 debugging/problem-solving question (e.g., diagnosing a rendering or performance issue)`,
  },
];

export function getRole(id: string): RoleDef | undefined {
  return ROLES.find((r) => r.id === id);
}

export interface QuestionItem {
  question: string;
  seconds: number;
}

export interface AnswerItem {
  question: string;
  answer: string;
}

export interface ChatTurn {
  role: "assistant" | "user";
  content: string;
}

export interface QuestionScore {
  question: string;
  score: number;
  feedback: string;
}

export interface InterviewReport {
  overallScore: number;
  summary: string;
  perQuestion: QuestionScore[];
  strengths: string[];
  weaknesses: string[];
  modelAnswerQuestion: string;
  modelAnswer: string;
}