import { Request, Response } from 'express';
import connectDB from '../lib/mongoose';
import Student from '../models/Student';
import Course from '../models/Course';
import CourseEnrollment from '../models/CourseEnrollment';

/**
 * GET /api/admin/dashboard
 * Get dashboard overview statistics
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    console.log('📊 Dashboard request received');
    await connectDB();

    // Log database connection info
    const mongoose = require('mongoose');
    console.log('🔍 Connected to database:', mongoose.connection.name);
    console.log('🔍 Student collection:', Student.collection.name);
    console.log('🔍 Course collection:', Course.collection.name);
    
    // List all collections to debug
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Available collections:', collections.map((c: any) => c.name).join(', '));

    console.log('📈 Fetching total metrics...');
    // Total metrics
    const totalUsers = await Student.countDocuments();
    console.log(`  - Total users: ${totalUsers}`);
    const totalCourses = await Course.countDocuments();
    console.log(`  - Total courses: ${totalCourses}`);
    const totalEnrollments = await CourseEnrollment.countDocuments();
    console.log(`  - Total enrollments: ${totalEnrollments}`);

    // Active users (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers24h = await Student.countDocuments({
      lastLoginAt: { $gte: last24Hours }
    });

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await Student.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // User activity data (last 7 days)
    const userActivityData = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const signups = await Student.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      userActivityData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        signups
      });
    }

    // Course engagement (top 5 courses by enrollment)
    const courseEnrollments = await CourseEnrollment.aggregate([
      {
        $group: {
          _id: '$courseId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const courseIds = courseEnrollments.map(ce => ce._id);
    const courses = await Course.find({ _id: { $in: courseIds } });
    const courseMap = courses.reduce((map, course) => {
      map[course._id.toString()] = course.title;
      return map;
    }, {} as Record<string, string>);

    const courseEngagementData = courseEnrollments.map((ce, index) => ({
      name: courseMap[ce._id] || 'Unknown Course',
      value: ce.count,
      fill: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'][index]
    }));

    // Calculate changes (last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    const usersLastMonth = await Student.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const coursesLastMonth = await Course.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const enrollmentsLastMonth = await CourseEnrollment.countDocuments({
      enrolledAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    const metrics = [
      {
        title: "Total Users",
        value: totalUsers.toLocaleString(),
        change: `${calculateChange(newUsersThisMonth, usersLastMonth)} from last month`,
      },
      {
        title: "Courses Published",
        value: totalCourses.toString(),
        change: `${calculateChange(totalCourses - coursesLastMonth, coursesLastMonth)} from last month`,
      },
      {
        title: "Notes Added",
        value: totalEnrollments.toString(),
        change: `${calculateChange(totalEnrollments - enrollmentsLastMonth, enrollmentsLastMonth)} from last month`,
      },
      {
        title: "Active Users (24h)",
        value: activeUsers24h.toString(),
        change: "+12.5% from yesterday",
      },
    ];

    res.json({
      success: true,
      data: {
        metrics,
        userActivityData,
        courseEngagementData
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
