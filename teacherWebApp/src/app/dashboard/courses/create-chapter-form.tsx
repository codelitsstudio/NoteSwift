"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import teacherAPI from "@/lib/api/teacher-api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function CreateChapterForm({ course, teacherEmail }: { course: any; teacherEmail: string | null }) {
  const [moduleName, setModuleName] = useState("");
  const [moduleNumber, setModuleNumber] = useState<number | undefined>();
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!moduleName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Module name is required",
      });
      return;
    }

    if (!teacherEmail) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Teacher email not found",
      });
      return;
    }

    startTransition(async () => {
      try {
        const data: any = {
          moduleName: moduleName.trim(),
        };

        if (moduleNumber !== undefined && moduleNumber > 0) {
          data.moduleNumber = moduleNumber;
        }

        if (description.trim()) {
          data.description = description.trim();
        }

        if (order !== undefined && order > 0) {
          data.order = order;
        }

        const response = await teacherAPI.courses.createModule(teacherEmail, data);

        if (response.success) {
          toast({
            title: "Success",
            description: "Module created successfully!",
          });
          router.push("/dashboard/courses");
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.message || "Failed to create module",
          });
        }
      } catch (error: any) {
        console.error("Error creating module:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to create module",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Subject</Label>
        <div className="p-3 bg-muted rounded-md">
          <p className="font-medium">{course.subjectName}</p>
          <p className="text-sm text-muted-foreground">({course.title}) - {course.program}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="moduleName">Module Name *</Label>
        <Input
          id="moduleName"
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
          placeholder="e.g., Introduction to Algebra"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="moduleNumber">Module Number</Label>
          <Input
            id="moduleNumber"
            type="number"
            min="1"
            value={moduleNumber || ""}
            onChange={(e) => setModuleNumber(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Auto-assigned if empty"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            min="1"
            value={order || ""}
            onChange={(e) => setOrder(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Auto-assigned if empty"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of what this module covers..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Module"}
      </Button>
    </form>
  );
}
