# NoteSwift Production Integration - Complete Implementation Guide

## Overview
This document outlines the comprehensive production-grade integration of all teacher dashboard features (21 pages) and student mobile app pages (Ask, Learn, Lesson, Test) with real database connections, ensuring teachers can only manage content for their assigned subject.

## Database Architecture

### Core Principle: Subject-Scoped Authorization
- **Every resource** (announcement, assignment, test, question, live class, etc.) is tied to a `subjectContentId`
- Teachers can only create/read/update/delete resources for subjects where `teacherId` matches their ID
- Students can only access resources for courses they are enrolled in

### Created Schemas (7 new models)

1. **Announcement.model.ts** - Teacher announcements to students
   - Fields: title, message, priority, subjectContentId, teacherId, targetAudience, recipients, readCount
   - Index: teacherId + subjectName + status

2. **Assignment.model.ts** - Homework, projects, submissions
   - Fields: title, description, subjectContentId, teacherId, deadline, submissions[], totalMarks
   - Nested: ISubmission with studentId, fileUrl, score, feedback, status
   - Index: teacherId + subjectName + status

3. **Test.model.ts** - MCQ, PDF, mixed tests
   - Fields: title, questions[], subjectContentId, teacherId, duration, attempts[], totalMarks
   - Nested: IQuestion with options, correctAnswer, marks
   - Nested: ITestAttempt with studentId, answers[], totalScore, percentage
   - Index: teacherId + subjectName + status

4. **Question.model.ts** - Student doubts/questions
   - Fields: title, questionText, subjectContentId, studentId, status, answers[], upvotes
   - Nested: IAnswer with answeredBy, answerText, isAccepted
   - Index: subjectContentId + status, studentId + status

5. **LiveClass.model.ts** - Scheduled online classes
   - Fields: title, subjectContentId, teacherId, scheduledAt, duration, meetingLink, attendees[]
   - Nested: ILiveClassAttendee with studentId, joinedAt, duration, status
   - Index: teacherId + subjectName + status, scheduledAt + status

6. **Batch.model.ts** - Student groups within subject
   - Fields: name, code, subjectContentId, teacherId, students[], schedule[]
   - Index: teacherId + subjectName + status

7. **Resource.model.ts** - Study materials (notes, videos, PDFs)
   - Fields: title, fileUrl, subjectContentId, teacherId, type, category, downloadCount
   - Index: teacherId + subjectName + status

## Backend API Structure

### Teacher APIs (Subject-Scoped)

#### Announcements
- `GET /api/teacher/announcements?teacherEmail=<email>` - Get all teacher's announcements
- `POST /api/teacher/announcements` - Create announcement (verifies subjectContentId ownership)
- `PATCH /api/teacher/announcements/:id` - Update announcement
- `POST /api/teacher/announcements/:id/send` - Send announcement
- `DELETE /api/teacher/announcements/:id` - Soft delete

#### Assignments
- `GET /api/teacher/assignments?teacherEmail=<email>&subjectContentId=<id>` - Get assignments
- `POST /api/teacher/assignments` - Create assignment
- `PATCH /api/teacher/assignments/:id` - Update assignment
- `POST /api/teacher/assignments/:id/grade` - Grade submission
- `GET /api/teacher/assignments/:id/submissions` - Get all submissions

#### Tests
- `GET /api/teacher/tests?teacherEmail=<email>&subjectContentId=<id>` - Get tests
- `POST /api/teacher/tests` - Create test with questions
- `PATCH /api/teacher/tests/:id` - Update test
- `GET /api/teacher/tests/:id/attempts` - Get student attempts
- `POST /api/teacher/tests/:id/grade` - Grade subjective answers

#### Questions/Doubts
- `GET /api/teacher/questions?teacherEmail=<email>&subjectContentId=<id>` - Get student questions
- `POST /api/teacher/questions/:id/answer` - Answer question
- `PATCH /api/teacher/questions/:id/priority` - Set priority

#### Live Classes
- `GET /api/teacher/live-classes?teacherEmail=<email>&subjectContentId=<id>` - Get classes
- `POST /api/teacher/live-classes` - Schedule class
- `PATCH /api/teacher/live-classes/:id` - Update class
- `POST /api/teacher/live-classes/:id/attendance` - Mark attendance

