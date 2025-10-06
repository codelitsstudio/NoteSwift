// BACKEND TEMPORARILY DISABLED FOR FRONTEND DEVELOPMENT
// import dbConnect from "@/lib/mongoose";
// import Announcement from "@/models/Announcement";
// import Teacher from "@/models/Teacher";
// import Course from "@/models/Course";
// import Batch from "@/models/Batch";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CreateAnnouncementForm } from "./announcement-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Send, Calendar, Users, BarChart3, Eye, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getData() {
  // MOCK DATA FOR FRONTEND DEVELOPMENT
  const now = Date.now();
  return {
    announcements: [
      { 
        _id: 'an1', 
        title: 'Grade 11 Math - Calculus Test Next Week', 
        message: 'The Calculus mid-term test will be held next Monday, October 7th at 10 AM. Topics covered: Differentiation, Integration basics. Duration: 60 minutes.',
        priority: 'high',
        targetAudience: 'Your Students',
        course: 'Grade 11 Study Package (Mathematics)',
        createdBy: { _id: 't1', name: 'You' }, 
        createdAt: new Date(now - 3600000).toISOString(),
        scheduledFor: new Date(now).toISOString(),
        status: 'sent',
        readCount: 3,
        totalRecipients: 3,
        deliveryRate: 100
      },
      { 
        _id: 'an2', 
        title: 'Trigonometry Assignment Due Friday', 
        message: 'Reminder: Your trigonometry practice problems assignment is due this Friday by 5 PM. Please submit through the portal.',
        priority: 'medium',
        targetAudience: 'Your Students',
        course: 'Grade 11 Study Package (Mathematics)',
        createdBy: { _id: 't1', name: 'You' }, 
        createdAt: new Date(now - 86400000).toISOString(),
        scheduledFor: new Date(now - 86400000).toISOString(),
        status: 'sent',
        readCount: 3,
        totalRecipients: 3,
        deliveryRate: 100
      },
      { 
        _id: 'an3', 
        title: 'Extra Doubt Session - Saturday 10 AM', 
        message: 'An extra doubt-clearing session for Quadratic Equations will be conducted this Saturday from 10 AM to 11:30 AM via Zoom. Link will be shared.',
        priority: 'medium',
        targetAudience: 'Your Students',
        course: 'Grade 11 Study Package (Mathematics)',
        createdBy: { _id: 't1', name: 'You' }, 
        createdAt: new Date(now - 172800000).toISOString(),
        scheduledFor: new Date(now - 172800000).toISOString(),
        status: 'sent',
        readCount: 2,
        totalRecipients: 3,
        deliveryRate: 100
      },
      { 
        _id: 'an4', 
        title: 'New Study Material Uploaded', 
        message: 'New video tutorials and practice questions for Coordinate Geometry have been uploaded. Check the Courses section.',
        priority: 'low',
        targetAudience: 'Your Students',
        course: 'Grade 11 Study Package (Mathematics)',
        createdBy: { _id: 't1', name: 'You' }, 
        createdAt: new Date(now - 259200000).toISOString(),
        scheduledFor: new Date(now - 259200000).toISOString(),
        status: 'sent',
        readCount: 3,
        totalRecipients: 3,
        deliveryRate: 100
      },
      { 
        _id: 'an5', 
        title: 'Statistics Chapter Live Class Tomorrow', 
        message: 'Tomorrow\'s live class will cover Statistics and Probability. Please complete the pre-reading assignment before class.',
        priority: 'high',
        targetAudience: 'Your Students',
        course: 'Grade 11 Study Package (Mathematics)',
        createdBy: { _id: 't1', name: 'You' }, 
        createdAt: new Date(now - 345600000).toISOString(),
        scheduledFor: new Date(now + 86400000).toISOString(),
        status: 'scheduled',
        readCount: 0,
        totalRecipients: 3,
        deliveryRate: 0
      }
    ],
    templates: [
      { _id: 'tpl1', name: 'Test Announcement', category: 'Academic', usageCount: 3 },
      { _id: 'tpl2', name: 'Assignment Reminder', category: 'Academic', usageCount: 5 },
      { _id: 'tpl3', name: 'Live Class Schedule', category: 'Academic', usageCount: 4 },
      { _id: 'tpl4', name: 'New Material Uploaded', category: 'General', usageCount: 2 },
      { _id: 'tpl5', name: 'Event Invitation', category: 'Events', usageCount: 12 }
    ],
    stats: {
      totalAnnouncements: 5,
      sentThisMonth: 4,
      avgReadRate: 92,
      scheduledUpcoming: 1
    },
    courses: [
      { _id: '1', title: 'Mathematics Grade 10' },
      { _id: '2', title: 'Physics Grade 11' },
      { _id: '3', title: 'Chemistry Grade 12' }
    ],
    batches: [
      { _id: 'b1', name: 'Batch 2024-A' },
      { _id: 'b2', name: 'Batch 2024-B' },
      { _id: 'b3', name: 'Batch 2025-A' }
    ],
    teachers: [
      { _id: 't1', name: 'Mr. Smith' },
      { _id: 't2', name: 'Ms. Johnson' },
      { _id: 't3', name: 'Dr. Brown' }
    ]
  };
}

