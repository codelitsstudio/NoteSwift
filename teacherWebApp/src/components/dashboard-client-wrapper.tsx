'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to get the authenticated teacher's email from localStorage token
 * Redirects to login if no valid token is found
 */
export function useTeacherAuth() {
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure localStorage is fully available after redirect
    const timer = setTimeout(() => {
      // Check all localStorage items
      const email = localStorage.getItem('teacherEmail');
      const token = localStorage.getItem('teacherToken');
      const id = localStorage.getItem('teacherId');
      
      console.log('🔐 Checking authentication...', { 
        hasEmail: !!email, 
        hasToken: !!token,
        hasId: !!id,
        email: email 
      });
      
      if (!email || !token) {
        console.log('❌ No teacher credentials found, redirecting to login');
        console.log('localStorage contents:', {
          email: localStorage.getItem('teacherEmail'),
          token: localStorage.getItem('teacherToken') ? 'exists' : 'missing',
          id: localStorage.getItem('teacherId')
        });
        window.location.href = '/login';
        return;
      }

      console.log('✅ Teacher authenticated:', email);
      setTeacherEmail(email);
      setLoading(false);
    }, 100); // 100ms delay to ensure localStorage is ready

    return () => clearTimeout(timer);
  }, []);

  return { teacherEmail, loading };
}

/**
 * Simple hook to get teacher email without auth redirect
 * Returns empty string if not authenticated
 */
export function useTeacherEmail() {
  const [teacherEmail, setTeacherEmail] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('teacherToken');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        setTeacherEmail(decoded.email || '');
      } catch (error) {
        console.error('Failed to decode teacher token:', error);
      }
    }
  }, []);

  return teacherEmail;
}
