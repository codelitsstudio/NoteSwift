import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SubscriptionWrapper } from "@/components/subscription-wrapper";


const auditLogs = [
  { id: 1, user: "Alice Johnson", action: "Course Created", details: "Created 'Introduction to Algebra'", timestamp: "2024-07-20 10:00 AM", avatar: "person woman" },
  { id: 2, user: "Alice Johnson", action: "Settings Updated", details: "Changed primary color", timestamp: "2024-07-20 09:45 AM", avatar: "person woman" },
  { id: 3, user: "Bob Williams", action: "User Role Changed", details: "Promoted 'Charlie Brown' to Instructor", timestamp: "2024-07-19 03:20 PM", avatar: "person man" },
  { id: 4, user: "Alice Johnson", action: "Announcement Sent", details: "Subject: 'Scheduled Maintenance'", timestamp: "2024-07-19 01:00 PM", avatar: "person woman" },
  { id: 5, user: "System", action: "Billing Failed", details: "Payment failed for 'Charlie Brown'", timestamp: "2024-07-19 12:00 PM", avatar: "S" },
];

const getActionVariant = (action: string) => {
  if (action.includes("Created") || action.includes("Sent")) return "default";
  if (action.includes("Updated") || action.includes("Changed")) return "secondary";
  if (action.includes("Deleted") || action.includes("Failed")) return "destructive";
  return "outline";
}


export default function AuditLogPage() {
  return (
     <SubscriptionWrapper requiredPlan="Pro">
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-bold font-headline tracking-tight">Audit Log</h1>
      <Card className="shadow-md w-full">
        <CardHeader>
          <CardTitle>Admin Activity</CardTitle>
          <CardDescription>Monitor admin actions for security and accountability.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint={log.avatar.includes('person') ? log.avatar : 'person abstract'} />
                        <AvatarFallback>{log.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{log.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </SubscriptionWrapper>
  );
}
