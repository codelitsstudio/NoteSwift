"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPendingTeachers, fetchApprovedTeachers, fetchRejectedTeachers, approveTeacher, rejectTeacher, removeTeacher, TeacherSummary } from "@/lib/api/adminTeachers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Eye, UserCheck, UserX, Shield, BookOpen, Plus, Edit, CheckCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

interface Course {
  _id: string;
  title: string;
  subject: string;
  description: string;
  status: string;
  gradeLevel?: string;
  chapters?: any[];
}

export default function TeachersManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pendingTeachers, setPendingTeachers] = useState<TeacherSummary[]>([]);
  const [approvedTeachers, setApprovedTeachers] = useState<TeacherSummary[]>([]);
  const [rejectedTeachers, setRejectedTeachers] = useState<TeacherSummary[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pending']));
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherSummary | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
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
      const res = await fetch('/api/courses');
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

  const handleRemove = async (id: string) => {
    try {
      await removeTeacher(id);
      toast({ title: 'Removed', description: 'Teacher removed successfully' });
      setApprovedTeachers(prev => prev.filter(t => t._id !== id));
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Remove failed', description: err.message || 'Could not remove teacher' });
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      const res = await fetch(`/api/teachers/${selectedTeacher._id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: editingSubject,
          courseIds: selectedCourses,
        }),
      });

      if (!res.ok) throw new Error('Failed to assign teacher');

      toast({ title: 'Success', description: 'Teacher assigned successfully' });
      setIsAssignDialogOpen(false);
      load(); // Refresh the data
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to assign teacher' });
    }
  };

  const openAssignDialog = (teacher: TeacherSummary) => {
    setSelectedTeacher(teacher);
    setEditingSubject((teacher as any).subjects?.[0]?.name || '');
    setSelectedCourses((teacher as any).assignedCourses?.map((ac: any) => ac.courseId) || []);
    setIsAssignDialogOpen(true);
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
                              <CardTitle className="text-3xl font-bold text-gray-900">Teacher Management</CardTitle>
                          </div>
                  <p className="text-gray-600 mt-2">Manage and oversee teacher assignments and approvals</p>
                </div>

      <Tabs defaultValue="overview" className="w-full">
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
                            <Button variant="outline" size="sm" onClick={() => handleRemove(t._id)}>
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
                        <Button variant="outline" size="sm" onClick={() => handleRemove(t._id)}>
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

        {/* Course Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Courses to Teacher</DialogTitle>
              <DialogDescription>
                Select courses for {selectedTeacher?.fullName || `${selectedTeacher?.firstName || ''} ${selectedTeacher?.lastName || ''}`}
              </DialogDescription>
            </DialogHeader>

            {selectedTeacher && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={editingSubject}
                      onChange={(e) => setEditingSubject(e.target.value)}
                      placeholder="Enter subject"
                    />
                  </div>
                </div>

                <div>
                  <Label>Available Courses</Label>
                  <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                    {courses.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No courses available
                      </div>
                    ) : (
                      courses.map(course => (
                        <div key={course._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={course._id}
                            checked={selectedCourses.includes(course._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCourses(prev => [...prev, course._id]);
                              } else {
                                setSelectedCourses(prev => prev.filter(id => id !== course._id));
                              }
                            }}
                          />
                          <Label htmlFor={course._id} className="flex-1 cursor-pointer">
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {course.subject} • {course.gradeLevel} • {course.chapters?.length || 0} chapters
                            </div>
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTeacher} disabled={!selectedTeacher}>
                Assign Courses
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
}
