import { Request, Response } from 'express';
import { ChatHistory, IChatHistory } from '../models/ChatHistory.model';

export class ChatHistoryController {
  // Save or update chat history
  static async saveChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId, title, lastMessage, courseTitle, courseId, subjectName, moduleName, messages } = req.body;
      const studentId = req.user?.id;

      if (!studentId) {
        res.status(401).json({
          success: false,
          message: 'Student authentication required'
        });
        return;
      }

      // Find existing chat or create new one
      let chatHistory = await ChatHistory.findOne({ studentId, chatId });

      if (chatHistory) {
        // Update existing chat
        chatHistory.title = title;
        chatHistory.lastMessage = lastMessage;
        chatHistory.courseTitle = courseTitle;
        chatHistory.courseId = courseId;
        chatHistory.subjectName = subjectName;
        chatHistory.moduleName = moduleName;
        chatHistory.messages = messages;
        await chatHistory.save();
      } else {
        // Create new chat
        chatHistory = new ChatHistory({
          studentId,
          chatId,
          title,
          lastMessage,
          courseTitle,
          courseId,
          subjectName,
          moduleName,
          messages
        });
        await chatHistory.save();
      }

      res.json({
        success: true,
        message: 'Chat history saved successfully'
      });

    } catch (error: any) {
      console.error('Save Chat History Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save chat history',
        error: error.message
      });
    }
  }

  // Get chat history for a student
  static async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.user?.id;

      if (!studentId) {
        res.status(401).json({
          success: false,
          message: 'Student authentication required'
        });
        return;
      }

      const chatHistory = await ChatHistory.find({ studentId })
        .sort({ updatedAt: -1 })
        .limit(50)
        .select('chatId title lastMessage courseTitle courseId subjectName moduleName createdAt updatedAt');

      res.json({
        success: true,
        data: chatHistory
      });

    } catch (error: any) {
      console.error('Get Chat History Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat history',
        error: error.message
      });
    }
  }

  // Get specific chat with full messages
  static async getChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const studentId = req.user?.id;

      if (!studentId) {
        res.status(401).json({
          success: false,
          message: 'Student authentication required'
        });
        return;
      }

      const chat = await ChatHistory.findOne({ studentId, chatId });

      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      res.json({
        success: true,
        data: chat
      });

    } catch (error: any) {
      console.error('Get Chat Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat',
        error: error.message
      });
    }
  }

  // Delete specific chat
  static async deleteChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const studentId = req.user?.id;

      if (!studentId) {
        res.status(401).json({
          success: false,
          message: 'Student authentication required'
        });
        return;
      }

      const result = await ChatHistory.deleteOne({ studentId, chatId });

      if (result.deletedCount === 0) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Chat deleted successfully'
      });

    } catch (error: any) {
      console.error('Delete Chat Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete chat',
        error: error.message
      });
    }
  }
}