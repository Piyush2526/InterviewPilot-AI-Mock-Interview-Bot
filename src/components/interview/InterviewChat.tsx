import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Timer, SkipForward, Loader2 } from "lucide-react";
import { getNextTurn } from "@/lib/interview.functions";
import type { RoleDef, AnswerItem, ChatTurn } from "@/lib/interview-roles";

const TOTAL_QUESTIONS = 5;
const SECONDS_PER_QUESTION = 150;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function toAnswers(history: ChatTurn[]): AnswerItem[] {
  const pairs: AnswerItem[] = [];
  history.forEach((turn, i) => {
    if (turn.role !== "user") return;
    const prev = [...history.slice(0, i)].reverse().find((t) => t.role === "assistant");
    pairs.push({ question: prev?.content ?? "", answer: turn.content });
  });
  return pairs;
}

export function InterviewChat({
  role,
  onFinish,
}: {
  role: RoleDef;
  onFinish: (answers: AnswerItem[]) => void;
}) {
  const askNext = useServerFn(getNextTurn);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [asked, setAsked] = useState(0);
  const [draft, setDraft] = useState("");
  const [left, setLeft] = useState(SECONDS_PER_QUESTION);
  const [thinking, setThinking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const submitRef = useRef<(text: string) => void>(() => {});
  const draftRef = useRef("");
  draftRef.current = draft;
  const startedRef = useRef(false);

  const requestTurn = useCallback(
    async (base: ChatTurn[], questionNumber: number) => {
      setThinking(true);
      setError(null);
      try {
        const text = await askNext({
          data: { roleId: role.id, history: base, questionNumber },
        });
        setHistory([...base, { role: "assistant", content: text }]);
        setAsked(questionNumber);
        setLeft(SECONDS_PER_QUESTION);
      } catch (e) {
        console.error("interview turn failed", e);
        setError("The interviewer didn't respond. Please try again.");
      } finally {
        setThinking(false);
      }
    },
    [askNext, role.id],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void requestTurn([], 1);
  }, [requestTurn]);

  const submit = (text: string) => {
    if (thinking || asked === 0) return;
    const answer = text.trim() || "(no answer given)";
    const next: ChatTurn[] = [...history, { role: "user", content: answer }];
    setHistory(next);
    setDraft("");

    if (asked >= TOTAL_QUESTIONS) {
      setThinking(true);
      onFinish(toAnswers(next));
      return;
    }
    void requestTurn(next, asked + 1);
  };
  submitRef.current = submit;

  useEffect(() => {
    if (thinking || asked === 0) return;
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
  }, [asked, thinking]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, thinking]);

  useEffect(() => {
    if (!thinking) inputRef.current?.focus();
  }, [thinking, asked]);

  const pct = Math.max(0, Math.min(100, (left / SECONDS_PER_QUESTION) * 100));
  const low = left <= 15;

  return (
    <div className="mx-auto flex h-screen w-full max-w-3xl flex-col px-5 py-6">
      <header className="card-elevated flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {role.title} interview
          </p>
          <h1 className="mt-0.5 text-lg">
            Question {Math.max(1, asked)}{" "}
            <span className="text-muted-foreground">of {TOTAL_QUESTIONS}</span>
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
        {history.map((b, i) =>
          b.role === "assistant" ? (
            <div key={i} className="flex gap-3">
              <span className="surface-navy mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                AI
              </span>
              <p className="max-w-[85%] whitespace-pre-wrap pt-1 text-[15px] leading-relaxed text-foreground">
                {b.content}
              </p>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-[15px] leading-relaxed text-primary-foreground">
                {b.content}
              </p>
            </div>
          ),
        )}
        {thinking && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="surface-navy flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
              AI
            </span>
            <Loader2 className="size-4 animate-spin" /> Thinking…
          </div>
        )}
        {error && (
          <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
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
          ref={inputRef}
          disabled={thinking}
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
              disabled={thinking}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
            >
              <SkipForward className="size-3.5" /> Skip
            </button>
            <button
              type="submit"
              disabled={!draft.trim() || thinking}
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