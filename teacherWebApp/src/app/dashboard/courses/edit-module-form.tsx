"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import teacherAPI from "@/lib/api/teacher-api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function EditModuleForm({ course, module, teacherEmail }: { course: any; module: any; teacherEmail: string }) {
  console.log('EditModuleForm received module:', module);
  console.log('Module description:', module?.description);
  
  const [moduleName, setModuleName] = useState(module.moduleName || "");
  const [description, setDescription] = useState(module.description || "");
  const [order, setOrder] = useState<number | undefined>(module.order);
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

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Module description is required",
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
        const data: any = {};

        if (moduleName.trim() !== module.moduleName) {
          data.moduleName = moduleName.trim();
        }

        if (description.trim() !== (module.description || "")) {
          data.description = description.trim();
        }

        if (order !== undefined && order !== module.order) {
          data.order = order;
        }

        // Only make API call if there are changes
        if (Object.keys(data).length === 0) {
          toast({
            title: "No Changes",
            description: "No changes were made to the module.",
          });
          return;
        }

        const response = await teacherAPI.courses.updateModule(teacherEmail, module.moduleNumber, data);

        if (response.success) {
          toast({
            title: "Success",
            description: "Module updated successfully!",
          });
          router.push("/dashboard/courses");
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.message || "Failed to update module",
          });
        }
      } catch (error: any) {
        console.error("Error updating module:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update module",
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
        <Label>Module Number</Label>
        <div className="p-3 bg-muted rounded-md">
          <p className="font-medium">{module.moduleNumber}</p>
          <p className="text-sm text-muted-foreground">Cannot be changed</p>
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

      <div className="space-y-2">
        <Label htmlFor="order">Order</Label>
        <Input
          id="order"
          type="number"
          min="1"
          value={order || ""}
          onChange={(e) => setOrder(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Display order"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of what this module covers..."
          rows={3}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Updating..." : "Update Module"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}