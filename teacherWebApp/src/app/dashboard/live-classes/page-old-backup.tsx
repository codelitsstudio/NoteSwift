import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Users, PlayCircle, UserPlus, Settings, TrendingUp, Plus, VideoIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

async function getData() {
  const now = Date.now();
  return {
    // Student teams for organizing classes
    studentTeams: [
      {
        _id: 'team1',
        name: 'Full Class',
        description: 'All Grade 11 Mathematics students',
        students: ['Jane Smith', 'Mike Johnson', 'Emily Davis'],
        studentCount: 3,
        color: 'blue'
      },
      {
        _id: 'team2',
        name: 'Advanced Group',
        description: 'High performers needing challenge',
        students: ['Jane Smith', 'Emily Davis'],
        studentCount: 2,
        color: 'green'
      },
      {
        _id: 'team3',
        name: 'Support Group',
        description: 'Students needing extra help',
        students: ['Mike Johnson'],
        studentCount: 1,
        color: 'yellow'
      }
    ],
    upcomingClasses: [
      { 
        _id: '1', 
        title: 'Calculus - Differentiation Basics',
        course: 'Grade 11 Study Package',
        chapter: 'Calculus',
        scheduledAt: new Date(now + 3600000).toISOString(),
        durationMinutes: 60,
        participants: 'Full Class (3 students)',
        participantCount: 3,
        status: 'scheduled',
        meetingCode: 'xyz-abc-def'
      },
      { 
        _id: '2', 
        title: 'Trigonometry - Problem Solving',
        course: 'Grade 11 Study Package',
        chapter: 'Trigonometry',
        scheduledAt: new Date(now + 86400000).toISOString(),
        durationMinutes: 90,
        participants: 'Full Class (3 students)',
        participantCount: 3,
        status: 'scheduled',
        meetingCode: 'pqr-stu-vwx'
      }
    ],
    pastClasses: [
      { 
        _id: '4', 
        title: 'Quadratic Equations Review',
        course: 'Grade 11 Study Package',
        chapter: 'Quadratic Equations',
        scheduledAt: new Date(now - 86400000).toISOString(),
        durationMinutes: 60,
        participants: 'Full Class',
        actualAttendees: 3,
        recordingAvailable: true,
        recordingViews: 2
      },
      { 
        _id: '5', 
        title: 'Coordinate Geometry Deep Dive',
        course: 'Grade 11 Study Package',
        chapter: 'Coordinate Geometry',
        scheduledAt: new Date(now - 172800000).toISOString(),
        durationMinutes: 90,
        participants: 'Advanced Group',
        actualAttendees: 2,
        recordingAvailable: true,
        recordingViews: 5
      }
    ],
    stats: {
      totalClassesThisMonth: 4,
      averageAttendance: 100,
      totalRecordingViews: 7,
      totalLiveHours: 6
    }
  };
}

