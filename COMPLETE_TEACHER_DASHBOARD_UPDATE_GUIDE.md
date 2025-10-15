# Teacher Dashboard - Complete API Integration Updates

## Quick Reference: What Needs to Be Done

For each of the following pages, you need to:
1. Add import: `import teacherAPI from "@/lib/api/teacher-api";`
2. Replace the entire `async function getData()` function with the code provided below
3. Keep all the UI/JSX code unchanged - only update the data fetching

---

## ✅ ALREADY UPDATED
1. **dashboard/page.tsx** - Main dashboard
2. **announcements/page.tsx** - Announcements list

---

## 🔧 UPDATES NEEDED

### 3. **assignments/page.tsx**

```typescript
// ADD IMPORT
import teacherAPI from "@/lib/api/teacher-api";

// REPLACE ENTIRE getData() FUNCTION
async function getData() {
  const teacherEmail = "teacher@example.com"; // TODO: Get from auth
  
  try {
    const response = await teacherAPI.assignments.getAll(teacherEmail);
    const assignments = response.data?.assignments || [];
    const stats = response.data?.stats || {};

    const transformedAssignments = assignments.map((a: any) => ({
      _id: a._id,
      title: a.title,
      course: a.courseName,
      chapter: `${a.subjectName} - ${a.topicName || ''}`,
      description: a.description,
      deadline: a.deadline,
      totalMarks: a.totalMarks,
      status: a.status,
      enrolledStudents: a.totalStudents || 0,
      submittedCount: a.totalSubmissions || 0,
      gradedCount: a.submissions?.filter((s: any) => s.status === 'graded').length || 0,
      avgScore: a.avgScore || 0,
      createdAt: a.createdAt
    }));

    const allSubmissions = assignments.flatMap((a: any) => 
      (a.submissions || []).map((s: any) => ({
        _id: s._id,
        assignment: a._id,
        assignmentTitle: a.title,
        student: { _id: s.studentId, name: s.studentName || 'Student' },
        submittedAt: s.submittedAt,
        score: s.score || 0,
        totalMarks: a.totalMarks,
        feedback: s.feedback || '',
        status: s.status,
        plagiarismScore: 0,
        lateSubmission: new Date(s.submittedAt) > new Date(a.deadline)
      }))
    );

    return {
      assignments: transformedAssignments,
      submissions: allSubmissions,
      stats: {
        totalAssignments: stats.total || 0,
        activeAssignments: stats.active || 0,
        overdueAssignments: stats.overdue || 0,
        avgSubmissionRate: 0,
        pendingGrading: stats.pendingGrading || 0
      },
      courses: [],
      chapters: []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      assignments: [],
      submissions: [],
      stats: { totalAssignments: 0, activeAssignments: 0, overdueAssignments: 0, avgSubmissionRate: 0, pendingGrading: 0 },
      courses: [],
      chapters: []
    };
  }
}
```

---

### 4. **tests/page.tsx**

```typescript
// ADD IMPORT
import teacherAPI from "@/lib/api/teacher-api";

// REPLACE ENTIRE getData() FUNCTION
async function getData() {
  const teacherEmail = "teacher@example.com";
  
  try {
    const response = await teacherAPI.tests.getAll(teacherEmail);
    const tests = response.data?.tests || [];
    const stats = response.data?.stats || {};

    const transformedTests = tests.map((t: any) => ({
      _id: t._id,
      title: t.title,
      course: t.courseName,
      chapter: `${t.subjectName} - ${t.moduleName || ''}`,
      type: t.testType,
      totalMarks: t.totalMarks,
      duration: t.duration,
      deadline: t.deadline,
      status: t.status,
      enrolledStudents: t.totalStudents || 0,
      attemptedCount: t.totalAttempts || 0,
      avgScore: t.avgScore || 0,
      passRate: t.passRate || 0,
      createdAt: t.createdAt
    }));

    const allAttempts = tests.flatMap((t: any) => 
      (t.attempts || []).map((a: any) => ({
        _id: a._id,
        test: t._id,
        testTitle: t.title,
        student: { _id: a.studentId, name: a.studentName || 'Student' },
        attemptedAt: a.attemptedAt,
        score: a.totalScore || 0,
        totalMarks: t.totalMarks,
        percentage: a.percentage || 0,
        status: a.status,
        timeTaken: a.timeTaken || 0
      }))
    );

    return {
      tests: transformedTests,
      attempts: allAttempts,
      stats: {
        totalTests: stats.total || 0,
        activeTests: stats.active || 0,
        completedTests: stats.completed || 0,
        avgPassRate: stats.avgPassRate || 0,
        pendingGrading: stats.pendingGrading || 0
      },
      courses: [],
      chapters: []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      tests: [],
      attempts: [],
      stats: { totalTests: 0, activeTests: 0, completedTests: 0, avgPassRate: 0, pendingGrading: 0 },
      courses: [],
      chapters: []
    };
  }
}
```

