"use client";

import { useTeacher } from '@/context/teacher-context';
import { BookOpen, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TeacherAssignments() {
  const { assignedCourses, isLoading } = useTeacher();

  if (isLoading) {
    return (
      <div className="px-4 py-3 border-b">
        <div className="animate-pulse">
          <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (assignedCourses.length === 0) {
    return (
      <div className="px-4 py-3 border-b bg-yellow-500/10">
        <div className="flex items-start gap-2">
          <GraduationCap className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-yellow-600">No Subject Assigned</p>
            <p className="text-xs text-muted-foreground">
              Contact admin to get subjects assigned
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 mb-2 border-b bg-blue-500/5">
      <div className="flex items-start gap-2">
        <BookOpen className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">Your Subject</p>
          <div className="space-y-2">
            {assignedCourses.map((course, index) => (
              <div key={index} className="flex flex-col gap-1">
                <p className="text-base font-semibold leading-tight">
                  {course.subject}
                </p>
                <p className="text-xs text-muted-foreground">
                  {course.courseName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