#### Batches
- `GET /api/teacher/batches?teacherEmail=<email>&subjectContentId=<id>` - Get batches
- `POST /api/teacher/batches` - Create batch
- `POST /api/teacher/batches/:id/students` - Add students to batch

#### Resources
- `GET /api/teacher/resources?teacherEmail=<email>&subjectContentId=<id>` - Get resources
- `POST /api/teacher/resources` - Upload resource
- `DELETE /api/teacher/resources/:id` - Delete resource

#### Analytics
- `GET /api/teacher/analytics/dashboard?teacherEmail=<email>&subjectContentId=<id>` - Dashboard stats
- `GET /api/teacher/analytics/student-performance?teacherEmail=<email>&subjectContentId=<id>` - Student metrics

### Student APIs (Enrollment-Scoped)

#### Learn Page
- `GET /api/student/courses/:courseId/content` - Get course with subject content (existing)
- `GET /api/student/courses/:courseId/subjects/:subjectName` - Get specific subject details
- `GET /api/student/courses/:courseId/modules/:moduleNumber` - Get module content
- `POST /api/student/progress/module` - Update module progress

#### Ask Page
- `GET /api/student/questions?courseId=<id>&status=<status>` - Get student's questions
- `POST /api/student/questions` - Ask new question
- `POST /api/student/questions/:id/upvote` - Upvote question/answer
- `GET /api/student/questions/community?courseId=<id>` - Get public questions

#### Test Page
- `GET /api/student/tests?courseId=<id>&status=<status>` - Get available tests
- `GET /api/student/tests/:id` - Get test details
- `POST /api/student/tests/:id/start` - Start test attempt
- `POST /api/student/tests/:id/submit` - Submit test
- `GET /api/student/tests/:id/result` - Get test result

#### Assignments
- `GET /api/student/assignments?courseId=<id>&status=<status>` - Get assignments
- `POST /api/student/assignments/:id/submit` - Submit assignment
- `GET /api/student/assignments/:id/feedback` - Get grading feedback

#### Live Classes
- `GET /api/student/live-classes?courseId=<id>&status=<status>` - Get scheduled classes
- `POST /api/student/live-classes/:id/register` - Register for class
- `POST /api/student/live-classes/:id/join` - Mark join time

#### Announcements
- `GET /api/student/announcements?courseId=<id>` - Get announcements
- `POST /api/student/announcements/:id/read` - Mark as read

#### Resources
- `GET /api/student/resources?courseId=<id>&subjectName=<name>` - Get study materials
- `POST /api/student/resources/:id/download` - Track download

## Teacher Dashboard Pages Update Plan

### Phase 1: Core Content Management (Pages 1-7)
1. **dashboard/page.tsx** - Main dashboard with real stats
2. **content/page.tsx** - Module content management (videos, notes)
3. **courses/page.tsx** - View assigned subjects
4. **resources/page.tsx** - Upload study materials
5. **announcements/page.tsx** - Create/manage announcements
6. **assignments/page.tsx** - Create assignments, grade submissions
7. **tests/page.tsx** - Create tests, view results

### Phase 2: Student Interaction (Pages 8-14)
8. **students/page.tsx** - View enrolled students
9. **batches/page.tsx** - Manage student batches
10. **doubts/page.tsx** - Answer student questions
11. **live-classes/page.tsx** - Schedule & manage classes
12. **feedback/page.tsx** - Student feedback/reviews
13. **notifications/page.tsx** - Send notifications
14. **audit-log/page.tsx** - Activity logs

### Phase 3: Analytics & Administration (Pages 15-21)
15. **analytics/page.tsx** - Subject performance analytics
16. **reports/page.tsx** - Generate reports
17. **settings/page.tsx** - Teacher profile & preferences
18. **plagiarism/page.tsx** - Plagiarism checking
19. **billing/page.tsx** - Payment/subscription (if applicable)
20. **subscription/page.tsx** - Subscription management
21. **users/page.tsx** - User management within subject

## Student Mobile App Update Plan

### Learn Page Integration
**File**: `student/app/Learn/LearnPage.tsx`

Current: Uses mock data from stores
Target: Fetch from `GET /courses/:courseId/content`

