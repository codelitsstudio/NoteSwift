import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Users, BookOpen, Eye } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  testsCount?: number;
  completedTests?: number;
  tests?: any[]; // Add tests array to show test details
}

interface CourseCardProps {
  course: Course;
  onViewTests?: () => void;
  onCreateTest?: () => void;
}

export default function CourseCard({ course, onViewTests, onCreateTest }: CourseCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">{course.title}</h3>
              <p className="text-xs text-muted-foreground">{course.subject}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {course.grade}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {course.testsCount || 0} Tests
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.completedTests || 0} Active
            </span>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{course.title} - Test Details</DialogTitle>
                  <DialogDescription>
                    Questions and answers for tests in this module
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {course.tests && course.tests.length > 0 ? (
                    course.tests.map((test: any, testIndex: number) => (
                      <div key={test._id || testIndex} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">{test.title}</h3>
                          <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                            {test.status === 'active' ? 'Active' : test.status === 'draft' ? 'Draft' : 'Completed'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                          <p>Type: {test.type?.toUpperCase()} • Questions: {test.questions?.length || 0} • Duration: {test.duration} mins</p>
                        </div>
                        {test.questions && test.questions.length > 0 ? (
                          <div className="space-y-4">
                            <h4 className="font-medium">Questions:</h4>
                            {test.questions.map((question: any, qIndex: number) => (
                              <div key={qIndex} className="border-l-4 border-blue-200 pl-4 py-2">
                                <div className="flex items-start gap-3">
                                  <span className="font-medium text-sm min-w-[24px]">Q{qIndex + 1}:</span>
                                  <div className="flex-1">
                                    <p className="text-sm mb-2">{question.questionText || question.text}</p>
                                    {question.options && question.options.length > 0 && (
                                      <div className="space-y-1">
                                        {question.options.map((option: string, optIndex: number) => {
                                          const isCorrect = question.correctAnswer === option || 
                                                          question.correctAnswer === String.fromCharCode(65 + optIndex) ||
                                                          question.correctAnswer === (optIndex + 1);
                                          return (
                                            <div key={optIndex} className={`text-xs p-2 rounded ${
                                              isCorrect ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-50'
                                            }`}>
                                              <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                                              {isCorrect && <span className="ml-2 text-green-600">✓ Correct</span>}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {question.marks && (
                                      <p className="text-xs text-muted-foreground mt-2">Marks: {question.marks}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No questions added yet.</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tests available</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={onCreateTest}
            >
              Edit Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}