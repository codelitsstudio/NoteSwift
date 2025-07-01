import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-bold font-headline tracking-tight">Settings & Configuration</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-md mt-6">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage basic application settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input id="appName" defaultValue="NoteSwift Admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="America/New_York" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="shadow-md mt-6">
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>Adjust the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable dark mode for the dashboard.</p>
                </div>
                <Switch />
              </div>
               <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input id="primaryColor" defaultValue="#2563EB" />
                <p className="text-sm text-muted-foreground">Set the primary accent color for buttons and links.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="shadow-md mt-6">
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>Connect with third-party services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="googleApi">Google API Key</Label>
                <Input id="googleApi" type="password" defaultValue="SECRET_KEY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripeApi">Stripe API Key</Label>
                <Input id="stripeApi" type="password" defaultValue="SECRET_KEY" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features">
           <Card className="shadow-md mt-6">
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable experimental features across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>AI Content Suggestions</Label>
                  <p className="text-sm text-muted-foreground">Allow AI to suggest tags and descriptions.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>New User Onboarding Flow</Label>
                  <p className="text-sm text-muted-foreground">Show a guided tour for new users.</p>
                </div>
                <Switch />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Real-time Collaboration</Label>
                  <p className="text-sm text-muted-foreground">Enable live collaboration on notes (Beta).</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
