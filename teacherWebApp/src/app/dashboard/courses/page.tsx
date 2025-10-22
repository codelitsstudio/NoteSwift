'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, CheckCircle, Edit, Trash2 } from "lucide-react";
import teacherAPI from "@/lib/api/teacher-api";
import Link from "next/link";
import { useTeacher } from "@/context/teacher-context";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CoursesPage() {
  const { assignedSubjects, assignedCourses, isLoading: contextLoading, refreshAssignments, teacherEmail } = useTeacher();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const [fallbackSubjects, setFallbackSubjects] = useState<any[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  useEffect(() => {
    if (contextLoading) return;
    
    if (!teacherEmail) {
      return;
    }

    // If TeacherContext has no assigned subjects, try direct fetch from all-subject-content
    if (!contextLoading && (!assignedSubjects || assignedSubjects.length === 0)) {
      const fetchFromAllSubjects = async () => {
        try {
          setFallbackLoading(true);
          const token = localStorage.getItem('teacherToken');
          if (!token) return;

          const response = await fetch(`${API_ENDPOINTS.COURSES}/all-subject-content`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.result?.subjects) {
              setFallbackSubjects(data.result.subjects);
            }
          }
        } catch (error) {
          console.error('Error fetching fallback subjects:', error);
        } finally {
          setFallbackLoading(false);
        }
      };

      fetchFromAllSubjects();
    }
  }, [teacherEmail, contextLoading, assignedSubjects]);

  const handleDeleteModule = async () => {
    if (!moduleToDelete || !teacherEmail) return;

    setDeleting(true);
    try {
      const response = await teacherAPI.courses.deleteModule(teacherEmail, moduleToDelete.moduleNumber);

      if (response.success) {
        toast({
          title: "Success",
          description: "Module deleted successfully!",
        });

        // Refresh assignments to get updated data
        await refreshAssignments();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to delete module",
        });
      }
    } catch (error: any) {
      console.error("Error deleting module:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete module",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setModuleToDelete(null);
    }
  };

  if (contextLoading || fallbackLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading subjects...</p>
        </div>
      </div>
    );
  }

  // Use assignedSubjects from context, or assignedCourses if subjects is empty, or fallback subjects
  const subjectsToUse = assignedSubjects && assignedSubjects.length > 0 
    ? assignedSubjects 
    : assignedCourses && assignedCourses.length > 0 
      ? assignedCourses.map(course => ({
          _id: course.courseId,
          courseId: course.courseId,
          courseName: course.courseName,
          courseProgram: '',
          courseThumbnail: '',
          subjectName: course.subject,
          description: '',
          syllabus: '',
          objectives: '',
          modules: [],
          lastUpdated: course.assignedAt,
          assignedAt: course.assignedAt,
          totalModules: 0,
          modulesWithVideo: 0,
          modulesWithNotes: 0,
          scheduledLiveClasses: 0,
        }))
      : fallbackSubjects;

  // Debug logging
  console.log('Courses Page Debug:');
  console.log('assignedSubjects:', assignedSubjects);
  console.log('assignedCourses:', assignedCourses);
  console.log('fallbackSubjects:', fallbackSubjects);
  console.log('subjectsToUse:', subjectsToUse);
  console.log('subjectsToUse[0]?.modules:', subjectsToUse[0]?.modules);

  if (!subjectsToUse || subjectsToUse.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Course Modules</h1>
          <p className="text-sm sm:text-base text-muted-foreground">No subjects assigned yet</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You haven't been assigned to any subject yet. Contact your administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the first assigned subject (assuming single assignment for now)
  const currentSubject = subjectsToUse[0];
  const course = {
    _id: currentSubject._id,
    title: currentSubject.courseName,
    subject: currentSubject.subjectName,
    description: currentSubject.description,
    program: currentSubject.courseProgram
  };
  // Collect ALL modules from ALL assigned subjects
  const allModules = subjectsToUse.flatMap((subject: any) => 
    (subject.modules || []).map((module: any) => ({
      ...module,
      subjectName: subject.subjectName,
      courseName: subject.courseName
    }))
  );
  const modules = allModules;
  const stats = {
    totalModules: allModules.length,
    videosUploaded: allModules.filter(m => m.hasVideo).length,
    notesUploaded: allModules.filter(m => m.hasNotes).length,
    testsCreated: allModules.filter(m => m.hasTest).length,
    liveClassesScheduled: allModules.filter(m => m.hasLiveClass).length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Course Modules</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          All modules from your assigned subjects
        </p>
      </div>

      {/* Content Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModules || 0}</div>
            <p className="text-xs mt-2 text-muted-foreground">Topics</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Video Lectures</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.videosUploaded || 0}</div>
            <p className="text-xs mt-2 text-muted-foreground">Videos</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">PDF Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notesUploaded || 0}</div>
            <p className="text-xs mt-2 text-muted-foreground">Documents</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testsCreated || 0}</div>
            <p className="text-xs mt-2 text-muted-foreground">Created</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Live Classes</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.liveClassesScheduled || 0}</div>
            <p className="text-xs mt-2 text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Module</CardTitle>
            <CardDescription>Add a new chapter/topic to your course</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/courses/new-chapter">
                <BookOpen className="h-4 w-4 mr-2" />
                Create Module
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Content</CardTitle>
            <CardDescription>Add videos, PDFs, or other materials</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/courses/upload-content">
                <FileText className="h-4 w-4 mr-2" />
                Upload Content
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modules List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Course Modules ({modules.length})</CardTitle>
              <CardDescription>Manage your course chapters and content</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard/courses/new-chapter">+ Add Module</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No modules yet. Create your first module to get started.</p>
              <Button asChild>
                <Link href="/dashboard/courses/new-chapter">Create First Module</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module: any) => (
                <Card key={module._id} className="bg-blue-50/60 border-blue-100">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Module {module.moduleNumber}: {module.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.subjectName} - {module.courseName}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {module.hasVideo && (
                            <Badge variant="secondary" className="gap-1">
                              <Video className="h-3 w-3" />
                              Video
                            </Badge>
                          )}
                          {module.hasNotes && (
                            <Badge variant="secondary" className="gap-1">
                              <FileText className="h-3 w-3" />
                              Notes
                            </Badge>
                          )}
                          {module.hasTest && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Test
                            </Badge>
                          )}
                          {module.hasLiveClass && (
                            <Badge variant="secondary" className="gap-1">
                              <Video className="h-3 w-3" />
                              Live Class
                            </Badge>
                          )}
                          {!module.hasVideo && !module.hasNotes && (
                            <Badge variant="outline">No content yet</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/courses/edit-module/${module.moduleNumber}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setModuleToDelete(module);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {module.hasVideo && module.videoTitle && (
                        <div className="flex items-center gap-2 text-sm">
                          <Video className="h-4 w-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium">{module.videoTitle}</p>
                            <p className="text-xs text-muted-foreground">Video lecture</p>
                          </div>
                        </div>
                      )}
                      {module.hasNotes && module.notesTitle && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-green-500" />
                          <div className="flex-1">
                            <p className="font-medium">{module.notesTitle}</p>
                            <p className="text-xs text-muted-foreground">PDF notes</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {!module.hasVideo && !module.hasNotes && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-3">No content uploaded yet</p>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/dashboard/courses/upload-content">Upload Content</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "Module {moduleToDelete?.moduleNumber}: {moduleToDelete?.title}"?
              This action cannot be undone and will permanently remove all associated content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Module"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
