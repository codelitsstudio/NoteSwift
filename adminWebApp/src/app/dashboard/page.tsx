"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  UsersRound,
  NotebookPen,
  StickyNote,
  UserCheck,
} from "lucide-react";
import { DashboardInsights } from "@/components/dashboard-insights";
import { TaskSuggestions } from "@/components/task-suggestions";



const metrics = [
  {
    title: "Total Users",
    value: "1,250",
    icon: UsersRound,
    change: "+15.2% from last month",
  },
  {
    title: "Courses Published",
    value: "48",
    icon: NotebookPen,
    change: "+5 from last month",
  },
  {
    title: "Notes Added",
    value: "520",
    icon: StickyNote,
    change: "+50 from last month",
  },
  {
    title: "Active Users (24h)",
    value: "350",
    icon: UserCheck,
    change: "+20.1% from last month",
  },
];

const userActivityData = [
  { day: "Mon", signups: 20 },
  { day: "Tue", signups: 35 },
  { day: "Wed", signups: 25 },
  { day: "Thu", signups: 40 },
  { day: "Fri", signups: 50 },
  { day: "Sat", signups: 60 },
  { day: "Sun", signups: 30 },
];

const courseEngagementData = [
  { name: "Algebra II", value: 400, fill: "hsl(var(--chart-1))" },
  { name: "World History", value: 300, fill: "hsl(var(--chart-2))" },
  { name: "AP Physics", value: 300, fill: "hsl(var(--chart-3))" },
  { name: "English Lit", value: 200, fill: "hsl(var(--chart-4))" },
  { name: "Chemistry", value: 150, fill: "hsl(var(--chart-5))" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Removed duplicate <h1>Dashboard</h1> */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>


          <DashboardInsights />
       
       
          <TaskSuggestions />
  

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">
              User Activity This Week
            </CardTitle>
            <CardDescription>
              New user sign-ups over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userActivityData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="signups"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">
              Course Engagement
            </CardTitle>
            <CardDescription>
              Breakdown of most popular courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                  <Pie
                    data={courseEngagementData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                  >
                    {courseEngagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
