import { ResourcesClient } from "./resources-client";
import teacherAPI from "@/lib/api/teacher-api";

async function getData() {
  const teacherEmail = "teacher@example.com";
  
  try {
    const response = await teacherAPI.resources.getAll(teacherEmail);
    const resources = response.data?.resources || [];
    const stats = response.data?.stats || {};

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const transformedResources = resources.map((r: any) => ({
      _id: r._id,
      title: r.title,
      description: r.description,
      type: r.type,
      fileUrl: r.fileUrl,
      fileSize: formatFileSize(r.fileSize || 0),
      chapter: r.moduleName || 'General',
      topic: r.topicName || 'Reference',
      uploadedAt: r.createdAt,
      sharedWith: r.targetAudience === 'all' ? 'all' : r.targetAudience === 'batch' ? 'team' : 'selected',
      teamName: r.batchIds?.length ? `${r.batchIds.length} batches` : undefined,
      studentCount: r.studentIds?.length || 0,
      viewCount: r.viewCount || 0,
      downloadCount: r.downloadCount || 0
    }));

    const uniqueChapters = [...new Set(resources.map((r: any) => r.moduleName).filter(Boolean))] as string[];

    return {
      resources: transformedResources,
      chapters: uniqueChapters,
      students: [],
      teams: [],
      stats: {
        totalResources: stats.total || 0,
        totalSize: `${((stats.totalDownloads || 0) / 1000).toFixed(1)} MB`,
        totalViews: stats.totalViews || 0,
        totalDownloads: stats.totalDownloads || 0
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      resources: [],
      chapters: [],
      students: [],
      teams: [],
      stats: { totalResources: 0, totalSize: '0 MB', totalViews: 0, totalDownloads: 0 }
    };
  }
}

export default async function ResourcesPage() {
  const data = await getData();
  
  return <ResourcesClient {...data} resources={data.resources as any} />;
}
