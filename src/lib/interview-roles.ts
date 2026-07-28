export type RoleId = "sde-intern" | "data-analyst" | "frontend-developer";

export interface RoleDef {
  id: RoleId;
  title: string;
  blurb: string;
  focus: string;
  duration: string;
}

export const ROLES: RoleDef[] = [
  {
    id: "sde-intern",
    title: "SDE Intern",
    blurb: "Data structures, problem solving and CS fundamentals for internship loops.",
    focus: "DSA · Complexity · Projects",
    duration: "~10 min",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb: "SQL reasoning, statistics and turning messy data into a clear recommendation.",
    focus: "SQL · Stats · Storytelling",
    duration: "~10 min",
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    blurb: "JavaScript depth, React patterns, performance and accessible UI decisions.",
    focus: "JS · React · Performance",
    duration: "~10 min",
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