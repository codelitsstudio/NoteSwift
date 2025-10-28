"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ArrangeOptionsInputSchema = z.object({
  correctAnswer: z.string().min(1).describe("The correct answer text"),
  wrongAnswers: z.array(z.string()).min(1).max(3).describe("Array of wrong answer texts (1-3 items)"),
});
export type ArrangeOptionsInput = z.infer<typeof ArrangeOptionsInputSchema>;

const ArrangeOptionsOutputSchema = z.object({
  options: z.array(z.object({
    key: z.string(),
    text: z.string(),
    isCorrect: z.boolean()
  })),
});
export type ArrangeOptionsOutput = z.infer<typeof ArrangeOptionsOutputSchema>;

const arrangeOptionsPrompt = ai.definePrompt({
  name: "arrangeOptionsPrompt",
  input: { schema: ArrangeOptionsInputSchema },
  output: { schema: ArrangeOptionsOutputSchema },
  prompt: `
You are helping teachers create multiple choice questions by randomly arranging answer options.

Given a correct answer and some wrong answers, randomly arrange them into A, B, C, D options.
- Always include exactly 4 options (A, B, C, D)
- If fewer than 3 wrong answers are provided, generate additional plausible wrong answers to make 4 total
- Randomly assign the correct answer to any position (A, B, C, or D)
- Ensure wrong answers are realistic and related to the correct answer's topic
- Return the options in A-B-C-D order, not the order they were provided

Correct Answer: {{correctAnswer}}
Wrong Answers: {{wrongAnswers}}

Return JSON: { "options": [ {"key": "A", "text": "...", "isCorrect": true/false}, {"key": "B", "text": "...", "isCorrect": true/false}, ... ] }
`,
});

export async function arrangeOptions(input: ArrangeOptionsInput): Promise<ArrangeOptionsOutput> {
  try {
    ArrangeOptionsInputSchema.parse(input);
    const { output } = await arrangeOptionsPrompt(input);
    return ArrangeOptionsOutputSchema.parse(output);
  } catch (e) {
    // Fallback: simple random arrangement
    const allAnswers = [input.correctAnswer, ...input.wrongAnswers];

    // Add dummy wrong answers if needed
    while (allAnswers.length < 4) {
      allAnswers.push(`Wrong answer ${allAnswers.length}`);
    }

    // Shuffle array
    const shuffled = [...allAnswers].sort(() => Math.random() - 0.5);

    // Find correct answer position
    const correctIndex = shuffled.indexOf(input.correctAnswer);

    return {
      options: shuffled.map((text, index) => ({
        key: String.fromCharCode(65 + index), // A, B, C, D
        text,
        isCorrect: index === correctIndex
      }))
    };
  }
}