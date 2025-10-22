import { Request, Response, NextFunction } from 'express';
import connectDB from '@core/lib/mongoose';
import Transaction from '../models/Transaction';
import UnlockCode from '../models/UnlockCode';
import Course from '../models/Course';
import CourseEnrollment from '../models/CourseEnrollment';

/**
 * GET /api/admin/revenue/overview
 * Get comprehensive revenue and billing overview
 */
export const getRevenueOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await connectDB();

    const period = req.query.period || '30d'; // 7d, 30d, 90d, all

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
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get data
    const transactions = await Transaction.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    const unlockCodes = await UnlockCode.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    const enrollments = await CourseEnrollment.find({
      enrolledAt: { $gte: startDate }
    }).sort({ enrolledAt: -1 });

    const courses = await Course.find({});
    const courseMap = courses.reduce((map, course) => {
      map[course._id.toString()] = course;
      return map;
    }, {} as Record<string, any>);

    // Calculate metrics
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const pendingRevenue = transactions
      .filter(t => t.status === 'pending-code-redemption')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const pendingTransactions = transactions.filter(t => t.status === 'pending-code-redemption').length;
    const cancelledTransactions = transactions.filter(t => t.status === 'cancelled').length;

    const totalCodes = unlockCodes.length;
    const usedCodes = unlockCodes.filter(c => c.isUsed).length;
    const unusedCodes = unlockCodes.filter(c => !c.isUsed).length;
    const expiredCodes = unlockCodes.filter(c => c.expiresOn && c.expiresOn < new Date()).length;

    const totalEnrollments = enrollments.length;

    // Revenue by payment method
    const revenueByMethod = transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + (t.amount || 0);
        return acc;
      }, {} as Record<string, number>);

    // Revenue by course
    const revenueByCourse = transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        const courseName = courseMap[t.courseId]?.title || t.courseId;
        acc[courseName] = (acc[courseName] || 0) + (t.amount || 0);
        return acc;
      }, {} as Record<string, number>);

    // Revenue trend
    const revenueTrend = transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        const date = t.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (t.amount || 0);
        return acc;
      }, {} as Record<string, number>);

    const revenueTrendData = Object.entries(revenueTrend)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Recent transactions
    const recentTransactions = transactions.slice(0, 10).map(t => ({
      _id: t._id,
      buyerName: t.buyerName,
      contact: t.contact,
      courseName: courseMap[t.courseId]?.title || t.courseId,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      status: t.status,
      createdAt: t.createdAt,
    }));

    // Recent codes
    const recentCodes = unlockCodes.slice(0, 10).map(code => ({
      _id: code._id,
      code: code.code,
      courseName: courseMap[code.courseId]?.title || code.courseId,
      issuedTo: code.issuedTo,
      issuedByAdminId: code.issuedByAdminId,
      issuedByRole: code.issuedByRole,
      isUsed: code.isUsed,
      usedTimestamp: code.usedTimestamp,
      expiresOn: code.expiresOn,
      createdAt: code.createdAt,
    }));

    res.json({
      success: true,
      data: {
        period,
        overview: {
          totalRevenue,
          pendingRevenue,
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          cancelledTransactions,
          totalCodes,
          usedCodes,
          unusedCodes,
          expiredCodes,
          totalEnrollments,
        },
        revenueByMethod,
        revenueByCourse,
        revenueTrendData,
        recentTransactions,
        recentCodes,
        courseMap,
      }
    });
  } catch (error) {
    console.error("Error fetching revenue overview:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
      return;
  }
};