```typescript
// Replace useCourseStore mock with real API
const fetchCourseContent = async (courseId: string) => {
  const response = await axios.get(`${API_BASE}/courses/${courseId}/content`);
  return response.data.data;
};

// Show subjects with teacher info
subjects.map(subject => (
  <SubjectCard
    name={subject.name}
    teacherName={subject.teacher.name}
    modules={subject.modules}
  />
))
```

### Ask Page Integration
**File**: `student/app/Ask/AskPage.tsx`

Current: Uses `demoQuestions` mock data
Target: Fetch from `GET /api/student/questions`

```typescript
const fetchQuestions = async () => {
  const response = await axios.get(`${API_BASE}/student/questions`, {
    params: { courseId, status: activeFilter }
  });
  setQuestions(response.data.data.questions);
};

// Post new question
const askQuestion = async (questionData) => {
  await axios.post(`${API_BASE}/student/questions`, questionData);
};
```

### Test Page Integration
**File**: `student/app/Test/TestPage.tsx`

Current: Uses `demoTests` mock data
Target: Fetch from `GET /api/student/tests`

```typescript
const fetchTests = async () => {
  const response = await axios.get(`${API_BASE}/student/tests`, {
    params: { courseId, status: activeTab }
  });
  setTests(response.data.data.tests);
};

// Start test
const startTest = async (testId) => {
  const response = await axios.post(`${API_BASE}/student/tests/${testId}/start`);
  // Navigate to test taking screen
};
```

## Authorization Middleware

### Teacher Authorization
```typescript
// backend/src/middlewares/teacherAuth.ts
export const authenticateTeacher = async (req, res, next) => {
  const teacherEmail = req.body.teacherEmail || req.query.teacherEmail;
  // Verify teacher session/token
  req.teacher = await Teacher.findOne({ email: teacherEmail });
  next();
};

export const verifySubjectOwnership = async (req, res, next) => {
  const { subjectContentId } = req.body || req.params;
  const subjectContent = await SubjectContent.findById(subjectContentId);
  
  if (subjectContent.teacherEmail !== req.teacher.email) {
    return res.status(403).json({ message: 'Not authorized for this subject' });
  }
  next();
};
```

### Student Authorization
```typescript
// backend/src/middlewares/authenticateStudent.ts (existing)
// Ensure student is enrolled in course before accessing content
export const verifyEnrollment = async (req, res, next) => {
  const { courseId } = req.params;
  const studentId = req.user._id;
  
  const enrollment = await CourseEnrollment.findOne({
    studentId,
    courseId,
    status: 'active'
  });
  
  if (!enrollment) {
    return res.status(403).json({ message: 'Not enrolled in this course' });
  }
  next();
};
```

## File Upload Strategy

### Storage Options
1. **Local Storage** (Development): Save to `backend/uploads/`
2. **Cloud Storage** (Production): AWS S3, Google Cloud Storage, or Cloudinary

### Upload Endpoints
- `POST /api/upload/video` - Upload video file
- `POST /api/upload/document` - Upload PDF/Word/PPT
- `POST /api/upload/image` - Upload image
- `POST /api/upload/assignment` - Student assignment submission

### File Structure
```
uploads/
  ├── subjects/
  │   ├── {subjectContentId}/
  │   │   ├── videos/
  │   │   ├── notes/
  │   │   └── resources/
  ├── assignments/
  │   └── {assignmentId}/
  │       └── submissions/
  └── tests/
      └── {testId}/
```

## Data Flow Examples

### Example 1: Teacher Creates Assignment
1. Teacher opens `dashboard/assignments/page.tsx`
2. Clicks "Create Assignment"
3. Fills form with title, description, deadline
4. Frontend sends `POST /api/teacher/assignments`:
   ```json
   {
     "title": "Quadratic Equations Homework",
     "subjectContentId": "67...",
     "teacherEmail": "teacher@example.com",
     "deadline": "2025-10-20T23:59:00Z",
     "totalMarks": 50
   }
   ```
5. Backend verifies:
   - Teacher owns subjectContent
   - Creates Assignment document
   - Links to SubjectContent modules[].hasTest
6. Returns success with assignment ID
7. Frontend refreshes assignment list

