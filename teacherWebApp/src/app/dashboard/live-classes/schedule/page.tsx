"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Users, Clock, ArrowLeft, Bell } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ScheduleClassPage() {
  const router = useRouter();
  const [classTitle, setClassTitle] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [duration, setDuration] = useState('60');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Mock data
  const students = [
    { _id: 's1', name: 'Jane Smith', email: 'jane@example.com' },
    { _id: 's2', name: 'Mike Johnson', email: 'mike@example.com' },
    { _id: 's3', name: 'Emily Davis', email: 'emily@example.com' }
  ];

  const teams = [
    { _id: 'team1', name: 'Full Class', studentCount: 3, students: ['Jane Smith', 'Mike Johnson', 'Emily Davis'] },
    { _id: 'team2', name: 'Advanced Group', studentCount: 2, students: ['Jane Smith', 'Emily Davis'] },
    { _id: 'team3', name: 'Support Group', studentCount: 1, students: ['Mike Johnson'] }
  ];

  const chapters = [
    'Quadratic Equations',
    'Calculus',
    'Trigonometry',
    'Coordinate Geometry',
    'Statistics'
  ];

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudents(students.map(s => s._id));
      setSelectedTeams([]);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleTeamSelect = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(t => t !== teamId));
    } else {
      setSelectedTeams([...selectedTeams, teamId]);
      setSelectAll(false);
      const team = teams.find(t => t._id === teamId);
      if (team) {
        const teamStudentIds = students
          .filter(s => team.students.includes(s.name))
          .map(s => s._id);
        const newSelected = [...new Set([...selectedStudents, ...teamStudentIds])];
        setSelectedStudents(newSelected);
      }
    }
  };

  const handleStudentSelect = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(s => s !== studentId));
      setSelectAll(false);
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
    setSelectedTeams([]);
  };

  const handleScheduleClass = () => {
    const meetingCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`;
    
    alert(`Class scheduled successfully!\nMeeting Code: ${meetingCode}\nDate: ${new Date(date + 'T' + time).toLocaleString()}\n\n${sendNotification ? 'Notifications sent to students.' : 'No notifications sent.'}`);
    router.push('/dashboard/live-classes');
  };

  const canSchedule = classTitle.trim() && selectedChapter && date && time && (selectedStudents.length > 0 || selectAll);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/live-classes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule a Class</h1>
          <p className="text-muted-foreground mt-2">
            Plan a live class for later with automatic notifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Class Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Class Details
              </CardTitle>
              <CardDescription>Enter the details for your scheduled class</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Class Title *</label>
                <Input 
                  placeholder="e.g., Trigonometry - Advanced Problems"
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Chapter/Topic *</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                  >
                    <option value="">Select chapter</option>
                    {chapters.map((chapter) => (
                      <option key={chapter} value={chapter}>{chapter}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                  <select 
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date *</label>
                  <Input 
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Time *</label>
                  <Input 
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Checkbox 
                  checked={sendNotification}
                  onCheckedChange={(checked) => setSendNotification(checked as boolean)}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Send Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Notify selected students about this scheduled class
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Participants
              </CardTitle>
              <CardDescription>
                Choose individual students, select all, or pick a team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Select All Option */}
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Checkbox 
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <div className="flex-1">
                  <p className="font-medium">All Students</p>
                  <p className="text-xs text-muted-foreground">
                    Select entire class ({students.length} students)
                  </p>
                </div>
                <Badge>{students.length}</Badge>
              </div>

              {/* Teams */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Select by Team</label>
                <div className="space-y-2">
                  {teams.map((team) => (
                    <div 
                      key={team._id}
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleTeamSelect(team._id)}
                    >
                      <Checkbox 
                        checked={selectedTeams.includes(team._id)}
                        onCheckedChange={() => handleTeamSelect(team._id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{team.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {team.students.join(', ')}
                        </p>
                      </div>
                      <Badge variant="secondary">{team.studentCount}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Students */}
              <div>
                <label className="text-sm font-medium mb-2 block">Or Select Individual Students</label>
                <div className="space-y-2 border rounded-lg p-3 max-h-60 overflow-y-auto">
                  {students.map((student) => (
                    <div 
                      key={student._id}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => handleStudentSelect(student._id)}
                    >
                      <Checkbox 
                        checked={selectedStudents.includes(student._id)}
                        onCheckedChange={() => handleStudentSelect(student._id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Title</label>
                <p className="text-sm font-medium">
                  {classTitle || 'Not set'}
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Chapter</label>
                <p className="text-sm font-medium">
                  {selectedChapter || 'Not selected'}
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Scheduled For</label>
                <p className="text-sm font-medium">
                  {date && time ? new Date(date + 'T' + time).toLocaleString() : 'Not set'}
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Duration</label>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {duration} minutes
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Participants</label>
                <div className="mt-1">
                  {selectAll ? (
                    <Badge>All Students (3)</Badge>
                  ) : selectedStudents.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedStudents.map(id => {
                        const student = students.find(s => s._id === id);
                        return student ? (
                          <Badge key={id} variant="secondary" className="text-xs">
                            {student.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm">No students selected</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Notifications</label>
                <p className="text-sm font-medium">
                  {sendNotification ? 'Enabled' : 'Disabled'}
                </p>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                disabled={!canSchedule}
                onClick={handleScheduleClass}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Class
              </Button>

              {!canSchedule && (
                <p className="text-xs text-muted-foreground text-center">
                  Fill all required fields to schedule
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-900">Scheduling Tip</p>
                <p className="text-xs text-green-800">
                  Students will receive notifications 15 minutes before the scheduled time. 
                  You can edit or cancel the class anytime before it starts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
