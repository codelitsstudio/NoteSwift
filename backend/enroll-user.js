const mongoose = require('mongoose');
require('dotenv').config();

// Use the same schemas as the backend
const courseEnrollmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

courseEnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
courseEnrollmentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
courseEnrollmentSchema.set('toJSON', { virtuals: true });

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  teacherName: String,
  thumbnail: String,
  originalPrice: String,
  discountPercentage: Number,
  isActive: Boolean,
  isFeatured: Boolean,
  level: String,
  category: String,
  tags: [String],
  syllabus: [{
    title: String,
    description: String,
    duration: String
  }],
  requirements: [String],
  learningOutcomes: [String]
}, { timestamps: true });

courseSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
courseSchema.set('toJSON', { virtuals: true });

const studentSchema = new mongoose.Schema({
  full_name: String,
  phone_number: String,
  grade: Number,
  password: String,
  address: {
    province: String,
    district: String,
    institution: String
  }
}, { timestamps: true });

studentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
studentSchema.set('toJSON', { virtuals: true });

async function createEnrollmentForUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const CourseEnrollment = mongoose.models.CourseEnrollment || mongoose.model('CourseEnrollment', courseEnrollmentSchema);
    const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
    const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
    
    // Get user ID from command line argument or use the one you saw in logs
    const userIdFromArgs = process.argv[2]; 
    const userIdFromLogs = '68c40d85c436a8f7d21983cb'; // The one you saw in logs
    
    const userId = userIdFromArgs || userIdFromLogs;
    console.log('Creating enrollment for user ID:', userId);
    
    // Find the featured course
    const featuredCourse = await Course.findOne({ isFeatured: true });
    console.log('Featured course:', featuredCourse._id, featuredCourse.title);
    
    // Find the specific user
    const student = await Student.findById(userId);
    if (!student) {
      console.log('Student not found with ID:', userId);
      console.log('Available students:');
      const allStudents = await Student.find({}, { _id: 1, full_name: 1, phone_number: 1 });
      allStudents.forEach(s => {
        console.log('-', s._id, s.full_name, s.phone_number);
      });
      return;
    }
    
    console.log('Student found:', student._id, student.full_name);
    
    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({
      courseId: featuredCourse._id,
      studentId: student._id
    });
    
    if (existingEnrollment) {
      console.log('Student already enrolled at:', existingEnrollment.enrolledAt);
    } else {
      // Create enrollment
      const enrollment = new CourseEnrollment({
        courseId: featuredCourse._id,
        studentId: student._id,
        enrolledAt: new Date(),
        progress: 0,
        isActive: true
      });
      
      await enrollment.save();
      console.log('Enrollment created:', enrollment._id);
    }
    
    // List all enrollments for this student
    const enrollments = await CourseEnrollment.find({ studentId: student._id });
    console.log('All enrollments for student:');
    enrollments.forEach(e => {
      console.log('- Course ID:', e.courseId.toString(), 'Active:', e.isActive);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createEnrollmentForUser();
