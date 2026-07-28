import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateInterviewQuestions, gradeInterviewAnswers } from "./interview.server";

export const getQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ roleId: z.string() }).parse(input))
  .handler(async ({ data }) => generateInterviewQuestions(data.roleId));

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