"use client";

export type CourseData = {
  _id?: string;
  title: string;
  description: string;
  subjects?: {
    name: string;
    description?: string;  // Added missing description field
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
  program: string;
  duration?: string;
  rating?: number;
  enrolledCount?: number;
  skills?: string[];
  features?: string[];
  learningPoints?: string[];
  offeredBy?: string;
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
  isFeatured?: boolean;
  keyFeatures?: string[];  // Added missing keyFeatures field
};

export async function createCourse(courseData: CourseData): Promise<CourseData> {
  const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
  const res = await fetch(API_ENDPOINTS.COURSES.CREATE, createFetchOptions('POST', courseData));

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create course');
  }

  const json = await res.json();
  return json.result.course;
}

export async function updateCourse(id: string, courseData: Partial<CourseData>): Promise<CourseData> {
  const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
  const res = await fetch(API_ENDPOINTS.COURSES.UPDATE(id), createFetchOptions('PUT', courseData));

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update course');
  }

  const json = await res.json();
  return json.result.course;
}

export async function getCourse(id: string): Promise<CourseData> {
  const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
  const res = await fetch(API_ENDPOINTS.COURSES.GET(id), createFetchOptions('GET'));

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch course');
  }

  const json = await res.json();
  return json.result.course;
}