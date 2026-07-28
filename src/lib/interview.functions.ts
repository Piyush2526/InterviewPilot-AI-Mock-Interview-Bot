import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { nextInterviewerTurn, gradeInterviewAnswers } from "./interview.server";

export const getNextTurn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        roleId: z.string(),
        history: z.array(
          z.object({ role: z.enum(["assistant", "user"]), content: z.string() }),
        ),
        questionNumber: z.number(),
      })
      .parse(input),
  )
  .handler(async ({ data }) =>
    nextInterviewerTurn(data.roleId, data.history, data.questionNumber),
  );

export const getReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        roleId: z.string(),
        answers: z.array(z.object({ question: z.string(), answer: z.string() })),
      })
      .parse(input),
  )
  .handler(async ({ data }) => gradeInterviewAnswers(data.roleId, data.answers));