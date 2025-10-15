# NoteSwift API Documentation - Teacher-Student Connection

## Base URLs

- **Backend (Student APIs)**: `http://localhost:5000/api` or your deployed backend URL
- **Teacher Web App**: `http://localhost:3001/api` or your deployed teacher app URL  
- **Admin Web App**: `http://localhost:3000/api` or your deployed admin app URL

---

## Admin APIs

### Assign Teacher to Subject

Assigns a teacher to a specific subject within a course package.

**Endpoint**: `POST /api/teachers/:id/assign`

**URL Parameters**:
- `id` (string, required) - Teacher ID

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "courseId": "67abc123def456...",
  "subjectName": "Mathematics"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Teacher assigned to subject successfully",
  "data": {
    "courseId": "67abc123def456...",
    "courseName": "Grade 11 Science Package",
    "subjectName": "Mathematics",
    "teacherName": "John Doe"
  }
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "success": false,
  "message": "courseId and subjectName are required"
}
```

404 Not Found:
```json
{
  "success": false,
  "message": "Teacher not found"
}
```

---

## Teacher APIs

### Get Assigned Subjects

Retrieves all subjects assigned to a teacher with full details including modules and statistics.

**Endpoint**: `GET /api/teacher/subjects`

**Query Parameters**:
- `email` (string, required) - Teacher's email address

**Request Example**:
```
GET /api/teacher/subjects?email=john.doe@example.com
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "teacher": {
      "_id": "teacher_id_here",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "assignedSubjects": [
      {
        "_id": "subject_content_id",
        "courseId": "course_id",
        "courseName": "Grade 11 Science Package",
        "courseProgram": "plus2",
        "courseThumbnail": "https://...",
        "subjectName": "Mathematics",
        "description": "Advanced mathematics for Grade 11",
        "syllabus": "...",
        "objectives": ["Understand calculus", "Master trigonometry"],
        "modules": [
          {
            "moduleNumber": 1,
            "moduleName": "Sets and Functions",
            "hasVideo": true,
            "videoUrl": "https://...",
            "videoTitle": "Introduction to Sets",
            "videoDuration": "30:00",
            "videoUploadedAt": "2025-01-15T10:00:00.000Z",
            "hasNotes": true,
            "notesUrl": "https://...",
            "notesTitle": "Sets Notes",
            "notesUploadedAt": "2025-01-14T15:00:00.000Z",
            "hasLiveClass": false,
            "liveClassSchedule": [],
            "hasTest": false,
            "testIds": [],
            "hasQuestions": false,
            "questionIds": [],
            "order": 1,
            "isActive": true
          }
        ],
        "lastUpdated": "2025-01-15T10:00:00.000Z",
        "assignedAt": "2025-01-01T00:00:00.000Z",
        "totalModules": 10,
        "modulesWithVideo": 3,
        "modulesWithNotes": 5,
        "scheduledLiveClasses": 2
      }
    ],
    "totalAssignments": 1
  },
  "message": "Assigned subjects retrieved successfully"
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "success": false,
  "message": "Teacher email is required"
}
```

404 Not Found:
```json
{
  "success": false,
  "message": "Teacher not found"
}
```

---

### Get Subject Content

Retrieves detailed content for a specific subject assignment.

**Endpoint**: `GET /api/teacher/subject-content`

**Query Parameters**:
- `id` (string, required) - SubjectContent document ID
- `teacherEmail` (string, optional) - For authorization verification

**Request Example**:
```
GET /api/teacher/subject-content?id=subject_content_id&teacherEmail=john.doe@example.com
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "subject_content_id",
    "courseId": {
      "_id": "course_id",
      "title": "Grade 11 Science Package",
      "description": "...",
      "program": "plus2",
      "subjects": [...]
    },
    "courseName": "Grade 11 Science Package",
    "subjectName": "Mathematics",
    "teacherId": "teacher_id",
    "teacherName": "John Doe",
    "teacherEmail": "john.doe@example.com",
    "modules": [...],
    "description": "...",
    "syllabus": "...",
    "objectives": [...],
    "isActive": true,
    "lastUpdated": "2025-01-15T10:00:00.000Z"
  },
  "message": "Subject content retrieved successfully"
}
```

---

### Update Subject Content

Updates subject-level information (description, syllabus, objectives, or entire modules array).

**Endpoint**: `PUT /api/teacher/subject-content`

**Request Body**:
```json
{
  "subjectContentId": "subject_content_id",
  "teacherEmail": "john.doe@example.com",
  "updates": {
    "description": "Updated subject description",
    "syllabus": "Updated syllabus content",
    "objectives": [
      "New objective 1",
      "New objective 2"
    ],
    "modules": []  // Optional: complete modules array replacement
  }
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    // Updated SubjectContent document
  },
  "message": "Subject content updated successfully"
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "success": false,
  "message": "Subject content ID and teacher email are required"
}
```

403 Forbidden:
```json
{
  "success": false,
  "message": "Unauthorized: You can only update your own subjects"
}
```

---

### Update Module Content

Updates specific module content (video, notes, live classes, etc.).

**Endpoint**: `PATCH /api/teacher/subject-content`

**Request Body**:
```json
{
  "subjectContentId": "subject_content_id",
  "teacherEmail": "john.doe@example.com",
  "moduleNumber": 1,
  "moduleUpdates": {
    "hasVideo": true,
    "videoUrl": "https://cloudinary.com/video.mp4",
    "videoTitle": "Introduction to Calculus",
    "videoDuration": "45:30",
    
    "hasNotes": true,
    "notesUrl": "https://cloudinary.com/notes.pdf",
    "notesTitle": "Calculus Notes Chapter 1",
    
    "hasLiveClass": true,
    "liveClassSchedule": [
      {
        "scheduledAt": "2025-01-20T10:00:00.000Z",
        "duration": 60,
        "meetingLink": "https://meet.google.com/abc-defg-hij",
        "status": "scheduled"
      }
    ],
    
    "hasTest": true,
    "testIds": ["test_id_1", "test_id_2"],
    
    "hasQuestions": true,
    "questionIds": ["question_id_1", "question_id_2"]
  }
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "subjectContent": {
      // Full updated SubjectContent document
    },
    "updatedModule": {
      "moduleNumber": 1,
      "moduleName": "Sets and Functions",
      "hasVideo": true,
      "videoUrl": "https://...",
      // ... all module fields
    }
  },
  "message": "Module 1 updated successfully"
}
```

---

## Student/Backend APIs

### Get Course Content

Retrieves complete course content with all subjects and teacher-managed modules. Requires student to be enrolled in the course.

**Endpoint**: `GET /api/courses/:courseId/content`

**URL Parameters**:
- `courseId` (string, required) - Course ID

**Request Headers**:
```
Authorization: Bearer <student_token>
```

**Request Example**:
```
GET /api/courses/67abc123def456.../content
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "course_id",
      "title": "Grade 11 Science Package",
      "description": "Comprehensive package for Grade 11 students",
      "program": "plus2",
      "duration": "1 year",
      "thumbnail": "https://...",
      "icon": "https://...",
      "status": "Published",
      "type": "pro"
    },
    "subjects": [
      {
        "name": "Mathematics",
        "description": "Advanced mathematics curriculum",
        "teacher": {
          "id": "teacher_id",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "modules": [
          {
            "moduleNumber": 1,
            "moduleName": "Sets and Functions",
            "description": "Introduction to sets, relations and functions",
            "order": 1,
            "isActive": true,
            "hasVideo": true,
            "video": {
              "url": "https://cloudinary.com/video.mp4",
              "title": "Introduction to Sets",
              "duration": "30:00",
              "uploadedAt": "2025-01-15T10:00:00.000Z"
            },
            "hasNotes": true,
            "notes": {
              "url": "https://cloudinary.com/notes.pdf",
              "title": "Sets Notes PDF",
              "uploadedAt": "2025-01-14T15:00:00.000Z"
            },
            "hasLiveClass": true,
            "liveClasses": [
              {
                "scheduledAt": "2025-01-20T10:00:00.000Z",
                "duration": 60,
                "meetingLink": "https://meet.google.com/abc-defg-hij",
                "status": "scheduled"
              }
            ],
            "hasTest": true,
            "testCount": 2,
            "hasQuestions": true,
            "questionCount": 15
          }
        ],
        "syllabus": "Complete syllabus content...",
        "objectives": ["Objective 1", "Objective 2"],
        "lastUpdated": "2025-01-15T10:00:00.000Z"
      },
      {
        "name": "Physics",
        "description": "Physics curriculum",
        "teacher": null,  // No teacher assigned yet
        "modules": [
          {
            "moduleNumber": 1,
            "moduleName": "Mechanics",
            "description": "Basic mechanics",
            "order": 1,
            "isActive": false,  // Not active until teacher is assigned
            "hasVideo": false,
            "video": null,
            "hasNotes": false,
            "notes": null,
            "hasLiveClass": false,
            "liveClasses": [],
            "hasTest": false,
            "testCount": 0,
            "hasQuestions": false,
            "questionCount": 0
          }
        ],
        "syllabus": null,
        "objectives": [],
        "lastUpdated": null
      }
    ],
    "totalSubjects": 5,
    "assignedSubjects": 3  // 3 out of 5 subjects have teachers assigned
  },
  "message": "Course content retrieved successfully"
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "success": false,
  "message": "Course ID is required"
}
```

403 Forbidden:
```json
{
  "success": false,
  "message": "You are not enrolled in this course"
}
```

404 Not Found:
```json
{
  "success": false,
  "message": "Course not found"
}
```

---

### Get Subject Content (Student)

Retrieves detailed content for a specific subject within a course.

**Endpoint**: `GET /api/courses/:courseId/subject/:subjectName`

**URL Parameters**:
- `courseId` (string, required) - Course ID
- `subjectName` (string, required) - Subject name (URL encoded)

**Request Headers**:
```
Authorization: Bearer <student_token>
```

**Request Example**:
```
GET /api/courses/67abc123def456.../subject/Mathematics
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "subject_content_id",
    "courseId": {
      "_id": "course_id",
      "title": "Grade 11 Science Package",
      "description": "...",
      "program": "plus2"
    },
    "courseName": "Grade 11 Science Package",
    "subjectName": "Mathematics",
    "teacherId": {
      "_id": "teacher_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "teacherName": "John Doe",
    "teacherEmail": "john.doe@example.com",
    "modules": [...],  // Full module details
    "description": "...",
    "syllabus": "...",
    "objectives": [...],
    "isActive": true,
    "lastUpdated": "2025-01-15T10:00:00.000Z"
  },
  "message": "Subject content retrieved successfully"
}
```

**Error Responses**:

404 Not Found:
```json
{
  "success": false,
  "message": "Subject content not found or no teacher assigned yet"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Data Models Reference

### Module Content Structure
```typescript
{
  moduleNumber: number,        // 1, 2, 3...
  moduleName: string,          // "Sets and Functions"
  hasVideo: boolean,
  videoUrl?: string,
  videoTitle?: string,
  videoDuration?: string,      // "30:00"
  videoUploadedAt?: Date,
  
  hasNotes: boolean,
  notesUrl?: string,
  notesTitle?: string,
  notesUploadedAt?: Date,
  
  hasLiveClass: boolean,
  liveClassSchedule?: [{
    scheduledAt: Date,
    duration: number,          // minutes
    meetingLink?: string,
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  }],
  
  hasTest: boolean,
  testIds?: string[],
  
  hasQuestions: boolean,
  questionIds?: string[],
  
  order: number,
  isActive: boolean
}
```

### Live Class Status
- **scheduled**: Upcoming class
- **ongoing**: Currently happening
- **completed**: Finished
- **cancelled**: Cancelled by teacher

---

## Authentication

### Student APIs
Use JWT token from student authentication:
```
Authorization: Bearer <student_jwt_token>
```

### Teacher APIs
Teacher email-based verification (can be enhanced with JWT):
- Pass teacher email in request body or query parameter
- Backend verifies teacher owns the resource

### Admin APIs
Admin session-based authentication (Next.js session handling)

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production:
- 100 requests per minute per IP for public endpoints
- 1000 requests per minute for authenticated endpoints

---

## Testing Examples

### cURL Examples

**Assign Teacher:**
```bash
curl -X POST http://localhost:3000/api/teachers/teacher_id/assign \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course_id",
    "subjectName": "Mathematics"
  }'
```

**Get Assigned Subjects:**
```bash
curl -X GET "http://localhost:3001/api/teacher/subjects?email=john.doe@example.com"
```

**Update Module:**
```bash
curl -X PATCH http://localhost:3001/api/teacher/subject-content \
  -H "Content-Type: application/json" \
  -d '{
    "subjectContentId": "subject_id",
    "teacherEmail": "john.doe@example.com",
    "moduleNumber": 1,
    "moduleUpdates": {
      "hasVideo": true,
      "videoUrl": "https://example.com/video.mp4",
      "videoTitle": "Introduction"
    }
  }'
```

**Get Course Content (Student):**
```bash
curl -X GET http://localhost:5000/api/courses/course_id/content \
  -H "Authorization: Bearer student_jwt_token"
```

---

## Error Handling

All API endpoints follow consistent error response format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

For validation errors:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "courseId",
      "message": "Course ID is required"
    }
  ]
}
```

---

## Version History

- **v1.0** (2025-01-15): Initial implementation
  - Subject-specific teacher assignments
  - Module content management
  - Student course content API
