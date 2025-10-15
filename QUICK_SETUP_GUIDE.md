# NoteSwift Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB database running
- Git repository cloned

## Step 1: Environment Setup

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/noteswift
# or your MongoDB Atlas URI
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/noteswift

PORT=5000
JWT_SECRET=your_jwt_secret_here
```

### Admin Web App (.env.local)
```env
MONGODB_URI=mongodb://localhost:27017/noteswift
# Use same URI as backend
```

### Teacher Web App (.env.local)
```env
MONGODB_URI=mongodb://localhost:27017/noteswift
# Use same URI as backend
```

### Student Mobile App
Update API URL in `student/api/axios.ts`:
```typescript
const BASE_URL = 'http://localhost:5000/api'; // or your deployed backend URL
```

## Step 2: Install Dependencies

```powershell
# Backend
cd backend
npm install

# Admin Web App
cd ../adminWebApp
npm install

# Teacher Web App
cd ../teacherWebApp
npm install

# Student Mobile App
cd ../student
npm install
```

## Step 3: Start Services

### Terminal 1 - Backend
```powershell
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2 - Admin Web App
```powershell
cd adminWebApp
npm run dev
# Runs on http://localhost:3000
```

### Terminal 3 - Teacher Web App
```powershell
cd teacherWebApp
npm run dev
# Runs on http://localhost:3001
```

### Terminal 4 - Student Mobile App
```powershell
cd student
npx expo start
# Scan QR code with Expo Go app
```

## Step 4: Test the Flow

### A. Create Test Data (if needed)

1. **Create a Course in Admin Panel**:
   - Login to Admin Panel (http://localhost:3000)
   - Go to Courses → Create New Course
   - Add course with subjects, e.g., "Grade 11 Package" with subjects: Math, Physics, Chemistry
   - Each subject should have modules (chapters)

2. **Create a Teacher**:
   - Teacher registers at Teacher Portal (http://localhost:3001/register)
   - Admin approves teacher in Admin Panel → Teacher Management

### B. Assign Teacher to Subject

1. Go to Admin Panel → Teacher Management → Assign tab
2. Click "Assign Subject" on an approved teacher
3. Select:
   - Course: "Grade 11 Package"
   - Subject: "Mathematics"
4. Click "Assign Subject"

✅ **Verification**: Check MongoDB `subjectcontents` collection - new document should be created

### C. Teacher Manages Content

1. Teacher logs in to Teacher Portal
2. Store teacher email in localStorage:
   ```javascript
   localStorage.setItem('teacherEmail', 'teacher@example.com');
   ```
3. Refresh page - assigned subjects should appear
4. Use API to update module:
   ```bash
   curl -X PATCH http://localhost:3001/api/teacher/subject-content \
     -H "Content-Type: application/json" \
     -d '{
       "subjectContentId": "your_subject_content_id",
       "teacherEmail": "teacher@example.com",
       "moduleNumber": 1,
       "moduleUpdates": {
         "hasVideo": true,
         "videoUrl": "https://example.com/video.mp4",
         "videoTitle": "Introduction to Sets"
       }
     }'
   ```

✅ **Verification**: Module 1 should now have `hasVideo: true` in database

### D. Student Views Content

1. Student enrolls in course (via mobile app or API)
2. Student calls API:
   ```bash
   curl -X GET http://localhost:5000/api/courses/{courseId}/content \
     -H "Authorization: Bearer student_jwt_token"
   ```
3. Response should show:
   - Course with subjects
   - Math subject with teacher info
   - Module 1 with video details

✅ **Verification**: Student sees video in Mathematics module 1

## Step 5: Common Issues & Solutions

### Issue: "Cannot find module '@/models/SubjectContent'"
**Solution**: Make sure you created SubjectContent.ts in all three locations:
- `backend/src/models/SubjectContent.model.ts`
- `teacherWebApp/src/models/SubjectContent.ts`
- `adminWebApp/src/lib/models/SubjectContent.ts`

### Issue: "Teacher email not found in localStorage"
**Solution**: Set teacher email after login:
```javascript
localStorage.setItem('teacherEmail', teacher.email);
```

### Issue: "Unauthorized: You can only update your own subjects"
**Solution**: Ensure the teacherEmail in request matches the teacher assigned to that subject

### Issue: Database connection failed
**Solution**: 
1. Check MongoDB is running: `mongosh`
2. Verify MONGODB_URI in all .env files
3. Check firewall/network settings

### Issue: CORS errors
**Solution**: Backend should have CORS enabled:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

## Step 6: MongoDB Queries for Debugging

### Check SubjectContent
```javascript
db.subjectcontents.find().pretty()
```

### Check Teacher Assignments
```javascript
db.teachers.find({ email: 'teacher@example.com' }).pretty()
```

### Check Course Subjects
```javascript
db.courses.findOne({ title: 'Grade 11 Package' }).subjects
```

### Update Module Manually
```javascript
db.subjectcontents.updateOne(
  { _id: ObjectId('your_id'), 'modules.moduleNumber': 1 },
  { 
    $set: { 
      'modules.$.hasVideo': true,
      'modules.$.videoUrl': 'https://example.com/video.mp4'
    }
  }
)
```

## Step 7: Testing API Endpoints

### Postman Collection
Import these endpoints into Postman:

1. **Assign Teacher to Subject**
   - POST http://localhost:3000/api/teachers/:teacherId/assign
   - Body: `{ "courseId": "...", "subjectName": "Mathematics" }`

2. **Get Teacher Subjects**
   - GET http://localhost:3001/api/teacher/subjects?email=teacher@example.com

3. **Update Module**
   - PATCH http://localhost:3001/api/teacher/subject-content
   - Body: `{ "subjectContentId": "...", "teacherEmail": "...", "moduleNumber": 1, "moduleUpdates": {...} }`

4. **Get Course Content (Student)**
   - GET http://localhost:5000/api/courses/:courseId/content
   - Header: Authorization: Bearer {student_token}

## Step 8: Development Workflow

### Daily Development
1. Start all services (backend, admin, teacher, student)
2. Make changes to code
3. Hot reload will update automatically

### Adding New Features
1. Update schemas if needed
2. Create/update API endpoints
3. Update frontend components
4. Test with real data

### Before Deployment
1. Run tests (when implemented)
2. Build production versions
3. Update environment variables for production
4. Deploy backend first, then frontend apps

## Step 9: Next Steps

### Implement Teacher Dashboard UI
Create pages in `teacherWebApp/src/app/dashboard/`:
- `/subjects` - List assigned subjects
- `/subjects/[id]` - Manage specific subject
- `/subjects/[id]/modules/[moduleNumber]` - Manage module content

### Implement Student Learn Page
Update `student/app/Learn/`:
- Fetch from `/courses/:courseId/content` API
- Display subjects with teacher info
- Show modules with content availability
- Add video/notes/live class access

### Add Authentication
- Implement proper JWT authentication
- Add role-based access control
- Secure all sensitive endpoints

## Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md` for architecture details
2. Check `API_DOCUMENTATION.md` for API reference
3. Review MongoDB collections for data verification
4. Check console logs in browser/terminal for errors

---

**Status**: ✅ Core backend and APIs complete, ready for UI implementation and testing
