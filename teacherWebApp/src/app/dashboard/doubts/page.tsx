// BACKEND TEMPORARILY DISABLED FOR FRONTEND DEVELOPMENT
// import dbConnect from "@/lib/mongoose";
// import Doubt from "@/models/Doubt";
// import Teacher from "@/models/Teacher";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ReplyAssignForm } from "./reply-assign-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, Clock, AlertCircle, Users, BarChart3, Search, TrendingUp, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

async function getData() {
  // MOCK DATA FOR FRONTEND DEVELOPMENT
  const now = Date.now();
  return {
    doubts: [
      { 
        _id: 'd1', 
        student: { _id: 'st1', name: 'Mike Johnson' }, 
        subject: 'Mathematics', 
        topic: 'Quadratic Equations',
        course: 'Grade 11 Study Package',
        createdAt: new Date(now - 3600000).toISOString(), 
        resolved: false, 
        priority: 'high',
        assignedTo: null,
        messages: [
          { senderType: 'student', text: 'I dont understand how to solve quadratic equations using the formula. Can you explain the discriminant?', timestamp: new Date(now - 3600000).toISOString() }
        ]
      },
      { 
        _id: 'd2', 
        student: { _id: 'st2', name: 'Jane Smith' }, 
        subject: 'Mathematics', 
        topic: 'Calculus - Differentiation',
        course: 'Grade 11 Study Package',
        createdAt: new Date(now - 7200000).toISOString(), 
        resolved: true, 
        priority: 'medium',
        assignedTo: { name: 'You' },
        responseTime: 45,
        messages: [
          { senderType: 'student', text: 'How do I differentiate composite functions using chain rule?', timestamp: new Date(now - 7200000).toISOString() }, 
          { senderType: 'teacher', text: 'The chain rule states that if you have f(g(x)), the derivative is f\'(g(x)) × g\'(x). Let me show you with examples...', timestamp: new Date(now - 4800000).toISOString() }
        ]
      },
      { 
        _id: 'd3', 
        student: { _id: 'st3', name: 'Emily Davis' }, 
        subject: 'Mathematics', 
        topic: 'Trigonometry',
        course: 'Grade 11 Study Package',
        createdAt: new Date(now - 14400000).toISOString(), 
        resolved: true, 
        priority: 'low',
        assignedTo: { name: 'You' },
        responseTime: 30,
        messages: [
          { senderType: 'student', text: 'Can you explain trigonometric identities and when to use them?', timestamp: new Date(now - 14400000).toISOString() },
          { senderType: 'teacher', text: 'Trigonometric identities help simplify expressions. The most common are sin²θ + cos²θ = 1...', timestamp: new Date(now - 10800000).toISOString() }
        ]
      }
    ],
    stats: {
      totalDoubts: 8,
      openDoubts: 1,
      resolvedToday: 2,
      avgResponseTime: 38
    },
    knowledgeBase: [
      { _id: 'kb1', topic: 'Quadratic Equations', subject: 'Mathematics', views: 245, helpfulVotes: 182 },
      { _id: 'kb2', topic: 'Newtons Laws', subject: 'Physics', views: 198, helpfulVotes: 156 },
      { _id: 'kb3', topic: 'Organic Chemistry Basics', subject: 'Chemistry', views: 167, helpfulVotes: 134 },
      { _id: 'kb4', topic: 'Triangle Properties', subject: 'Mathematics', views: 143, helpfulVotes: 112 }
    ],
    teacherId: 't1'
  };
}

