// Test Data Types and Demo Data

export type TestType = 'mcq' | 'pdf' | 'mixed';
export type TestDifficulty = 'easy' | 'medium' | 'hard';
export type TestStatus = 'not-started' | 'in-progress' | 'completed';

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  type: TestType;
  difficulty: TestDifficulty;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  description: string;
  status: TestStatus;
  attemptedDate?: string;
  score?: number;
  timeSpent?: number;
  thumbnail: any;
}

export interface Course {
  id: string;
  name: string;
  subject: string;
  grade: string;
  thumbnail: any;
  testsCount: number;
  completedTests: number;
}

export interface TestResult {
  testId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  attemptDate: string;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

// Demo Courses
export const demoCourses: Course[] = [
  {
    id: 'c1',
    name: 'Advanced Mathematics',
    subject: 'Mathematics',
    grade: 'Grade 12',
    thumbnail: require('../../assets/images/otp-ill.png'),
    testsCount: 8,
    completedTests: 3,
  },
  {
    id: 'c2',
    name: 'Physics Fundamentals',
    subject: 'Physics',
    grade: 'Grade 11',
    thumbnail: require('../../assets/images/illl-3.png'),
    testsCount: 6,
    completedTests: 2,
  },
  {
    id: 'c3',
    name: 'Organic Chemistry',
    subject: 'Chemistry',
    grade: 'Grade 12',
    thumbnail: require('../../assets/images/illl-2.png'),
    testsCount: 7,
    completedTests: 4,
  },
  {
    id: 'c4',
    name: 'English Literature',
    subject: 'English',
    grade: 'Grade 10',
    thumbnail: require('../../assets/images/illl-4.png'),
    testsCount: 5,
    completedTests: 1,
  },
  {
    id: 'c5',
    name: 'Computer Science',
    subject: 'CS',
    grade: 'Grade 12',
    thumbnail: require('../../assets/images/illl-5.png'),
    testsCount: 10,
    completedTests: 5,
  },
  {
    id: 'c6',
    name: 'Biology Essentials',
    subject: 'Biology',
    grade: 'Grade 11',
    thumbnail: require('../../assets/images/illl-6.png'),
    testsCount: 6,
    completedTests: 2,
  },
];

// Demo Tests
export const demoTests: Test[] = [
  // Mathematics Tests
  {
    id: 't1',
    title: 'Calculus - Derivatives',
    courseId: 'c1',
    courseName: 'Advanced Mathematics',
    type: 'mcq',
    difficulty: 'hard',
    duration: 45,
    totalQuestions: 25,
    totalMarks: 100,
    description: 'Test your understanding of derivatives, limits, and differentiation techniques.',
    status: 'completed',
    attemptedDate: '2025-10-12',
    score: 85,
    timeSpent: 38,
    thumbnail: require('../../assets/images/illl-1.png'),
  },
  {
    id: 't2',
    title: 'Integration Techniques',
    courseId: 'c1',
    courseName: 'Advanced Mathematics',
    type: 'mixed',
    difficulty: 'hard',
    duration: 60,
    totalQuestions: 20,
    totalMarks: 100,
    description: 'Master integration methods including substitution, parts, and partial fractions.',
    status: 'in-progress',
    thumbnail: require('../../assets/images/illl-2.png'),
  },
  {
    id: 't3',
    title: 'Matrices & Determinants',
    courseId: 'c1',
    courseName: 'Advanced Mathematics',
    type: 'mcq',
    difficulty: 'medium',
    duration: 40,
    totalQuestions: 30,
    totalMarks: 90,
    description: 'Comprehensive test on matrix operations, determinants, and linear algebra.',
    status: 'not-started',
    thumbnail: require('../../assets/images/illl-3.png'),
  },
  {
    id: 't4',
    title: 'Trigonometry Advanced',
    courseId: 'c1',
    courseName: 'Advanced Mathematics',
    type: 'pdf',
    difficulty: 'medium',
    duration: 50,
    totalQuestions: 15,
    totalMarks: 75,
    description: 'PDF-based test covering trigonometric identities and equations.',
    status: 'not-started',
    thumbnail: require('../../assets/images/illl-4.png'),
  },
  
  // Physics Tests
  {
    id: 't5',
    title: 'Mechanics - Motion',
    courseId: 'c2',
    courseName: 'Physics Fundamentals',
    type: 'mcq',
    difficulty: 'medium',
    duration: 35,
    totalQuestions: 20,
    totalMarks: 80,
    description: 'Test on kinematics, Newton\'s laws, and motion equations.',
    status: 'completed',
    attemptedDate: '2025-10-10',
    score: 72,
    timeSpent: 32,
    thumbnail: require('../../assets/images/illl-5.png'),
  },
  {
    id: 't6',
    title: 'Electricity & Magnetism',
    courseId: 'c2',
    courseName: 'Physics Fundamentals',
    type: 'mixed',
    difficulty: 'hard',
    duration: 55,
    totalQuestions: 25,
    totalMarks: 100,
    description: 'Comprehensive test on electromagnetic theory and applications.',
    status: 'not-started',
    thumbnail: require('../../assets/images/illl-6.png'),
  },
  
  // Chemistry Tests
  {
    id: 't7',
    title: 'Organic Reactions',
    courseId: 'c3',
    courseName: 'Organic Chemistry',
    type: 'mcq',
    difficulty: 'hard',
    duration: 40,
    totalQuestions: 30,
    totalMarks: 90,
    description: 'Test on reaction mechanisms, reagents, and organic synthesis.',
    status: 'completed',
    attemptedDate: '2025-10-08',
    score: 78,
    timeSpent: 35,
    thumbnail: require('../../assets/images/book2.png'),
  },
  {
    id: 't8',
    title: 'Functional Groups',
    courseId: 'c3',
    courseName: 'Organic Chemistry',
    type: 'pdf',
    difficulty: 'medium',
    duration: 45,
    totalQuestions: 20,
    totalMarks: 80,
    description: 'Identify and analyze various functional groups in organic compounds.',
    status: 'not-started',
    thumbnail: require('../../assets/images/courses.png'),
  },
  
  // Computer Science Tests
  {
    id: 't9',
    title: 'Data Structures',
    courseId: 'c5',
    courseName: 'Computer Science',
    type: 'mcq',
    difficulty: 'medium',
    duration: 50,
    totalQuestions: 35,
    totalMarks: 100,
    description: 'Arrays, linked lists, stacks, queues, trees, and graphs.',
    status: 'completed',
    attemptedDate: '2025-10-13',
    score: 92,
    timeSpent: 45,
    thumbnail: require('../../assets/images/demo.png'),
  },
  {
    id: 't10',
    title: 'Algorithms & Complexity',
    courseId: 'c5',
    courseName: 'Computer Science',
    type: 'mixed',
    difficulty: 'hard',
    duration: 60,
    totalQuestions: 25,
    totalMarks: 100,
    description: 'Sorting, searching, dynamic programming, and time complexity analysis.',
    status: 'not-started',
    thumbnail: require('../../assets/images/illl-1.png'),
  },
];

// Demo MCQ Questions
export const demoMCQQuestions: Record<string, MCQQuestion[]> = {
  't1': [
    {
      id: 'q1',
      question: 'What is the derivative of x² + 3x + 2?',
      options: [
        { id: 'a', text: '2x + 3', isCorrect: true },
        { id: 'b', text: 'x + 3', isCorrect: false },
        { id: 'c', text: '2x + 2', isCorrect: false },
        { id: 'd', text: 'x² + 3', isCorrect: false },
      ],
      explanation: 'Using the power rule: d/dx(x²) = 2x and d/dx(3x) = 3, constant derivative is 0.',
    },
    {
      id: 'q2',
      question: 'Find the limit: lim(x→0) (sin x)/x',
      options: [
        { id: 'a', text: '0', isCorrect: false },
        { id: 'b', text: '1', isCorrect: true },
        { id: 'c', text: '∞', isCorrect: false },
        { id: 'd', text: 'Does not exist', isCorrect: false },
      ],
      explanation: 'This is a standard limit that equals 1. It can be proven using L\'Hôpital\'s rule.',
    },
    {
      id: 'q3',
      question: 'What is the derivative of sin(x)?',
      options: [
        { id: 'a', text: 'cos(x)', isCorrect: true },
        { id: 'b', text: '-cos(x)', isCorrect: false },
        { id: 'c', text: 'sin(x)', isCorrect: false },
        { id: 'd', text: '-sin(x)', isCorrect: false },
      ],
      explanation: 'The derivative of sin(x) with respect to x is cos(x).',
    },
    {
      id: 'q4',
      question: 'Evaluate: d/dx(e^x)',
      options: [
        { id: 'a', text: 'e^x', isCorrect: true },
        { id: 'b', text: 'e', isCorrect: false },
        { id: 'c', text: 'x·e^(x-1)', isCorrect: false },
        { id: 'd', text: 'ln(x)', isCorrect: false },
      ],
      explanation: 'The exponential function e^x is its own derivative.',
    },
    {
      id: 'q5',
      question: 'What is the chain rule formula?',
      options: [
        { id: 'a', text: 'd/dx[f(g(x))] = f\'(g(x))·g\'(x)', isCorrect: true },
        { id: 'b', text: 'd/dx[f(g(x))] = f\'(x)·g\'(x)', isCorrect: false },
        { id: 'c', text: 'd/dx[f(g(x))] = f(x)·g(x)', isCorrect: false },
        { id: 'd', text: 'd/dx[f(g(x))] = f\'(g(x)) + g\'(x)', isCorrect: false },
      ],
      explanation: 'The chain rule states that the derivative of a composite function is the derivative of the outer function evaluated at the inner function times the derivative of the inner function.',
    },
  ],
  't5': [
    {
      id: 'q1',
      question: 'What is Newton\'s Second Law of Motion?',
      options: [
        { id: 'a', text: 'F = ma', isCorrect: true },
        { id: 'b', text: 'E = mc²', isCorrect: false },
        { id: 'c', text: 'F = G(m₁m₂)/r²', isCorrect: false },
        { id: 'd', text: 'v = u + at', isCorrect: false },
      ],
      explanation: 'Newton\'s Second Law states that Force equals mass times acceleration (F = ma).',
    },
    {
      id: 'q2',
      question: 'If a car accelerates from 0 to 60 m/s in 10 seconds, what is its acceleration?',
      options: [
        { id: 'a', text: '6 m/s²', isCorrect: true },
        { id: 'b', text: '60 m/s²', isCorrect: false },
        { id: 'c', text: '10 m/s²', isCorrect: false },
        { id: 'd', text: '600 m/s²', isCorrect: false },
      ],
      explanation: 'Using a = (v - u)/t = (60 - 0)/10 = 6 m/s²',
    },
    {
      id: 'q3',
      question: 'What is the SI unit of force?',
      options: [
        { id: 'a', text: 'Newton', isCorrect: true },
        { id: 'b', text: 'Joule', isCorrect: false },
        { id: 'c', text: 'Watt', isCorrect: false },
        { id: 'd', text: 'Pascal', isCorrect: false },
      ],
      explanation: 'The SI unit of force is the Newton (N), named after Isaac Newton.',
    },
  ],
  't7': [
    {
      id: 'q1',
      question: 'What is the functional group in alcohols?',
      options: [
        { id: 'a', text: '-OH', isCorrect: true },
        { id: 'b', text: '-COOH', isCorrect: false },
        { id: 'c', text: '-CHO', isCorrect: false },
        { id: 'd', text: '-NH₂', isCorrect: false },
      ],
      explanation: 'Alcohols contain the hydroxyl (-OH) functional group.',
    },
    {
      id: 'q2',
      question: 'Which reagent is used for oxidation of primary alcohols to aldehydes?',
      options: [
        { id: 'a', text: 'PCC (Pyridinium Chlorochromate)', isCorrect: true },
        { id: 'b', text: 'NaBH₄', isCorrect: false },
        { id: 'c', text: 'LiAlH₄', isCorrect: false },
        { id: 'd', text: 'H₂/Pd', isCorrect: false },
      ],
      explanation: 'PCC is a mild oxidizing agent that converts primary alcohols to aldehydes without further oxidation.',
    },
  ],
  't9': [
    {
      id: 'q1',
      question: 'What is the time complexity of binary search?',
      options: [
        { id: 'a', text: 'O(log n)', isCorrect: true },
        { id: 'b', text: 'O(n)', isCorrect: false },
        { id: 'c', text: 'O(n²)', isCorrect: false },
        { id: 'd', text: 'O(1)', isCorrect: false },
      ],
      explanation: 'Binary search divides the search space in half each time, resulting in O(log n) complexity.',
    },
    {
      id: 'q2',
      question: 'Which data structure uses LIFO (Last In First Out)?',
      options: [
        { id: 'a', text: 'Stack', isCorrect: true },
        { id: 'b', text: 'Queue', isCorrect: false },
        { id: 'c', text: 'Array', isCorrect: false },
        { id: 'd', text: 'Tree', isCorrect: false },
      ],
      explanation: 'Stack follows LIFO principle - the last element added is the first one to be removed.',
    },
    {
      id: 'q3',
      question: 'What is the worst-case time complexity of QuickSort?',
      options: [
        { id: 'a', text: 'O(n²)', isCorrect: true },
        { id: 'b', text: 'O(n log n)', isCorrect: false },
        { id: 'c', text: 'O(n)', isCorrect: false },
        { id: 'd', text: 'O(log n)', isCorrect: false },
      ],
      explanation: 'QuickSort\'s worst case occurs when the pivot is always the smallest or largest element, resulting in O(n²).',
    },
  ],
};

// Demo Test Results
export const demoTestResults: Record<string, TestResult> = {
  't1': {
    testId: 't1',
    score: 85,
    totalMarks: 100,
    percentage: 85,
    timeTaken: 38,
    correctAnswers: 21,
    wrongAnswers: 3,
    skippedQuestions: 1,
    attemptDate: '2025-10-12',
    answers: [],
  },
  't5': {
    testId: 't5',
    score: 72,
    totalMarks: 80,
    percentage: 90,
    timeTaken: 32,
    correctAnswers: 18,
    wrongAnswers: 2,
    skippedQuestions: 0,
    attemptDate: '2025-10-10',
    answers: [],
  },
  't7': {
    testId: 't7',
    score: 78,
    totalMarks: 90,
    percentage: 86.67,
    timeTaken: 35,
    correctAnswers: 26,
    wrongAnswers: 3,
    skippedQuestions: 1,
    attemptDate: '2025-10-08',
    answers: [],
  },
  't9': {
    testId: 't9',
    score: 92,
    totalMarks: 100,
    percentage: 92,
    timeTaken: 45,
    correctAnswers: 32,
    wrongAnswers: 2,
    skippedQuestions: 1,
    attemptDate: '2025-10-13',
    answers: [],
  },
};
