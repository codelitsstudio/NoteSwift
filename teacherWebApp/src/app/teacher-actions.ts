"use server";

// BACKEND TEMPORARILY DISABLED FOR FRONTEND DEVELOPMENT
import { revalidatePath } from "next/cache";
import { z } from "zod";
// import dbConnect from "@/lib/mongoose";
// import Course from "@/models/Course";
// import Chapter from "@/models/Chapter";
// import Content from "@/models/Content";
// import LiveClass from "@/models/LiveClass";
// import Assignment from "@/models/Assignment";
// import Test, { Question } from "@/models/Test";
// import Announcement from "@/models/Announcement";
// import Attendance from "@/models/Attendance";
// import Teacher from "@/models/Teacher";
// import Feedback from "@/models/Feedback";
// import Doubt from "@/models/Doubt";
// import { Submission } from "@/models/Assignment";
// import { getQuestionSuggestions } from "@/ai/flows/question-suggestions";

// -------- Courses: Chapters & Content --------
const chapterSchema = z.object({
  courseId: z.string(),
  title: z.string().min(2),
  order: z.number().int().min(0).default(0),
});

export async function createChapter(input: z.infer<typeof chapterSchema>) {
  // await dbConnect();
  const data = chapterSchema.parse(input);
  // await Chapter.create({ course: data.courseId, title: data.title, order: data.order });
  console.log('📝 [MOCK] Create Chapter:', data);
  revalidatePath("/dashboard/courses");
  return { success: true };
}

const contentSchema = z.object({
  chapterId: z.string(),
  type: z.enum(["video", "pdf", "slides", "assignment", "question_bank"]),
  title: z.string().min(2),
  description: z.string().optional(),
  url: z.string().url().optional(),
  attachments: z.array(z.object({ name: z.string(), url: z.string().url() })).optional(),
  deadline: z.string().datetime().optional(),
});

export async function createContent(input: z.infer<typeof contentSchema>) {
  // await dbConnect();
  const data = contentSchema.parse(input);
  // await Content.create({
  //   chapter: data.chapterId,
  //   type: data.type,
  //   title: data.title,
  //   description: data.description,
  //   url: data.url,
  //   attachments: data.attachments,
  //   deadline: data.deadline ? new Date(data.deadline) : undefined,
  // });
  console.log('📝 [MOCK] Create Content:', data);
  revalidatePath("/dashboard/courses");
  return { success: true };
}

// -------- Live Classes --------
const liveClassSchema = z.object({
  courseId: z.string(),
  subject: z.string().min(2),
  chapterId: z.string().optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(10),
  platform: z.enum(["jitsi", "zoom", "custom"]).default("jitsi"),
  meetingUrl: z.string().url(),
  recordingUrl: z.string().url().optional(),
});

export async function scheduleLiveClass(input: z.infer<typeof liveClassSchema>) {
  // await dbConnect();
  const data = liveClassSchema.parse(input);
  // await LiveClass.create({
  //   course: data.courseId,
  //   subject: data.subject,
  //   chapter: data.chapterId,
  //   scheduledAt: new Date(data.scheduledAt),
  //   durationMinutes: data.durationMinutes,
  //   platform: data.platform,
  //   meetingUrl: data.meetingUrl,
  //   recordingUrl: data.recordingUrl,
  // });
  console.log('📝 [MOCK] Schedule Live Class:', data);
  revalidatePath("/dashboard/live-classes");
  return { success: true };
}

// -------- Assignments --------
const assignmentSchema = z.object({
  courseId: z.string(),
  chapterId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
  attachments: z.array(z.object({ name: z.string(), url: z.string().url() })).optional(),
});

export async function createAssignment(input: z.infer<typeof assignmentSchema>) {
  // await dbConnect();
  const data = assignmentSchema.parse(input);
  // await Assignment.create({
  //   course: data.courseId,
  //   chapter: data.chapterId,
  //   title: data.title,
  //   description: data.description,
  //   deadline: data.deadline ? new Date(data.deadline) : undefined,
  //   attachments: data.attachments,
  // });
  console.log('📝 [MOCK] Create Assignment:', data);
  revalidatePath("/dashboard/assignments");
  return { success: true };
}