---

### 5. **doubts/page.tsx**

```typescript
// ADD IMPORT
import teacherAPI from "@/lib/api/teacher-api";

// REPLACE ENTIRE getData() FUNCTION
async function getData() {
  const teacherEmail = "teacher@example.com";
  
  try {
    const response = await teacherAPI.questions.getAll(teacherEmail);
    const questions = response.data?.questions || [];
    const stats = response.data?.stats || {};

    const transformedQuestions = questions.map((q: any) => ({
      _id: q._id,
      title: q.title,
      questionText: q.questionText,
      student: { _id: q.studentId, name: q.studentName || 'Student' },
      course: q.courseName,
      subject: q.subjectName,
      topic: q.topicName,
      status: q.status,
      priority: q.priority,
      answers: q.answers || [],
      upvotes: q.upvotes?.length || 0,
      views: q.views || 0,
      createdAt: q.createdAt,
      lastActivity: q.updatedAt
    }));

    return {
      questions: transformedQuestions,
      stats: {
        totalQuestions: stats.total || 0,
        openQuestions: stats.open || 0,
        answeredQuestions: stats.answered || 0,
        resolvedQuestions: stats.resolved || 0,
        highPriorityQuestions: stats.highPriority || 0
      },
      courses: [],
      topics: []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      questions: [],
      stats: { totalQuestions: 0, openQuestions: 0, answeredQuestions: 0, resolvedQuestions: 0, highPriorityQuestions: 0 },
      courses: [],
      topics: []
    };
  }
}
```

---

### 6. **live-classes/page.tsx**

```typescript
// ADD IMPORT
import teacherAPI from "@/lib/api/teacher-api";

// REPLACE ENTIRE getData() FUNCTION
async function getData() {
  const teacherEmail = "teacher@example.com";
  
  try {
    const response = await teacherAPI.liveClasses.getAll(teacherEmail);
    const liveClasses = response.data?.liveClasses || [];
    const stats = response.data?.stats || {};

    const transformedClasses = liveClasses.map((lc: any) => ({
      _id: lc._id,
      title: lc.title,
      course: lc.courseName,
      subject: lc.subjectName,
      module: lc.moduleName,
      scheduledAt: lc.scheduledAt,
      duration: lc.duration,
      platform: lc.platform,
      meetingLink: lc.meetingLink,
      status: lc.status,
      enrolledStudents: lc.attendees?.length || 0,
      attendedCount: lc.attendees?.filter((a: any) => a.status === 'attended').length || 0,
      attendanceRate: lc.attendanceRate || 0,
      recordingUrl: lc.recordingUrl,
      createdAt: lc.createdAt
    }));

    const upcomingClasses = transformedClasses.filter((lc: any) => new Date(lc.scheduledAt) > new Date() && lc.status === 'scheduled');
    const completedClasses = transformedClasses.filter((lc: any) => lc.status === 'completed');

    return {
      liveClasses: transformedClasses,
      upcomingClasses,
      completedClasses,
      stats: {
        totalClasses: stats.total || 0,
        upcomingClasses: stats.upcoming || 0,
        completedClasses: stats.completed || 0,
        avgAttendance: stats.avgAttendance || 0,
        cancelledClasses: stats.cancelled || 0
      },
      courses: []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      liveClasses: [],
      upcomingClasses: [],
      completedClasses: [],
      stats: { totalClasses: 0, upcomingClasses: 0, completedClasses: 0, avgAttendance: 0, cancelledClasses: 0 },
      courses: []
    };
  }
}
```

---

### 7. **batches/page.tsx**