export default async function LiveClassesPage() {
  const { studentTeams, upcomingClasses, pastClasses, stats } = await getData();

  const getTeamColor = (color: string) => {
    const colors: Record<string, string> = {
      'blue': 'bg-blue-100 text-blue-700 border-blue-200',
      'green': 'bg-green-100 text-green-700 border-green-200',
      'yellow': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'red': 'bg-red-100 text-red-700 border-red-200',
      'purple': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[color] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
        <p className="text-muted-foreground mt-2">
          Start instant classes or schedule sessions with your Grade 11 Mathematics students
        </p>
      </div>

      {/* Quick Actions - Google Meet Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-4 rounded-2xl">
                <VideoIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Start Instant Class</h3>
                <p className="text-sm text-muted-foreground">
                  Begin a class immediately with students
                </p>
              </div>
            </div>
            <Link href="/dashboard/live-classes/instant">
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" size="lg">
                <Video className="mr-2 h-5 w-5" />
                Start Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-4 rounded-2xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Schedule a Class</h3>
                <p className="text-sm text-muted-foreground">
                  Plan a class for later with notifications
                </p>
              </div>
            </div>
            <Link href="/dashboard/live-classes/schedule">
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Class
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Classes This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-600" />
              {stats.totalClassesThisMonth}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Active teaching</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              {stats.averageAttendance}%
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Excellent!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recording Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <PlayCircle className="h-6 w-6 text-purple-600" />
              {stats.totalRecordingViews}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Students reviewing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Live Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-600" />
              {stats.totalLiveHours}h
            </div>
            <p className="text-xs mt-1 text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Your Classes
              </CardTitle>
              <CardDescription>
                Manage upcoming sessions, view history, and organize student teams
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming ({upcomingClasses.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastClasses.length})</TabsTrigger>
              <TabsTrigger value="teams">Student Teams ({studentTeams.length})</TabsTrigger>
            </TabsList>

            {/* Upcoming Classes */}
            <TabsContent value="upcoming" className="space-y-4 mt-4">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.map((cls: any) => (
                  <Card key={cls._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{cls.title}</h3>
                            <Badge variant="outline" className="bg-blue-50">Scheduled</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>{cls.course} • {cls.chapter}</p>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(cls.scheduledAt).toLocaleString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {cls.durationMinutes} minutes
                            </p>
                            <p className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {cls.participants}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Video className="mr-2 h-4 w-4" />
                          Start Class
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Copy Meeting Code
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming classes scheduled</p>
                  <Link href="/dashboard/live-classes/schedule">
                    <Button className="mt-4">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Your First Class
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Past Classes Tab */}
            <TabsContent value="past" className="space-y-4 mt-4">
              {pastClasses.map((cls: any) => (
                <Card key={cls._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{cls.subject}</CardTitle>
                        <CardDescription>
                          {cls.course} • {new Date(cls.scheduledAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getPlatformBadge(cls.platform)}>
                        {cls.platform.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Attendance</p>
                        <p className="text-xl font-bold">
                          {cls.actualAttendees}/{cls.enrolledStudents}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((cls.actualAttendees / cls.enrolledStudents) * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recording Views</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {cls.recordingViews}
                        </p>
                        <p className="text-xs text-muted-foreground">Total views</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Watch Time</p>
                        <p className="text-xl font-bold">{cls.averageWatchTime} min</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((cls.averageWatchTime / cls.durationMinutes) * 100)}% of class
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Engagement</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {cls.chatMessages}
                        </p>
                        <p className="text-xs text-muted-foreground">{cls.pollsCreated} polls</p>
                      </div>
                    </div>
                    <Progress 
                      value={(cls.actualAttendees / cls.enrolledStudents) * 100} 
                      className="h-2 mb-4" 
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Watch Recording
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline">View Attendance</Button>
                      <Button variant="outline">Analytics</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Recordings Library Tab */}
            <TabsContent value="recordings" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastClasses.map((cls: any) => (
                  <Card key={cls._id}>
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-2">
                        <PlayCircle className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-base">{cls.subject}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(cls.scheduledAt).toLocaleDateString()} • {cls.durationMinutes} min
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Views</span>
                          <span className="font-medium">{cls.recordingViews}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Watch Time</span>
                          <span className="font-medium">{cls.averageWatchTime} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Attendance</span>
                          <span className="font-medium">{cls.actualAttendees} students</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Play
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Attendance Trends</CardTitle>
                    <CardDescription>Student participation over the last 6 classes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pastClasses.map((cls: any, idx: number) => (
                        <div key={cls._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{cls.subject.substring(0, 20)}...</span>
                            <span className="text-muted-foreground">
                              {cls.actualAttendees}/{cls.enrolledStudents}
                            </span>
                          </div>
                          <Progress 
                            value={(cls.actualAttendees / cls.enrolledStudents) * 100} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recording Engagement</CardTitle>
                    <CardDescription>Most watched recordings and completion rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pastClasses
                        .sort((a: any, b: any) => b.recordingViews - a.recordingViews)
                        .map((cls: any) => (
                          <div key={cls._id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{cls.subject.substring(0, 20)}...</span>
                              <span className="text-muted-foreground">{cls.recordingViews} views</span>
                            </div>
                            <Progress 
                              value={(cls.recordingViews / cls.enrolledStudents) * 100} 
                              className="h-2" 
                            />
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Platform Usage</CardTitle>
                    <CardDescription>Distribution of classes across platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="text-sm">Zoom</span>
                        <Badge className="bg-blue-500">
                          {pastClasses.filter((c: any) => c.platform === 'zoom').length} classes
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">Google Meet</span>
                        <Badge className="bg-red-500">
                          {pastClasses.filter((c: any) => c.platform === 'google-meet').length} classes
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm">Jitsi</span>
                        <Badge className="bg-green-500">
                          {pastClasses.filter((c: any) => c.platform === 'jitsi').length} classes
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Session Insights</CardTitle>
                    <CardDescription>Average metrics across all live classes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Session Duration</span>
                        <span className="text-lg font-bold">
                          {Math.round(pastClasses.reduce((sum: number, c: any) => sum + c.durationMinutes, 0) / pastClasses.length)} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Chat Messages</span>
                        <span className="text-lg font-bold">
                          {Math.round(pastClasses.reduce((sum: number, c: any) => sum + c.chatMessages, 0) / pastClasses.length)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Polls per Class</span>
                        <span className="text-lg font-bold">
                          {Math.round(pastClasses.reduce((sum: number, c: any) => sum + c.pollsCreated, 0) / pastClasses.length)}
                        </span>
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
