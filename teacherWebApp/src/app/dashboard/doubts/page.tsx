"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ReplyAssignForm } from "./reply-assign-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, Clock, AlertCircle, Users, BarChart3, Search, TrendingUp, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import teacherAPI from "@/lib/api/teacher-api";
import { useTeacherAuth } from "@/context/teacher-auth-context";
import { useEffect, useState } from "react";

/**
 * Teacher Doubts & Chat Page
 *
 * BACKEND IMPLEMENTATION REQUIRED:
 * This component expects the following backend API endpoints:
 *
 * Teacher-side endpoints (under /api/teacher):
 * - GET /messages/chats?teacherEmail=... - Get all teacher chat conversations
 *   Returns: { success: true, conversations: [{ subjectName, courseName, student: {...}, lastMessage, lastMessageTime, unreadCount, messages: [...] }] }
 *
 * - POST /messages/send - Send message from teacher to student
 *   Body: { teacherEmail, studentId, subjectName, message }
 *   Returns: { success: true }
 *
 * - GET /questions/all?teacherEmail=...&includeAnswers=true - Get all questions (existing)
 * - POST /questions/resolve/:questionId - Resolve question (existing)
 * - POST /questions/set-priority/:questionId - Set question priority (existing)
 *
 * Database Models Required:
 * - Message collection: { studentId, teacherId, subjectName, courseName, message, senderType ('student'|'teacher'), timestamp, isRead }
 * - Questions collection: (existing) { studentId, subjectName, courseName, questionText, answers, status, etc. }
 *
 * Note: Chat messages are separate from Q&A questions. Chat uses dedicated Message collection, Q&A uses Questions collection.
 */

interface Doubt {
  _id: string;
  student: { _id: string; name: string; email: string };
  subject: string;
  topic: string;
  course: string;
  moduleName?: string;
  createdAt: string;
  resolved: boolean;
  priority: string;
  assignedTo: { name: string } | null;
  responseTime: number;
  messages: Array<{
    senderType: 'student' | 'teacher';
    text: string;
    timestamp: string;
    senderName?: string;
    isAccepted?: boolean;
  }>;
  status: string;
  answers: any[];
  acceptedAnswerId?: string;
}

interface ChatMessage {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  subjectName: string;
  courseName: string;
  message: string;
  senderType: 'student' | 'teacher';
  timestamp: string;
  isRead: boolean;
}

