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
import { Plus, X } from "lucide-react";

interface VideoUpload {
  file: File | null;
  title: string;
  duration: string;
}

export function CreateContentForm({ modules, teacherEmail }: { modules: any[]; teacherEmail: string | null }) {
  const [moduleNumber, setModuleNumber] = useState<string>("");
  const [contentType, setContentType] = useState<string>("video");
  const [videos, setVideos] = useState<VideoUpload[]>([{ file: null, title: "", duration: "" }]);
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [notesTitle, setNotesTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    if (value === "notes") {
      setVideos([{ file: null, title: "", duration: "" }]);
    } else {
      setNotesFile(null);
      setNotesTitle("");
    }
  };

  const addVideo = () => {
    setVideos([...videos, { file: null, title: "", duration: "" }]);
  };

  const removeVideo = (index: number) => {
    if (videos.length > 1) {
      setVideos(videos.filter((_, i) => i !== index));
    }
  };

  const updateVideo = (index: number, field: keyof VideoUpload, value: string | File | null) => {
    const updatedVideos = [...videos];
    updatedVideos[index] = { ...updatedVideos[index], [field]: value };
    setVideos(updatedVideos);
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
          // Validate video uploads
          const validVideos = videos.filter(v => v.file !== null);
          if (validVideos.length === 0) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Please select at least one video file to upload",
            });
            return;
          }

          // Check if all videos have titles
          const videosWithoutTitles = validVideos.filter(v => !v.title.trim());
          if (videosWithoutTitles.length > 0) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Please provide titles for all video files",
            });
            return;
          }

          const videoFiles = validVideos.map(v => v.file!);
          const videoTitles = validVideos.map(v => v.title.trim());
          const videoDurations = validVideos.map(v => v.duration && v.duration.trim() ? parseInt(v.duration.trim()) : '');

          // Upload videos
          const response = await teacherAPI.courses.uploadVideo(
            teacherEmail,
            moduleNum,
            videoFiles,
            videoTitles,
            videoDurations
          );

          if (response.success) {
            toast({
              title: "Success",
              description: `${videoFiles.length} video${videoFiles.length > 1 ? 's' : ''} uploaded successfully!`,
            });
            router.push("/dashboard/courses");
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: response.message || "Failed to upload videos",
            });
          }
        } else if (contentType === "notes") {
          if (!notesFile) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Please select a notes file to upload",
            });
            return;
          }

          if (!notesTitle.trim()) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Notes title is required",
            });
            return;
          }

          // Upload notes file
          const response = await teacherAPI.courses.uploadNotes(
            teacherEmail,
            moduleNum,
            notesFile,
            notesTitle.trim()
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

      {contentType === "video" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Video Files *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVideo}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Video
            </Button>
          </div>

          {videos.map((video, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Video {index + 1}</h4>
                {videos.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`video-file-${index}`}>Video File *</Label>
                <Input
                  id={`video-file-${index}`}
                  type="file"
                  accept="video/*"
                  onChange={(e) => updateVideo(index, 'file', e.target.files?.[0] || null)}
                  required
                />
                {video.file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {video.file.name} ({(video.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`video-title-${index}`}>Video Title *</Label>
                <Input
                  id={`video-title-${index}`}
                  value={video.title}
                  onChange={(e) => updateVideo(index, 'title', e.target.value)}
                  placeholder={`e.g., Introduction to Algebra - Part ${index + 1}`}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`video-duration-${index}`}>Video Duration (minutes)</Label>
                <Input
                  id={`video-duration-${index}`}
                  type="number"
                  min="1"
                  value={video.duration}
                  onChange={(e) => updateVideo(index, 'duration', e.target.value)}
                  placeholder="e.g., 45"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {contentType === "notes" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="notesTitle">Notes Title *</Label>
            <Input
              id="notesTitle"
              value={notesTitle}
              onChange={(e) => setNotesTitle(e.target.value)}
              placeholder="e.g., Algebra Fundamentals Notes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notesFile">Notes File *</Label>
            <Input
              id="notesFile"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              onChange={(e) => setNotesFile(e.target.files?.[0] || null)}
              required
            />
            {notesFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {notesFile.name} ({(notesFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </>
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
        {isPending ? "Uploading..." : `Upload ${contentType === "video" ? "Video" + (videos.filter(v => v.file).length > 1 ? "s" : "") : "Notes"}`}
      </Button>
    </form>
  );
}
