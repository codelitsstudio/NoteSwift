
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend, Line, LineChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Users, Activity, BookCheck, Clock } from 'lucide-react';



const userGrowthData = [
  { month: "Jan", newUsers: 186 },
  { month: "Feb", newUsers: 305 },
  { month: "Mar", newUsers: 237 },
  { month: "Apr", newUsers: 273 },
  { month: "May", newUsers: 209 },
  { month: "Jun", newUsers: 250 },
];

const courseEnrollmentData = [
    { name: "Algebra II", value: 400, fill: "hsl(var(--chart-1))" },
    { name: "World History", value: 300, fill: "hsl(var(--chart-2))"  },
    { name: "AP Physics", value: 300, fill: "hsl(var(--chart-3))"  },
    { name: "English Lit", value: 200, fill: "hsl(var(--chart-4))"  },
    { name: "Chemistry", value: 150, fill: "hsl(var(--chart-5))" },
];

const weeklyActiveUsersData = [
  { day: "Mon", users: 120 },
  { day: "Tue", users: 150 },
  { day: "Wed", users: 175 },
  { day: "Thu", users: 130 },
  { day: "Fri", users: 190 },
  { day: "Sat", users: 220 },
  { day: "Sun", users: 210 },
];

const coursesPublishedData = [
  { month: "Jan", courses: 5 },
  { month: "Feb", courses: 8 },
  { month: "Mar", courses: 6 },
  { month: "Apr", courses: 10 },
  { month: "May", courses: 7 },
  { month: "Jun", courses: 12 },
];


const reportMetrics = [
    { title: "Weekly Active Users", value: "890", icon: Activity, change: "+120 from last week" },
    { title: "Total Users (30 days)", value: "1,250", icon: Users, change: "+15.2% from last month" },
    { title: "Published Courses", value: "48", icon: BookCheck, change: "+5 from last month" },
    { title: "Avg. Session Duration", value: "24m", icon: Clock, change: "-2m from last month" },
]

export default function ReportsPage() {
  return (
   
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Reports</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reportMetrics.map((metric) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
              <CardHeader>
                  <CardTitle>User Growth (Last 6 Months)</CardTitle>
                  <CardDescription>New users signing up each month.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userGrowthData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="newUsers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>

          <Card className="shadow-md">
              <CardHeader>
                  <CardTitle>Course Enrollment Breakdown</CardTitle>
                  <CardDescription>Distribution of students across popular courses.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                  <ChartContainer config={{}} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                          <Pie
                              data={courseEnrollmentData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              labelLine={false}
                          >
                              {courseEnrollmentData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                          </Pie>
                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
          
          <Card className="shadow-md">
              <CardHeader>
                  <CardTitle>Weekly Active Users</CardTitle>
                  <CardDescription>Daily active users over the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyActiveUsersData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="day" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                  </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>

          <Card className="shadow-md">
              <CardHeader>
                  <CardTitle>Courses Published (Last 6 Months)</CardTitle>
                  <CardDescription>New courses published each month.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={coursesPublishedData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="courses" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
        </div>
      </div>
  
  );
}