export default async function DoubtsPage() {
  const { doubts, stats, knowledgeBase, teacherId } = await getData();

  const openDoubts = doubts.filter((d: any) => !d.resolved);
  const resolvedDoubts = doubts.filter((d: any) => d.resolved);
  const highPriorityDoubts = doubts.filter((d: any) => !d.resolved && d.priority === 'high');

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
        <h1 className="text-2xl sm:text-3xl font-bold">Doubts & Student Support</h1>
        <p className="text-muted-foreground mt-2">
          Manage student queries, provide timely responses, track resolution metrics, and build a comprehensive knowledge base for common questions
        </p>
      </div>

      {/* Doubts Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Doubts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6  text-blue-600" />
              {stats.totalDoubts}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Doubts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              {stats.openDoubts}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Need response</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100 shadow-sm hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle className="h-6 w-6  text-blue-600" />
              {stats.resolvedToday}
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6" />
              {stats.avgResponseTime}m
            </div>
            <p className="text-xs text-white/80 mt-1">Average minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Doubts Alert */}
      {highPriorityDoubts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Urgent: {highPriorityDoubts.length} High Priority Doubts Need Attention
            </CardTitle>
            <CardDescription>These doubts have been marked as high priority by students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highPriorityDoubts.slice(0, 3).map((doubt: any) => (
                <div key={doubt._id} className="flex items-center justify-between bg-white p-2 rounded">
                  <div>
                    <p className="font-semibold text-sm">{doubt.student.name}</p>
                    <p className="text-xs text-muted-foreground">{doubt.subject} - {doubt.topic}</p>
                  </div>
                  <Button size="sm" variant="destructive">Respond Now</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doubts Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Doubt Queue & Knowledge Base
          </CardTitle>
          <CardDescription>
            Manage student questions, track resolution status, analyze response metrics, and build helpful resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open" className="w-full">
            <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-max">
              <TabsTrigger value="open">Open ({openDoubts.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({resolvedDoubts.length})</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base ({knowledgeBase.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            </div>

            {/* Open Doubts Tab */}
            <TabsContent value="open" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search doubts by topic, student, or subject..." className="pl-8" />
                </div>
                <Button variant="outline">Filter by Subject</Button>
                <Button variant="outline">Filter by Priority</Button>
              </div>

              {openDoubts.map((doubt: any) => (
                <Card key={doubt._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{doubt.topic}</CardTitle>
                          <Badge className={getPriorityColor(doubt.priority)}>
                            {doubt.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription>
                          Asked by {doubt.student.name} • {doubt.subject} • {doubt.course}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(doubt.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doubt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {doubt.messages.map((message: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg ${message.senderType === 'student' ? 'bg-blue-50' : 'bg-blue-50'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-3 w-3" />
                            <span className="text-xs font-semibold capitalize">{message.senderType}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm">{message.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {doubt.assignedTo ? (
                        <Badge variant="secondary">Assigned to {doubt.assignedTo.name}</Badge>
                      ) : (
                        <Badge variant="outline">Unassigned</Badge>
                      )}
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor((Date.now() - new Date(doubt.createdAt).getTime()) / 60000)} min ago
                      </Badge>
                    </div>
                    <ReplyAssignForm doubtId={doubt._id} defaultTeacherId={teacherId} />
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button variant="outline" size="sm">Reply</Button>
                      <Button variant="outline" size="sm">Assign to Teacher</Button>
                      <Button variant="outline" size="sm">Mark as Resolved</Button>
                      <Button variant="outline" size="sm">Add to Knowledge Base</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Resolved Doubts Tab */}
            <TabsContent value="resolved" className="space-y-4 mt-4">
              {resolvedDoubts.map((doubt: any) => (
                <Card key={doubt._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{doubt.topic}</CardTitle>
                          <Badge className="bg-blue-500">RESOLVED</Badge>
                          {doubt.responseTime && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {doubt.responseTime}m
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          {doubt.student.name} • {doubt.subject} • Resolved by {doubt.assignedTo?.name}
                        </CardDescription>
                      </div>
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {doubt.messages.map((message: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded text-sm ${message.senderType === 'student' ? 'bg-blue-50' : 'bg-blue-50'}`}
                        >
                          <span className="font-semibold capitalize">{message.senderType}:</span> {message.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm">View Full Thread</Button>
                      <Button variant="outline" size="sm">Reopen</Button>
                      <Button variant="outline" size="sm">Export</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Knowledge Base Tab */}
            <TabsContent value="knowledge" className="space-y-4 mt-4">
              <div className="mb-4">
                <Button className="w-full md:w-auto">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create New Article
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {knowledgeBase.map((article: any) => (
                  <Card key={article._id}>
                    <CardHeader>
                      <CardTitle className="text-base">{article.topic}</CardTitle>
                      <CardDescription>{article.subject}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Views</p>
                          <p className="text-xl font-bold">{article.views}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Helpful Votes</p>
                          <p className="text-xl font-bold text-blue-600">{article.helpfulVotes}</p>
                        </div>
                      </div>
                      <Progress 
                        value={(article.helpfulVotes / article.views) * 100} 
                        className="h-2 mb-4" 
                      />
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm">View Article</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Share</Button>
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
                    <CardTitle className="text-base">Doubts by Subject</CardTitle>
                    <CardDescription>Distribution across different subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Mathematics', 'Physics', 'Chemistry'].map((subject) => {
                        const count = doubts.filter((d: any) => d.subject === subject).length;
                        return (
                          <div key={subject}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{subject}</span>
                              <span className="text-muted-foreground">{count} doubts</span>
                            </div>
                            <Progress value={(count / doubts.length) * 100} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Response Time Analysis</CardTitle>
                    <CardDescription>How quickly doubts are being resolved</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="text-sm">Fast (&lt;30 min)</span>
                        <Badge className="bg-blue-500">
                          {resolvedDoubts.filter((d: any) => d.responseTime < 30).length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span className="text-sm">Moderate (30-120 min)</span>
                        <Badge className="bg-yellow-500">
                          {resolvedDoubts.filter((d: any) => d.responseTime >= 30 && d.responseTime <= 120).length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">Slow (&gt;120 min)</span>
                        <Badge className="bg-red-500">
                          {resolvedDoubts.filter((d: any) => d.responseTime > 120).length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Most Active Students</CardTitle>
                    <CardDescription>Students asking the most questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.from(new Set(doubts.map((d: any) => d.student.name))).slice(0, 5).map((name, idx) => {
                        const count = doubts.filter((d: any) => d.student.name === name).length;
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm">{name}</span>
                            <Badge variant="outline">{count} doubts</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resolution Rate</CardTitle>
                    <CardDescription>Overall doubt resolution efficiency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Doubts</span>
                        <span className="text-lg font-bold">{doubts.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Resolved</span>
                        <span className="text-lg font-bold text-blue-600">{resolvedDoubts.length}</span>
                      </div>
                      <Progress 
                        value={(resolvedDoubts.length / doubts.length) * 100} 
                        className="h-2" 
                      />
                      <p className="text-center text-sm font-semibold">
                        {Math.round((resolvedDoubts.length / doubts.length) * 100)}% Resolution Rate
                      </p>
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
