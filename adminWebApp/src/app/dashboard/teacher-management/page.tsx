"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { fetchPendingTeachers, fetchApprovedTeachers, fetchRejectedTeachers, approveTeacher, rejectTeacher, removeTeacher, TeacherSummary } from "@/lib/api/adminTeachers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Eye, UserCheck, UserX, Shield, BookOpen, Plus, Edit, CheckCircle, User, Users, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { RemoveTeacherDialog } from "@/components/teachers/remove-teacher-dialog";

interface Course {
  _id: string;
  title: string;
  subject: string;
  description: string;
  status: string;
  gradeLevel?: string;
  chapters?: any[];
  program?: string;
  subjects?: Array<{
    name: string;
    description?: string;
    modules?: Array<{
      name: string;
      description: string;
      duration?: string;
    }>;
  }>;
}

export default function TeachersManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [loading, setLoading] = useState(false);
  const [pendingTeachers, setPendingTeachers] = useState<TeacherSummary[]>([]);
  const [approvedTeachers, setApprovedTeachers] = useState<TeacherSummary[]>([]);
  const [rejectedTeachers, setRejectedTeachers] = useState<TeacherSummary[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pending']));
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherSummary | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [teacherToRemove, setTeacherToRemove] = useState<TeacherSummary | null>(null);
  const [editingSubject, setEditingSubject] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isRemoveAssignmentDialogOpen, setIsRemoveAssignmentDialogOpen] = useState(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<{ teacherId: string; courseId: string; subject: string; courseName: string } | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [pendingData, approvedData, rejectedData, coursesData] = await Promise.all([
        fetchPendingTeachers(),
        fetchApprovedTeachers(),
        fetchRejectedTeachers(),
        fetchCourses()
      ]);
      setPendingTeachers(pendingData);
      setApprovedTeachers(approvedData);
      setRejectedTeachers(rejectedData);
      setCourses(coursesData);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Load failed', description: err.message || 'Could not load data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (): Promise<Course[]> => {
    try {
      const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
      const res = await fetch(API_ENDPOINTS.COURSES.LIST, createFetchOptions('GET'));
      if (!res.ok) throw new Error('Failed to fetch courses');
      const json = await res.json();
      return json.result?.courses || [];
    } catch (err: any) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => { load(); }, []);

  const toggleSectionExpansion = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveTeacher(id);
      toast({ title: 'Approved', description: 'Teacher approved successfully' });
      // Move from pending to approved
      const teacher = pendingTeachers.find(t => t._id === id);
      if (teacher) {
        setPendingTeachers(prev => prev.filter(t => t._id !== id));
        setApprovedTeachers(prev => [...prev, teacher]);
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Approve failed', description: err.message || 'Could not approve teacher' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectTeacher(id);
      toast({ title: 'Rejected', description: 'Teacher rejected' });
      // Move from pending to rejected
      const teacher = pendingTeachers.find(t => t._id === id);
      if (teacher) {
        setPendingTeachers(prev => prev.filter(t => t._id !== id));
        setRejectedTeachers(prev => [...prev, teacher]);
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Reject failed', description: err.message || 'Could not reject teacher' });
    }
  };

  const openRemoveDialog = (teacher: TeacherSummary) => {
    setTeacherToRemove(teacher);
    setRemoveDialogOpen(true);
  };

  const handleRemoveTeacher = async (teacherId: string, reason: string) => {
    try {
      const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
      const response = await fetch(
        API_ENDPOINTS.TEACHERS.REMOVE(teacherId),
        createFetchOptions('POST', { reason })
      );
      const data = await response.json();
      
      if (response.ok) {
        toast({ 
          title: 'Teacher Removed', 
          description: data.message || 'Teacher has been removed and notified via email.' 
        });
        // Remove from all lists
        setPendingTeachers(prev => prev.filter(t => t._id !== teacherId));
        setApprovedTeachers(prev => prev.filter(t => t._id !== teacherId));
        setRejectedTeachers(prev => prev.filter(t => t._id !== teacherId));
      } else {
        throw new Error(data.error || 'Failed to remove teacher');
      }
    } catch (err: any) {
      console.error(err);
      toast({ 
        title: 'Remove failed', 
        description: err.message || 'Could not remove teacher',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher || !selectedCourse || !selectedSubject) {
      toast({ 
        title: 'Error', 
        description: 'Please select a course and subject',
        variant: 'destructive' 
      });
      return;
    }

    try {
      const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
      
      // Check if teacher already has an assignment
      const currentAssignments = (selectedTeacher as any).assignedCourses || [];
      const hasExistingAssignment = currentAssignments.length > 0;
      
      if (hasExistingAssignment) {
        // Confirm replacement
        const confirmReplace = window.confirm(
          `This teacher is already assigned to "${currentAssignments[0].subject}" in "${currentAssignments[0].courseName}". ` +
          `Do you want to replace this assignment with "${selectedSubject}" in the selected course?`
        );
        
        if (!confirmReplace) {
          return;
        }
      }

      const res = await fetch(API_ENDPOINTS.TEACHERS.ASSIGN(selectedTeacher._id), createFetchOptions('POST', {
        courseId: selectedCourse,
        subjectName: selectedSubject,
      }));

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to assign teacher');
      }

      const data = await res.json();
      toast({ 
        title: 'Success', 
        description: hasExistingAssignment 
          ? `Teacher assignment replaced! Now assigned to ${data.data.subjectName} in ${data.data.courseName}`
          : `Teacher assigned to ${data.data.subjectName} in ${data.data.courseName}` 
      });
      setIsAssignDialogOpen(false);
      setSelectedCourse('');
      setSelectedSubject('');
      load(); // Refresh the data
    } catch (err: any) {
      console.error(err);
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to assign teacher',
        variant: 'destructive'
      });
    }
  };

  const openAssignDialog = (teacher: TeacherSummary) => {
    setSelectedTeacher(teacher);
    setEditingSubject((teacher as any).subjects?.[0]?.name || '');
    setSelectedCourse('');
    setSelectedSubject('');
    setIsAssignDialogOpen(true);
  };

  const openRemoveAssignmentDialog = (teacherId: string, courseId: string, subject: string, courseName: string) => {
    setAssignmentToRemove({ teacherId, courseId, subject, courseName });
    setIsRemoveAssignmentDialogOpen(true);
  };

  const handleRemoveAssignment = async () => {
    if (!assignmentToRemove) return;

    try {
      const { API_ENDPOINTS, createFetchOptions } = await import('@/config/api');
      const res = await fetch(API_ENDPOINTS.TEACHERS.REMOVE_ASSIGNMENT(assignmentToRemove.teacherId), createFetchOptions('POST', {
        courseId: assignmentToRemove.courseId,
        subject: assignmentToRemove.subject,
      }));

      if (!res.ok) {
        let errorMessage = 'Failed to remove assignment';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = `Failed to remove assignment: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      toast({ 
        title: 'Success', 
        description: `Assignment removed! Teacher no longer assigned to ${assignmentToRemove.subject}` 
      });
      
      // Close dialog and reset state
      setIsRemoveAssignmentDialogOpen(false);
      setAssignmentToRemove(null);
      
      // Refresh the data
      load();
    } catch (err: any) {
      console.error('Remove assignment error:', err);
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to remove assignment',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
            <div>
                   <div className="flex items-center gap-2">
                              <CardTitle className="text-3xl font-bold text-gray-900">Teacher Management</CardTitle>
                          </div>
                  <p className="text-gray-600 mt-2">Manage and oversee teacher assignments and approvals</p>
                </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading teachers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
     <div>
                   <div className="flex items-center gap-2">
                     <Users className="h-6 w-6 text-primary" />
                              <CardTitle className="text-3xl font-bold text-gray-900">Teacher Management</CardTitle>
                          </div>
                  <p className="text-gray-600 mt-2">Manage and oversee teacher assignments and approvals</p>
                </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            Overview ({pendingTeachers.length + approvedTeachers.length + rejectedTeachers.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingTeachers.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedTeachers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedTeachers.length})
          </TabsTrigger>
          <TabsTrigger value="assign">
            Assign Courses ({approvedTeachers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Pending Teachers Overview */}
          <Card>
            <Collapsible open={expandedSections.has('pending')} onOpenChange={() => toggleSectionExpansion('pending')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSections.has('pending') ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Pending Approval
                      </CardTitle>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {pendingTeachers.length} teachers
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {pendingTeachers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending teachers
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingTeachers.map(t => (
                        <div key={t._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold">{t.fullName || `${t.firstName || ''} ${t.lastName || ''}`}</div>
                              <div className="text-sm text-muted-foreground">{t.email}</div>
                              <div className="text-sm text-muted-foreground">{t.institution?.name || ''} • {t.subjects?.map((s: any) => s.name).join(', ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher-management/${t._id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(t._id)}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleReject(t._id)}>
                              <UserX className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Approved Teachers Overview */}
          <Card>
            <Collapsible open={expandedSections.has('approved')} onOpenChange={() => toggleSectionExpansion('approved')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSections.has('approved') ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Approved Teachers
                      </CardTitle>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {approvedTeachers.length} teachers
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {approvedTeachers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No approved teachers
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvedTeachers.map(t => (
                        <div key={t._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Shield className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold">{t.fullName || `${t.firstName || ''} ${t.lastName || ''}`}</div>
                              <div className="text-sm text-muted-foreground">{t.email}</div>
                              <div className="text-sm text-muted-foreground">{t.institution?.name || ''} • {t.subjects?.map((s: any) => s.name).join(', ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher-management/${t._id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openRemoveDialog(t)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Rejected Teachers Overview */}
          <Card>
            <Collapsible open={expandedSections.has('rejected')} onOpenChange={() => toggleSectionExpansion('rejected')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSections.has('rejected') ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Rejected Teachers
                      </CardTitle>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        {rejectedTeachers.length} teachers
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {rejectedTeachers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No rejected teachers
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rejectedTeachers.map(t => (
                        <div key={t._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <UserX className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <div className="font-semibold">{t.fullName || `${t.firstName || ''} ${t.lastName || ''}`}</div>
                              <div className="text-sm text-muted-foreground">{t.email}</div>
                              <div className="text-sm text-muted-foreground">{t.institution?.name || ''} • {t.subjects?.map((s: any) => s.name).join(', ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher-management/${t._id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Pending Approval ({pendingTeachers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending teachers
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTeachers.map(t => (
                    <div key={t._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{t.fullName || `${t.firstName || ''} ${t.lastName || ''}`}</div>
                          <div className="text-sm text-muted-foreground">{t.email}</div>
                          <div className="text-sm text-muted-foreground">{t.institution?.name || ''} • {t.subjects?.map((s: any) => s.name).join(', ')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher-management/${t._id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(t._id)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleReject(t._id)}>
                          <UserX className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Approved Teachers ({approvedTeachers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvedTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approved teachers
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedTeachers.map(t => (
                    <div key={t._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{t.fullName || `${t.firstName || ''} ${t.lastName || ''}`}</div>
                          <div className="text-sm text-muted-foreground">{t.email}</div>
                          <div className="text-sm text-muted-foreground">{t.institution?.name || ''} • {t.subjects?.map((s: any) => s.name).join(', ')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher-management/${t._id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openRemoveDialog(t)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Rejected Teachers ({rejectedTeachers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rejectedTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No rejected teachers
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedTeachers.map(t => (
                    <div key={t._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <UserX className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{t.fullName || `${t.firstName || ''} ${t.lastName || ''}`}</div>
                          <div className="text-sm text-muted-foreground">{t.email}</div>
                          <div className="text-sm text-muted-foreground">{t.institution?.name || ''} • {t.subjects?.map((s: any) => s.name).join(', ')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher-management/${t._id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Assign Courses to Teachers ({approvedTeachers.length})
              </CardTitle>
              <CardDescription>
                Assign approved teachers to specific courses they will teach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approved teachers available for course assignment
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedTeachers.map(t => (
                    <div key={t._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{t.fullName || `${t.firstName || ''} ${t.lastName || ''}`}</div>
                          <div className="text-sm text-muted-foreground">{t.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {t.institution?.name || ''} • {t.subjects?.map((s: any) => s.name).join(', ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Assigned courses: {(t as any).assignedCourses?.length || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/teacher-management/${t._id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => openAssignDialog(t)}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Assign Courses
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subject Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Subject to Teacher</DialogTitle>
              <DialogDescription>
                Select a course and specific subject for {selectedTeacher?.fullName || `${selectedTeacher?.firstName || ''} ${selectedTeacher?.lastName || ''}`}
              </DialogDescription>
            </DialogHeader>

            {selectedTeacher && (
              <div className="space-y-4">
                {/* Current Assignments */}
                {(selectedTeacher as any).assignedCourses && (selectedTeacher as any).assignedCourses.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-900 mb-2">Currently Assigned:</p>
                    <div className="space-y-1">
                      {(selectedTeacher as any).assignedCourses.map((ac: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm text-blue-700">
                          <span>• {ac.subject} in {ac.courseName}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRemoveAssignmentDialog(selectedTeacher._id, ac.courseId, ac.subject, ac.courseName)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Selection */}
                <div>
                  <Label htmlFor="course-select">Select Course Package</Label>
                  <Select value={selectedCourse} onValueChange={(value) => {
                    setSelectedCourse(value);
                    setSelectedSubject(''); // Reset subject when course changes
                  }}>
                    <SelectTrigger id="course-select">
                      <SelectValue placeholder="Choose a course package" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">
                          No courses available
                        </div>
                      ) : (
                        courses.map(course => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title} {course.program ? `(${course.program})` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject Selection */}
                {selectedCourse && (
                  <div>
                    <Label htmlFor="subject-select">Select Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger id="subject-select">
                        <SelectValue placeholder="Choose a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const course = courses.find(c => c._id === selectedCourse);
                          const subjects = (course as any)?.subjects || [];
                          
                          if (subjects.length === 0) {
                            return (
                              <div className="p-2 text-center text-muted-foreground">
                                No subjects in this course
                              </div>
                            );
                          }
                          
                          return subjects.map((subject: any, idx: number) => (
                            <SelectItem key={idx} value={subject.name}>
                              <div>
                                <div className="font-medium">{subject.name}</div>
                                {subject.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {subject.description.substring(0, 50)}...
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-1">
                                  {subject.modules?.length || 0} modules
                                </div>
                              </div>
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                    
                    {selectedSubject && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Teacher will be able to manage all content for this subject including modules, videos, notes, live classes, and assessments.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignTeacher} 
                disabled={!selectedTeacher || !selectedCourse || !selectedSubject}
              >
                Assign Subject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Teacher Dialog */}
        <RemoveTeacherDialog
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          teacher={teacherToRemove ? {
            _id: teacherToRemove._id,
            firstName: teacherToRemove.firstName || '',
            lastName: teacherToRemove.lastName || '',
            email: teacherToRemove.email
          } : null}
          onConfirm={handleRemoveTeacher}
        />

        {/* Remove Assignment Dialog */}
        <Dialog open={isRemoveAssignmentDialogOpen} onOpenChange={setIsRemoveAssignmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Assignment</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this assignment? The teacher will no longer have access to manage this subject.
              </DialogDescription>
            </DialogHeader>

            {assignmentToRemove && (
              <div className="py-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-900">Assignment to Remove:</p>
                  <p className="text-sm text-red-700 mt-1">
                    <strong>{assignmentToRemove.subject}</strong> in <strong>{assignmentToRemove.courseName}</strong>
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    This action cannot be undone. The teacher will lose access to all content, modules, and assessments for this subject.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsRemoveAssignmentDialogOpen(false);
                  setAssignmentToRemove(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRemoveAssignment}
              >
                Remove Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
}
