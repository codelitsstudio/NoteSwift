// backend/src/controller/userController.ts
import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { generateRandomAvatar } from '../services/avatarService';
import CourseEnrollment from '@student/models/CourseEnrollment';
import Teacher from '../models/Teacher.model';
import { Types } from 'mongoose';

export const register: RequestHandler = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }

  const existing = await User.findOne({ username });
  if (existing) {
    res.status(409).json({ error: 'Username taken' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const avatarEmoji = generateRandomAvatar();

  const user = new User({ username, passwordHash, avatarEmoji });
  await user.save();

  res.status(201).json({
    userId: user._id,
    username: user.username,
    avatarEmoji: user.avatarEmoji,
  });
};

export const getProfile: RequestHandler = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select('username avatarEmoji');
  if (!user) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(user);
};

// Get students for a teacher (students enrolled in courses where teacher is assigned)
export const getTeacherStudents: RequestHandler = async (req, res) => {
  try {
    const { teacherEmail, courseId } = req.query as { teacherEmail?: string; courseId?: string };

    if (!teacherEmail) {
      res.status(400).json({
        success: false,
        message: "Teacher email is required"
      });
      return;
    }

    // Get teacher by email
    const teacher = await Teacher.findOne({ email: teacherEmail }).select('assignedCourses');
    
    if (!teacher) {
      res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
      return;
    }

    // Get course IDs where teacher is assigned
    const assignedCourseIds = teacher.assignedCourses?.map(ac => ac.courseId) || [];
    
    if (assignedCourseIds.length === 0) {
      res.json({
        success: true,
        data: { students: [] },
        message: "No students found (teacher not assigned to any courses)"
      });
      return;
    }

    // Build query for enrollments
    const enrollmentQuery: any = {
      courseId: { $in: assignedCourseIds },
      isActive: true
    };

    // If specific courseId is provided, filter by that course
    if (courseId && Types.ObjectId.isValid(courseId)) {
      enrollmentQuery.courseId = new Types.ObjectId(courseId);
    }

    // Get enrollments with course details (don't populate studentId since it's in students collection)
    const enrollments = await CourseEnrollment.find(enrollmentQuery)
      .populate('courseId', 'title')
      .sort({ enrolledAt: -1 });

    // Get unique student IDs from enrollments
    const studentIds = Array.from(new Set(enrollments.map((e: any) => e.studentId.toString())));

    // Fetch student details directly from students collection using MongoDB client
    const mongoose = require('mongoose');
    const studentsData = await mongoose.connection.db.collection('students').find({
      _id: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).project({
      full_name: 1,
      email: 1,
      profileImage: 1,
      createdAt: 1
    }).toArray();

    // Create a map of student data for quick lookup
    const studentMap = new Map<string, any>();
    studentsData.forEach((student: any) => {
      studentMap.set(student._id.toString(), student);
    });

    // Transform data to match expected format
    const students = enrollments.map((enrollment: any) => {
      const studentData = studentMap.get(enrollment.studentId.toString());
      
      return {
        _id: enrollment.studentId,
        firstName: studentData?.full_name?.split(' ')[0] || '',
        lastName: studentData?.full_name?.split(' ').slice(1).join(' ') || '',
        email: studentData?.email || '',
        profilePhoto: studentData?.profileImage,
        enrolledAt: enrollment.enrolledAt,
        courseTitle: enrollment.courseId.title,
        courseId: enrollment.courseId._id,
        lastActive: studentData?.createdAt || enrollment.enrolledAt, // Using createdAt as fallback for lastActive
        progress: enrollment.progress || 0
      };
    });

    console.log(`👨‍🎓 Found ${students.length} students for teacher ${teacherEmail}`);

    res.json({
      success: true,
      data: { students },
      message: "Students retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching teacher students:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};