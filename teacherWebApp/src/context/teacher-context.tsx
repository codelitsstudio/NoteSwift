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
    assignedCourses: [],
    assignedSubjects: [],
    isLoading: true,
    updateTeacherData: () => {},
    refreshAssignments: async () => {},
  });

  const fetchTeacherData = async () => {
    try {
      setTeacherData((prev) => ({ ...prev, isLoading: true }));
      
      // Get teacher email from localStorage or session
      const teacherEmail = localStorage.getItem('teacherEmail');
      
      if (!teacherEmail) {
        console.log('No teacher email found in localStorage');
        setTeacherData((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Fetch teacher's assigned subjects from Express backend
      const response = await fetch(`${API_ENDPOINTS.COURSES}/subject-content?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch teacher data');
      }

      const data = await response.json();

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
          assignedCourses: courses,
          assignedSubjects: subjects,
          isLoading: false,
        }));
      } else {
        // No assignments yet
        setTeacherData((prev) => ({
          ...prev,
          isLoading: false,
        }));
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
