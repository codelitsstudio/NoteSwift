import Link from "next/link";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import dbConnect from "@/lib/mongoose";
import CourseModel from "@/models/Course";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { QuickUploads } from "@/components/quick-uploads";

type Course = {
  _id: string;
  title: string;
  subject: string;
  status: string;
  createdAt: string;
};

async function getCourses(): Promise<Course[]> {
  try {
    await dbConnect();
    const courses = await CourseModel.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(); // Better performance
    return courses.map((course: any) => ({
      ...course,
      _id: course._id.toString(),
      createdAt: course.createdAt?.toISOString() || "",
    }));
  } catch (e) {
    console.error("Failed to fetch courses:", e);
    return [];
  }
}

export default async function ContentPage() {
  const courses = await getCourses();

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex flex-col gap-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">
            Content Management
          </h1>
          <Button asChild className="gap-1 w-full sm:w-auto">
            <Link href="/dashboard/content/new">
              <PlusCircle size={16} /> Add New Course
            </Link>
          </Button>
        </div>

        <QuickUploads courses={courses} />

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>Manage your existing courses here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Course Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[150px]">Created At</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No courses found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                  {courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.subject || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.status === "Published" ? "default" : "secondary"
                          }
                        >
                          {course.status || "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {course.createdAt
                          ? format(new Date(course.createdAt), "PP")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Publish</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
