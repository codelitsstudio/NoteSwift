// courseData.ts - Centralized data structure for courses, subjects, and modules

export interface Module {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUri?: string;
  teacher?: string;
  teacherAvatar?: string;
  uploadDate?: string;
  tags: { type: "live" | "video" | "notes"; label: string; count?: number }[];
}

export interface Subject {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  duration: string;
  teacher?: string;
  icon: string;
  color: string;
  image: string;
  modules: Module[];
  totalLessons: number;
  estimatedHours?: number;
}

export interface Course {
  _id: string;
  title: string;
  grade: string;
  description: string;
  subjects: Subject[];
}

// Demo courses data
export const courses: Record<string, Course> = {
  'course-1': {
    _id: 'course-grade-11',
    title: 'Grade 11 Learning Package',
    grade: 'Grade 11',
    description: 'Comprehensive learning package for Grade 11 students',
    subjects: [
      {
        id: 'physics-11',
        name: 'Physics',
        subtitle: 'Mechanics, Thermodynamics, Waves & Optics',
        description: 'Explore the fundamental laws of physics and understand how the universe works',
        duration: '120 hours',
        teacher: 'Prof. Sharma',
        icon: 'science',
        color: '#3B82F6',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
        totalLessons: 45,
        estimatedHours: 120,
        modules: [
          {
            id: 'physics-11-module-1',
            title: 'Introduction to Mechanics',
            subtitle: 'Understanding motion and forces',
            description: 'Learn about mechanics and its fundamental concepts. Understand motion, forces, energy, and the laws governing physical bodies.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Prof. Rajesh Kumar',
            teacherAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            uploadDate: 'Jan 10, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 5 },
              { type: 'notes', label: 'Notes', count: 6 }
            ]
          },
          {
            id: 'physics-11-module-2',
            title: "Newton's First Law",
            subtitle: 'Law of Inertia',
            description: 'Understand the law of inertia and how objects behave when no external force is applied.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Prof. Rajesh Kumar',
            teacherAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            uploadDate: 'Jan 12, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 4 },
              { type: 'notes', label: 'Notes', count: 5 }
            ]
          },
          {
            id: 'physics-11-module-3',
            title: "Newton's Second Law",
            subtitle: 'Force and Acceleration',
            description: 'Learn about the relationship between force, mass, and acceleration.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Prof. Rajesh Kumar',
            teacherAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            uploadDate: 'Jan 15, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 6 },
              { type: 'notes', label: 'Notes', count: 7 }
            ]
          },
        ],
      },
      {
        id: 'chemistry-11',
        name: 'Chemistry',
        subtitle: 'Organic & Physical Chemistry',
        description: 'Master chemical reactions, organic compounds, and physical chemistry principles',
        duration: '110 hours',
        teacher: 'Dr. Patel',
        icon: 'biotech',
        color: '#10B981',
        image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500',
        totalLessons: 42,
        estimatedHours: 110,
        modules: [
          {
            id: 'chemistry-11-module-1',
            title: 'Introduction to Organic Chemistry',
            subtitle: 'Carbon compounds',
            description: 'Explore the world of carbon-based compounds and their properties.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Dr. Patel',
            teacherAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
            uploadDate: 'Jan 8, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 5 },
              { type: 'notes', label: 'Notes', count: 7 }
            ]
          },
          {
            id: 'chemistry-11-module-2',
            title: 'Hydrocarbons',
            subtitle: 'Alkanes, Alkenes, Alkynes',
            description: 'Study different types of hydrocarbons and their chemical properties.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Dr. Patel',
            teacherAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
            uploadDate: 'Jan 11, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 6 },
              { type: 'notes', label: 'Notes', count: 8 }
            ]
          },
        ],
      },
      {
        id: 'mathematics-11',
        name: 'Mathematics',
        subtitle: 'Calculus, Algebra & Trigonometry',
        description: 'Master advanced mathematical concepts and problem-solving techniques',
        duration: '130 hours',
        teacher: 'Prof. Kumar',
        icon: 'calculate',
        color: '#F59E0B',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
        totalLessons: 50,
        estimatedHours: 130,
        modules: [
          {
            id: 'mathematics-11-module-1',
            title: 'Introduction to Limits',
            subtitle: 'Understanding continuity',
            description: 'Learn the fundamental concept of limits in calculus.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Prof. Kumar',
            teacherAvatar: 'https://randomuser.me/api/portraits/men/50.jpg',
            uploadDate: 'Jan 5, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 6 },
              { type: 'notes', label: 'Notes', count: 8 }
            ]
          },
          {
            id: 'mathematics-11-module-2',
            title: 'Derivatives',
            subtitle: 'Rate of change',
            description: 'Understand derivatives and their applications in real-world problems.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Prof. Kumar',
            teacherAvatar: 'https://randomuser.me/api/portraits/men/50.jpg',
            uploadDate: 'Jan 9, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 7 },
              { type: 'notes', label: 'Notes', count: 9 }
            ]
          },
          {
            id: 'mathematics-11-module-3',
            title: 'Applications of Derivatives',
            subtitle: 'Real-world problems',
            description: 'Apply derivative concepts to solve practical problems.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Prof. Kumar',
            teacherAvatar: 'https://randomuser.me/api/portraits/men/50.jpg',
            uploadDate: 'Jan 13, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 5 },
              { type: 'notes', label: 'Notes', count: 6 }
            ]
          },
        ],
      },
      {
        id: 'biology-11',
        name: 'Biology',
        subtitle: 'Cell Biology & Human Physiology',
        description: 'Explore the microscopic world and understand living organisms',
        duration: '100 hours',
        teacher: 'Dr. Singh',
        icon: 'eco',
        color: '#8B5CF6',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500',
        totalLessons: 38,
        estimatedHours: 100,
        modules: [
          {
            id: 'biology-11-module-1',
            title: 'Cell Structure',
            subtitle: 'Organelles and their functions',
            description: 'Dive into cellular biology and understand cell components.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Dr. Singh',
            teacherAvatar: 'https://randomuser.me/api/portraits/women/40.jpg',
            uploadDate: 'Jan 7, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 4 },
              { type: 'notes', label: 'Notes', count: 6 }
            ]
          },
          {
            id: 'biology-11-module-2',
            title: 'Cell Division',
            subtitle: 'Mitosis and Meiosis',
            description: 'Learn about cell reproduction and genetic inheritance.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Dr. Singh',
            teacherAvatar: 'https://randomuser.me/api/portraits/women/40.jpg',
            uploadDate: 'Jan 14, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 5 },
              { type: 'notes', label: 'Notes', count: 7 }
            ]
          },
        ],
      },
      {
        id: 'cs-11',
        name: 'Computer Science',
        subtitle: 'Programming & Data Structures',
        description: 'Learn programming fundamentals and algorithmic thinking',
        duration: '90 hours',
        teacher: 'Prof. Gupta',
        icon: 'computer',
        color: '#EF4444',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
        totalLessons: 35,
        estimatedHours: 90,
        modules: [
          {
            id: 'cs-11-module-1',
            title: 'Python Basics',
            subtitle: 'Variables and Data Types',
            description: 'Start your programming journey with Python basics.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Prof. Gupta',
            teacherAvatar: 'https://randomuser.me/api/portraits/men/55.jpg',
            uploadDate: 'Jan 6, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 4 },
              { type: 'notes', label: 'Notes', count: 5 }
            ]
          },
          {
            id: 'cs-11-module-2',
            title: 'Control Flow',
            subtitle: 'If statements and loops',
            description: 'Master control structures in programming.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Prof. Gupta',
            teacherAvatar: 'https://randomuser.me/api/portraits/men/55.jpg',
            uploadDate: 'Jan 16, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 6 },
              { type: 'notes', label: 'Notes', count: 7 }
            ]
          },
          {
            id: 'cs-11-module-3',
            title: 'Functions and Modules',
            subtitle: 'Code organization',
            description: 'Learn to write clean, modular code.',
            imageUri: 'https://i.postimg.cc/9Fg6yxdf/course-1-thumbnail.jpg',
            teacher: 'Prof. Gupta',
            teacherAvatar: 'https://randomuser.me/api/portraits/men/55.jpg',
            uploadDate: 'Jan 18, 2025',
            tags: [
              { type: 'video', label: 'Videos', count: 5 },
              { type: 'notes', label: 'Notes', count: 6 }
            ]
          },
        ],
      },
    ],
  },
  'course-2': {
    _id: 'course-grade-12',
    title: 'Grade 12 Complete Package',
    grade: 'Grade 12',
    description: 'Advanced preparation for board exams',
    subjects: [
      {
        id: 'physics-12',
        name: 'Physics',
        subtitle: 'Electromagnetism & Modern Physics',
        description: 'Advanced physics concepts for Grade 12',
        duration: '140 hours',
        teacher: 'Prof. Sharma',
        icon: 'science',
        color: '#3B82F6',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
        totalLessons: 48,
        estimatedHours: 140,
        modules: [],
      },
      {
        id: 'chemistry-12',
        name: 'Chemistry',
        subtitle: 'Organic, Inorganic & Physical',
        description: 'Complete chemistry curriculum for Grade 12',
        duration: '130 hours',
        teacher: 'Dr. Patel',
        icon: 'biotech',
        color: '#10B981',
        image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500',
        totalLessons: 45,
        estimatedHours: 130,
        modules: [],
      },
    ],
  },
  'course-3': {
    _id: 'course-grade-10',
    title: 'Grade 10 Foundation Package',
    grade: 'Grade 10',
    description: 'Build strong fundamentals for higher grades',
    subjects: [
      {
        id: 'science-10',
        name: 'Science',
        subtitle: 'Physics, Chemistry, Biology',
        description: 'Comprehensive science foundation',
        duration: '100 hours',
        teacher: 'Multiple Teachers',
        icon: 'science',
        color: '#3B82F6',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
        totalLessons: 40,
        estimatedHours: 100,
        modules: [],
      },
    ],
  },
};
