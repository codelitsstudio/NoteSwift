"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import teacherAPI from "@/lib/api/teacher-api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function CreateContentForm({ modules, teacherEmail }: { modules: any[]; teacherEmail: string | null }) {
  const [moduleNumber, setModuleNumber] = useState<string>("");
  const [contentType, setContentType] = useState<string>("video");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    setFile(null); // Reset file when content type changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!moduleNumber) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a module",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title is required",
      });
      return;
    }

    if (!file) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a file to upload",
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
        const moduleNum = parseInt(moduleNumber);

        if (contentType === "video") {
          // Upload video file
          const response = await teacherAPI.courses.uploadVideo(
            teacherEmail,
            moduleNum,
            file,
            title.trim(),
            videoDuration ? parseInt(videoDuration) : undefined
          );

          if (response.success) {
            toast({
              title: "Success",
              description: "Video uploaded successfully!",
            });
            router.push("/dashboard/courses");
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: response.message || "Failed to upload video",
            });
          }
        } else if (contentType === "notes") {
          // Upload notes file
          const response = await teacherAPI.courses.uploadNotes(
            teacherEmail,
            moduleNum,
            file,
            title.trim()
          );

          if (response.success) {
            toast({
              title: "Success",
              description: "Notes uploaded successfully!",
            });
            router.push("/dashboard/courses");
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: response.message || "Failed to upload notes",
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "Not Implemented",
            description: "Only video and notes upload are currently supported",
          });
        }
      } catch (error: any) {
        console.error("Error uploading content:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to upload content",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Module *</Label>
        <Select value={moduleNumber} onValueChange={setModuleNumber}>
          <SelectTrigger>
            <SelectValue placeholder="Select a module" />
          </SelectTrigger>
          <SelectContent>
            {modules.map((module) => (
              <SelectItem key={module.moduleNumber} value={module.moduleNumber.toString()}>
                Module {module.moduleNumber}: {module.moduleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Content Type *</Label>
        <Select value={contentType} onValueChange={handleContentTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Video Lecture</SelectItem>
            <SelectItem value="notes">PDF Notes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">{contentType === "video" ? "Video Title" : "Notes Title"} *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={contentType === "video" ? "e.g., Introduction to Algebra" : "e.g., Algebra Fundamentals Notes"}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">{contentType === "video" ? "Video File" : "Notes File"} *</Label>
        <Input
          id="file"
          type="file"
          accept={contentType === "video" ? "video/*" : ".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.gif"}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        {file && (
          <p className="text-sm text-muted-foreground">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {contentType === "video" && (
        <div className="space-y-2">
          <Label htmlFor="videoDuration">Video Duration (minutes)</Label>
          <Input
            id="videoDuration"
            type="number"
            min="1"
            value={videoDuration}
            onChange={(e) => setVideoDuration(e.target.value)}
            placeholder="e.g., 45"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the content..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Uploading..." : `Upload ${contentType === "video" ? "Video" : "Notes"}`}
      </Button>
    </form>
  );
}