// -------- Tests & Questions --------
const testSchema = z.object({
  courseId: z.string(),
  chapterId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().optional(),
});

export async function createTest(input: z.infer<typeof testSchema>) {
  // await dbConnect();
  const data = testSchema.parse(input);
  // const test = await Test.create({
  //   course: data.courseId,
  //   chapter: data.chapterId,
  //   title: data.title,
  //   description: data.description,
  //   scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
  //   durationMinutes: data.durationMinutes,
  // });
  console.log('📝 [MOCK] Create Test:', data);
  revalidatePath("/dashboard/tests");
  return { success: true, testId: 'mock-test-id' };
}

const questionSchema = z.object({
  testId: z.string(),
  type: z.enum(["mcq", "numerical", "short", "long"]),
  text: z.string().min(2),
  options: z.array(z.object({ key: z.string(), text: z.string() })).optional(),
  correctAnswer: z.any().optional(),
  points: z.number().int().min(1).default(1),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  usesLatex: z.boolean().optional(),
});

export async function addQuestion(input: z.infer<typeof questionSchema>) {
  // await dbConnect();
  const data = questionSchema.parse(input);
  // await Question.create({
  //   test: data.testId,
  //   type: data.type,
  //   text: data.text,
  //   options: data.options,
  //   correctAnswer: data.correctAnswer,
  //   points: data.points,
  //   difficulty: data.difficulty,
  //   usesLatex: data.usesLatex ?? false,
  // });
  console.log('📝 [MOCK] Add Question:', data);
  revalidatePath("/dashboard/tests");
  return { success: true };
}

// -------- Announcements --------
const announcementSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(2),
  courseId: z.string().optional(),
  batchId: z.string().optional(),
  teacherId: z.string(),
});

export async function createAnnouncement(input: z.infer<typeof announcementSchema>) {
  // await dbConnect();
  const data = announcementSchema.parse(input);
  // await Announcement.create({
  //   title: data.title,
  //   message: data.message,
  //   course: data.courseId,
  //   batch: data.batchId,
  //   createdBy: data.teacherId,
  // });
  console.log('📝 [MOCK] Create Announcement:', data);
  revalidatePath("/dashboard/announcements");
  return { success: true };
}

// -------- Attendance (manual) --------
const attendanceSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  date: z.string().datetime(),
  status: z.enum(["present", "absent", "late"]),
  note: z.string().optional(),
});

export async function markAttendance(input: z.infer<typeof attendanceSchema>) {
  // await dbConnect();
  const data = attendanceSchema.parse(input);
  // await Attendance.create({
  //   student: data.studentId,
  //   course: data.courseId,
  //   date: new Date(data.date),
  //   status: data.status,
  //   note: data.note,
  // });
  console.log('📝 [MOCK] Mark Attendance:', data);
  revalidatePath("/dashboard/students");
  return { success: true };
}

// -------- Teacher Profile --------
const teacherProfileSchema = z.object({
  teacherId: z.string(),
  name: z.string().min(2),
  bio: z.string().optional(),
  qualifications: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  photoUrl: z.string().url().optional(),
});

export async function updateTeacherProfile(input: z.infer<typeof teacherProfileSchema>) {
  // await dbConnect();
  const data = teacherProfileSchema.parse(input);
  // await Teacher.findByIdAndUpdate(data.teacherId, {
  //   name: data.name,
  //   bio: data.bio,
  //   qualifications: data.qualifications,
  //   subjects: data.subjects,
  //   photoUrl: data.photoUrl,
  // });
  console.log('📝 [MOCK] Update Teacher Profile:', data);
  revalidatePath("/dashboard/settings");
  return { success: true };
}

