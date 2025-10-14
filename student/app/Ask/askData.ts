// Ask Module Types
export type QuestionType = 'mcq' | 'numerical' | 'short' | 'long' | 'theory';
export type QuestionStatus = 'answered' | 'pending' | 'in-progress';
export type CategoryType = 'doubts' | 'resources' | 'notes' | 'videos' | 'general';
export type SourceType = 'ai' | 'community' | 'support' | 'teacher';

export interface Question {
  id: string;
  question: string;
  description?: string;
  category: CategoryType;
  subject: string;
  chapter?: string;
  type: QuestionType;
  status: QuestionStatus;
  askedBy: string;
  askedAt: string;
  answeredBy?: string;
  answeredAt?: string;
  answer?: string;
  upvotes: number;
  hasAttachment: boolean;
  source: SourceType;
}

export interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  available: boolean;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  question: string;
  subject: string;
  timestamp: string;
  replies: number;
  upvotes: number;
  hasAnswer: boolean;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

// Demo Data
export const demoQuestions: Question[] = [
  {
    id: 'q1',
    question: 'What is the quadratic formula and how to apply it?',
    description: 'I am having trouble understanding when to use the quadratic formula and how to solve equations with it.',
    category: 'doubts',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    type: 'theory',
    status: 'answered',
    askedBy: 'You',
    askedAt: '2 hours ago',
    answeredBy: 'AI Assistant',
    answeredAt: '2 hours ago',
    answer: 'The quadratic formula is: x = (-b ± √(b²-4ac)) / 2a. It is used to solve quadratic equations of the form ax² + bx + c = 0. Simply substitute the values of a, b, and c into the formula to find the roots.',
    upvotes: 12,
    hasAttachment: false,
    source: 'ai',
  },
  {
    id: 'q2',
    question: 'Explain the process of photosynthesis',
    description: 'Need detailed explanation with diagrams',
    category: 'doubts',
    subject: 'Biology',
    chapter: 'Plant Physiology',
    type: 'theory',
    status: 'answered',
    askedBy: 'You',
    askedAt: '5 hours ago',
    answeredBy: 'Community Expert',
    answeredAt: '4 hours ago',
    answer: 'Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in two stages: Light-dependent reactions (in thylakoids) and Light-independent reactions (Calvin cycle in stroma).',
    upvotes: 8,
    hasAttachment: true,
    source: 'community',
  },
  {
    id: 'q3',
    question: 'How to solve differential equations?',
    description: 'Linear differential equations with constant coefficients',
    category: 'doubts',
    subject: 'Mathematics',
    chapter: 'Differential Equations',
    type: 'theory',
    status: 'pending',
    askedBy: 'You',
    askedAt: '1 day ago',
    upvotes: 3,
    hasAttachment: false,
    source: 'ai',
  },
  {
    id: 'q4',
    question: "What is Newton's Third Law of Motion?",
    description: 'Need examples and applications',
    category: 'doubts',
    subject: 'Physics',
    chapter: 'Laws of Motion',
    type: 'short',
    status: 'answered',
    askedBy: 'You',
    askedAt: '3 days ago',
    answeredBy: 'Teacher',
    answeredAt: '2 days ago',
    answer: "Newton's Third Law states: For every action, there is an equal and opposite reaction. Example: When you push a wall, the wall pushes back with equal force.",
    upvotes: 15,
    hasAttachment: false,
    source: 'support',
  },
  {
    id: 'q5',
    question: 'Difference between DNA and RNA?',
    category: 'doubts',
    subject: 'Biology',
    chapter: 'Molecular Biology',
    type: 'short',
    status: 'in-progress',
    askedBy: 'You',
    askedAt: '6 hours ago',
    upvotes: 5,
    hasAttachment: false,
    source: 'community',
  },
];

export const demoAIFeatures: AIFeature[] = [
  {
    id: 'f1',
    title: 'AI Chat Bot',
    description: 'Chat with AI for instant help on any topic',
    icon: 'smart-toy',
    available: true,
  },
  {
    id: 'f2',
    title: 'Question Generator',
    description: 'Generate MCQs, numericals, and theory questions',
    icon: 'psychology',
    available: true,
  },
  {
    id: 'f3',
    title: 'Doubt Solver',
    description: 'Get instant solutions to academic doubts',
    icon: 'lightbulb',
    available: true,
  },
  {
    id: 'f4',
    title: 'Step-by-Step Guide',
    description: 'Detailed explanations with examples',
    icon: 'stairs',
    available: true,
  },
  {
    id: 'f5',
    title: 'Study Tips',
    description: 'Personalized study techniques and tips',
    icon: 'menu-book',
    available: true,
  },
  {
    id: 'f6',
    title: 'Learning Path',
    description: 'AI-powered personalized learning roadmap',
    icon: 'route',
    available: true,
  },
];

export const demoCommunityPosts: CommunityPost[] = [
  {
    id: 'cp1',
    userId: 'u1',
    userName: 'Rahul Sharma',
    question: 'Best way to memorize periodic table?',
    subject: 'Chemistry',
    timestamp: '1 hour ago',
    replies: 8,
    upvotes: 23,
    hasAnswer: true,
  },
  {
    id: 'cp2',
    userId: 'u2',
    userName: 'Priya Patel',
    question: 'How to improve problem-solving speed in physics?',
    subject: 'Physics',
    timestamp: '3 hours ago',
    replies: 5,
    upvotes: 17,
    hasAnswer: true,
  },
  {
    id: 'cp3',
    userId: 'u3',
    userName: 'Amit Kumar',
    question: 'Recommended books for calculus preparation?',
    subject: 'Mathematics',
    timestamp: '5 hours ago',
    replies: 12,
    upvotes: 31,
    hasAnswer: true,
  },
];

export const demoSupportTickets: SupportTicket[] = [
  {
    id: 'st1',
    title: 'Unable to download study materials',
    description: 'Getting error when trying to download PDF files',
    category: 'Technical Issue',
    status: 'in-progress',
    priority: 'high',
    createdAt: '1 hour ago',
    updatedAt: '30 min ago',
  },
  {
    id: 'st2',
    title: 'Question about subscription renewal',
    description: 'When will my subscription expire?',
    category: 'Billing',
    status: 'closed',
    priority: 'medium',
    createdAt: '2 days ago',
    updatedAt: '1 day ago',
  },
];
