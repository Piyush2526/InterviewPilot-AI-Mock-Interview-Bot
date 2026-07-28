import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { getRole, type AnswerItem, type InterviewReport, type QuestionItem } from "./interview-roles";

const MODEL = "google/gemini-3.6-flash";

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

const questionsSchema = z.object({
  questions: z.array(z.object({ question: z.string(), seconds: z.number() })),
});

const reportSchema = z.object({
  overallScore: z.number(),
  summary: z.string(),
  perQuestion: z.array(
    z.object({ question: z.string(), score: z.number(), feedback: z.string() }),
  ),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  modelAnswerQuestion: z.string(),
  modelAnswer: z.string(),
});

export async function generateInterviewQuestions(roleId: string): Promise<QuestionItem[]> {
  const role = getRole(roleId);
  if (!role) throw new Error("Unknown role");

  const { output } = await generateText({
    model: gateway()(MODEL),
    output: Output.object({ schema: questionsSchema }),
    system:
      "You are a senior technical interviewer. Write realistic, concise interview questions. " +
      "Never ask multi-part compound questions.",
    prompt:
      `Generate exactly 5 interview questions for a ${role.title} candidate. ` +
      `Focus areas: ${role.focus}. Mix one warm-up/behavioral question with four technical ones, ordered easy to hard. ` +
      `Each question must be under 220 characters. For each, set "seconds" to a suggested answer time between 60 and 180.`,
  });

  return output.questions.slice(0, 5).map((q) => ({
    question: q.question,
    seconds: Math.min(240, Math.max(45, Math.round(q.seconds || 120))),
  }));
}

export async function gradeInterviewAnswers(
  roleId: string,
  answers: AnswerItem[],
): Promise<InterviewReport> {
  const role = getRole(roleId);
  if (!role) throw new Error("Unknown role");

  const transcript = answers
    .map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.answer?.trim() || "(no answer given)"}`)
    .join("\n\n");

  const prompt =
    `Evaluate this mock interview for a ${role.title} role.\n\n${transcript}\n\n` +
    `Score each question 0-10 (empty answers score 0) and give one or two sentences of specific feedback. ` +
    `overallScore is 0-100. Give 3 strengths and 3 weaknesses, each under 120 characters. ` +
    `Pick the single weakest answer's question as modelAnswerQuestion and write an exemplary answer for it (under 1200 characters). ` +
    `Keep summary under 300 characters. Repeat each question verbatim in perQuestion.`;

  try {
    const { output } = await generateText({
      model: gateway()(MODEL),
      output: Output.object({ schema: reportSchema }),
      system: "You are a fair but demanding interview coach. Be specific, never generic.",
      prompt,
    });
    return normalize(output, answers);
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && error.text) {
      const match = error.text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = reportSchema.safeParse(JSON.parse(match[0]));
        if (parsed.success) return normalize(parsed.data, answers);
      }
    }
    throw error;
  }
}

function normalize(data: z.infer<typeof reportSchema>, answers: AnswerItem[]): InterviewReport {
  return {
    ...data,
    overallScore: Math.min(100, Math.max(0, Math.round(data.overallScore))),
    perQuestion: data.perQuestion.slice(0, answers.length).map((p) => ({
      ...p,
      score: Math.min(10, Math.max(0, Math.round(p.score))),
    })),
    strengths: data.strengths.slice(0, 4),
    weaknesses: data.weaknesses.slice(0, 4),
  };
}