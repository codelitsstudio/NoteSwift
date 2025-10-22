"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IAssignedCourse } from '@/models/Teacher';
import { API_ENDPOINTS } from '@/config/api';

interface AssignedSubject {
  _id: string;
  courseId: string;
  courseName: string;
  courseProgram: string;
  courseThumbnail?: string;
  subjectName: string;
  description?: string;
  syllabus?: string;
  objectives?: string[];
  modules: any[];
  lastUpdated: Date;
  assignedAt: Date;
  totalModules: number;
  modulesWithVideo: number;
  modulesWithNotes: number;
  scheduledLiveClasses: number;
}

interface TeacherContextType {
  teacherId: string | null;
  teacherName: string;
  teacherEmail: string;
  teacherProfilePic?: string;
  assignedCourses: IAssignedCourse[];
  assignedSubjects: AssignedSubject[];
  isLoading: boolean;
  updateTeacherData: (data: Partial<TeacherContextType>) => void;
  refreshAssignments: () => Promise<void>;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [teacherData, setTeacherData] = useState<TeacherContextType>({
    teacherId: null,
    teacherName: 'NoteSwift Teacher',
    teacherEmail: 'teacher@noteswift.com',
    teacherProfilePic: undefined,
    assignedCourses: [],
    assignedSubjects: [],
    isLoading: true,
    updateTeacherData: () => {},
    refreshAssignments: async () => {},
  });

  const fetchTeacherData = async () => {
    console.log('🔄 fetchTeacherData called');
    try {
      setTeacherData((prev) => ({ ...prev, isLoading: true }));
      
      // Get teacher email from localStorage or session
      const teacherEmail = localStorage.getItem('teacherEmail');
      const token = localStorage.getItem('teacherToken');
      console.log('Teacher email from localStorage:', teacherEmail);
      console.log('Token exists:', !!token);
      
      // Always try to fetch teacher profile data if token exists
      let profilePic: string | undefined;
      if (token) {
        try {
          const profileResponse = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('Profile API response:', JSON.stringify(profileData, null, 2));
            if (profileData.success && profileData.result?.teacher) {
              const teacher = profileData.result.teacher;
              // Extract profile picture from verificationDocuments (same as admin page)
              profilePic = teacher.verificationDocuments?.profile?.[0]?.url || teacher.profilePhoto;
              console.log('Profile picture found:', profilePic);
              console.log('Teacher verificationDocuments:', teacher.verificationDocuments);
              console.log('Teacher profilePhoto field:', teacher.profilePhoto);
            } else {
              console.log('Profile API returned success=false or no teacher data');
            }
          } else {
            console.log('Profile API response not ok:', profileResponse.status, profileResponse.statusText);
          }
        } catch (profileError) {
          console.log('Could not fetch profile data:', profileError);
        }
      }

      if (!teacherEmail) {
        console.log('No teacher email found in localStorage, but setting profile pic if available');
        setTeacherData((prev) => ({
          ...prev,
          teacherProfilePic: profilePic,
          isLoading: false,
        }));
        return;
      }

      // Fetch teacher's assigned courses from auth/me endpoint
      if (token) {
        try {
          const authResponse = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log('Auth API response:', JSON.stringify(authData, null, 2));
            if (authData.success && authData.result?.teacher) {
              const teacher = authData.result.teacher;
              
              // Extract profile picture from verificationDocuments
              profilePic = teacher.verificationDocuments?.profile?.[0]?.url || teacher.profilePhoto;
              
              // Get assigned courses from teacher profile
              const assignedCourses = teacher.assignedCourses || [];
              console.log('Assigned courses from auth/me:', assignedCourses);
              
              // Convert assignedCourses to the expected format
              const courses: IAssignedCourse[] = assignedCourses.map((ac: any) => ({
                courseId: ac.courseId,
                courseName: ac.courseName,
                subject: ac.subject,
                assignedAt: ac.assignedAt,
              }));

              // Fetch all subject content for assigned courses
              let subjects: AssignedSubject[] = [];
              try {
                const subjectResponse = await fetch(`${API_ENDPOINTS.COURSES}/all-subject-content`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (subjectResponse.ok) {
                  const subjectData = await subjectResponse.json();
                  if (subjectData.success && subjectData.result?.subjects) {
                    subjects = subjectData.result.subjects;
                    console.log('Subject content fetched:', subjects.length, 'subjects with modules');
                    console.log('First subject modules:', subjects[0]?.modules?.length || 0);
                  }
                }
              } catch (subjectError) {
                console.log('Could not fetch subject content:', subjectError);
              }              setTeacherData((prev) => ({
                ...prev,
                teacherId: teacher._id,
                teacherName: teacher.fullName || 'NoteSwift Teacher',
                teacherEmail: teacher.email,
                teacherProfilePic: profilePic,
                assignedCourses: courses,
                assignedSubjects: subjects,
                isLoading: false,
              }));
              
              return; // Exit early since we got data from auth/me
            }
          }
        } catch (authError) {
          console.log('Could not fetch from auth/me:', authError);
        }
      }

      // Fallback: Fetch teacher's assigned subjects from Express backend (old method)
      if (teacherEmail) {
        const apiUrl = `${API_ENDPOINTS.COURSES}/subject-content?teacherEmail=${encodeURIComponent(teacherEmail)}`;
        console.log('Fetching teacher data from fallback:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Fallback response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fallback response data:', JSON.stringify(data, null, 2));

          if (data.success && data.data.subjectContent) {
            const subjectContent = data.data.subjectContent;
            const course = data.data.course;
            
            // Convert to assignedSubjects format
            const subjects: AssignedSubject[] = [{
              _id: subjectContent._id,
              courseId: subjectContent.courseId,
              courseName: subjectContent.courseName,
              courseProgram: course?.program || '',
              courseThumbnail: course?.thumbnail,
              subjectName: subjectContent.subjectName,
              description: subjectContent.description,
              syllabus: subjectContent.syllabus,
              objectives: subjectContent.objectives,
              modules: subjectContent.modules || [],
              lastUpdated: subjectContent.lastUpdated,
              assignedAt: subjectContent.createdAt,
              totalModules: subjectContent.modules?.length || 0,
              modulesWithVideo: subjectContent.modules?.filter((m: any) => m.hasVideo).length || 0,
              modulesWithNotes: subjectContent.modules?.filter((m: any) => m.hasNotes).length || 0,
              scheduledLiveClasses: subjectContent.modules?.reduce((acc: number, m: any) => 
                acc + (m.liveClassSchedule?.length || 0), 0) || 0,
            }];
            
            // Convert to old format for backward compatibility
            const courses: IAssignedCourse[] = [{
              courseId: subjectContent.courseId,
              courseName: subjectContent.courseName,
              subject: subjectContent.subjectName,
              assignedAt: subjectContent.createdAt,
            }];

            setTeacherData((prev) => ({
              ...prev,
              teacherId: subjectContent.teacherId,
              teacherName: subjectContent.teacherName,
              teacherEmail: subjectContent.teacherEmail,
              teacherProfilePic: profilePic,
              assignedCourses: courses,
              assignedSubjects: subjects,
              isLoading: false,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setTeacherData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const updateTeacherData = (data: Partial<TeacherContextType>) => {
    setTeacherData((prev) => ({ ...prev, ...data }));
  };

  const refreshAssignments = async () => {
    await fetchTeacherData();
  };

  return (
    <TeacherContext.Provider value={{ ...teacherData, updateTeacherData, refreshAssignments }}>
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacher() {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
}
