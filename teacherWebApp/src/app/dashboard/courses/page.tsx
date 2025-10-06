// BACKEND TEMPORARILY DISABLED FOR FRONTEND DEVELOPMENT
// import dbConnect from "@/lib/mongoose";
// import Course from "@/models/Course";
// import Chapter from "@/models/Chapter";
// import Content from "@/models/Content";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, FileArchive, CheckSquare, HelpCircle, BarChart3, Users, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getData() {
  // MOCK DATA FOR FRONTEND DEVELOPMENT
  return {
    courses: [
      { 
        _id: '1', 
        title: 'Grade 11 Study Package', 
        subject: 'Mathematics',
        totalChapters: 8,
        completedChapters: 5,
        totalStudents: 3,
        avgProgress: 85,
        lastUpdated: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    chapters: [
      { _id: 'ch1', course: '1', title: 'Algebra - Quadratic Equations', order: 1, contentCount: 6, studentsCompleted: 3, duration: '120 min' },
      { _id: 'ch2', course: '1', title: 'Calculus - Differentiation', order: 2, contentCount: 5, studentsCompleted: 2, duration: '90 min' },
      { _id: 'ch3', course: '1', title: 'Trigonometry - Advanced', order: 3, contentCount: 7, studentsCompleted: 2, duration: '150 min' },
      { _id: 'ch4', course: '1', title: 'Coordinate Geometry', order: 4, contentCount: 8, studentsCompleted: 3, duration: '180 min' },
      { _id: 'ch5', course: '1', title: 'Statistics and Probability', order: 5, contentCount: 6, studentsCompleted: 1, duration: '120 min' }
    ],
    contents: [
      { _id: 'c1', chapter: 'ch1', type: 'video', title: 'Quadratic Equations - Introduction', url: 'https://example.com/video1', views: 3, duration: '25 min' },
      { _id: 'c2', chapter: 'ch1', type: 'pdf', title: 'Quadratic Equations Notes', url: 'https://example.com/notes1.pdf', downloads: 3 },
      { _id: 'c3', chapter: 'ch1', type: 'slides', title: 'Quadratic Formula Presentation', url: 'https://example.com/slides1', views: 3 },
      { _id: 'c4', chapter: 'ch2', type: 'assignment', title: 'Differentiation Assignment', deadline: new Date(Date.now() + 604800000).toISOString(), submissions: 2, total: 3 },
      { _id: 'c5', chapter: 'ch2', type: 'video', title: 'Calculus Fundamentals', url: 'https://example.com/video2', views: 3, duration: '30 min' },
      { _id: 'c6', chapter: 'ch2', type: 'question_bank', title: 'Calculus Practice Questions', questions: 30, attempted: 2 }
    ],
    stats: {
      totalContent: 32,
      videosUploaded: 8,
      pdfDocuments: 12,
      assignmentsCreated: 5,
      questionBanks: 7
    }
  };
}

export default async function CoursesPage() {
  const { courses, chapters, contents, stats } = await getData();
  const coursesWithChapters = courses.map((course: any) => ({
    ...course,
    chapters: chapters
      .filter((ch: any) => ch.course === course._id)
      .map((ch: any) => ({
        ...ch,
        contents: contents.filter((c: any) => c.chapter === ch._id),
      })),
  }));

  const getContentIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'slides': return <FileArchive className="h-4 w-4" />;
      case 'assignment': return <CheckSquare className="h-4 w-4" />;
      case 'question_bank': return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
            <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Courses</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage chapters and content for your assigned course: Grade 11 Mathematics</p>
      </div>

      {/* Content Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent}</div>
            <p className="text-xs mt-1 text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Video Lectures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-500" />
              {stats.videosUploaded}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Hours of content</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">PDF Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              {stats.pdfDocuments}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Study materials</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-orange-500" />
              {stats.assignmentsCreated}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50/60 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Question Banks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              {stats.questionBanks}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Practice sets</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Upload Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Create New Chapter
            </CardTitle>
            <CardDescription>
              Add a new chapter to organize your course content. Chapters help structure your curriculum and track student progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <a href="/dashboard/courses/new-chapter">Go to Create Chapter</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/dashboard/courses">Learn More</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Content
            </CardTitle>
            <CardDescription>
              Upload videos, PDFs, presentations, or other learning materials. Support for multiple formats and bulk uploads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <a href="/dashboard/courses/upload-content">Go to Upload Page</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/dashboard/courses">Content Guidelines</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Overview with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Course Library & Analytics
          </CardTitle>
          <CardDescription>
            View all your courses, manage chapters and content, and monitor student engagement and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 min-w-max">
              <TabsTrigger value="overview">Course Overview</TabsTrigger>
              <TabsTrigger value="content">Content Library</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            </div>

            {/* Course Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {coursesWithChapters.map((course: any) => (
                <Card key={course._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="secondary">{course.subject}</Badge>
                          <span className="ml-2 text-sm">Last updated: {new Date(course.lastUpdated).toLocaleDateString()}</span>
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">Edit Course</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Chapters</p>
                        <p className="text-2xl font-bold">{course.totalChapters}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{course.completedChapters}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Enrolled Students</p>
                        <p className="text-2xl font-bold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.totalStudents}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Progress</p>
                        <p className="text-2xl font-bold text-blue-600">{course.avgProgress}%</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Chapters ({course.chapters.length})</h4>
                        <Button variant="ghost" size="sm">+ Add Chapter</Button>
                      </div>
                      <div className="space-y-3">
                        {course.chapters.map((chapter: any) => (
                          <div key={chapter._id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h5 className="font-medium">{chapter.order}. {chapter.title}</h5>
                                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {chapter.contentCount} items
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {chapter.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {chapter.studentsCompleted}/{course.totalStudents} completed
                                  </span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">Manage</Button>
                            </div>
                            <Progress value={(chapter.studentsCompleted / course.totalStudents) * 100} className="h-2" />
                            {chapter.contents && chapter.contents.length > 0 && (
                              <div className="mt-3 space-y-1">
                                {chapter.contents.map((content: any) => (
                                  <div key={content._id} className="flex items-center gap-2 text-sm ml-4">
                                    {getContentIcon(content.type)}
                                    <span>{content.title}</span>
                                    <Badge variant="outline" className="ml-auto">{content.type}</Badge>
                                    {content.views && <span className="text-muted-foreground text-xs">{content.views} views</span>}
                                    {content.downloads && <span className="text-muted-foreground text-xs">{content.downloads} downloads</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Content Library Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm">All</Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4 mr-1" />
                  Videos
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Documents
                </Button>
                <Button variant="outline" size="sm">
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Assignments
                </Button>
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Question Banks
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contents.map((content: any) => {
                  const chapter = chapters.find((ch: any) => ch._id === content.chapter);
                  const course = courses.find((c: any) => c._id === chapter?.course);
                  return (
                    <Card key={content._id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getContentIcon(content.type)}
                            <Badge variant="secondary">{content.type}</Badge>
                          </div>
                          <Button variant="ghost" size="sm">•••</Button>
                        </div>
                        <CardTitle className="text-base mt-2">{content.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {course?.title} / {chapter?.title}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {content.views && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Views</span>
                              <span className="font-medium">{content.views}</span>
                            </div>
                          )}
                          {content.downloads && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Downloads</span>
                              <span className="font-medium">{content.downloads}</span>
                            </div>
                          )}
                          {content.duration && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration</span>
                              <span className="font-medium">{content.duration}</span>
                            </div>
                          )}
                          {content.submissions !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Submissions</span>
                              <span className="font-medium">{content.submissions}/{content.total}</span>
                            </div>
                          )}
                          {content.questions && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Questions</span>
                              <span className="font-medium">{content.questions} total</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">View</Button>
                          <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Content Engagement</CardTitle>
                    <CardDescription>Most viewed and downloaded content this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Introduction to Algebra</span>
                          <span className="text-muted-foreground">42 views</span>
                        </div>
                        <Progress value={84} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Geometry Fundamentals</span>
                          <span className="text-muted-foreground">40 views</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Algebra Notes PDF</span>
                          <span className="text-muted-foreground">38 downloads</span>
                        </div>
                        <Progress value={76} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Student Progress by Course</CardTitle>
                    <CardDescription>Average completion rates across courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {courses.map((course: any) => (
                        <div key={course._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{course.title}</span>
                            <span className="text-muted-foreground">{course.avgProgress}%</span>
                          </div>
                          <Progress value={course.avgProgress} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Content Performance</CardTitle>
                    <CardDescription>Content effectiveness and student feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span>High Engagement Content</span>
                        <Badge variant="default" className="bg-green-600">28 items</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-yellow-50 rounded">
                        <span>Needs Improvement</span>
                        <Badge variant="default" className="bg-yellow-600">12 items</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-red-50 rounded">
                        <span>Low Engagement</span>
                        <Badge variant="default" className="bg-red-600">5 items</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Content Uploads Timeline</CardTitle>
                    <CardDescription>Weekly upload activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>This Week</span>
                        <div className="flex items-center gap-2">
                          <Progress value={75} className="h-2 w-24" />
                          <span className="font-medium">18 uploads</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Last Week</span>
                        <div className="flex items-center gap-2">
                          <Progress value={60} className="h-2 w-24" />
                          <span className="font-medium">15 uploads</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>2 Weeks Ago</span>
                        <div className="flex items-center gap-2">
                          <Progress value={45} className="h-2 w-24" />
                          <span className="font-medium">11 uploads</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
