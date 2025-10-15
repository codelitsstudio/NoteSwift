# Admin Backend Migration Plan

## Current Status ✅
- **Teacher Backend**: Fully migrated to Express (port 5001) ✅
- **Admin Backend**: Started structure, needs full migration

## Admin API Routes to Convert

From `adminWebApp/src/app/api/*` to `adminWebApp/backend/src/controllers/*`:

### 1. **Admin Routes** (`/admin/*`)
- GET /admin/me
- PATCH /admin/profile
- POST /admin/change-password

### 2. **Auth Routes** (`/auth/*`)
- POST /auth/login
- POST /auth/logout
- POST /auth/register
- GET /auth/me

### 3. **Teacher Management** (`/teachers/*`)
- GET /teachers (list with filtering)
- GET /teachers/:id
- POST /teachers/:id/approve
- POST /teachers/:id/reject
- POST /teachers/:id/assign (assign courses)
- PATCH /teachers/:id
- DELETE /teachers/:id

### 4. **Course Management** (`/courses/*`)
- GET /courses
- GET /courses/:id
- POST /courses
- PATCH /courses/:id
- DELETE /courses/:id
- POST /courses/:id/publish

### 5. **Notification System** (`/notifications/*`)
- GET /notifications
- POST /notifications
- POST /notifications/send
- DELETE /notifications/:id

### 6. **Recommendations** (`/recommendations/*`)
- GET /recommendations
- POST /recommendations/generate

## Migration Steps

### Step 1: Copy Models ✅
```bash
# Already done - models exist in adminWebApp/src/lib/models/
```

### Step 2: Convert Each API Route
For each route file in `src/app/api/`:
1. Create controller in `backend/src/controllers/`
2. Convert `NextRequest` → `Request, Response`
3. Convert response format to Express pattern
4. Add to routes file

### Step 3: Create Routes File
Create `adminRoutes.ts` that mounts all controllers

### Step 4: Update Frontend
Create `adminWebApp/src/config/api.ts` with centralized URLs

### Step 5: Install Dependencies
```bash
cd adminWebApp/backend
npm install
```

### Step 6: Test All Features
- Teacher approval/rejection
- Course management
- Notifications
- Analytics

## Recommended Approach

**Option 1: Manual Migration (Safer)** ⭐ RECOMMENDED
- Convert one feature at a time
- Test each feature before moving to next
- Keep Next.js routes as backup during migration
- Takes ~2-3 hours but very safe

**Option 2: Automated Script (Faster)**
- Create script to convert all routes at once
- Risky - might break things
- Need careful testing
- Takes ~30 mins but higher risk

## Next Steps

1. Do you want me to:
   - A) Convert all admin routes now (automated, faster, riskier)
   - B) Convert them one by one (manual, safer, slower)
   - C) Create a conversion script for you to run later

2. After migration:
   - Update `.env` files with API URLs
   - Test all admin features thoroughly
   - Deploy to production with new backend URLs

## Production Deployment

After migration, you'll have:
```
Teacher: NEXT_PUBLIC_API_URL=https://teacher-api.noteswift.com
Admin:   NEXT_PUBLIC_API_URL=https://admin-api.noteswift.com
Student: API_URL=https://student-api.noteswift.com
```

All three backends will be separate, independent Express servers! 🚀
