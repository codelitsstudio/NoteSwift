// Subject data structure for grade packages
export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  image: string;
  chapters: string[]; // Array of chapter keys from chapterData
  totalLessons: number;
  estimatedHours: number;
}

export interface GradePackage {
  id: string;
  grade: string;
  title: string;
  description: string;
  subjects: Subject[];
}

// Demo data for grade packages
export const gradePackages: Record<string, GradePackage> = {
  'demo-1': {
    id: 'demo-1',
    grade: 'Grade 11',
    title: 'Grade 11 Learning Package',
    description: 'Comprehensive learning package for Grade 11 students',
    subjects: [
      {
        id: 'physics-11',
        name: 'Physics',
        description: 'Mechanics, Thermodynamics, Waves & Optics',
        icon: 'science',
        color: '#3B82F6',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
        chapters: ['chapter-1', 'chapter-2'],
        totalLessons: 45,
        estimatedHours: 120,
      },
      {
        id: 'chemistry-11',
        name: 'Chemistry',
        description: 'Organic Chemistry, Physical Chemistry',
        icon: 'biotech',
        color: '#10B981',
        image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500',
        chapters: ['chapter-3', 'chapter-4'],
        totalLessons: 42,
        estimatedHours: 110,
      },
      {
        id: 'mathematics-11',
        name: 'Mathematics',
        description: 'Calculus, Algebra, Trigonometry',
        icon: 'calculate',
        color: '#F59E0B',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
        chapters: ['chapter-5', 'chapter-6'],
        totalLessons: 50,
        estimatedHours: 130,
      },
      {
        id: 'biology-11',
        name: 'Biology',
        description: 'Plant Biology, Human Physiology',
        icon: 'eco',
        color: '#8B5CF6',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500',
        chapters: ['chapter-7'],
        totalLessons: 38,
        estimatedHours: 100,
      },
      {
        id: 'cs-11',
        name: 'Computer Science',
        description: 'Programming, Data Structures, Algorithms',
        icon: 'computer',
        color: '#EF4444',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
        chapters: ['chapter-8'],
        totalLessons: 35,
        estimatedHours: 90,
      },
    ],
  },
  'demo-2': {
    id: 'demo-2',
    grade: 'Grade 12',
    title: 'Grade 12 Complete Package',
    description: 'Advanced preparation for board exams',
    subjects: [
      {
        id: 'physics-12',
        name: 'Physics',
        description: 'Electromagnetism, Modern Physics, Electronics',
        icon: 'science',
        color: '#3B82F6',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
        chapters: ['chapter-1', 'chapter-2'],
        totalLessons: 48,
        estimatedHours: 140,
      },
      {
        id: 'chemistry-12',
        name: 'Chemistry',
        description: 'Organic, Inorganic & Physical Chemistry',
        icon: 'biotech',
        color: '#10B981',
        image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500',
        chapters: ['chapter-3', 'chapter-4'],
        totalLessons: 45,
        estimatedHours: 130,
      },
      {
        id: 'mathematics-12',
        name: 'Mathematics',
        description: 'Calculus, Vectors, Probability',
        icon: 'calculate',
        color: '#F59E0B',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
        chapters: ['chapter-5', 'chapter-6'],
        totalLessons: 52,
        estimatedHours: 150,
      },
      {
        id: 'biology-12',
        name: 'Biology',
        description: 'Genetics, Evolution, Biotechnology',
        icon: 'eco',
        color: '#8B5CF6',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500',
        chapters: ['chapter-7'],
        totalLessons: 40,
        estimatedHours: 110,
      },
      {
        id: 'english-12',
        name: 'English',
        description: 'Literature, Writing, Comprehension',
        icon: 'menu-book',
        color: '#EC4899',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500',
        chapters: ['chapter-8'],
        totalLessons: 30,
        estimatedHours: 80,
      },
    ],
  },
  'demo-3': {
    id: 'demo-3',
    grade: 'Grade 10',
    title: 'Grade 10 Foundation Package',
    description: 'Build strong fundamentals for higher grades',
    subjects: [
      {
        id: 'science-10',
        name: 'Science',
        description: 'Physics, Chemistry, Biology basics',
        icon: 'science',
        color: '#3B82F6',
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
        chapters: ['chapter-1', 'chapter-2'],
        totalLessons: 40,
        estimatedHours: 100,
      },
      {
        id: 'mathematics-10',
        name: 'Mathematics',
        description: 'Algebra, Geometry, Statistics',
        icon: 'calculate',
        color: '#F59E0B',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
        chapters: ['chapter-3', 'chapter-4'],
        totalLessons: 45,
        estimatedHours: 110,
      },
      {
        id: 'social-10',
        name: 'Social Studies',
        description: 'History, Geography, Civics',
        icon: 'public',
        color: '#10B981',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
        chapters: ['chapter-5'],
        totalLessons: 35,
        estimatedHours: 90,
      },
      {
        id: 'english-10',
        name: 'English',
        description: 'Grammar, Literature, Writing',
        icon: 'menu-book',
        color: '#EC4899',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500',
        chapters: ['chapter-6'],
        totalLessons: 30,
        estimatedHours: 75,
      },
    ],
  },
};