// -------- Submissions grading & comments --------
const gradeSubmissionSchema = z.object({
  submissionId: z.string(),
  score: z.number().min(0),
  feedback: z.string().optional(),
});

export async function gradeSubmission(input: z.infer<typeof gradeSubmissionSchema>) {
  // await dbConnect();
  const data = gradeSubmissionSchema.parse(input);
  // await Submission.findByIdAndUpdate(data.submissionId, { score: data.score, graded: true, feedback: data.feedback });
  console.log('📝 [MOCK] Grade Submission:', data);
  revalidatePath("/dashboard/assignments");
  return { success: true };
}

const autoGradeSchema = z.object({ submissionId: z.string() });
export async function autoGradeSubmission(input: z.infer<typeof autoGradeSchema>) {
  // await dbConnect();
  const { submissionId } = autoGradeSchema.parse(input);
  const score = Math.floor(Math.random() * 100);
  // await Submission.findByIdAndUpdate(submissionId, { score, graded: true });
  console.log('📝 [MOCK] Auto Grade Submission:', { submissionId, score });
  revalidatePath("/dashboard/assignments");
  return { success: true, score };
}

// -------- Doubts: reply & assignment --------
const replyDoubtSchema = z.object({ doubtId: z.string(), teacherId: z.string(), message: z.string().min(1) });
export async function replyToDoubt(input: z.infer<typeof replyDoubtSchema>) {
  // await dbConnect();
  const data = replyDoubtSchema.parse(input);
  // await Doubt.findByIdAndUpdate(data.doubtId, { $push: { messages: { senderType: 'teacher', sender: data.teacherId, text: data.message, createdAt: new Date() } } });
  console.log('📝 [MOCK] Reply to Doubt:', data);
  revalidatePath("/dashboard/doubts");
  return { success: true };
}

const assignDoubtSchema = z.object({ doubtId: z.string(), teacherId: z.string() });
export async function assignDoubt(input: z.infer<typeof assignDoubtSchema>) {
  // await dbConnect();
  const data = assignDoubtSchema.parse(input);
  // await Doubt.findByIdAndUpdate(data.doubtId, { assignedTo: data.teacherId });
  console.log('📝 [MOCK] Assign Doubt:', data);
  revalidatePath("/dashboard/doubts");
  return { success: true };
}

// -------- Feedback collection --------
const feedbackSchema = z.object({ rating: z.number().min(1).max(5), message: z.string().min(1), teacherId: z.string().optional() });
export async function submitFeedback(input: z.infer<typeof feedbackSchema>) {
  // await dbConnect();
  const data = feedbackSchema.parse(input);
  // await Feedback.create({ teacher: data.teacherId, rating: data.rating, message: data.message });
  console.log('📝 [MOCK] Submit Feedback:', data);
  revalidatePath("/dashboard/feedback");
  return { success: true };
}

// -------- AI Question suggestions (stub via Genkit) --------
const questionSuggestSchema = z.object({ topic: z.string().min(2), type: z.enum(["mcq","numerical","short","long"]), count: z.number().int().min(1).max(10).default(3) });
export async function suggestQuestions(input: z.infer<typeof questionSuggestSchema>) {
  try {
    const data = questionSuggestSchema.parse(input);
    // const result = await getQuestionSuggestions(data);
    // return { success: true, questions: result.questions };
    console.log('📝 [MOCK] Suggest Questions:', data);
    // Return mock questions
    const mockQuestions = [
      { text: `Sample ${data.type} question about ${data.topic}?`, options: data.type === 'mcq' ? [{ key: 'A', text: 'Option 1' }, { key: 'B', text: 'Option 2' }, { key: 'C', text: 'Option 3' }, { key: 'D', text: 'Option 4' }] : undefined, correctAnswer: data.type === 'mcq' ? 'A' : undefined }
    ];
    return { success: true, questions: mockQuestions };
  } catch (e) {
    return { success: false, error: "Suggestion service unavailable" };
  }
}