export default async function AnnouncementsPage() {
  const { announcements, templates, stats, courses, batches, teachers } = await getData();

  const sentAnnouncements = announcements.filter((a: any) => a.status === 'sent');
  const scheduledAnnouncements = announcements.filter((a: any) => a.status === 'scheduled');

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'high': 'bg-red-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-blue-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Announcements</h1>
        <p className="text-muted-foreground mt-2">
          View and manage announcements sent to your Grade 11 Mathematics students
        </p>
      </div>

      {/* Announcement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-500 hover:border-blue-600 transition-colors shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2 ">
              <Bell className="h-6 w-6 text-blue-600" />
              {stats.totalAnnouncements}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Sent This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Send className="h-6 w-6" />
              {stats.sentThisMonth}
            </div>
            <p className="text-xs text-white/80 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Read Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Eye className="h-6 w-6 text-blue-600" />
              {stats.avgReadRate}%
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Engagement rate</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-600" />
              {stats.scheduledUpcoming}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Announcements
          </CardTitle>
          <CardDescription>
            View sent announcements, manage scheduled messages, and track student engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sent" className="w-full">
            <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-max">
              <TabsTrigger value="sent">Sent ({sentAnnouncements.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({scheduledAnnouncements.length})</TabsTrigger>
              <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            </div>

            {/* Sent Announcements Tab */}
            <TabsContent value="sent" className="space-y-4 mt-4">
              {sentAnnouncements.map((announcement: any) => (
                <Card key={announcement._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{announcement.title}</CardTitle>
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {announcement.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription>
                          {announcement.targetAudience} • {announcement.course}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{announcement.message}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Recipients</p>
                        <p className="text-lg font-bold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {announcement.totalRecipients}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Read</p>
                        <p className="text-lg font-bold text-green-600">
                          {announcement.readCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((announcement.readCount / announcement.totalRecipients) * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Rate</p>
                        <p className="text-lg font-bold">{announcement.deliveryRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Posted By</p>
                        <p className="text-sm font-medium">{announcement.createdBy.name}</p>
                      </div>
                    </div>
                    <Progress 
                      value={(announcement.readCount / announcement.totalRecipients) * 100} 
                      className="h-2 mb-4" 
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Read Receipts
                      </Button>
                      <Button variant="outline" size="sm">Resend</Button>
                      <Button variant="outline" size="sm">Edit & Resend</Button>
                      <Button variant="outline" size="sm">Archive</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Scheduled Announcements Tab */}
            <TabsContent value="scheduled" className="space-y-4 mt-4">
              {scheduledAnnouncements.length > 0 ? (
                scheduledAnnouncements.map((announcement: any) => (
                  <Card key={announcement._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">{announcement.title}</CardTitle>
                            <Badge className={getPriorityColor(announcement.priority)}>
                              {announcement.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              SCHEDULED
                            </Badge>
                          </div>
                          <CardDescription>
                            {announcement.targetAudience} • {announcement.course}
                          </CardDescription>
                        </div>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{announcement.message}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Scheduled For</p>
                          <p className="text-base font-bold">
                            {new Date(announcement.scheduledFor).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(announcement.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Recipients</p>
                          <p className="text-lg font-bold flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {announcement.totalRecipients}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created By</p>
                          <p className="text-sm font-medium">{announcement.createdBy.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm">Send Now</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button variant="destructive" size="sm">Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-lg font-semibold">No Scheduled Announcements</p>
                  <p className="text-sm text-muted-foreground">Create an announcement and schedule it for later</p>
                </div>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="mb-4">
                <Button className="w-full md:w-auto">
                  <Bell className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template: any) => (
                  <Card key={template._id}>
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary">{template.category}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Used</p>
                        <p className="text-2xl font-bold">{template.usageCount} times</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="flex-1">Use Template</Button>
                        <Button variant="outline" size="sm" className="flex-1">Edit</Button>
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
                    <CardTitle className="text-base">Engagement Rates</CardTitle>
                    <CardDescription>Read rates for recent announcements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sentAnnouncements.slice(0, 5).map((announcement: any) => (
                        <div key={announcement._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{announcement.title.substring(0, 25)}...</span>
                            <span className="text-muted-foreground">
                              {Math.round((announcement.readCount / announcement.totalRecipients) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(announcement.readCount / announcement.totalRecipients) * 100} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Announcements by Priority</CardTitle>
                    <CardDescription>Distribution of message priorities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">High Priority</span>
                        <Badge className="bg-red-500">
                          {announcements.filter((a: any) => a.priority === 'high').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span className="text-sm">Medium Priority</span>
                        <Badge className="bg-yellow-500">
                          {announcements.filter((a: any) => a.priority === 'medium').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="text-sm">Low Priority</span>
                        <Badge className="bg-blue-500">
                          {announcements.filter((a: any) => a.priority === 'low').length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Target Audience Distribution</CardTitle>
                    <CardDescription>Who receives announcements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">All Students</span>
                        <span className="text-lg font-bold">
                          {announcements.filter((a: any) => a.targetAudience === 'All Students').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Course-Specific</span>
                        <span className="text-lg font-bold">
                          {announcements.filter((a: any) => a.targetAudience !== 'All Students').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Overall Performance</CardTitle>
                    <CardDescription>Communication effectiveness metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Sent</span>
                        <span className="text-lg font-bold">{sentAnnouncements.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Read Rate</span>
                        <span className="text-lg font-bold text-green-600">{stats.avgReadRate}%</span>
                      </div>
                      <Progress value={stats.avgReadRate} className="h-2" />
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
