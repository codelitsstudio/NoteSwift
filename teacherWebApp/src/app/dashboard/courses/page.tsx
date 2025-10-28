'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, CheckCircle, Edit, Trash2, RefreshCw, MoreHorizontal, Upload, X, Eye, EyeOff, Replace, Plus } from "lucide-react";
import teacherAPI from "@/lib/api/teacher-api";
import Link from "next/link";
import { useTeacher } from "@/context/teacher-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CoursesPage() {
  const { assignedSubjects, assignedCourses, isLoading: contextLoading, refreshAssignments, teacherEmail } = useTeacher();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [updatingContent, setUpdatingContent] = useState<string | null>(null);

  // Replace upload dialog state - updated for multiple videos
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [moduleToReplace, setModuleToReplace] = useState<any>(null);
  const [replaceType, setReplaceType] = useState<'video' | 'notes' | null>(null);
  const [videoToReplace, setVideoToReplace] = useState<number | null>(null); // Index of video to replace
  const [replaceForm, setReplaceForm] = useState({
    file: null as File | null,
    title: '',
    duration: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAssignments();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleRemoveVideo = async (module: any) => {
    if (!teacherEmail) return;

    setUpdatingContent(`video-${module.uniqueKey}`);
    try {
      const response = await teacherAPI.courses.updateModule(teacherEmail, module.moduleNumber, {
        hasVideo: false,
        videoUrl: undefined,
        videoTitle: undefined,
        videoDuration: undefined,
        videoUploadedAt: undefined,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Video removed successfully!",
        });
        await refreshAssignments();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to remove video",
        });
      }
    } catch (error: any) {
      console.error("Error removing video:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove video",
      });
    } finally {
      setUpdatingContent(null);
    }
  };

  const handleRemoveNotes = async (module: any) => {
    if (!teacherEmail) return;

    setUpdatingContent(`notes-${module.uniqueKey}`);
    try {
      const response = await teacherAPI.courses.updateModule(teacherEmail, module.moduleNumber, {
        hasNotes: false,
        notesUrl: undefined,
        notesTitle: undefined,
        notesUploadedAt: undefined,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Notes removed successfully!",
        });
        await refreshAssignments();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to remove notes",
        });
      }
    } catch (error: any) {
      console.error("Error removing notes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove notes",
      });
    } finally {
      setUpdatingContent(null);
    }
  };

  const handleTogglePublish = async (module: any) => {
    if (!teacherEmail) return;

    setUpdatingContent(`publish-${module.uniqueKey}`);
    try {
      const newStatus = !module.isActive;
      const response = await teacherAPI.courses.updateModule(teacherEmail, module.moduleNumber, {
        isActive: newStatus,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `Module ${newStatus ? 'published' : 'unpublished'} successfully!`,
        });
        await refreshAssignments();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || `Failed to ${newStatus ? 'publish' : 'unpublish'} module`,
        });
      }
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update module status",
      });
    } finally {
      setUpdatingContent(null);
    }
  };

  const handleReplaceUpload = (module: any, type: 'video' | 'notes', videoIndex?: number) => {
    // Determine if this is replacing a single video (legacy) or adding/replacing in array
    const isSingleVideoReplace = type === 'video' && videoIndex === undefined && module.videoTitle && (!module.videos || module.videos.length === 0);
    const actualVideoIndex = videoIndex ?? (isSingleVideoReplace ? 0 : null);
    
    setModuleToReplace(module);
    setReplaceType(type);
    setVideoToReplace(actualVideoIndex);

    // Set form defaults based on content type and video index
    if (type === 'video') {
      if (actualVideoIndex !== null && actualVideoIndex !== undefined && module.videos && module.videos[actualVideoIndex]) {
        // Replacing specific video in array
        const video = module.videos[actualVideoIndex];
        setReplaceForm({
          file: null,
          title: video.title || '',
          duration: video.duration || ''
        });
      } else if (module.videoTitle && isSingleVideoReplace) {
        // Replacing legacy single video
        setReplaceForm({
          file: null,
          title: module.videoTitle || '',
          duration: module.videoDuration || ''
        });
      } else {
        // Adding new video
        setReplaceForm({
          file: null,
          title: '',
          duration: ''
        });
      }
    } else {
      // Notes
      setReplaceForm({
        file: null,
        title: module.notesTitle || '',
        duration: ''
      });
    }
    setReplaceDialogOpen(true);
  };

  const handleReplaceSubmit = async () => {
    if (!moduleToReplace || !replaceType || !teacherEmail || !replaceForm.file) return;

    setUploadingFile(true);
    setUpdatingContent(`replace-${moduleToReplace.uniqueKey}`);
    try {
      if (replaceType === 'video') {
        // Handle video replacement/addition
        const response = await teacherAPI.courses.uploadVideo(
          teacherEmail,
          moduleToReplace.moduleNumber,
          [replaceForm.file],
          [replaceForm.title],
          replaceForm.duration ? [parseInt(replaceForm.duration)] : undefined,
          videoToReplace !== null ? videoToReplace : undefined
        );

        if (response.success) {
          toast({
            title: "Success",
            description: videoToReplace !== null && videoToReplace !== undefined ? "Video replaced successfully!" : "Video added successfully!",
          });
          await refreshAssignments();
          setReplaceDialogOpen(false);
          setModuleToReplace(null);
          setReplaceType(null);
          setVideoToReplace(null);
          setReplaceForm({ file: null, title: '', duration: '' });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.message || "Failed to update video",
          });
        }
      } else {
        // Handle notes replacement (existing logic)
        const response = await teacherAPI.courses.uploadNotes(
          teacherEmail,
          moduleToReplace.moduleNumber,
          replaceForm.file,
          replaceForm.title
        );

        if (response.success) {
          toast({
            title: "Success",
            description: "Notes replaced successfully!",
          });
          await refreshAssignments();
          setReplaceDialogOpen(false);
          setModuleToReplace(null);
          setReplaceType(null);
          setVideoToReplace(null);
          setReplaceForm({ file: null, title: '', duration: '' });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.message || "Failed to replace notes",
          });
        }
      }
    } catch (error: any) {
      console.error("Error replacing content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${videoToReplace !== null && videoToReplace !== undefined ? 'replace' : 'add'} ${replaceType}`,
      });
    } finally {
      setUploadingFile(false);
      setUpdatingContent(null);
    }
  };

  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading subjects...</p>
        </div>
      </div>
    );
  }

  // Use assignedSubjects from context, or assignedCourses if subjects is empty
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
      : [];

  // Debug logging
  console.log('Courses Page Debug:');
  console.log('assignedSubjects:', assignedSubjects);
  console.log('assignedCourses:', assignedCourses);
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
      courseName: subject.courseName,
      uniqueKey: `${subject._id}_${module.moduleNumber}` // Create unique key
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Course Modules</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            All modules from your assigned subjects
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
                <Card key={module.uniqueKey} className="bg-blue-50/60 border-blue-100">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Module {module.moduleNumber}: {module.moduleName || module.name || 'Untitled Module'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.subjectName} - {module.courseName}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {((module.hasVideo && module.videoTitle) || (module.videos && module.videos.length > 0)) && (
                            <Badge variant="secondary" className="gap-1">
                              <Video className="h-3 w-3" />
                              Video{(module.videos && module.videos.length > 1) ? `s (${module.videos.length})` : ''}
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
                          {!((module.hasVideo && module.videoTitle) || (module.videos && module.videos.length > 0)) && !module.hasNotes && (
                            <Badge variant="outline">No content yet</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/courses/edit-module/${module.moduleNumber}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Module
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {(module.hasVideo || module.hasNotes) && (
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Replace className="h-4 w-4 mr-2" />
                                  Replace Content
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {/* Video replace options */}
                                  {((module.hasVideo && module.videoTitle) || (module.videos && module.videos.length > 0)) && (
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger>
                                        <Video className="h-4 w-4 mr-2" />
                                        Replace Video
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent>
                                        {module.videos && module.videos.length > 0 ? (
                                          // Multiple videos - show individual options
                                          module.videos.map((video: any, index: number) => (
                                            <DropdownMenuItem
                                              key={index}
                                              onClick={() => handleReplaceUpload(module, 'video', index)}
                                              disabled={updatingContent === `replace-${module.uniqueKey}`}
                                            >
                                              <Video className="h-4 w-4 mr-2" />
                                              Replace "{video.title}" (Video {index + 1})
                                            </DropdownMenuItem>
                                          ))
                                        ) : (
                                          // Single video fallback
                                          <DropdownMenuItem
                                            onClick={() => handleReplaceUpload(module, 'video')}
                                            disabled={updatingContent === `replace-${module.uniqueKey}`}
                                          >
                                            <Video className="h-4 w-4 mr-2" />
                                            Replace Video
                                          </DropdownMenuItem>
                                        )}
                                        {/* Option to add new video */}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleReplaceUpload(module, 'video')}
                                          disabled={updatingContent === `replace-${module.uniqueKey}`}
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add New Video
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                  )}
                                  {/* Notes replace option */}
                                  {module.hasNotes && (
                                    <DropdownMenuItem
                                      onClick={() => handleReplaceUpload(module, 'notes')}
                                      disabled={updatingContent === `replace-${module.uniqueKey}`}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      Replace Notes
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            )}
                            <DropdownMenuSeparator />
                            {module.hasVideo && (
                              <DropdownMenuItem
                                onClick={() => handleRemoveVideo(module)}
                                disabled={updatingContent === `video-${module.uniqueKey}`}
                                className="text-red-600 focus:text-red-600"
                              >
                                {updatingContent === `video-${module.uniqueKey}` ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Video className="h-4 w-4 mr-2" />
                                )}
                                Remove Video
                              </DropdownMenuItem>
                            )}
                            {module.hasNotes && (
                              <DropdownMenuItem
                                onClick={() => handleRemoveNotes(module)}
                                disabled={updatingContent === `notes-${module.uniqueKey}`}
                                className="text-red-600 focus:text-red-600"
                              >
                                {updatingContent === `notes-${module.uniqueKey}` ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <FileText className="h-4 w-4 mr-2" />
                                )}
                                Remove Notes
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setModuleToDelete(module);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Module
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Display all videos */}
                      {((module.hasVideo && module.videoTitle) || (module.videos && module.videos.length > 0)) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                            <Video className="h-4 w-4" />
                            Video Content
                          </div>
                          {module.videos && module.videos.length > 0 ? (
                            // Display multiple videos
                            module.videos.map((video: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm pl-6 border-l-2 border-blue-200">
                                <div className="flex-1">
                                  <p className="font-medium">{video.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Video {index + 1} {video.duration && `• ${video.duration}`}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            // Fallback for single video (backward compatibility)
                            <div className="flex items-center gap-2 text-sm pl-6 border-l-2 border-blue-200">
                              <div className="flex-1">
                                <p className="font-medium">{module.videoTitle}</p>
                                <p className="text-xs text-muted-foreground">Video lecture</p>
                              </div>
                            </div>
                          )}
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
                    {!((module.hasVideo && module.videoTitle) || (module.videos && module.videos.length > 0)) && !module.hasNotes && (
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
              Are you sure you want to delete Module {moduleToDelete?.moduleNumber}: {moduleToDelete?.moduleName}?
              This action cannot be undone and will remove all associated content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Replace Upload Dialog */}
      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {videoToReplace !== null && videoToReplace !== undefined ? 'Replace' : 'Add'} {replaceType === 'video' ? 'Video' : 'Notes'}
            </DialogTitle>
            <DialogDescription>
              {videoToReplace !== null && videoToReplace !== undefined
                ? `Update the ${replaceType} content for Module ${moduleToReplace?.moduleNumber}: ${moduleToReplace?.moduleName}`
                : `Add new ${replaceType} content to Module ${moduleToReplace?.moduleNumber}: ${moduleToReplace?.moduleName}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={replaceForm.title}
                onChange={(e) => setReplaceForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder={`Enter ${replaceType} title`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                accept={replaceType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.txt,.ppt,.pptx,image/*'}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setReplaceForm(prev => ({ ...prev, file }));
                }}
              />
              {replaceForm.file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {replaceForm.file.name} ({(replaceForm.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            {replaceType === 'video' && (
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={replaceForm.duration}
                  onChange={(e) => setReplaceForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 10:30"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReplaceDialogOpen(false);
                setModuleToReplace(null);
                setReplaceType(null);
                setVideoToReplace(null);
                setReplaceForm({ file: null, title: '', duration: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReplaceSubmit}
              disabled={updatingContent === `replace-${moduleToReplace?.uniqueKey}` || uploadingFile || !replaceForm.file || !replaceForm.title.trim()}
            >
              {updatingContent === `replace-${moduleToReplace?.uniqueKey}` || uploadingFile ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {uploadingFile ? 'Uploading...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Replace className="h-4 w-4 mr-2" />
                  {videoToReplace !== null && videoToReplace !== undefined ? 'Replace' : 'Add'} {replaceType === 'video' ? 'Video' : 'Notes'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
