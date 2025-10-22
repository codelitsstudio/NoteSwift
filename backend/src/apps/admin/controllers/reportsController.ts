import { Request, Response, NextFunction } from 'express';
import Student from '../models/Student';
import Course from '../models/Course';
import CourseEnrollment from '../models/CourseEnrollment';
import Transaction from '../models/Transaction';

// GET /api/admin/reports/overview - Get comprehensive reports data
export const getReportsOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const period = (req.query.period as string) || '30d'; // 7d, 30d, 90d, all

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60d':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get total users and new users over time
    const totalUsers = await Student.countDocuments();
    const newUsersThisPeriod = await Student.countDocuments({
      createdAt: { $gte: startDate }
    });

    // User growth data (last 6 months)
    const userGrowthData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const count = await Student.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      userGrowthData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        newUsers: count
      });
    }

    // Course enrollment breakdown
    const courseEnrollments = await CourseEnrollment.aggregate([
      {
        $match: {
          enrolledAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$courseId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get course names
    const courseIds = courseEnrollments.map((ce: any) => ce._id);
    const courses = await Course.find({ _id: { $in: courseIds } });
    const courseMap = courses.reduce((map, course) => {
      map[course._id.toString()] = course.title;
      return map;
    }, {} as Record<string, string>);

    const courseEnrollmentData = courseEnrollments.map((ce: any) => ({
      name: courseMap[ce._id] || 'Unknown Course',
      value: ce.count,
      fill: '#2563eb'
    }));

    // Revenue trend data (daily revenue for charts)
    const revenueTrend = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const revenueTrendData = revenueTrend.map((item: any) => ({
      date: item._id,
      revenue: item.revenue,
      transactions: item.transactions
    }));

    // Weekly active users (last 7 days)
    const weeklyActiveUsersData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Count users who had activity (enrollments or transactions) on this day
      const activeUsers = await Promise.all([
        CourseEnrollment.countDocuments({
          enrolledAt: { $gte: dayStart, $lte: dayEnd }
        }),
        Transaction.countDocuments({
          createdAt: { $gte: dayStart, $lte: dayEnd }
        })
      ]);

      weeklyActiveUsersData.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        users: Math.max(...activeUsers)
      });
    }

    // Courses published over time (last 6 months)
    const coursesPublishedData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const count = await Course.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      coursesPublishedData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        courses: count
      });
    }

    // Additional metrics
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await CourseEnrollment.countDocuments({
      enrolledAt: { $gte: startDate }
    });
    const totalTransactions = await Transaction.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Revenue data for the period
    const revenueData = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Course completion rates (simplified - courses with enrollments)
    const completedCourses = await CourseEnrollment.countDocuments({
      enrolledAt: { $gte: startDate }
    });

    res.json({
      success: true,
      data: {
        period,
        metrics: {
          totalUsers,
          newUsersThisPeriod,
          totalCourses,
          totalEnrollments,
          totalTransactions,
          totalRevenue,
          completedCourses
        },
        userGrowthData,
        courseEnrollmentData,
        weeklyActiveUsersData,
        coursesPublishedData,
        revenueTrendData
      }
    });
  } catch (error) {
    console.error("Error fetching reports overview:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
      return;
  }
};
