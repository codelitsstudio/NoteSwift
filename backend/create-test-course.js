const mongoose = require('mongoose');
require('dotenv').config();

// Define the course schema directly
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

// Virtual for ID compatibility
courseSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

courseSchema.set('toJSON', {
  virtuals: true
});

async function createTestCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create or get the Course model
    const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

    // Check if there are any courses
    const courses = await Course.find();
    console.log('Total courses:', courses.length);

    const featuredCourses = await Course.find({ isFeatured: true });
    console.log('Featured courses:', featuredCourses.length);

    if (featuredCourses.length === 0) {
      console.log('No featured courses found. Creating one...');

            const newCourse = new Course({
        title: 'Learn How To Actually Study Before It’s Too Late',
        description: 'A professional course exploring effective study strategies and habits for long-term success.',
        teacherName: 'ThatGuy (US), NoteSwift Research Team',
        thumbnail: 'course-1-thumbnail.jpg',
        originalPrice: '9',
        discountPercentage: 100,
        isActive: true,
        isFeatured: true,
        level: 'Beginner',
        category: 'Education',
        tags: ['study', 'learning', 'productivity'],
        syllabus: [{
          title: 'Study Fundamentals',
          description: 'Understand how to set up an effective learning environment and routine.',
          duration: '40 minutes'
        }],
        requirements: ['Basic motivation to learn'],
        learningOutcomes: [
          'Develop effective study habits',
          'Learn structured techniques for retaining knowledge',
          'Apply strategies for better time management'
        ]
      });

      await newCourse.save();
      console.log('Featured course created successfully!');
      console.log('Course ID:', newCourse._id);
      console.log('Course Title:', newCourse.title);
    } else {
      console.log('Featured course already exists:', featuredCourses[0].title);
      console.log('Updating existing featured course...');
      
      // Update the existing featured course
      const existingCourse = featuredCourses[0];
      existingCourse.title = 'Learn How To Actually Study Before It\'s Too Late';
      existingCourse.description = 'A professional course exploring effective study strategies and habits for long-term success.';
      existingCourse.teacherName = 'ThatGuy (US), NoteSwift Research Team';
      existingCourse.thumbnail = 'course-1-thumbnail.jpg';
      existingCourse.originalPrice = '9';
      existingCourse.discountPercentage = 0;
      existingCourse.level = 'Beginner';
      existingCourse.category = 'Education';
      existingCourse.tags = ['study', 'learning', 'productivity'];
      existingCourse.syllabus = [{
        title: 'Study Fundamentals',
        description: 'Understand how to set up an effective learning environment and routine.',
        duration: '40 minutes'
      }];
      existingCourse.requirements = ['Basic motivation to learn'];
      existingCourse.learningOutcomes = [
        'Develop effective study habits',
        'Learn structured techniques for retaining knowledge',
        'Apply strategies for better time management'
      ];
      
      await existingCourse.save();
      console.log('Featured course updated successfully!');
      console.log('Course ID:', existingCourse._id);
      console.log('Course Title:', existingCourse.title);
      console.log('Thumbnail:', existingCourse.thumbnail);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestCourse();
