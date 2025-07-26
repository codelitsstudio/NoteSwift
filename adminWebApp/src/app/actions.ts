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
import Otp from "@/models/Otp";
import Course from "@/models/Course";

const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------------------- OTP HANDLER ----------------------------
export async function handleSendOtp() {
  try {
    await dbConnect();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const email = process.env.OTP_EMAIL_TO!;
    if (!email) {
      throw new Error("OTP_EMAIL_TO environment variable is not set.");
    }

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Remove old OTPs
    await Otp.deleteMany({ email });

    // Save new OTP
    const OTP = new Otp({ email, otp, expires })
    await OTP.save();
    console.log(email)
    await resend.emails.send({
      from: "NoteSwift Admin <noteswift@codelitsstudio.com>",
      to: email,
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

export async function handleVerifyOtp(data: { otp: string }) {
  const validation = otpSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Invalid OTP format." };
  }

  try {
    await dbConnect();

    const email = process.env.OTP_EMAIL_TO!;
    if (!email) {
      throw new Error("OTP_EMAIL_TO environment variable is not set.");
    }

    const record = await Otp.findOne({ email, otp: validation.data.otp });

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

// ---------------------------- CREATE COURSE ----------------------------
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  subject: z.string().min(2, "Subject must be at least 2 characters long."),
  tags: z.array(z.string()).optional(),
});

export async function handleCreateCourse(data: z.infer<typeof courseSchema>) {
  try {
    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: "Invalid data." };
    }

    await dbConnect();

    await Course.create({
      ...validation.data,
      status: "Draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/dashboard/content");
    return { success: true, message: "Course created successfully." };
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, error: "An unexpected error occurred while creating the course." };
  }
}

// ---------------------------- MOCKED DASHBOARD INSIGHTS ----------------------------
export async function handleGetDashboardInsights() {
  try {
    const mockInput: DashboardInsightsInput = {
      totalUsers: 1250,
      activeUsersToday: 350,
      newSignupsLastWeek: 260,
      coursesPublished: 48,
      topCourses: [
        { name: "Algebra II", engagement: 400 },
        { name: "World History", engagement: 300 },
        { name: "AP Physics", engagement: 300 },
      ],
    };

    const result = await getDashboardInsights(mockInput);
    return { success: true, insights: result };
  } catch (error) {
    console.error("Error getting dashboard insights:", error);
    return { success: false, error: "An unexpected error occurred while generating insights." };
  }
}

// ---------------------------- MOCKED TASK SUGGESTIONS ----------------------------
export async function handleGetTaskSuggestions() {
  try {
    const mockInput: TaskSuggestionsInput = {
      inactiveUserCount: 15,
      unreviewedContentCount: 8,
      failedPaymentsCount: 2,
    };

    const result = await getTaskSuggestions(mockInput);
    return { success: true, suggestions: result };
  } catch (error) {
    console.error("Error getting task suggestions:", error);
    return { success: false, error: "An unexpected error occurred while generating task suggestions." };
  }
}

// ---------------------------- ADMIN LOGIN ----------------------------
export async function handleAdminLogin(username: string, password: string) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return { success: false, error: "Server configuration error." };
  }

  if (username === adminUsername && password === adminPassword) {
    return { success: true };
  } else {
    return { success: false, error: "Invalid username or password." };
  }
}
