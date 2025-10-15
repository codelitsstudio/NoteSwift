# Teacher Dashboard Pages - Real API Integration Status

## ✅ COMPLETED PAGES

### 1. ✅ Main Dashboard (page.tsx)
- **Status**: UPDATED
- **API Calls**: announcements, assignments, tests, questions, liveClasses
- **Features**: Stats calculation, upcoming classes, pending tasks

### 2. ✅ Announcements (announcements/page.tsx)
- **Status**: UPDATED
- **API Calls**: teacherAPI.announcements.getAll()
- **Features**: List all announcements, stats, sent/scheduled filtering

---

## 🔄 IN PROGRESS - Core Feature Pages (Need Updating)

### 3. Assignments (assignments/page.tsx)
- **API Needed**: teacherAPI.assignments.getAll()
- **getData Changes**:
  ```typescript
  const response = await teacherAPI.assignments.getAll(teacherEmail);
  const assignments = response.data?.assignments || [];
  const stats = response.data?.stats || {};
  const submissions = []; // Get from getSubmissions for each assignment
  ```

### 4. Tests (tests/page.tsx)
- **API Needed**: teacherAPI.tests.getAll()
- **getData Changes**: Similar to assignments, fetch tests with stats

### 5. Doubts/Questions (doubts/page.tsx)
- **API Needed**: teacherAPI.questions.getAll()
- **getData Changes**: Fetch questions by status (open/resolved), priority filtering

### 6. Live Classes (live-classes/page.tsx)
- **API Needed**: teacherAPI.liveClasses.getAll()
- **getData Changes**: Fetch upcoming/past classes, attendance stats

### 7. Batches (batches/page.tsx)
- **API Needed**: teacherAPI.batches.getAll()
- **getData Changes**: Fetch all batches with student counts

### 8. Resources (resources/page.tsx)
- **API Needed**: teacherAPI.resources.getAll()
- **getData Changes**: Fetch resources by type/status, download stats

---

## 📋 Secondary Pages (Less Critical - Can use existing data)

### 9. Analytics (analytics/page.tsx)
- **Note**: Requires aggregated data - implement later
- **Temporary**: Use stats from other API calls

### 10. Students (students/page.tsx)
- **Note**: Need student enrollment API (not yet implemented)
- **Temporary**: Keep mock data

### 11. Courses (courses/page.tsx)
- **Note**: Content management - uses existing SubjectContent model
- **API**: Already exists in courseController

### 12. Feedback (feedback/page.tsx)
- **Note**: Not in current backend scope
- **Temporary**: Keep mock data

### 13. Assignments/New (assignments/new/page.tsx)
- **Note**: Form page - will use POST API on submit
- **No getData needed**

### 14. Courses/Upload Content (courses/upload-content/page.tsx)
- **Note**: Uses existing course APIs
- **Already handled**

### 15. Courses/New Chapter (courses/new-chapter/page.tsx)
- **Note**: Uses existing course APIs
- **Already handled**

---

## 🚫 Pages NOT Using Teacher API (Keep As-Is)

### About, Audit-Log, Billing, Notifications, Plagiarism, Reports, Settings, Subscription, Users
- These pages don't directly interact with our 7 new teacher feature APIs
- They use different data sources (admin APIs, settings, external services)
- **Action**: Skip for now, focus on core feature pages

---

## SUMMARY

**Total Pages in Dashboard**: 23 folders
**Pages with getData**: 15 files
**Core API-Connected Pages**: 8 (assignments, tests, doubts, live-classes, batches, resources, announcements, dashboard)
**Already Updated**: 2 (dashboard, announcements)
**Need Immediate Update**: 6 (assignments, tests, doubts, live-classes, batches, resources)
**Secondary/Later**: 7 (analytics, students, courses, feedback, new pages, etc.)

---

## NEXT ACTIONS

1. ✅ Update page.tsx (dashboard) - DONE
2. ✅ Update announcements/page.tsx - DONE
3. ⏳ Update assignments/page.tsx - IN PROGRESS
4. ⏳ Update tests/page.tsx
5. ⏳ Update doubts/page.tsx
6. ⏳ Update live-classes/page.tsx
7. ⏳ Update batches/page.tsx
8. ⏳ Update resources/page.tsx
