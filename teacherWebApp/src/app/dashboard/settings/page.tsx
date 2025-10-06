import dbConnect from "@/lib/mongoose";
import Teacher from "@/models/Teacher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProfileSettings } from "@/components/teacher/profile-settings";
import { NotificationSettings } from "@/components/teacher/notification-settings";

async function getTeacher() {
  await dbConnect();
  const teacher = await Teacher.findOne({}).lean();
  return JSON.parse(JSON.stringify(teacher));
}

export default async function SettingsPage() {
  const teacher = await getTeacher();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-bold font-headline tracking-tight">Profile & Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-md mt-6">
            <CardHeader>
              <CardTitle>Teacher Profile</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings teacher={teacher} />
              <Separator className="my-6" />
              <div>
                <CardTitle className="text-lg">Earnings</CardTitle>
                <p className="text-3xl font-bold mt-2">₹{teacher?.earnings ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-md mt-6">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you get notified.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="shadow-md mt-6">
            <CardHeader>
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>Sync live classes & tests to your calendar.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>Google Calendar ICS URL</Label>
                <Input placeholder="https://calendar.google.com/.../basic.ics" />
              </div>
              <div>
                <Label>Outlook Calendar ICS URL</Label>
                <Input placeholder="https://outlook.office.com/.../basic.ics" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="shadow-md mt-6">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Adjust the look and feel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Application Name</Label>
                <Input defaultValue="NoteSwift Teacher" />
              </div>
              <div>
                <Label>Primary Color</Label>
                <Input defaultValue="#2563EB" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
