import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, CreditCard, ShoppingCart } from "lucide-react";

const billingMetrics = [
  { title: "Total Revenue", value: "$45,231.89", icon: DollarSign, change: "+20.1% from last month" },
  { title: "Active Subscriptions", value: "+2350", icon: Users, change: "+180.1% from last month" },
  { title: "Sales", value: "+12,234", icon: CreditCard, change: "+19% from last month" },
  { title: "New Customers", value: "+573", icon: ShoppingCart, change: "+201 since last hour" },
];

const transactions = [
  { user: "Alice Johnson", email: "alice@example.com", amount: "$99.00", status: "Paid", date: "2024-07-20", plan: "Pro Annual" },
  { user: "Bob Williams", email: "bob@example.com", amount: "$9.99", status: "Paid", date: "2024-07-19", plan: "Basic Monthly" },
  { user: "Charlie Brown", email: "charlie@example.com", amount: "$9.99", status: "Failed", date: "2024-07-19", plan: "Basic Monthly" },
  { user: "Diana Miller", email: "diana@example.com", amount: "$99.00", status: "Paid", date: "2024-07-18", plan: "Pro Annual" },
  { user: "Ethan Davis", email: "ethan@example.com", amount: "$9.99", status: "Paid", date: "2024-07-18", plan: "Basic Monthly" },
];

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-bold font-headline tracking-tight">Payments & Billing</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {billingMetrics.map((metric) => (
          <Card key={metric.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A list of recent payments and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{transaction.user}</div>
                    <div className="text-sm text-muted-foreground">{transaction.email}</div>
                  </TableCell>
                  <TableCell>{transaction.plan}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.status === "Paid" ? "default" : "destructive"}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="text-right">{transaction.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
