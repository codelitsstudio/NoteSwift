import { Request, Response } from "express";
import { generateAIResponse, AIChatInput } from "../../../ai/chat";
import SubjectContent from "../models/SubjectContent.model";
import Question from "../models/Question.model";
import Test from "../models/Test.model";

export class AIController {
  static async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message, courseContext, subjectContext, moduleContext, conversationHistory }: AIChatInput = req.body;

      if (!message || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Message is required"
        });
        return;
      }

      // Fetch relevant educational data
      const educationalData = await AIController.fetchEducationalData(courseContext, subjectContext, moduleContext);

      const input: AIChatInput = {
        message: message.trim(),
        courseContext,
        subjectContext,
        moduleContext,
        conversationHistory,
        educationalData // Add educational data to input
      };

      const result = await generateAIResponse(input);

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate AI response",
        error: error.message
      });
    }
  }

  private static async fetchEducationalData(courseContext?: any, subjectContext?: any, moduleContext?: any) {
    try {
      const data: any = {};

      // Fetch subject content if we have course and subject context
      if (courseContext?.courseId && subjectContext?.subjectName) {
        const subjectContent = await SubjectContent.findOne({
          courseId: courseContext.courseId,
          subjectName: subjectContext.subjectName,
          isActive: true
        }).lean();

        if (subjectContent) {
          data.subjectContent = {
            description: subjectContent.description,
            syllabus: subjectContent.syllabus,
            objectives: subjectContent.objectives,
            modules: subjectContent.modules?.map(module => ({
              moduleNumber: module.moduleNumber,
              moduleName: module.moduleName,
              description: module.description,
              hasVideo: module.hasVideo,
              hasNotes: module.hasNotes,
              hasTest: module.hasTest,
              hasQuestions: module.hasQuestions,
              order: module.order
            }))
          };
        }
      }

      // Fetch related questions
      if (subjectContext?.subjectName) {
        const questions = await Question.find({
          subjectName: subjectContext.subjectName,
          isActive: true,
          status: { $in: ['answered', 'resolved'] }
        })
        .select('title questionText answers status tags moduleName topicName')
        .limit(20)
        .sort({ createdAt: -1 })
        .lean();

        if (questions.length > 0) {
          data.questions = questions.map(q => ({
            title: q.title,
            question: q.questionText,
            answers: q.answers?.slice(0, 2).map(a => a.answerText) || [], // Top 2 answers
            tags: q.tags,
            moduleName: q.moduleName,
            topicName: q.topicName
          }));
        }
      }

      // Fetch test questions and explanations
      if (subjectContext?.subjectName) {
        const tests = await Test.find({
          subjectName: subjectContext.subjectName,
          status: 'active',
          isActive: true
        })
        .select('title questions totalQuestions category')
        .limit(10)
        .lean();

        if (tests.length > 0) {
          data.tests = tests.map(test => ({
            title: test.title,
            category: test.category,
            totalQuestions: test.totalQuestions,
            sampleQuestions: test.questions?.slice(0, 3).map(q => ({
              questionText: q.questionText,
              questionType: q.questionType,
              options: q.options,
              explanation: q.explanation,
              difficulty: q.difficulty
            })) || []
          }));
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching educational data:', error);
      return {};
    }
  }
}