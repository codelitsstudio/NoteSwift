import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Users, PlayCircle, UserPlus, Settings, Plus, VideoIcon, Eye } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Live Classes</h1>
        <p className="text-muted-foreground mt-2">
          Start instant classes or schedule sessions with your Grade 11 Mathematics students
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-8 w-8 text-blue-600 pr-1" />
              Start Instant Class 
            </CardTitle>
            <CardDescription className="text-sm">
              Begin a class immediately with students
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/dashboard/live-classes/instant">
              <Button className="w-full">
                Start Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-8 w-8 text-blue-600 pr-1" />
              Schedule a Class
            </CardTitle>
            <CardDescription className="text-sm">
              Plan a class for later with notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/dashboard/live-classes/schedule">
              <Button className="w-full">
                Schedule Class
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
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
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
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
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
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
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
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
            <TabsContent value="upcoming" className="space-y-3 mt-4">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.map((cls: any) => (
                  <Card key={cls._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold">{cls.title}</h3>
                            <Badge variant="outline" className="bg-blue-50 text-xs">Scheduled</Badge>
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

            {/* Past Classes */}
            <TabsContent value="past" className="space-y-3 mt-4">
              {pastClasses.length > 0 ? (
                pastClasses.map((cls: any) => (
                  <Card key={cls._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold">{cls.title}</h3>
                            <Badge variant="secondary" className="text-xs">Completed</Badge>
                            {cls.recordingAvailable && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">Recording Available</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>{cls.course} • {cls.chapter}</p>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(cls.scheduledAt).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {cls.actualAttendees} attended • {cls.participants}
                            </p>
                            {cls.recordingAvailable && (
                              <p className="flex items-center gap-2">
                                <PlayCircle className="h-4 w-4" />
                                {cls.recordingViews} recording views
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {cls.recordingAvailable && (
                          <Button size="sm" variant="outline">
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Watch Recording
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          View Analytics
                        </Button>
                        <Button size="sm" variant="outline">
                          Schedule Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No past classes yet</p>
                </div>
              )}
            </TabsContent>

            {/* Student Teams */}
            <TabsContent value="teams" className="space-y-3 mt-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-muted-foreground">
                  Organize students into teams for targeted live classes
                </p>
                <Link href="/dashboard/live-classes/teams/new">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentTeams.map((team: any) => (
                  <Card key={team._id} className={`border-2 ${getTeamColor(team.color)}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-1">{team.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {team.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{team.studentCount}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-medium text-muted-foreground">Students:</p>
                        <div className="flex flex-wrap gap-1">
                          {team.students.map((student: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {student}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/live-classes/instant?team=${team._id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Video className="mr-2 h-4 w-4" />
                            Instant
                          </Button>
                        </Link>
                        <Link href={`/dashboard/live-classes/schedule?team=${team._id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {studentTeams.length === 0 && (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No student teams created yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create teams to organize students for group classes
                  </p>
                  <Link href="/dashboard/live-classes/teams/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Team
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
