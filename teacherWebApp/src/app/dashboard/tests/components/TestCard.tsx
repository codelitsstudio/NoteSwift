import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, FileText, CheckCircle } from "lucide-react";

interface Test {
  _id: string;
  title: string;
  course: string;
  chapter: string;
  description: string;
  scheduledAt: string;
  duration: number;
  totalMarks: number;
  totalQuestions: number;
  status: string;
  enrolledStudents: number;
  submittedCount: number;
  avgScore?: number;
  type: string;
  difficulty: string;
}

interface TestCardProps {
  test: Test;
  onViewDetails?: () => void;
  onViewResults?: () => void;
  onEdit?: () => void;
}

export default function TestCard({ test, onViewDetails, onViewResults, onEdit }: TestCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'easy': 'bg-green-500',
      'medium': 'bg-yellow-500',
      'hard': 'bg-red-500'
    };
    return colors[difficulty] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base">{test.title}</CardTitle>
              <Badge className={getDifficultyColor(test.difficulty)}>{test.difficulty}</Badge>
              <Badge variant="outline">{test.type.toUpperCase()}</Badge>
              <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                {test.status}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {test.course} - {test.chapter}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Schedule</div>
          <div className="text-sm font-medium">{new Date(test.scheduledAt).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Duration</div>
          <div className="text-sm font-medium">{test.duration} min</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Questions</div>
          <div className="text-sm font-medium">{test.totalQuestions}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Students</div>
          <div className="text-sm font-medium">{test.enrolledStudents}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Submissions</div>
          <div className="text-sm font-medium">{test.submittedCount}/{test.enrolledStudents}</div>
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onViewDetails}>
            View Details
          </Button>
          {test.status === 'completed' && (
            <Button size="sm" variant="outline" onClick={onViewResults}>
              View Results
            </Button>
          )}
          <Button size="sm" onClick={onEdit}>
            Edit Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}