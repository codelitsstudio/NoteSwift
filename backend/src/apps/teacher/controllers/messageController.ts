import { Request, Response } from 'express';
import { Message } from '../../../core/models/Message';
import { Student } from '../../../apps/student/models/students/Student.model';
import Teacher from '../models/Teacher.model';

// GET /api/teacher/messages/chats - Get all teacher chat conversations
export const getTeacherChats = async (req: Request, res: Response) => {
  try {
    const { teacherEmail } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email required' });
    }

    // Verify teacher exists
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Get all messages for this teacher, grouped by student and subject
    const messages = await Message.find({ teacherId: teacher._id })
      .sort({ createdAt: -1 })
      .populate('studentId', 'full_name email')
      .populate('teacherId', 'fullName email')
      .lean();

    // Group messages by student-subject combination
    const conversationsMap = new Map<string, any>();

    messages.forEach((msg: any) => {
      const key = `${msg.studentId._id}-${msg.subjectName}`;

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          subjectName: msg.subjectName,
          courseName: msg.courseName,
          student: {
            _id: msg.studentId._id,
            name: msg.studentId.full_name,
            email: msg.studentId.email
          },
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          messages: []
        });
      }

      const conversation = conversationsMap.get(key);
      conversation.messages.push({
        _id: msg._id,
        studentId: msg.studentId._id,
        studentName: msg.studentId.full_name,
        studentEmail: msg.studentId.email,
        teacherId: msg.teacherId._id,
        teacherName: msg.teacherId.fullName,
        teacherEmail: msg.teacherId.email,
        subjectName: msg.subjectName,
        courseName: msg.courseName,
        message: msg.message,
        senderType: msg.senderType,
        timestamp: msg.timestamp,
        isRead: msg.isRead
      });

      // Count unread messages (messages from student that teacher hasn't read)
      if (msg.senderType === 'student' && !msg.isRead) {
        conversation.unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    // Sort conversations by last message time (most recent first)
    conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    return res.status(200).json({
      success: true,
      data: {
        conversations
      }
    });
  } catch (error: any) {
    console.error('Error fetching teacher chats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chat conversations' });
  }
};

// GET /api/teacher/messages/chat - Get specific chat conversation
export const getChatConversation = async (req: Request, res: Response) => {
  try {
    const { teacherEmail, studentId, subjectName } = req.query;

    if (!teacherEmail || !studentId || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Teacher email, student ID, and subject name required'
      });
    }

    // Verify teacher exists
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get messages for this conversation
    const messages = await Message.find({
      teacherId: teacher._id,
      studentId: studentId,
      subjectName: subjectName
    })
    .sort({ createdAt: 1 }) // Oldest first for chat flow
    .populate('studentId', 'full_name email')
    .populate('teacherId', 'fullName email')
    .lean();

    // Transform messages
    const transformedMessages = messages.map((msg: any) => ({
      _id: msg._id,
      studentId: msg.studentId._id,
      studentName: msg.studentId.full_name,
      studentEmail: msg.studentId.email,
      teacherId: msg.teacherId._id,
      teacherName: msg.teacherId.fullName,
      teacherEmail: msg.teacherId.email,
      subjectName: msg.subjectName,
      courseName: msg.courseName,
      message: msg.message,
      senderType: msg.senderType,
      timestamp: msg.timestamp,
      isRead: msg.isRead
    }));

    return res.status(200).json({
      success: true,
      data: {
        conversation: {
          subjectName,
          courseName: transformedMessages[0]?.courseName || '',
          student: {
            _id: student._id,
            name: student.full_name,
            email: student.email
          },
          messages: transformedMessages
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching chat conversation:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chat conversation' });
  }
};

// POST /api/teacher/messages/send - Send message from teacher to student
export const sendTeacherMessage = async (req: Request, res: Response) => {
  try {
    const { teacherEmail, studentId, subjectName, message } = req.body;

    if (!teacherEmail || !studentId || !subjectName || !message) {
      return res.status(400).json({
        success: false,
        message: 'Teacher email, student ID, subject name, and message required'
      });
    }

    // Verify teacher exists
    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get course name (use the same logic as student message sending)
    let courseName = "General"; // Default fallback

    // Try to get course name from student's enrolled courses
    if (student.enrolledCourses && student.enrolledCourses.length > 0) {
      const enrolledCourse = student.enrolledCourses[0];
      if (enrolledCourse && enrolledCourse.title) {
        courseName = enrolledCourse.title;
      }
    }

    // Create the message
    const newMessage = new Message({
      studentId: studentId,
      teacherId: teacher._id,
      subjectName,
      courseName,
      message: message.trim(),
      senderType: 'teacher',
      timestamp: new Date(),
      isRead: false
    });

    await newMessage.save();

    return res.status(200).json({
      success: true,
      data: {
        message: {
          _id: newMessage._id,
          message: newMessage.message,
          senderType: newMessage.senderType,
          timestamp: newMessage.timestamp,
          isRead: newMessage.isRead
        }
      },
      message: 'Message sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending teacher message:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};