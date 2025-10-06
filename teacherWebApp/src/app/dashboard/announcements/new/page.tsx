import { CreateAnnouncementForm } from "../announcement-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default async function CreateAnnouncementPage() {
  // Mock data for teacher's courses (teacher-focused)
  const courses = [
    { 
      _id: '507f1f77bcf86cd799439012', 
      title: 'Grade 11 Study Package (Mathematics)' 
    }
  ];

  // Not needed for teacher (batches are admin-only)
  const batches: any[] = [];
  
  // Only the current teacher
  const teachers = [
    { 
      _id: '507f1f77bcf86cd799439011', 
      name: 'John Doe (You)' 
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Announcement</h1>
        <p className="text-muted-foreground mt-2">
          Send important updates and information to your Grade 11 Mathematics students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Announcement Details
          </CardTitle>
          <CardDescription>
            Compose your announcement with a clear title and message. You can schedule it for later or send it immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAnnouncementForm courses={courses} batches={batches} teachers={teachers} />
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Use clear titles</strong> - Students see the title first in notifications</p>
          <p>• <strong>Keep messages concise</strong> - Important information should be easy to scan</p>
          <p>• <strong>Schedule strategically</strong> - Send during times when students are most active</p>
          <p>• <strong>Mark urgency appropriately</strong> - High priority for time-sensitive announcements only</p>
        </CardContent>
      </Card>
    </div>
  );
}
