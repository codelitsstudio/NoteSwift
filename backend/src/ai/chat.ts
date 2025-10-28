"use server";

import { ai } from "./genkit";
import { z } from "genkit";

const AIChatInputSchema = z.object({
  message: z.string().min(1).describe("User's message"),
  courseContext: z.object({
    courseId: z.string(),
    courseTitle: z.string(),
    subjects: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      modules: z.array(z.any()).optional()
    })).optional(),
    program: z.string().optional(),
    description: z.string().optional()
  }).optional(),
  subjectContext: z.object({
    subjectName: z.string(),
    subjectDescription: z.string().optional(),
    modules: z.array(z.any()).optional()
  }).optional(),
  moduleContext: z.object({
    moduleName: z.string(),
    moduleDescription: z.string().optional()
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional(),
  educationalData: z.any().optional().describe("Additional educational content and context")
});

export type AIChatInput = z.infer<typeof AIChatInputSchema>;

const AIChatOutputSchema = z.object({
  response: z.string(),
  suggestions: z.array(z.string()).optional()
});

export type AIChatOutput = z.infer<typeof AIChatOutputSchema>;

const aiChatPrompt = ai.definePrompt({
  name: "aiChatPrompt",
  input: { schema: AIChatInputSchema },
  output: { schema: AIChatOutputSchema },
  prompt: `
You are an expert AI tutor with access to comprehensive educational content. Provide detailed, accurate, and helpful responses using all available information.

{{#if courseContext}}
**COURSE CONTEXT:**
- Course: {{courseContext.courseTitle}}
{{#if courseContext.description}}- Description: {{courseContext.description}}{{/if}}
{{#if courseContext.program}}- Program: {{courseContext.program}}{{/if}}
{{#if courseContext.subjects}}- Available Subjects: {{#each courseContext.subjects}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{/if}}

{{#if subjectContext}}
**CURRENT SUBJECT: {{subjectContext.subjectName}}**
{{#if subjectContext.subjectDescription}}- Description: {{subjectContext.subjectDescription}}{{/if}}
{{#if subjectContext.modules}}- Available Modules: {{#each subjectContext.modules}}{{this.moduleName}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{/if}}

{{#if moduleContext}}
**CURRENT MODULE: {{moduleContext.moduleName}}**
{{#if moduleContext.moduleDescription}}- Description: {{moduleContext.moduleDescription}}{{/if}}
{{/if}}

{{#if educationalData.subjectContent}}
**SUBJECT CONTENT AVAILABLE:**
{{#if educationalData.subjectContent.description}}- Subject Description: {{educationalData.subjectContent.description}}{{/if}}
{{#if educationalData.subjectContent.syllabus}}- Syllabus: {{educationalData.subjectContent.syllabus}}{{/if}}
{{#if educationalData.subjectContent.objectives}}- Learning Objectives: {{#each educationalData.subjectContent.objectives}}• {{this}}
{{/each}}{{/if}}
{{#if educationalData.subjectContent.modules}}
**MODULES:**
{{#each educationalData.subjectContent.modules}}
Module {{this.moduleNumber}}: {{this.moduleName}}
{{#if this.description}}- Description: {{this.description}}{{/if}}
- Content Available: {{#if this.hasVideo}}Video, {{/if}}{{#if this.hasNotes}}Notes, {{/if}}{{#if this.hasTest}}Tests, {{/if}}{{#if this.hasQuestions}}Questions{{/if}}
{{/each}}
{{/if}}
{{/if}}

{{#if educationalData.questions}}
**RELATED STUDENT QUESTIONS & ANSWERS:**
{{#each educationalData.questions}}
**Q: {{this.title}}**
{{this.question}}
{{#if this.answers.length}}
**Answers:**
{{#each this.answers}}
• {{this}}
{{/each}}
{{/if}}
{{#if this.tags}}Tags: {{join this.tags ", "}}{{/if}}
{{#if this.moduleName}}Module: {{this.moduleName}}{{/if}}
---
{{/each}}
{{/if}}

{{#if educationalData.tests}}
**AVAILABLE TESTS & PRACTICE QUESTIONS:**
{{#each educationalData.tests}}
**{{this.title}} ({{this.category}} - {{this.totalQuestions}} questions)**
{{#if this.sampleQuestions}}
Sample Questions:
{{#each this.sampleQuestions}}
• {{this.questionText}}
{{#if this.options}}  Options: {{join this.options ", "}}{{/if}}
{{#if this.explanation}}  Explanation: {{this.explanation}}{{/if}}
  Difficulty: {{this.difficulty}}
{{/each}}
{{/if}}
---
{{/each}}
{{/if}}

{{#if conversationHistory}}
**PREVIOUS CONVERSATION:**
{{#each conversationHistory}}
{{#if (eq this.role "user")}}**Student:** {{this.content}}
{{else}}**Tutor:** {{this.content}}
{{/if}}
{{/each}}
{{/if}}

**STUDENT'S QUESTION:** {{message}}

**INSTRUCTIONS:**
You are an expert tutor with access to the student's complete course materials, past questions, test questions, and learning progress. Provide comprehensive, accurate responses that:

1. **Use Available Content**: Reference specific modules, tests, questions, and learning materials when relevant
2. **Provide Detailed Explanations**: Break down complex concepts with examples and step-by-step reasoning
3. **Connect Knowledge**: Link current questions to related topics, prerequisites, and future learning
4. **Offer Practice**: Suggest relevant exercises, problems, or test questions from available content
5. **Identify Gaps**: Point out any missing foundational knowledge or prerequisite skills needed
6. **Suggest Next Steps**: Recommend specific modules, topics, or practice questions to study next
7. **Be Encouraging**: Maintain a supportive, motivational tone throughout

**RESPONSE GUIDELINES:**
- Always provide complete, working solutions with explanations
- Include relevant formulas, examples, and step-by-step problem-solving
- Reference specific content from the course materials when available
- Suggest practice problems from available tests or question banks
- If the question relates to a specific module, reference that module's content
- If no direct content is available, provide comprehensive general knowledge with examples

Provide your response now:
`,
});

