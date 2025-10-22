"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';

export interface TeacherData {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  subjects?: any[];
  onboardingStep?: string;
  onboardingComplete?: boolean;
  registrationStatus?: 'pending' | 'approved' | 'rejected';
  profilePhoto?: string;
  assignedCourses?: any[];
}

interface TeacherAuthContextType {
  teacher: TeacherData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  isOnboardingComplete: boolean;
  isApproved: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(undefined);

export function TeacherAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated and get teacher data
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('teacherToken');
      if (!token) {
        setTeacher(null);
        return;
      }

      // Verify token and get teacher profile
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result?.teacher) {
          const teacherData = data.result.teacher;
          setTeacher(teacherData);

          // Update localStorage with latest data
          localStorage.setItem('teacherId', teacherData._id);
          localStorage.setItem('teacherEmail', teacherData.email);
          localStorage.setItem('isAuthenticated', 'true');
        } else {
          // Token invalid, clear it
          logout();
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        logout();
      } else {
        throw new Error('Failed to verify authentication');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError(err instanceof Error ? err.message : 'Authentication check failed');
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!result.success || !result.result) {
        return { success: false, message: result.message || 'Login failed' };
      }

      // Store auth data
      const { token, teacher: teacherData } = result.result;
      localStorage.setItem('teacherToken', token);
      localStorage.setItem('teacherId', teacherData._id);
      localStorage.setItem('teacherEmail', teacherData.email);
      localStorage.setItem('isAuthenticated', 'true');

      setTeacher(teacherData);

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('teacherEmail');
    localStorage.removeItem('isAuthenticated');
    setTeacher(null);
    setError(null);
  };

  // Refresh authentication data
  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Computed values
  const isAuthenticated = !!teacher;
  const needsOnboarding = teacher ? teacher.onboardingStep !== 'completed' : false;
  const isOnboardingComplete = teacher ? teacher.onboardingStep === 'completed' : false;
  const isApproved = teacher ? teacher.registrationStatus === 'approved' : false;

  const value: TeacherAuthContextType = {
    teacher,
    loading,
    error,
    isAuthenticated,
    needsOnboarding,
    isOnboardingComplete,
    isApproved,
    login,
    logout,
    refreshAuth,
    checkAuthStatus
  };

  return (
    <TeacherAuthContext.Provider value={value}>
      {children}
    </TeacherAuthContext.Provider>
  );
}

export function useTeacherAuth() {
  const context = useContext(TeacherAuthContext);
  if (context === undefined) {
    throw new Error('useTeacherAuth must be used within a TeacherAuthProvider');
  }
  return context;
}