import { CourseForm } from "@/components/course-form";

export default function NewCoursePage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl font-bold font-headline tracking-tight">Create New Course</h1>
      <CourseForm />
    </div>
  );
}
