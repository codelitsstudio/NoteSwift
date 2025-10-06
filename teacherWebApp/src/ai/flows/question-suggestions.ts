"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const QuestionSuggestionsInputSchema = z.object({
  topic: z.string().min(2).describe("Topic or chapter name"),
  type: z.enum(["mcq", "numerical", "short", "long"]).describe("Desired question type"),
  count: z.number().int().min(1).max(10).default(3),
});
export type QuestionSuggestionsInput = z.infer<typeof QuestionSuggestionsInputSchema>;

const QuestionSuggestionSchema = z.object({
  text: z.string(),
  options: z.array(z.object({ key: z.string(), text: z.string() })).optional(),
  correctAnswer: z.any().optional(),
});

const QuestionSuggestionsOutputSchema = z.object({
  questions: z.array(QuestionSuggestionSchema),
});
export type QuestionSuggestionsOutput = z.infer<typeof QuestionSuggestionsOutputSchema>;

const questionSuggestionsPrompt = ai.definePrompt({
  name: "questionSuggestionsPrompt",
  input: { schema: QuestionSuggestionsInputSchema },
  output: { schema: QuestionSuggestionsOutputSchema },
  prompt: `
You generate exam questions for teachers.
- Keep them concise and clear.
- If type is mcq, include 4 options with keys A-D and specify the correctAnswer key.
- If numerical, provide a single numeric correctAnswer.
- If short/long, omit options and correctAnswer.
Return JSON: { "questions": [ { "text": "...", "options": [ {"key": "A", "text": "..."}], "correctAnswer": "A" } ] }
Topic: {{topic}}
Type: {{type}}
Count: {{count}}
`,
});

export async function getQuestionSuggestions(input: QuestionSuggestionsInput): Promise<QuestionSuggestionsOutput> {
  try {
    QuestionSuggestionsInputSchema.parse(input);
    const { output } = await questionSuggestionsPrompt(input);
    return QuestionSuggestionsOutputSchema.parse(output);
  } catch (e) {
    return {
      questions: Array.from({ length: input.count ?? 3 }).map((_, i) => ({
        text: `${input.type.toUpperCase()} sample Q${i + 1} on ${input.topic}`,
        options: input.type === "mcq" ? [
          { key: "A", text: "Option A" },
          { key: "B", text: "Option B" },
          { key: "C", text: "Option C" },
          { key: "D", text: "Option D" },
        ] : undefined,
        correctAnswer: input.type === "mcq" ? "A" : undefined,
      })),
    };
  }
}
