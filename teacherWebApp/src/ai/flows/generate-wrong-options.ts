"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateWrongOptionsInputSchema = z.object({
  question: z.string().min(10).describe("The question text"),
  correctAnswer: z.string().min(1).describe("The correct answer text"),
  count: z.number().int().min(1).max(3).default(3).describe("Number of wrong options to generate"),
});
export type GenerateWrongOptionsInput = z.infer<typeof GenerateWrongOptionsInputSchema>;

const GenerateWrongOptionsOutputSchema = z.object({
  wrongOptions: z.array(z.string()),
});
export type GenerateWrongOptionsOutput = z.infer<typeof GenerateWrongOptionsOutputSchema>;

const generateWrongOptionsPrompt = ai.definePrompt({
  name: "generateWrongOptionsPrompt",
  input: { schema: GenerateWrongOptionsInputSchema },
  output: { schema: GenerateWrongOptionsOutputSchema },
  prompt: `
You are helping teachers create multiple choice questions by generating plausible wrong answers.

Given a question and its correct answer, generate {{count}} wrong but realistic answer options.
- Wrong answers should be plausible and related to the question topic
- They should be similar in style/length to the correct answer
- Avoid obviously wrong answers that students would never choose
- Make them educational - wrong answers that represent common mistakes or misconceptions
- Ensure they are clearly different from the correct answer

Question: {{question}}
Correct Answer: {{correctAnswer}}
Number of wrong options needed: {{count}}

Return JSON: { "wrongOptions": ["wrong answer 1", "wrong answer 2", "wrong answer 3"] }
`,
});

export async function generateWrongOptions(input: GenerateWrongOptionsInput): Promise<GenerateWrongOptionsOutput> {
  try {
    GenerateWrongOptionsInputSchema.parse(input);
    const { output } = await generateWrongOptionsPrompt(input);
    return GenerateWrongOptionsOutputSchema.parse(output);
  } catch (e) {
    // Fallback: generate simple wrong options
    const fallbacks = [
      "Incorrect option 1",
      "Wrong answer 2",
      "Not the right choice 3"
    ];

    return {
      wrongOptions: fallbacks.slice(0, input.count)
    };
  }
}