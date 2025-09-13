// student/stores/courseStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Course {
  _id: string;
  id: string;
  title: string;
  description: string;
  teacherName: string;
  thumbnail: string;
  originalPrice?: string;
  discountPercentage?: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CourseEnrollment {
  _id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
  progress: number;
  isActive: boolean;
}

interface ApiState {
  is_loading: boolean;
  api_message: string;
}

interface CourseState extends ApiState {
  // Courses
  courses: Course[];
  featuredCourse: Course | null;
  
  // Enrollments
  enrolledCourses: string[]; // Array of enrolled course IDs
  
  // Popup state
  hasShownPopupToday: boolean;
  lastPopupDate: string | null;
  
  // Actions
  fetchFeaturedCourse: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<boolean>;
  isEnrolled: (courseId: string) => boolean;
  checkAndShowPopup: (userId: string) => boolean;
  markPopupShown: () => void;
  fetchUserEnrollments: (userId: string) => Promise<void>;
  
  // Legacy methods for backward compatibility
  enrollCourse: (courseId: string) => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  
  // Reset functions
  reset: () => void;
}

const initialState = {
  is_loading: false,
  api_message: "",
  courses: [],
  featuredCourse: null,
  enrolledCourses: [],
  hasShownPopupToday: false,
  lastPopupDate: null,
};

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchFeaturedCourse: async () => {
        try {
          set({ is_loading: true, api_message: "" });
          
          const response = await axios.get('/courses/featured');
          
          if (response.data.success) {
            const course = response.data.data;
            // Ensure id field exists
            if (course && !course.id) {
              course.id = course._id;
            }
            
            set({ 
              featuredCourse: course,
              is_loading: false 
            });
          } else {
            set({ 
              api_message: response.data.message || "Failed to fetch featured course",
              is_loading: false 
            });
          }
        } catch (error: any) {
          set({ 
            is_loading: false, 
            api_message: error.response?.data?.message || "Something went wrong" 
          });
          console.error('Error fetching featured course:', error);
        }
      },

      enrollInCourse: async (courseId: string) => {
        try {
          set({ is_loading: true, api_message: "" });
          
          const response = await axios.post('/courses/enroll', { 
            courseId 
          });
          
          if (response.data.success) {
            // Add to local enrolled courses
            const currentEnrolled = get().enrolledCourses;
            if (!currentEnrolled.includes(courseId)) {
              set({ 
                enrolledCourses: [...currentEnrolled, courseId],
                is_loading: false,
                api_message: "Successfully enrolled in course!"
              });
            }
            return true;
          } else {
            set({ 
              api_message: response.data.message || "Failed to enroll in course",
              is_loading: false 
            });
            return false;
          }
        } catch (error: any) {
          set({ 
            is_loading: false, 
            api_message: error.response?.data?.message || "Something went wrong" 
          });
          console.error('Error enrolling in course:', error);
          return false;
        }
      },

      fetchUserEnrollments: async (userId: string) => {
        try {
          console.log('Fetching enrollments for user:', userId);
          const response = await axios.get(`/courses/enrollments/${userId}`);
          
          console.log('Enrollment API response:', response.data);
          
          if (response.data.success) {
            const enrolledCourseIds = response.data.data.map((enrollment: any) => {
              // courseId is populated with the full course object
              const courseId = enrollment.courseId._id || enrollment.courseId.id || enrollment.courseId;
              console.log('Extracting course ID:', courseId, 'from enrollment:', enrollment);
              return courseId;
            });
            console.log('User enrolled in courses:', enrolledCourseIds);
            set({ enrolledCourses: enrolledCourseIds });
          } else {
            console.log('Enrollment API returned success: false');
          }
        } catch (error: any) {
          console.error('Error fetching user enrollments:', error.message);
          console.error('Error status:', error.response?.status);
          console.error('Error data:', error.response?.data);
          if (error.response?.status === 403) {
            console.error('Access denied - authentication issue');
          } else if (error.response?.status === 404) {
            console.error('Enrollments endpoint not found');
          }
          // Set empty array on error to prevent undefined issues
          set({ enrolledCourses: [] });
        }
      },

      isEnrolled: (courseId: string) => {
        return get().enrolledCourses.includes(courseId);
      },

      checkAndShowPopup: (userId: string) => {
        const state = get();
        
        console.log('=== POPUP CHECK DEBUG ===');
        console.log('User ID:', userId);
        console.log('Featured course:', state.featuredCourse);
        console.log('Enrolled courses:', state.enrolledCourses);
        console.log('Enrolled courses length:', state.enrolledCourses.length);
        
        // Don't show if no featured course
        if (!state.featuredCourse) {
          console.log('No featured course available');
          return false;
        }
        
        // Don't show if already enrolled in featured course
        const courseId = state.featuredCourse.id || state.featuredCourse._id;
        console.log('Featured course ID:', courseId);
        console.log('Featured course _id:', state.featuredCourse._id);
        console.log('Featured course id:', state.featuredCourse.id);
        
        // Check each enrolled course ID for debugging
        state.enrolledCourses.forEach((enrolledId, index) => {
          console.log(`Enrolled course ${index}:`, enrolledId, typeof enrolledId);
          console.log(`Matches courseId?`, enrolledId === courseId);
          if (state.featuredCourse) {
            console.log(`Matches _id?`, enrolledId === state.featuredCourse._id);
            console.log(`Matches id?`, enrolledId === state.featuredCourse.id);
          }
        });
        
        console.log('Is enrolled check:', state.isEnrolled(courseId));
        
        if (state.isEnrolled(courseId)) {
          console.log('Already enrolled in featured course');
          return false;
        }
        
        console.log('Should show popup - user not enrolled and has featured course');
        return true;
      },

      markPopupShown: () => {
        console.log('Popup was dismissed by user (this does not affect future showings)');
        // We can still track this for analytics but don't prevent future showings
        const today = new Date().toDateString();
        set({ 
          hasShownPopupToday: true, 
          lastPopupDate: today 
        });
      },

      // Legacy methods for backward compatibility
      enrollCourse: async (courseId: string) => {
        const success = await get().enrollInCourse(courseId);
        if (!success) {
          throw new Error('Failed to enroll in course');
        }
      },

      fetchEnrolledCourses: async () => {
        console.warn('fetchEnrolledCourses called without userId - use fetchUserEnrollments instead');
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'course-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

