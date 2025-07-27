
"use client";

import { useState } from "react";
import { useLoading } from "@/context/loading-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const announcements = [
  { id: 1, subject: "Scheduled Maintenance Downtime", date: "2024-07-20", status: "Sent" },
  { id: 2, subject: "New Feature: AI Quiz Generator!", date: "2024-07-18", status: "Sent" },
  { id: 3, subject: "Welcome to the new semester!", date: "2024-07-15", status: "Sent" },
  { id: 4, subject: "Upcoming Holiday Schedule", date: "2024-07-21", status: "Draft" },
];

export default function NotificationsPage() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
        startLoading();

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
        stopLoading();

    toast({
      title: "Announcement Sent!",
      description: "Your message has been delivered to all users.",
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-bold font-headline tracking-tight">Notifications & Announcements</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-md h-full">
            <CardHeader>
              <CardTitle>Send New Announcement</CardTitle>
              <CardDescription>This will be sent to all users.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="e.g., Important Update" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Compose your announcement..." className="min-h-[150px]" required />
                </div>
                <Button type="submit" className="w-full" disabled={isSending}>
                  {isSending && <Loader2 className="animate-spin" />}
                  Send Announcement
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
           <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>A log of previously sent announcements.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.subject}</TableCell>
                      <TableCell>
                         <Badge variant={item.status === "Sent" ? "default" : "secondary"}>
                           {item.status}
                         </Badge>
                      </TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
