import { RotateCcw, TrendingUp, TriangleAlert, Sparkle } from "lucide-react";
import type { InterviewReport, RoleDef } from "@/lib/interview-roles";

function band(score: number) {
  if (score >= 8) return "text-success";
  if (score >= 5) return "text-warning";
  return "text-destructive";
}

export function ReportCard({
  role,
  report,
  onRestart,
}: {
  role: RoleDef;
  report: InterviewReport;
  onRestart: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <div className="surface-navy rounded-2xl px-8 py-9 shadow-[var(--shadow-lift)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
          {role.title} · Report card
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h1 className="max-w-xl text-2xl leading-snug">{report.summary}</h1>
          <div className="text-right">
            <div className="text-6xl font-semibold leading-none tabular-nums">
              {report.overallScore}
              <span className="text-2xl opacity-60">/100</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-xl">Question breakdown</h2>
        <div className="mt-4 space-y-3">
          {report.perQuestion.map((q, i) => (
            <article key={i} className="card-elevated p-5">
              <div className="flex items-start justify-between gap-5">
                <p className="text-[15px] font-medium leading-relaxed text-foreground">
                  <span className="mr-2 text-muted-foreground">Q{i + 1}.</span>
                  {q.question}
                </p>
                <span className={`shrink-0 text-2xl font-semibold tabular-nums ${band(q.score)}`}>
                  {q.score}
                  <span className="text-sm text-muted-foreground">/10</span>
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${q.score * 10}%` }} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{q.feedback}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="card-elevated p-6">
          <h2 className="flex items-center gap-2 text-lg">
            <TrendingUp className="size-4 text-success" /> Strengths
          </h2>
          <ul className="mt-4 space-y-3">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section className="card-elevated p-6">
          <h2 className="flex items-center gap-2 text-lg">
            <TriangleAlert className="size-4 text-warning" /> Work on next
          </h2>
          <ul className="mt-4 space-y-3">
            {report.weaknesses.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card-elevated mt-5 border-l-4 border-l-primary p-6">
        <h2 className="flex items-center gap-2 text-lg">
          <Sparkle className="size-4 text-primary" /> Model answer
        </h2>
        <p className="mt-3 text-sm font-medium text-foreground">{report.modelAnswerQuestion}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {report.modelAnswer}
        </p>
      </section>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RotateCcw className="size-4" /> Run another interview
        </button>
      </div>
    </div>
  );
}