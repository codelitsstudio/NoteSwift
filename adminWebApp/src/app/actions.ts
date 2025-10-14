"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { suggestTags } from "@/ai/flows/content-tagging";
import type { ContentTaggingInput } from "@/ai/flows/content-tagging";
import { Resend } from "resend";
import { OtpEmail } from "@/emails/otp-email";
import { getDashboardInsights } from "@/ai/flows/dashboard-insights";
import type { DashboardInsightsInput } from "@/ai/flows/dashboard-insights";
import { getTaskSuggestions } from "@/ai/flows/task-suggestions";
import type { TaskSuggestionsInput } from "@/ai/flows/task-suggestions";

import dbConnect from "@/lib/mongoose";
import Otp from "@/lib/models/Otp";
import Course from "@/lib/models/Course";
import Student from "@/lib/models/Student";
import CourseEnrollment from "@/lib/models/CourseEnrollment";
import Transaction from "@/lib/models/Transaction";

const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------------------- OTP HANDLER ----------------------------
export async function handleSendOtp(email?: string) {
  try {
    await dbConnect();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const targetEmail = email || process.env.OTP_EMAIL_TO!;
    if (!targetEmail) {
      throw new Error("Email is required for OTP sending.");
    }

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Remove old OTPs
    await Otp.deleteMany({ email: targetEmail });

    // Save new OTP
    const OTP = new Otp({ email: targetEmail, otp, expires })
    await OTP.save();
    console.log(targetEmail)
    await resend.emails.send({
      from: "NoteSwift Admin <noteswift@codelitsstudio.com>",
      to: targetEmail,
      subject: "Your NoteSwift Admin Login Code",
      react: OtpEmail({ otp }),
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: "Could not send OTP. Please try again." };
  }
}

const otpSchema = z.object({
  otp: z.string().length(6, "Your one-time code must be 6 characters."),
});

export async function handleVerifyOtp(data: { otp: string }, email?: string) {
  const validation = otpSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Invalid OTP format." };
  }

  try {
    await dbConnect();

    const targetEmail = email || process.env.OTP_EMAIL_TO!;
    if (!targetEmail) {
      throw new Error("Email is required for OTP verification.");
    }

    const record = await Otp.findOne({ email: targetEmail, otp: validation.data.otp });

    if (!record) {
      return { success: false, error: "The one-time code is incorrect." };
    }

    if (new Date() > record.expires) {
      await Otp.deleteOne({ _id: record._id });
      return { success: false, error: "The one-time code has expired. Please request a new one." };
    }

    await Otp.deleteOne({ _id: record._id });

    return { success: true };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: "An unexpected error occurred while verifying the code." };
  }
}

// ---------------------------- SUGGEST TAGS ----------------------------
export async function handleSuggestTags(data: ContentTaggingInput) {
  try {
    const result = await suggestTags(data);
    return { success: true, tags: result.tags };
  } catch (error) {
    console.error("Error suggesting tags:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}


// ---------------------------- DASHBOARD INSIGHTS ----------------------------
export async function handleGetDashboardInsights() {
  try {
    await dbConnect();

    // Get real metrics from database
    const totalUsers = await Student.countDocuments();
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsersToday = await Student.countDocuments({
      lastLoginAt: { $gte: last24Hours }
    });

    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newSignupsLastWeek = await Student.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    const coursesPublished = await Course.countDocuments();

    // Get top courses by enrollment
    const topCoursesData = await CourseEnrollment.aggregate([
      {
        $group: {
          _id: '$courseId',
          engagement: { $sum: 1 }
        }
      },
      {
        $sort: { engagement: -1 }
      },
      {
        $limit: 3
      }
    ]);

    // Get course names
    const courseIds = topCoursesData.map(tc => tc._id);
    const courses = await Course.find({ _id: { $in: courseIds } });
    const courseMap = courses.reduce((map, course) => {
      map[course._id.toString()] = course.title;
      return map;
    }, {} as Record<string, string>);

    const topCourses = topCoursesData.map(tc => ({
      name: courseMap[tc._id] || 'Unknown Course',
      engagement: tc.engagement
    }));

    const realInput: DashboardInsightsInput = {
      totalUsers,
      activeUsersToday,
      newSignupsLastWeek,
      coursesPublished,
      topCourses,
    };

    const result = await getDashboardInsights(realInput);
    return { success: true, insights: result };
  } catch (error) {
    console.error("Error getting dashboard insights:", error);
    return { success: false, error: "An unexpected error occurred while generating insights." };
  }
}

// ---------------------------- TASK SUGGESTIONS ----------------------------
export async function handleGetTaskSuggestions() {
  try {
    await dbConnect();

    // Get real metrics for task suggestions
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Inactive users (users who haven't logged in for 30 days)
    const inactiveUserCount = await Student.countDocuments({
      lastLoginAt: { $lt: thirtyDaysAgo }
    });

    // Unreviewed content (courses that might need review - using courses without recent updates as proxy)
    const unreviewedContentCount = await Course.countDocuments({
      updatedAt: { $lt: thirtyDaysAgo }
    });

    // Failed payments (transactions with failed status)
    const failedPaymentsCount = await Transaction.countDocuments({
      status: 'failed'
    });

    const realInput: TaskSuggestionsInput = {
      inactiveUserCount,
      unreviewedContentCount,
      failedPaymentsCount,
    };

    const result = await getTaskSuggestions(realInput);
    return { success: true, suggestions: result };
  } catch (error) {
    console.error("Error getting task suggestions:", error);
    return { success: false, error: "An unexpected error occurred while generating task suggestions." };
  }
}

// ---------------------------- ADMIN LOGIN ----------------------------
export async function handleAdminLogin(email: string, password: string) {
  try {
    const { authenticateAdmin, generateAdminToken } = await import('@/lib/auth/admin-auth');

    const authResult = await authenticateAdmin(email, password);

    if (!authResult.success) {
      return { success: false, error: authResult.error || "Authentication failed" };
    }

    // Prevent system admin from logging in through regular login page
    if (authResult.admin.role === 'system_admin') {
      return { success: false, error: "System administrators must login through the dedicated admin portal" };
    }

    // Generate JWT token
    const token = generateAdminToken(authResult.admin._id);

    return {
      success: true,
      token,
      admin: {
        _id: authResult.admin._id,
        email: authResult.admin.email,
        name: authResult.admin.name,
        role: authResult.admin.role
      }
    };
  } catch (error) {
    console.error('Error during admin login:', error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ---------------------------- CREATE ADMIN SESSION ----------------------------
export async function handleCreateAdminSession(username: string, deviceFingerprint: string, ipAddress?: string, userAgent?: string) {
  try {
    const { createAdminSession } = await import('@/lib/auth');

    const sessionData = {
      adminId: 'admin_001', // Fixed admin ID for single admin system
      username,
      loginTime: Date.now(),
      deviceFingerprint,
      ipAddress,
      userAgent,
    };

    const token = await createAdminSession(sessionData);

    return {
      success: true,
      token,
      sessionData: {
        username: sessionData.username,
        loginTime: sessionData.loginTime,
      }
    };
  } catch (error) {
    console.error('Error creating admin session:', error);
    return { success: false, error: 'Failed to create session.' };
  }
}