export async function generateAIResponse(input: AIChatInput): Promise<AIChatOutput> {
  try {
    console.log('🤖 AI Chat Input:', JSON.stringify(input, null, 2));
    AIChatInputSchema.parse(input);
    console.log('✅ Input validation passed');

    const { output } = await aiChatPrompt(input);
    console.log('🤖 AI Raw Output:', JSON.stringify(output, null, 2));

    const parsedOutput = AIChatOutputSchema.parse(output);
    console.log('✅ AI Response parsed successfully:', parsedOutput.response.substring(0, 100) + '...');

    return parsedOutput;
  } catch (error: any) {
    console.error('❌ AI Chat Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });

    // Provide more specific error handling and fallback responses
    let fallbackResponse = "I'm sorry, I encountered an error while processing your question. Please try again.";
    let suggestions: string[] = [
      "Can you please rephrase your question?",
      "Try asking about a specific topic",
      "Ask me to explain a concept"
    ];

    // Check for specific error types
    if (error.message?.includes('API_KEY') || error.message?.includes('authentication')) {
      fallbackResponse = "There seems to be an issue with my configuration. Please contact support if this persists.";
      console.error('🚨 API Key or Authentication Error');
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      fallbackResponse = "I'm currently experiencing high demand. Please try again in a few minutes.";
      console.error('🚨 Quota or Rate Limit Error');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      fallbackResponse = "Unable to connect to the AI service. Please check your internet connection.";
      console.error('🚨 Network Connection Error');
    }

    // If we have context, provide more targeted fallback
    if (input.subjectContext?.subjectName) {
      fallbackResponse = `I'm having trouble accessing detailed information about ${input.subjectContext.subjectName} right now. Let me provide some general guidance instead.`;
      suggestions = [
        `Can you tell me more about what you need help with in ${input.subjectContext.subjectName}?`,
        `Would you like me to explain a specific concept in ${input.subjectContext.subjectName}?`,
        `I can help you find practice problems related to ${input.subjectContext.subjectName}`
      ];
    } else if (input.courseContext?.courseTitle) {
      fallbackResponse = `I'd be happy to help you with ${input.courseContext.courseTitle}! I'm experiencing some technical difficulties, but I can still provide guidance.`;
      suggestions = [
        `What specific topic in ${input.courseContext.courseTitle} would you like help with?`,
        `I can help you understand the course structure and requirements`,
        `Let me know what you're currently studying in ${input.courseContext.courseTitle}`
      ];
    }

    return {
      response: fallbackResponse,
      suggestions
    };
  }
}