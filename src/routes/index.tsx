import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { RolePicker } from "@/components/interview/RolePicker";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { ReportCard } from "@/components/interview/ReportCard";
import { getReport } from "@/lib/interview.functions";
import type {
  AnswerItem,
  InterviewReport,
  RoleDef,
} from "@/lib/interview-roles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InterviewPilot — Timed AI Mock Interviews" },
      {
        name: "description",
        content:
          "Pick a role, answer five timed questions from an AI interviewer, and get a scored report card with strengths, gaps and a model answer.",
      },
      { property: "og:title", content: "InterviewPilot — Timed AI Mock Interviews" },
      {
        property: "og:description",
        content:
          "Pick a role, answer five timed questions from an AI interviewer, and get a scored report card.",
      },
    ],
  }),
  component: Index,
});

type Stage = "pick" | "chat" | "grading" | "report";

function Loading({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Index() {
  const fetchReport = useServerFn(getReport);

  const [stage, setStage] = useState<Stage>("pick");
  const [role, setRole] = useState<RoleDef | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = (picked: RoleDef) => {
    setRole(picked);
    setError(null);
    setStage("chat");
  };

  const finish = async (answers: AnswerItem[]) => {
    if (!role) return;
    setStage("grading");
    try {
      const r = await fetchReport({ data: { roleId: role.id, answers } });
      setReport(r);
      setStage("report");
    } catch {
      setError("Scoring failed. Please run the interview again.");
      setStage("pick");
    }
  };

  const restart = () => {
    setStage("pick");
    setRole(null);
    setReport(null);
  };

  return (
    <main className="min-h-screen bg-background">
      {error && stage === "pick" && (
        <div className="mx-auto max-w-5xl px-6 pt-6">
          <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        </div>
      )}
      {stage === "pick" && <RolePicker onSelect={start} />}
      {stage === "chat" && role && (
        <InterviewChat key={role.id} role={role} onFinish={finish} />
      )}
      {stage === "grading" && <Loading label="Scoring your answers…" />}
      {stage === "report" && role && report && (
        <ReportCard role={role} report={report} onRestart={restart} />
      )}
    </main>
  );
}
