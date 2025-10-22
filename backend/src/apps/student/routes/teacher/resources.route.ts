import { Router } from "express";
import Resource from "../../models/Resource.model";
import SubjectContent from "../../models/SubjectContent.model";
import JsonResponse from "../../lib/Response";

const router = Router();

// GET /api/teacher/resources?teacherEmail=email&subjectContentId=id&type=type&status=status
router.get("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { teacherEmail, subjectContentId, type, status } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    let query: any = { teacherId: teacher._id, isActive: true };

    // Filter by subject content if provided
    if (subjectContentId) {
      query.subjectContentId = subjectContentId;
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .populate('courseId', 'title subject');

    // Calculate stats for dashboard
    const totalResources = resources.length;
    const storageUsed = resources.reduce((sum, res) => sum + res.fileSize, 0);
    const totalViews = resources.reduce((sum, res) => sum + res.viewCount, 0);
    const totalDownloads = resources.reduce((sum, res) => sum + res.downloadCount, 0);

    jsonResponse.success({
      resources: resources.map(res => ({
        _id: res._id,
        title: res.title,
        description: res.description,
        type: res.type,
        category: res.category,
        fileName: res.fileName,
        fileType: res.fileType,
        fileSize: res.fileSize,
        status: res.status,
        downloadCount: res.downloadCount,
        viewCount: res.viewCount,
        avgRating: res.avgRating,
        courseName: res.courseName,
        subjectName: res.subjectName,
        moduleName: res.moduleName,
        createdAt: res.createdAt,
        updatedAt: res.updatedAt
      })),
      stats: {
        totalResources,
        storageUsed,
        totalViews,
        totalDownloads
      }
    });

  } catch (error) {
    console.error("Error fetching resources:", error);
    jsonResponse.serverError("Failed to fetch resources");
  }
});

// POST /api/teacher/resources
router.post("/", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const {
      title,
      description,
      subjectContentId,
      moduleNumber,
      moduleName,
      topicName,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      mimeType,
      type,
      category = 'lecture-notes',
      tags,
      difficulty,
      targetAudience = 'all',
      batchIds,
      studentIds,
      isPublic = false,
      requiresEnrollment = true
    } = req.body;

    // Validate required fields
    if (!title || !description || !subjectContentId || !fileUrl || !fileName || !fileType || !fileSize || !mimeType || !type) {
      return jsonResponse.clientError("Title, description, subjectContentId, fileUrl, fileName, fileType, fileSize, mimeType, and type are required");
    }

    // Get subject content to validate teacher has access
    const subjectContent = await SubjectContent.findOne({
      _id: subjectContentId,
      teacherId: teacher._id
    });

    if (!subjectContent) {
      return jsonResponse.notAuthorized("You don't have access to this subject content");
    }

    const resource = new Resource({
      title,
      description,
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      moduleNumber,
      moduleName,
      topicName,
      teacherId: teacher._id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      mimeType,
      type,
      category,
      tags,
      difficulty,
      targetAudience,
      batchIds,
      studentIds,
      isPublic,
      requiresEnrollment,
      downloadCount: 0,
      viewCount: 0,
      status: 'draft'
    });

    await resource.save();

    jsonResponse.success({
      resource: {
        _id: resource._id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        fileName: resource.fileName,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
        status: resource.status,
        courseName: resource.courseName,
        subjectName: resource.subjectName,
        createdAt: resource.createdAt
      }
    }, "Resource uploaded successfully");

  } catch (error) {
    console.error("Error uploading resource:", error);
    jsonResponse.serverError("Failed to upload resource");
  }
});

// PATCH /api/teacher/resources/:id
router.patch("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const resource = await Resource.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!resource) {
      return jsonResponse.notFound("Resource not found");
    }

    // Don't allow editing published resources
    if (resource.status === 'published') {
      return jsonResponse.clientError("Cannot edit published resources");
    }

    const updateFields = [
      'title', 'description', 'moduleNumber', 'moduleName', 'topicName',
      'fileUrl', 'fileName', 'fileType', 'fileSize', 'mimeType', 'type',
      'category', 'tags', 'difficulty', 'targetAudience', 'batchIds',
      'studentIds', 'isPublic', 'requiresEnrollment'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (resource as any)[field] = req.body[field];
      }
    });

    await resource.save();

    jsonResponse.success({
      resource: {
        _id: resource._id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        fileName: resource.fileName,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
        updatedAt: resource.updatedAt
      }
    }, "Resource updated successfully");

  } catch (error) {
    console.error("Error updating resource:", error);
    jsonResponse.serverError("Failed to update resource");
  }
});

// POST /api/teacher/resources/:id/publish
router.post("/:id/publish", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const resource = await Resource.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!resource) {
      return jsonResponse.notFound("Resource not found");
    }

    if (resource.status === 'published') {
      return jsonResponse.clientError("Resource already published");
    }

    // Update resource status
    resource.status = 'published';
    await resource.save();

    jsonResponse.success({
      resource: {
        _id: resource._id,
        status: resource.status
      }
    }, "Resource published successfully");

  } catch (error) {
    console.error("Error publishing resource:", error);
    jsonResponse.serverError("Failed to publish resource");
  }
});

// DELETE /api/teacher/resources/:id?teacherEmail=email
router.delete("/:id", async (req, res) => {
  const jsonResponse = new JsonResponse(res);

  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const teacher = res.locals.teacher;

    if (!teacher) {
      return jsonResponse.notAuthorized("Teacher not authenticated");
    }

    const resource = await Resource.findOne({
      _id: id,
      teacherId: teacher._id,
      isActive: true
    });

    if (!resource) {
      return jsonResponse.notFound("Resource not found");
    }

    // Don't allow deleting published resources
    if (resource.status === 'published') {
      return jsonResponse.clientError("Cannot delete published resources");
    }

    resource.isActive = false;
    await resource.save();

    jsonResponse.success({ message: "Resource deleted successfully" });

  } catch (error) {
    console.error("Error deleting resource:", error);
    jsonResponse.serverError("Failed to delete resource");
  }
});

export default router;