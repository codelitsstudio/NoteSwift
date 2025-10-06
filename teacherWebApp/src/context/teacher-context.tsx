"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IAssignedCourse } from '@/models/Teacher';

interface TeacherContextType {
  teacherId: string | null;
  teacherName: string;
  teacherEmail: string;
  assignedCourses: IAssignedCourse[];
  isLoading: boolean;
  updateTeacherData: (data: Partial<TeacherContextType>) => void;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [teacherData, setTeacherData] = useState<TeacherContextType>({
    teacherId: null,
    teacherName: 'NoteSwift Teacher',
    teacherEmail: 'teacher@noteswift.com',
    assignedCourses: [],
    isLoading: true,
    updateTeacherData: () => {},
  });

  useEffect(() => {
    // Fetch teacher data from API or localStorage
    // For now, using mock data. Replace with actual API call
    const fetchTeacherData = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/teacher/me');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockData = {
          teacherId: '507f1f77bcf86cd799439011',
          teacherName: 'John Doe',
          teacherEmail: 'john.doe@noteswift.com',
          assignedCourses: [
            {
              courseId: '507f1f77bcf86cd799439012' as any,
              courseName: 'Grade 11 Study Package',
              subject: 'Mathematics',
              assignedAt: new Date('2025-01-01'),
            },
          ],
          isLoading: false,
        };

        setTeacherData((prev) => ({
          ...prev,
          ...mockData,
        }));
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        setTeacherData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchTeacherData();
  }, []);

  const updateTeacherData = (data: Partial<TeacherContextType>) => {
    setTeacherData((prev) => ({ ...prev, ...data }));
  };

  return (
    <TeacherContext.Provider value={{ ...teacherData, updateTeacherData }}>
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
