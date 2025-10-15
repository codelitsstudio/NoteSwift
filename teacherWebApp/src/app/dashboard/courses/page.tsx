import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, CheckCircle, Edit, Trash2 } from "lucide-react";
import teacherAPI from "@/lib/api/teacher-api";
import Link from "next/link";

async function getData() {
  const teacherEmail = "teacher@example.com"; // TODO: Get from auth
  
  try {
    const response = await teacherAPI.courses.getSubjectContent(teacherEmail);
    const { subjectContent, course, stats } = response.data || {};

    if (!subjectContent || !course) {
      return {
        course: null,
        modules: [],
        stats: {
          totalModules: 0,
          completedModules: 0,
          totalContent: 0,
          videosUploaded: 0,
          notesUploaded: 0,
          testsCreated: 0,
          liveClassesScheduled: 0
        }
      };
    }

    return {
      course: {
        _id: course._id,
        title: course.title,
        subject: course.subjectName,
        description: course.description,
        program: course.program
      },
      modules: subjectContent.modules.map((mod: any) => ({
        _id: mod._id || mod.moduleNumber,
        moduleNumber: mod.moduleNumber,
        title: mod.moduleName,
        order: mod.order,
        hasVideo: mod.hasVideo,
        hasNotes: mod.hasNotes,
        hasTest: mod.hasTest,
        hasLiveClass: mod.hasLiveClass,
        videoUrl: mod.videoUrl,
        videoTitle: mod.videoTitle,
        notesUrl: mod.notesUrl,
        notesTitle: mod.notesTitle,
        isActive: mod.isActive
      })),
      stats: stats || {}
    };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return {
      course: null,
      modules: [],
      stats: {
        totalModules: 0,
        completedModules: 0,
        totalContent: 0,
        videosUploaded: 0,
        notesUploaded: 0,
        testsCreated: 0,
        liveClassesScheduled: 0
      }
    };
  }
}

export default async function CoursesPage() {
  const { course, modules, stats } = await getData();

  if (!course) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Course</h1>
          <p className="text-sm sm:text-base text-muted-foreground">No course assigned yet</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You haven't been assigned to any course yet. Contact your administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Course</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {course.title} - {course.subject}
        </p>
      </div>

      {/* Content Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModules || 0}</div>
            <p className="text-xs mt-1 text-muted-foreground">Topics</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Video Lectures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.videosUploaded || 0}</div>
            <p className="text-xs mt-1 text-muted-foreground">Videos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">PDF Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notesUploaded || 0}</div>
            <p className="text-xs mt-1 text-muted-foreground">Documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testsCreated || 0}</div>
            <p className="text-xs mt-1 text-muted-foreground">Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Live Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.liveClassesScheduled || 0}</div>
            <p className="text-xs mt-1 text-muted-foreground">Scheduled</p>
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
                <Card key={module._id} className="border-l-4 border-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Module {module.moduleNumber}: {module.title}
                        </CardTitle>
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
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
    </div>
  );
}