interface ChatConversation {
  subjectName: string;
  courseName: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

interface Stats {
  totalDoubts: number;
  openDoubts: number;
  resolvedToday: number;
  avgResponseTime: number;
}


function DoubtsPageContent() {
  const { teacher } = useTeacherAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [stats, setStats] = useState<Stats>({ totalDoubts: 0, openDoubts: 0, resolvedToday: 0, avgResponseTime: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (teacher?.email) {
      fetchData();
      fetchChatConversations();
    }
  }, [teacher?.email, selectedModule]);

  const fetchData = async () => {
    if (!teacher?.email) return;

    try {
      setLoading(true);
      // Get all questions first
      const response = await teacherAPI.questions.getAll(teacher.email, undefined, undefined, true);
      
      let questions = [];
      if (response.success && response.data) {
        questions = response.data.questions || response.data.result?.questions || [];
      }
      
      if (questions.length > 0) {
        // Get teacher's assigned subjects/courses
        const teacherSubjects = teacher.subjects || [];
        const teacherCourses = teacher.assignedCourses || [];
        
        // Extract subject names and course names for filtering
        const assignedSubjectNames = teacherSubjects.map((s: any) => s.name || s.subjectName).filter(Boolean);
        const assignedCourseNames = teacherCourses.map((c: any) => c.name || c.courseName).filter(Boolean);
        
        // Filter questions to only include those from teacher's assigned subjects/courses
        const filteredQuestions = questions.filter((q: any) => {
          const questionSubject = q.subjectName || q.subject;
          const questionCourse = q.courseName || q.course;
          
          return assignedSubjectNames.includes(questionSubject) || assignedCourseNames.includes(questionCourse);
        });
        
        // Transform questions to match the expected format
        const transformedDoubts: Doubt[] = filteredQuestions.map((q: any) => ({
          _id: q._id,
          student: { 
            _id: q.studentId || q.student?._id || 'unknown',
            name: q.studentName || q.student?.name || 'Student',
            email: q.studentEmail || q.student?.email || ''
          },
          subject: q.subjectName || q.subject,
          topic: q.topicName || q.title || 'General Question',
          course: q.courseName || q.course,
          moduleName: q.moduleName,
          createdAt: q.createdAt,
          resolved: q.status === 'resolved' || q.status === 'answered',
          priority: q.priority || 'medium',
          assignedTo: q.assignedToTeacherName ? { name: q.assignedToTeacherName } : null,
          responseTime: q.resolvedAt ? Math.floor((new Date(q.resolvedAt).getTime() - new Date(q.createdAt).getTime()) / 60000) : 0,
          messages: [
            { 
              senderType: 'student', 
              text: q.questionText || q.text, 
              timestamp: q.createdAt,
              senderName: q.studentName || q.student?.name || 'Student'
            },
            ...(q.answers || []).map((a: any) => ({
              senderType: 'teacher',
              text: a.answerText || a.text,
              timestamp: a.createdAt || a.timestamp,
              senderName: a.answeredByName || a.senderName || 'Teacher',
              isAccepted: a.isAccepted
            }))
          ],
          status: q.status,
          answers: q.answers || [],
          acceptedAnswerId: q.acceptedAnswerId
        }));

        // Filter by selected module if not "all"
        let finalQuestions = transformedDoubts;
        if (selectedModule !== "all") {
          finalQuestions = transformedDoubts.filter((q) => q.moduleName === selectedModule);
        }

        setDoubts(finalQuestions);
      } else {
        setDoubts([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setDoubts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatConversations = async () => {
    if (!teacher?.email) return;

    try {
      // Fetch chat conversations for this teacher
      const response = await teacherAPI.messages.getTeacherChats(teacher.email);
      
      if (response.success && response.data) {
        const conversations = response.data.conversations || [];
        
        // Transform to ChatConversation format
        const transformedConversations: ChatConversation[] = conversations.map((conv: any) => ({
          subjectName: conv.subjectName,
          courseName: conv.courseName,
          student: {
            _id: conv.studentId,
            name: conv.studentName,
            email: conv.studentEmail
          },
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount || 0,
          messages: conv.messages || []
        }));
        
        setChatConversations(transformedConversations);
      }
    } catch (error) {
      console.error('Error fetching chat conversations:', error);
      setChatConversations([]);
    }
  };

  const sendChatMessage = async (subjectName: string, studentId: string, message: string) => {
    console.log('sendChatMessage called with:', {
      subjectName,
      studentId,
      message,
      teacher: teacher,
      teacherEmail: teacher?.email
    });

    if (!teacher?.email || !message.trim()) {
      console.error('Missing teacher email or message:', { teacherEmail: teacher?.email, message });
      return;
    }

    try {
      setChatLoading(true);
      const requestData = {
        teacherEmail: teacher.email,
        studentId,
        subjectName,
        message: message.trim()
      };

      console.log('Sending API request with data:', requestData);

      const response = await teacherAPI.messages.sendTeacherMessage(requestData);

      console.log('API response:', response);

      if (response.success) {
        // Refresh chat conversations
        await fetchChatConversations();
        setNewMessage('');
      } else {
        console.error('API response error:', response);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    } finally {
      setChatLoading(false);
    }
  };

  // Calculate statistics locally like the student app
  const totalQuestions = doubts.length;
  const answeredQuestions = doubts.filter((d) => d.status === 'answered').length;
  const pendingQuestions = doubts.filter((d) => d.status === 'pending' || d.status === 'in-progress').length;

  // Get unique modules from all questions
  const availableModules = Array.from(new Set(doubts.map(d => d.moduleName).filter(Boolean))) as string[];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'high': 'bg-red-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-blue-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Student Questions & Chat</h1>
        <p className="text-muted-foreground mt-2">
          Manage student queries, provide timely responses, track resolution metrics, and engage in direct chat conversations with students
        </p>
      </div>

      {/* Questions Stats - Matching Student App Format */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs mt-2 text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Answered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{answeredQuestions}</div>
            <p className="text-xs mt-2 text-muted-foreground">Have responses</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Questions</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingQuestions}</div>
            <p className="text-xs mt-2 text-muted-foreground">Need response</p>
          </CardContent>
        </Card>
      </div>

      {/* Questions Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Student Questions & Chat
          </CardTitle>
          <CardDescription>
            Manage and respond to student questions and engage in direct chat conversations
          </CardDescription>
        </CardHeader>

        {/* Module Filter */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Filter by Module:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedModule === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedModule("all")}
              >
                All Modules ({doubts.length})
              </Button>
              {availableModules.map((module) => {
                const count = doubts.filter(d => d.moduleName === module).length;
                return (
                  <Button
                    key={module}
                    variant={selectedModule === module ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedModule(module)}
                  >
                    {module} ({count})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <CardContent>
          <Tabs defaultValue="questions" className="w-full">
            <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-max">
              <TabsTrigger value="questions">Questions ({totalQuestions})</TabsTrigger>
              <TabsTrigger value="answered">Answered ({answeredQuestions})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingQuestions})</TabsTrigger>
              <TabsTrigger value="chat">Chat ({chatConversations.length})</TabsTrigger>
            </TabsList>
            </div>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search questions by topic, student, or subject..." className="pl-8" />
                </div>
                <Button variant="outline">Filter by Priority</Button>
              </div>

              {doubts.map((doubt) => (
                <Card key={doubt._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{doubt.topic}</CardTitle>
                          <Badge className={
                            doubt.status === 'resolved' ? 'bg-green-500' :
                            doubt.status === 'answered' ? 'bg-blue-500' :
                            doubt.priority === 'high' ? 'bg-red-500' :
                            doubt.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }>
                            {doubt.status === 'resolved' ? 'RESOLVED' : 
                             doubt.status === 'answered' ? 'ANSWERED' : 
                             doubt.priority?.toUpperCase() || 'MEDIUM'}
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
                      {doubt.messages.map((message, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg ${
                            message.senderType === 'student' 
                              ? 'bg-blue-50 ' 
                              : message.isAccepted 
                                ? 'bg-green-50 border-green-500'
                                : 'bg-gray-50 border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Users className={`h-3 w-3 ${message.senderType === 'student' ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className="text-xs font-semibold capitalize">
                              {message.senderType === 'student' ? 'Student Question' : 'Teacher Answer'}
                            </span>
                            {message.isAccepted && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Accepted Answer
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm mb-1">{message.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {message.senderType === 'student' ? doubt.student.name : message.senderName}
                          </p>
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
                                        <ReplyAssignForm doubtId={doubt._id} teacherEmail={teacher?.email || ""} onAnswerSubmitted={fetchData} />
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button variant="outline" size="sm">Reply</Button>
                      <Button variant="outline" size="sm">Assign to Teacher</Button>
                      {!doubt.resolved && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={async () => {
                            try {
                              if (teacher?.email) {
                                await teacherAPI.questions.resolve(doubt._id, teacher.email);
                                fetchData(); // Refresh data
                              }
                            } catch (error) {
                              console.error("Failed to resolve question:", error);
                            }
                          }}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                      <Button variant="outline" size="sm">Add to Knowledge Base</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          const newPriority = doubt.priority === 'high' ? 'medium' : doubt.priority === 'medium' ? 'low' : 'high';
                          try {
                            if (teacher?.email) {
                              await teacherAPI.questions.setPriority(doubt._id, newPriority, teacher.email);
                              fetchData(); // Refresh data
                            }
                          } catch (error) {
                            console.error("Failed to update priority:", error);
                          }
                        }}
                      >
                        Set {doubt.priority === 'high' ? 'Medium' : doubt.priority === 'medium' ? 'Low' : 'High'} Priority
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Answered Questions Tab */}
            <TabsContent value="answered" className="space-y-4 mt-4">
              {doubts.filter(d => d.status === 'answered').map((doubt) => (
                <Card key={doubt._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{doubt.topic}</CardTitle>
                          <Badge className={
                            doubt.status === 'resolved' ? 'bg-green-500' :
                            doubt.status === 'answered' ? 'bg-blue-500' :
                            doubt.priority === 'high' ? 'bg-red-500' :
                            doubt.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }>
                            {doubt.status === 'resolved' ? 'RESOLVED' : 
                             doubt.status === 'answered' ? 'ANSWERED' : 
                             doubt.priority?.toUpperCase() || 'MEDIUM'}
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
                      {doubt.messages.map((message, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg ${
                            message.senderType === 'student' 
                              ? 'bg-blue-50 ' 
                              : message.isAccepted 
                                ? 'bg-green-50 border-green-500'
                                : 'bg-gray-50 border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Users className={`h-3 w-3 ${message.senderType === 'student' ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className="text-xs font-semibold capitalize">
                              {message.senderType === 'student' ? 'Student Question' : 'Teacher Answer'}
                            </span>
                            {message.isAccepted && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Accepted Answer
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm mb-1">{message.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {message.senderType === 'student' ? doubt.student.name : message.senderName}
                          </p>
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
                                        <ReplyAssignForm doubtId={doubt._id} teacherEmail={teacher?.email || ""} onAnswerSubmitted={fetchData} />
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button variant="outline" size="sm">Reply</Button>
                      <Button variant="outline" size="sm">Assign to Teacher</Button>
                      {!doubt.resolved && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={async () => {
                            try {
                              if (teacher?.email) {
                                await teacherAPI.questions.resolve(doubt._id, teacher.email);
                                fetchData(); // Refresh data
                              }
                            } catch (error) {
                              console.error("Failed to resolve question:", error);
                            }
                          }}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                      <Button variant="outline" size="sm">Add to Knowledge Base</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          const newPriority = doubt.priority === 'high' ? 'medium' : doubt.priority === 'medium' ? 'low' : 'high';
                          try {
                            if (teacher?.email) {
                              await teacherAPI.questions.setPriority(doubt._id, newPriority, teacher.email);
                              fetchData(); // Refresh data
                            }
                          } catch (error) {
                            console.error("Failed to update priority:", error);
                          }
                        }}
                      >
                        Set {doubt.priority === 'high' ? 'Medium' : doubt.priority === 'medium' ? 'Low' : 'High'} Priority
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Pending Questions Tab */}
            <TabsContent value="pending" className="space-y-4 mt-4">
              {doubts.filter(d => d.status === 'pending' || d.status === 'in-progress').map((doubt) => (
                <Card key={doubt._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{doubt.topic}</CardTitle>
                          <Badge className={
                            doubt.status === 'resolved' ? 'bg-green-500' :
                            doubt.status === 'answered' ? 'bg-blue-500' :
                            doubt.priority === 'high' ? 'bg-red-500' :
                            doubt.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }>
                            {doubt.status === 'resolved' ? 'RESOLVED' : 
                             doubt.status === 'answered' ? 'ANSWERED' : 
                             doubt.priority?.toUpperCase() || 'MEDIUM'}
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
                      {doubt.messages.map((message, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg ${
                            message.senderType === 'student' 
                              ? 'bg-blue-50 ' 
                              : message.isAccepted 
                                ? 'bg-green-50 border-green-500'
                                : 'bg-gray-50 border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Users className={`h-3 w-3 ${message.senderType === 'student' ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className="text-xs font-semibold capitalize">
                              {message.senderType === 'student' ? 'Student Question' : 'Teacher Answer'}
                            </span>
                            {message.isAccepted && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Accepted Answer
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm mb-1">{message.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {message.senderType === 'student' ? doubt.student.name : message.senderName}
                          </p>
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
                                        <ReplyAssignForm doubtId={doubt._id} teacherEmail={teacher?.email || ""} onAnswerSubmitted={fetchData} />
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button variant="outline" size="sm">Reply</Button>
                      <Button variant="outline" size="sm">Assign to Teacher</Button>
                      {!doubt.resolved && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={async () => {
                            try {
                              if (teacher?.email) {
                                await teacherAPI.questions.resolve(doubt._id, teacher.email);
                                fetchData(); // Refresh data
                              }
                            } catch (error) {
                              console.error("Failed to resolve question:", error);
                            }
                          }}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                      <Button variant="outline" size="sm">Add to Knowledge Base</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          const newPriority = doubt.priority === 'high' ? 'medium' : doubt.priority === 'medium' ? 'low' : 'high';
                          try {
                            if (teacher?.email) {
                              await teacherAPI.questions.setPriority(doubt._id, newPriority, teacher.email);
                              fetchData(); // Refresh data
                            }
                          } catch (error) {
                            console.error("Failed to update priority:", error);
                          }
                        }}
                      >
                        Set {doubt.priority === 'high' ? 'Medium' : doubt.priority === 'medium' ? 'Low' : 'High'} Priority
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Chat Conversations List */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Student Chats</CardTitle>
                      <CardDescription>Chat conversations with students</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-96 overflow-y-auto">
                        {chatConversations.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No chat conversations yet</p>
                          </div>
                        ) : (
                          chatConversations.map((conversation) => (
                            <div
                              key={`${conversation.student._id}-${conversation.subjectName}`}
                              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                                selectedChat?.student._id === conversation.student._id &&
                                selectedChat?.subjectName === conversation.subjectName
                                  ? 'bg-blue-50 border-blue-200'
                                  : ''
                              }`}
                              onClick={() => setSelectedChat(conversation)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{conversation.student.name}</p>
                                  <p className="text-xs text-muted-foreground">{conversation.subjectName}</p>
                                  <p className="text-xs text-muted-foreground truncate mt-1">
                                    {conversation.lastMessage}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {conversation.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs mb-1">
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(conversation.lastMessageTime).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Chat Messages */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {selectedChat ? `Chat with ${selectedChat.student.name}` : 'Select a conversation'}
                      </CardTitle>
                      {selectedChat && (
                        <CardDescription>
                          {selectedChat.subjectName} • {selectedChat.courseName}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedChat ? (
                        <div className="space-y-4">
                          {/* Messages */}
                          <div className="max-h-80 overflow-y-auto space-y-3 p-2">
                            {selectedChat.messages.map((message) => (
                              <div
                                key={message._id}
                                className={`flex ${message.senderType === 'teacher' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[70%] p-3 rounded-lg ${
                                    message.senderType === 'teacher'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <p className="text-sm">{message.message}</p>
                                  <p className={`text-xs mt-1 ${
                                    message.senderType === 'teacher' ? 'text-blue-100' : 'text-gray-500'
                                  }`}>
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Message Input */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type your message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !chatLoading) {
                                  sendChatMessage(selectedChat.subjectName, selectedChat.student._id, newMessage);
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              onClick={() => sendChatMessage(selectedChat.subjectName, selectedChat.student._id, newMessage)}
                              disabled={!newMessage.trim() || chatLoading}
                            >
                              {chatLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                'Send'
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Select a conversation to start chatting</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DoubtsPage() {
  return <DoubtsPageContent />;
}
