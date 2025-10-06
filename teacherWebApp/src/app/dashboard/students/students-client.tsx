"use client";

import { useTeacher } from '@/context/teacher-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Calendar, BarChart3, CheckCircle, Award, Search, UserPlus, Trash2, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportCSVButton } from "@/components/ui/export-csv";
import { ExportPDFButton } from "@/components/ui/export-pdf";
import { useMemo, useState } from 'react';

interface StudentData {
  _id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  overallProgress: number;
  attendanceRate: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  averageScore: number;
  lastActive: string;
  joinedDate: string;
  progress: any;
}

export function StudentsClient({ allStudents, attendance, allStats, courses }: any) {
  const { assignedCourses, isLoading } = useTeacher();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teams, setTeams] = useState([
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
    }
  ]);

  // Filter students to only show those enrolled in teacher's assigned courses
  const filteredStudents = useMemo(() => {
    if (isLoading || assignedCourses.length === 0) {
      return [];
    }

    const teacherCourseNames = assignedCourses.map(ac => ac.courseName);
    
    return allStudents.filter((student: StudentData) => 
      student.enrolledCourses.some(course => 
        teacherCourseNames.some(tcName => course.includes(tcName))
      )
    );
  }, [allStudents, assignedCourses, isLoading]);

  // Filter by search query
  const searchFilteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return filteredStudents;
    
    const query = searchQuery.toLowerCase();
    return filteredStudents.filter((student: StudentData) =>
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  }, [filteredStudents, searchQuery]);

  // Recalculate stats based on filtered students
  const stats = useMemo(() => {
    if (filteredStudents.length === 0) {
      return { totalStudents: 0, activeStudents: 0, avgAttendance: 0, avgProgress: 0 };
    }

    const activeStudents = filteredStudents.filter((s: StudentData) => 
      new Date(s.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const avgAttendance = Math.round(
      filteredStudents.reduce((sum: number, s: StudentData) => sum + s.attendanceRate, 0) / filteredStudents.length
    );

    const avgProgress = Math.round(
      filteredStudents.reduce((sum: number, s: StudentData) => sum + s.overallProgress, 0) / filteredStudents.length
    );

    return {
      totalStudents: filteredStudents.length,
      activeStudents,
      avgAttendance,
      avgProgress,
    };
  }, [filteredStudents]);

  const topPerformers = useMemo(() => 
    [...filteredStudents].sort((a: StudentData, b: StudentData) => b.averageScore - a.averageScore).slice(0, 5),
    [filteredStudents]
  );

  const needsAttention = useMemo(() =>
    filteredStudents.filter((s: StudentData) => s.averageScore < 60 || s.attendanceRate < 75),
    [filteredStudents]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your students...</p>
        </div>
      </div>
    );
  }

  if (assignedCourses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Course Assignments</CardTitle>
            <CardDescription>
              You haven't been assigned any courses yet. Please contact your administrator to get courses assigned.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Students</h1>
        <p className="text-muted-foreground mt-2">
          Students enrolled in your assigned courses: {assignedCourses.map(ac => `${ac.courseName} (${ac.subject})`).join(', ')}
        </p>
      </div>

      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              {stats.totalStudents}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Enrolled in your courses</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              {stats.activeStudents}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Active this week</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              {stats.avgAttendance}%
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              {stats.avgProgress}%
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Course completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
            <CardDescription>Students with highest average scores in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <div className="space-y-3">
                {topPerformers.map((student: StudentData, index: number) => (
                  <div key={student._id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-gray-700 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                    <Badge className="bg-blue-500">{student.averageScore}%</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No students to display</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance Trends
            </CardTitle>
            <CardDescription>Daily attendance for the last 5 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendance.map((record: any) => (
                <div key={record.date}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">
                      {record.present}/{record.total} ({Math.round((record.present / record.total) * 100)}%)
                    </span>
                  </div>
                  <Progress value={(record.present / record.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Student Directory & Analytics
          </CardTitle>
          <CardDescription>
            View your students, track individual progress, monitor attendance, and analyze performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="directory" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-5 min-w-max">
                <TabsTrigger value="directory">Directory ({searchFilteredStudents.length})</TabsTrigger>
                <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
                <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>

            {/* Student Directory Tab */}
            <TabsContent value="directory" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search students by name or email..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ExportCSVButton filename="my_students" rows={searchFilteredStudents} headers={["name","email"]} />
                <ExportPDFButton filename="my_students" html={`<h1>My Students</h1>${searchFilteredStudents.map((s:any)=>`<div><strong>${s.name}</strong> - ${s.email}</div>`).join("")}`} />
              </div>
              
              {searchFilteredStudents.length > 0 ? (
                <div className="space-y-3">
                  {searchFilteredStudents.map((student: StudentData) => (
                    <Card key={student._id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base">{student.name}</CardTitle>
                            <CardDescription>{student.email}</CardDescription>
                            <div className="flex gap-2 mt-2">
                              {student.enrolledCourses.map((course: string) => (
                                <Badge key={course} variant="secondary">{course}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{student.averageScore}%</div>
                            <div className="text-xs text-muted-foreground">Avg Score</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Progress</div>
                          <Progress value={student.overallProgress} className="h-2 mt-1" />
                          <div className="text-xs font-medium mt-1">{student.overallProgress}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Attendance</div>
                          <Progress value={student.attendanceRate} className="h-2 mt-1" />
                          <div className="text-xs font-medium mt-1">{student.attendanceRate}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Assignments</div>
                          <div className="text-sm font-medium mt-1">
                            {student.assignmentsCompleted}/{student.totalAssignments}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Last Active</div>
                          <div className="text-xs font-medium mt-1">
                            {new Date(student.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No students found matching your search' : 'No students enrolled in your courses yet'}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-4 mt-4">
              {/* Create Team Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Create New Team
                  </CardTitle>
                  <CardDescription>
                    Select students from your class to create a team for live classes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Team Name</label>
                      <Input 
                        placeholder="e.g., Advanced Group, Study Group A" 
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Input 
                        placeholder="Brief description of the team" 
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Students</label>
                    <div className="space-y-2 border rounded-lg p-3 max-h-60 overflow-y-auto">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student: StudentData) => (
                          <div key={student._id} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                            <Checkbox 
                              checked={selectedStudents.includes(student.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedStudents([...selectedStudents, student.name]);
                                } else {
                                  setSelectedStudents(selectedStudents.filter(s => s !== student.name));
                                }
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                            <Badge variant="secondary">{student.averageScore}%</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No students available
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedStudents.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">
                        {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                      </span>
                      <Button 
                        onClick={() => {
                          if (teamName.trim()) {
                            const newTeam = {
                              _id: `team${teams.length + 1}`,
                              name: teamName,
                              description: teamDescription || 'No description',
                              students: selectedStudents,
                              studentCount: selectedStudents.length,
                              color: ['blue', 'green', 'yellow', 'purple', 'red'][teams.length % 5]
                            };
                            setTeams([...teams, newTeam]);
                            setTeamName('');
                            setTeamDescription('');
                            setSelectedStudents([]);
                          }
                        }}
                        disabled={!teamName.trim()}
                      >
                        Create Team
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Existing Teams */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Your Teams</h3>
                {teams.length > 0 ? (
                  teams.map((team) => {
                    const getTeamColorClass = (color: string) => {
                      const colors: Record<string, string> = {
                        'blue': 'bg-blue-50 border-blue-200',
                        'green': 'bg-green-50 border-green-200',
                        'yellow': 'bg-yellow-50 border-yellow-200',
                        'red': 'bg-red-50 border-red-200',
                        'purple': 'bg-purple-50 border-purple-200'
                      };
                      return colors[color] || 'bg-gray-50 border-gray-200';
                    };

                    return (
                      <Card key={team._id} className={getTeamColorClass(team.color)}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{team.name}</CardTitle>
                              <CardDescription>{team.description}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setTeams(teams.filter(t => t._id !== team._id));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{team.studentCount} Students</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {team.students.map((studentName: string, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {studentName}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No teams created yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create teams to organize students for live classes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Other tabs can be similarly implemented */}
            <TabsContent value="progress" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                Progress tracking view for your students
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select a student from the directory to mark attendance
                </p>
                {searchFilteredStudents.length > 0 ? (
                  <div className="grid gap-3">
                    {searchFilteredStudents.map((student: StudentData) => (
                      <Card key={student._id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-sm">{student.name}</CardTitle>
                              <CardDescription className="text-xs">{student.email}</CardDescription>
                            </div>
                            <Badge>{student.attendanceRate}% attendance</Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No students to display
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                Analytics view for your students' performance
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {needsAttention.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-600">Students Needing Attention</CardTitle>
            <CardDescription>Students with low scores or poor attendance in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {needsAttention.map((student: StudentData) => (
                <div key={student._id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {student.averageScore < 60 && (
                      <Badge variant="destructive">Low Score: {student.averageScore}%</Badge>
                    )}
                    {student.attendanceRate < 75 && (
                      <Badge variant="destructive">Low Attendance: {student.attendanceRate}%</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
