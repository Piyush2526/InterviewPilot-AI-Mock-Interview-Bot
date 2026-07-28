import { useEffect, useRef, useState } from "react";
import { Send, Timer, SkipForward } from "lucide-react";
import type { QuestionItem, RoleDef, AnswerItem } from "@/lib/interview-roles";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

type Bubble = { role: "ai" | "user"; text: string };

export function InterviewChat({
  role,
  questions,
  onFinish,
}: {
  role: RoleDef;
  questions: QuestionItem[];
  onFinish: (answers: AnswerItem[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [draft, setDraft] = useState("");
  const [left, setLeft] = useState(questions[0]?.seconds ?? 120);
  const [bubbles, setBubbles] = useState<Bubble[]>([
    {
      role: "ai",
      text: `Hi — I'll be your interviewer for the ${role.title} round. Take your time, answer out loud in your head, then type your response. Ready? Here's question 1.`,
    },
    { role: "ai", text: questions[0]?.question ?? "" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<(text: string) => void>(() => {});

  const submit = (text: string) => {
    const current = questions[index];
    if (!current) return;
    const next = [...answers, { question: current.question, answer: text }];
    setAnswers(next);
    setDraft("");

    if (index + 1 >= questions.length) {
      setBubbles((b) => [
        ...b,
        { role: "user", text: text.trim() || "(skipped)" },
        { role: "ai", text: "That's the last one. Scoring your interview now…" },
      ]);
      onFinish(next);
      return;
    }

    const upcoming = questions[index + 1];
    setBubbles((b) => [
      ...b,
      { role: "user", text: text.trim() || "(skipped)" },
      { role: "ai", text: upcoming.question },
    ]);
    setIndex(index + 1);
    setLeft(upcoming.seconds);
  };
  submitRef.current = submit;

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) {
          submitRef.current(draftRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [index]);

  const draftRef = useRef("");
  draftRef.current = draft;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bubbles]);

  const total = questions[index]?.seconds ?? 1;
  const pct = Math.max(0, Math.min(100, (left / total) * 100));
  const low = left <= 15;

  return (
    <div className="mx-auto flex h-screen w-full max-w-3xl flex-col px-5 py-6">
      <header className="card-elevated flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {role.title} interview
          </p>
          <h1 className="mt-0.5 text-lg">
            Question {index + 1}{" "}
            <span className="text-muted-foreground">of {questions.length}</span>
          </h1>
        </div>
        <div className="text-right">
          <div
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold tabular-nums ${
              low ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"
            }`}
          >
            <Timer className="size-4" />
            {fmt(left)}
          </div>
          <div className="mt-2 h-1 w-28 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${low ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
        {bubbles.map((b, i) =>
          b.role === "ai" ? (
            <div key={i} className="flex gap-3">
              <span className="surface-navy mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                AI
              </span>
              <p className="max-w-[85%] pt-1 text-[15px] leading-relaxed text-foreground">
                {b.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-[15px] leading-relaxed text-primary-foreground">
                {b.text}
              </p>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          submit(draft);
        }}
        className="card-elevated mt-4 p-3"
      >
        <textarea
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              if (draft.trim()) submit(draft);
            }
          }}
          rows={3}
          placeholder="Type your answer…"
          className="w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-xs text-muted-foreground">⌘ + Enter to send</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => submit("")}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <SkipForward className="size-3.5" /> Skip
            </button>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Send <Send className="size-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}