### Example 2: Student Submits Assignment
1. Student opens `app/Learn/` or navigates to assignments
2. Sees assignment in "Pending" list
3. Clicks "Submit", uploads file
4. Frontend sends `POST /api/student/assignments/:id/submit`:
   ```json
   {
     "studentId": "65...",
     "fileUrl": "https://...",
     "fileName": "homework.pdf"
   }
   ```
5. Backend:
   - Verifies student enrolled
   - Checks deadline
   - Adds submission to assignment.submissions[]
   - Updates totalSubmissions, pendingGrading counts
6. Teacher sees submission in dashboard
7. Teacher grades: `POST /api/teacher/assignments/:id/grade`
8. Student sees grade and feedback

### Example 3: Student Asks Question
1. Student in `app/Ask/AskPage.tsx` clicks "Ask Question"
2. Fills form with question text, selects subject/module
3. Frontend sends `POST /api/student/questions`:
   ```json
   {
     "title": "Confused about Integration",
     "questionText": "How to solve...",
     "courseId": "67...",
     "subjectName": "Mathematics",
     "moduleNumber": 5,
     "studentId": "65..."
   }
   ```
4. Backend:
   - Finds SubjectContent for course+subject
   - Creates Question document
   - Sets assignedToTeacherId from subjectContent.teacherId
5. Teacher sees question in `dashboard/doubts/page.tsx`
6. Teacher answers: `POST /api/teacher/questions/:id/answer`
7. Student receives notification, sees answer

## Testing Checklist

### Teacher Dashboard Tests
- [ ] Login as teacher → Dashboard shows only assigned subject data
- [ ] Create announcement → Students receive it
- [ ] Create assignment → Students can view and submit
- [ ] Grade submission → Student sees feedback
- [ ] Schedule live class → Students see in calendar
- [ ] Upload resource → Students can download
- [ ] Create test → Students can attempt
- [ ] View analytics → Shows correct subject metrics
- [ ] Answer doubt → Student sees answer
- [ ] Create batch → Can add students

### Student App Tests
- [ ] Enroll in course → See all subjects with teachers
- [ ] View modules → See videos, notes, tests added by teacher
- [ ] Ask question → Teacher receives it
- [ ] Submit assignment → Teacher can grade
- [ ] Attempt test → Score calculated correctly
- [ ] Join live class → Attendance marked
- [ ] Download resource → Count incremented
- [ ] View announcements → Read status updated

### Authorization Tests
- [ ] Teacher A cannot see Teacher B's content
- [ ] Teacher cannot modify different subject content
- [ ] Student cannot access unenrolled course content
- [ ] Student cannot see other students' submissions
- [ ] Unauthenticated requests rejected

## Performance Optimizations

1. **Indexes**: All schemas have indexes on common query fields
2. **Pagination**: Implement pagination for lists (assignments, questions, tests)
3. **Caching**: Cache frequently accessed data (course content, teacher info)
4. **Lazy Loading**: Load resources on demand, not all at once
5. **Aggregation**: Use MongoDB aggregation for analytics queries

## Next Steps

1. **Complete Controller Implementation**: Create controllers for all 7 resources
2. **Create Route Files**: Wire controllers to Express routes
3. **Update Teacher Dashboard Pages**: Replace mock data with API calls (21 pages)
4. **Update Student Mobile Pages**: Replace mock data with API calls (4 main pages)
5. **Implement File Upload**: Set up Multer or cloud storage
6. **Add Real-time Updates**: WebSocket for live notifications
7. **Testing**: End-to-end testing of complete flow
8. **Documentation**: API documentation with Swagger/Postman

## Timeline Estimate

- **Week 1**: Complete all backend controllers and routes (7 resources × 5 endpoints = 35 endpoints)
- **Week 2**: Update teacher dashboard pages 1-10 (Core features)
- **Week 3**: Update teacher dashboard pages 11-21 (Advanced features)
- **Week 4**: Update student mobile app (4 pages + sub-pages)
- **Week 5**: Testing, bug fixes, authorization hardening
- **Week 6**: Performance optimization, documentation

Total: 6 weeks for full production-grade implementation

---

**Created**: October 15, 2025
**Status**: Schemas Complete, Controllers In Progress
**Next**: Complete Assignment, Test, Question, LiveClass, Batch, Resource controllers
