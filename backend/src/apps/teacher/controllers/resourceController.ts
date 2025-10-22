import { Request, Response } from 'express';
import Resource from '../models/Resource.model';
import SubjectContent from '../models/SubjectContent.model';
import Teacher from '../models/Teacher.model';

const verifySubjectOwnership = async (teacherEmail: string, subjectContentId: string): Promise<boolean> => {
  const subjectContent = await SubjectContent.findById(subjectContentId);
  return subjectContent ? subjectContent.teacherEmail === teacherEmail : false;
};

// GET /api/teacher/resources - Get teacher's resources
export const getTeacherResources = async (req: Request, res: Response) => {
  try {
    const { teacherEmail, subjectContentId, type, category, status } = req.query;

    if (!teacherEmail) {
      return res.status(400).json({ success: false, message: 'Teacher email required' });
    }

    const query: any = { teacherEmail, isActive: true };
    if (subjectContentId) query.subjectContentId = subjectContentId;
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    const resources = await Resource.find(query).sort({ createdAt: -1 });

    const stats = {
      total: resources.length,
      published: resources.filter(r => r.status === 'published').length,
      draft: resources.filter(r => r.status === 'draft').length,
      totalDownloads: resources.reduce((sum, r) => sum + r.downloadCount, 0),
      totalViews: resources.reduce((sum, r) => sum + r.viewCount, 0),
      byType: {
        notes: resources.filter(r => r.type === 'notes').length,
        video: resources.filter(r => r.type === 'video').length,
        document: resources.filter(r => r.type === 'document').length,
        other: resources.filter(r => !['notes', 'video', 'document'].includes(r.type)).length
      }
    };

    return res.status(200).json({ success: true, data: { resources, stats } });
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch resources', error: error.message });
  }
};

// POST /api/teacher/resources - Upload resource
export const uploadResource = async (req: Request, res: Response) => {
  try {
    const {
      title, description, subjectContentId, teacherEmail,
      fileUrl, fileName, fileType, fileSize, mimeType,
      type, category, moduleNumber, moduleName, topicName,
      tags, difficulty, targetAudience, batchIds, studentIds,
      isPublic, requiresEnrollment
    } = req.body;

    if (!await verifySubjectOwnership(teacherEmail, subjectContentId)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this subject' });
    }

    const subjectContent = await SubjectContent.findById(subjectContentId);
    if (!subjectContent) {
      return res.status(404).json({ success: false, message: 'Subject content not found' });
    }

    const teacher = await Teacher.findOne({ email: teacherEmail });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const resource = new Resource({
      title, description,
      subjectContentId,
      courseId: subjectContent.courseId,
      courseName: subjectContent.courseName,
      subjectName: subjectContent.subjectName,
      moduleNumber, moduleName, topicName,
      teacherId: teacher._id,
      teacherName: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`,
      teacherEmail: teacher.email,
      fileUrl, fileName, fileType, fileSize, mimeType,
      type: type || 'document',
      category: category || 'lecture-notes',
      tags: tags || [],
      difficulty,
      targetAudience: targetAudience || 'all',
      batchIds, studentIds,
      isPublic: isPublic || false,
      requiresEnrollment: requiresEnrollment !== false,
      status: 'published'
    });

    await resource.save();

    // Update SubjectContent if it's a note for a module
    if (moduleNumber && type === 'notes') {
      const module = subjectContent.modules.find(m => m.moduleNumber === moduleNumber);
      if (module) {
        module.hasNotes = true;
        module.notesUrl = fileUrl;
        module.notesTitle = title;
        module.notesUploadedAt = new Date();
        await subjectContent.save();
      }
    }

    return res.status(201).json({ success: true, message: 'Resource uploaded', data: resource });
  } catch (error: any) {
    console.error('Error uploading resource:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload resource', error: error.message });
  }
};

// PATCH /api/teacher/resources/:id - Update resource
export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;
    const updates = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    Object.assign(resource, updates);
    await resource.save();

    return res.status(200).json({ success: true, message: 'Resource updated', data: resource });
  } catch (error: any) {
    console.error('Error updating resource:', error);
    return res.status(500).json({ success: false, message: 'Failed to update resource', error: error.message });
  }
};

// POST /api/teacher/resources/:id/publish - Publish resource
export const publishResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    resource.status = 'published';
    await resource.save();

    return res.status(200).json({ success: true, message: 'Resource published', data: resource });
  } catch (error: any) {
    console.error('Error publishing resource:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish resource', error: error.message });
  }
};

// DELETE /api/teacher/resources/:id - Delete resource
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.query;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.teacherEmail !== teacherEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    resource.isActive = false;
    resource.status = 'archived';
    await resource.save();

    return res.status(200).json({ success: true, message: 'Resource deleted' });
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete resource', error: error.message });
  }
};