```typescript
// ADD IMPORT
import teacherAPI from "@/lib/api/teacher-api";

// REPLACE ENTIRE getData() FUNCTION
async function getData() {
  const teacherEmail = "teacher@example.com";
  
  try {
    const response = await teacherAPI.batches.getAll(teacherEmail);
    const batches = response.data?.batches || [];
    const stats = response.data?.stats || {};

    const transformedBatches = batches.map((b: any) => ({
      _id: b._id,
      name: b.name,
      code: b.code,
      course: b.courseName,
      subject: b.subjectName,
      description: b.description,
      students: b.students || [],
      totalStudents: b.totalStudents || 0,
      activeStudents: b.activeStudents || 0,
      maxStudents: b.maxStudents,
      schedule: b.schedule || [],
      status: b.status,
      createdAt: b.createdAt
    }));

    return {
      batches: transformedBatches,
      stats: {
        totalBatches: stats.total || 0,
        activeBatches: stats.active || 0,
        totalStudents: stats.totalStudents || 0,
        avgBatchSize: stats.avgBatchSize || 0
      },
      courses: []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      batches: [],
      stats: { totalBatches: 0, activeBatches: 0, totalStudents: 0, avgBatchSize: 0 },
      courses: []
    };
  }
}
```

---

### 8. **resources/page.tsx**

```typescript
// ADD IMPORT
import teacherAPI from "@/lib/api/teacher-api";

// REPLACE ENTIRE getData() FUNCTION
async function getData() {
  const teacherEmail = "teacher@example.com";
  
  try {
    const response = await teacherAPI.resources.getAll(teacherEmail);
    const resources = response.data?.resources || [];
    const stats = response.data?.stats || {};

    const transformedResources = resources.map((r: any) => ({
      _id: r._id,
      title: r.title,
      description: r.description,
      type: r.type,
      category: r.category,
      course: r.courseName,
      subject: r.subjectName,
      module: r.moduleName,
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      fileType: r.fileType,
      fileSize: r.fileSize,
      downloadCount: r.downloadCount || 0,
      viewCount: r.viewCount || 0,
      avgRating: r.avgRating || 0,
      status: r.status,
      createdAt: r.createdAt
    }));

    return {
      resources: transformedResources,
      stats: {
        totalResources: stats.total || 0,
        publishedResources: stats.published || 0,
        draftResources: stats.draft || 0,
        totalDownloads: stats.totalDownloads || 0,
        totalViews: stats.totalViews || 0,
        byType: stats.byType || {}
      },
      courses: []
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      resources: [],
      stats: { totalResources: 0, publishedResources: 0, draftResources: 0, totalDownloads: 0, totalViews: 0, byType: {} },
      courses: []
    };
  }
}
```

---

## ⚠️ IMPORTANT NOTES

1. **Teacher Email**: All functions use `"teacher@example.com"` as placeholder. You need to implement proper authentication to get the real teacher email from the session.

2. **Error Handling**: All functions return empty data on error to prevent page crashes. The UI will show "No data" messages.

3. **Data Transformation**: The transformation code maps backend response structure to the structure expected by existing UI components.

4. **TODO Comments**: Several features are marked with TODO:
   - Plagiarism detection
   - Course/chapter filtering
   - Performance calculations
   - Authentication integration

5. **Testing**: After updating, test each page to ensure:
   - Data loads correctly
   - Stats display properly
   - No console errors
   - Loading states work

---

## 📊 Pages NOT Using Teacher API (No Changes Needed)

These pages don't use the 7 new teacher feature APIs:
- `about/page.tsx` - Static content
- `analytics/page.tsx` - Aggregate stats (implement later)
- `audit-log/page.tsx` - Admin feature
- `billing/page.tsx` - Payment processing
- `feedback/page.tsx` - Separate feedback system
- `notifications/page.tsx` - Notification system
- `plagiarism/page.tsx` - Plagiarism checker (implement later)
- `reports/page.tsx` - Report generation
- `settings/page.tsx` - User settings
- `students/page.tsx` - Student management (needs enrollment API)
- `subscription/page.tsx` - Subscription management
- `users/page.tsx` - User management (admin)
- `courses/page.tsx` - Uses existing course APIs (already working)

---

## 🚀 Implementation Order

1. ✅ dashboard/page.tsx (DONE)
2. ✅ announcements/page.tsx (DONE)
3. ⏳ assignments/page.tsx (UPDATE NEXT)
4. ⏳ tests/page.tsx
5. ⏳ doubts/page.tsx
6. ⏳ live-classes/page.tsx
7. ⏳ batches/page.tsx
8. ⏳ resources/page.tsx

Total: **8 out of 23** pages need API updates (the core feature pages).
