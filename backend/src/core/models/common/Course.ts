export interface TCourse {
    _id: string;
    title: string;
    description: string;
    subjects?: {
        name: string;
        description?: string;
        modules?: {
            name: string;
            description: string;
            duration?: string;
        }[];
    }[];
    tags: string[];
    status: string;
    type: 'featured' | 'pro' | 'free' | 'recommended' | 'upcoming';
    price?: number;
    program: string; // see, plus2, bachelor, ctevt
    duration?: string;
    rating?: number;
    enrolledCount?: number;
    skills?: string[];
    features?: string[];
    learningPoints?: string[];
    offeredBy?: string; // teacher name
    courseOverview?: string;
    syllabus?: {
        moduleNumber: number;
        title: string;
        description: string;
    }[];
    faq?: {
        question: string;
        answer: string;
    }[];
    icon?: string;
    thumbnail?: string;
    isFeatured?: boolean;
    keyFeatures?: string[];
    // AI-powered recommendation metadata
    recommendationData?: {
        targetGrades?: string[];
        targetAudience?: string;
        difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
        recommendedFor?: string[];
        confidence?: number;
        lastAnalyzed?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}
