/**
 * Teacher API Client
 * Centralized API calls for all teacher dashboard features
 */

import { API_BASE_URL } from '@/config/api';

const API_URL = `${API_BASE_URL}/api`;

// ==================== TYPE DEFINITIONS ====================
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface Stats {
  total: number;
  active?: number;
  pending?: number;
  draft?: number;
  published?: number;
  [key: string]: any;
}

// ==================== HELPER FUNCTIONS ====================
async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get the JWT token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('teacherToken') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers if they exist
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Network error occurred',
    };
  }
}

async function uploadFileAPI<T = any>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get the JWT token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('teacherToken') : null;
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'File upload failed');
    }

    return data;
  } catch (error: any) {
    console.error(`Upload Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Upload error occurred',
    };
  }
}

// ==================== ANNOUNCEMENT APIs ====================
export const announcementAPI = {
  getAll: (teacherEmail: string, subjectContentId?: string) => {
    const params = new URLSearchParams({ teacherEmail });
    if (subjectContentId) params.append('subjectContentId', subjectContentId);
    return fetchAPI(`/teacher/announcements?${params}`);
  },

  create: (data: any) => {
    return fetchAPI('/teacher/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: any) => {
    return fetchAPI(`/teacher/announcements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  send: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/announcements/${id}/send`, {
      method: 'POST',
      body: JSON.stringify({ teacherEmail }),
    });
  },

  delete: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/announcements/${id}?teacherEmail=${teacherEmail}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ASSIGNMENT APIs ====================
export const assignmentAPI = {
  getAll: (teacherEmail: string, subjectContentId?: string, status?: string) => {
    const params = new URLSearchParams({ teacherEmail });
    if (subjectContentId) params.append('subjectContentId', subjectContentId);
    if (status) params.append('status', status);
    return fetchAPI(`/teacher/assignments?${params}`);
  },

  create: (data: any) => {
    return fetchAPI('/teacher/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: any) => {
    return fetchAPI(`/teacher/assignments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getSubmissions: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/assignments/${id}/submissions?teacherEmail=${teacherEmail}`);
  },

  gradeSubmission: (assignmentId: string, submissionId: string, data: any) => {
    return fetchAPI(`/teacher/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  publish: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/assignments/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ teacherEmail }),
    });
  },

  delete: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/assignments/${id}?teacherEmail=${teacherEmail}`, {
      method: 'DELETE',
    });
  },
};

// ==================== TEST APIs ====================
export const testAPI = {
  getAll: (teacherEmail: string, subjectContentId?: string, status?: string) => {
    const params = new URLSearchParams({ teacherEmail });
    if (subjectContentId) params.append('subjectContentId', subjectContentId);
    if (status) params.append('status', status);
    return fetchAPI(`/teacher/tests?${params}`);
  },

  create: (data: any) => {
    return fetchAPI('/teacher/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: any) => {
    return fetchAPI(`/teacher/tests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  uploadPDF: (testId: string, pdfFile: File, teacherEmail: string) => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    // teacherEmail is now obtained from JWT token in backend, no need to send it
    return uploadFileAPI(`/teacher/tests/${testId}/upload-pdf`, formData);
  },

  getAttempts: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/tests/${id}/attempts?teacherEmail=${teacherEmail}`);
  },

  gradeAttempt: (testId: string, attemptId: string, data: any) => {
    return fetchAPI(`/teacher/tests/${testId}/attempts/${attemptId}/grade`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  publish: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/tests/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ teacherEmail }),
    });
  },

  delete: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/tests/${id}?teacherEmail=${teacherEmail}`, {
      method: 'DELETE',
    });
  },
};

// ==================== QUESTION/DOUBT APIs ====================
export const questionAPI = {
  getAll: (teacherEmail?: string, status?: string, priority?: string, fetchAll?: boolean) => {
    const params = new URLSearchParams();
    if (teacherEmail) params.append('teacherEmail', teacherEmail);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (fetchAll) params.append('all', 'true');
    return fetchAPI(`/teacher/questions?${params}`);
  },

  getAllUnassigned: (status?: string, priority?: string) => {
    // Same as getAll but without teacherEmail to get all questions
    return questionAPI.getAll(undefined, status, priority, true);
  },

  getById: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/questions/${id}?teacherEmail=${teacherEmail}`);
  },

  answer: (id: string, data: any) => {
    return fetchAPI(`/teacher/questions/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  setPriority: (id: string, priority: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/questions/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority, teacherEmail }),
    });
  },

  resolve: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/questions/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ teacherEmail }),
    });
  },

  acceptAnswer: (id: string, answerId: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/questions/${id}/answers/${answerId}/accept`, {
      method: 'PATCH',
      body: JSON.stringify({ teacherEmail }),
    });
  },

  delete: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/questions/${id}?teacherEmail=${teacherEmail}`, {
      method: 'DELETE',
    });
  },
};

// ==================== LIVE CLASS APIs ====================
export const liveClassAPI = {
  getAll: (teacherEmail: string, subjectContentId?: string, upcoming?: boolean) => {
    const params = new URLSearchParams({ teacherEmail });
    if (subjectContentId) params.append('subjectContentId', subjectContentId);
    if (upcoming !== undefined) params.append('upcoming', String(upcoming));
    return fetchAPI(`/teacher/live-classes?${params}`);
  },

  schedule: (data: any) => {
    return fetchAPI('/teacher/live-classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: any) => {
    return fetchAPI(`/teacher/live-classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  start: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/live-classes/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ teacherEmail }),
    });
  },

  end: (id: string, data: any) => {
    return fetchAPI(`/teacher/live-classes/${id}/end`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  markAttendance: (id: string, data: any) => {
    return fetchAPI(`/teacher/live-classes/${id}/attendance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancel: (id: string, data: any) => {
    return fetchAPI(`/teacher/live-classes/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/live-classes/${id}?teacherEmail=${teacherEmail}`, {
      method: 'DELETE',
    });
  },
};

// ==================== BATCH APIs ====================
export const batchAPI = {
  getAll: (teacherEmail: string, subjectContentId?: string) => {
    const params = new URLSearchParams({ teacherEmail });
    if (subjectContentId) params.append('subjectContentId', subjectContentId);
    return fetchAPI(`/teacher/batches?${params}`);
  },

  create: (data: any) => {
    return fetchAPI('/teacher/batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: any) => {
    return fetchAPI(`/teacher/batches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  addStudents: (id: string, data: any) => {
    return fetchAPI(`/teacher/batches/${id}/students`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeStudent: (id: string, studentId: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/batches/${id}/students/${studentId}?teacherEmail=${teacherEmail}`, {
      method: 'DELETE',
    });
  },

  delete: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/batches/${id}?teacherEmail=${teacherEmail}`, {
      method: 'DELETE',
    });
  },
};

// ==================== RESOURCE APIs ====================
export const resourceAPI = {
  getAll: (teacherEmail: string, subjectContentId?: string, type?: string, status?: string) => {
    const params = new URLSearchParams({ teacherEmail });
    if (subjectContentId) params.append('subjectContentId', subjectContentId);
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    return fetchAPI(`/teacher/resources?${params}`);
  },

  upload: (data: any) => {
    return fetchAPI('/teacher/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: any) => {
    return fetchAPI(`/teacher/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  publish: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/resources/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ teacherEmail }),
    });
  },

  delete: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/resources/${id}?teacherEmail=${teacherEmail}`, {
      method: 'DELETE',
    });
  },
};

// ==================== COURSE/MODULE APIs ====================
export const courseAPI = {
  getSubjectContent: (teacherEmail: string) => {
    return fetchAPI(`/teacher/courses/all-subject-content`);
  },

  createModule: (teacherEmail: string, data: any) => {
    return fetchAPI(`/teacher/courses/modules?teacherEmail=${teacherEmail}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateModule: (teacherEmail: string, moduleNumber: number, data: any) => {
    return fetchAPI(`/teacher/courses/modules/${moduleNumber}?teacherEmail=${teacherEmail}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteModule: (teacherEmail: string, moduleNumber: number) => {
    return fetchAPI(`/teacher/courses/modules/${moduleNumber}?teacherEmail=${teacherEmail}`, {
      method: 'DELETE',
    });
  },

  uploadVideo: (teacherEmail: string, moduleNumber: number, videoFiles: File[], videoTitles: string[], videoDurations?: (number | string | undefined)[], replaceVideoIndex?: number) => {
    const formData = new FormData();
    videoFiles.forEach((file, index) => {
      formData.append('videos', file);
    });
    formData.append('moduleNumber', moduleNumber.toString());
    formData.append('videoTitles', JSON.stringify(videoTitles));
    if (videoDurations) {
      formData.append('videoDurations', JSON.stringify(videoDurations));
    }
    if (replaceVideoIndex !== undefined) {
      formData.append('replaceVideoIndex', replaceVideoIndex.toString());
    }
    return uploadFileAPI(`/teacher/upload/video?teacherEmail=${teacherEmail}`, formData);
  },

  uploadNotes: (teacherEmail: string, moduleNumber: number, notesFile: File, notesTitle: string) => {
    const formData = new FormData();
    formData.append('notes', notesFile);
    formData.append('moduleNumber', moduleNumber.toString());
    formData.append('notesTitle', notesTitle);
    return uploadFileAPI(`/teacher/upload/notes?teacherEmail=${teacherEmail}`, formData);
  },
};

// ==================== ANALYTICS APIs ====================
export const analyticsAPI = {
  getAnalytics: (teacherEmail: string) => {
    return fetchAPI(`/teacher/analytics?teacherEmail=${teacherEmail}`);
  },

  getWeeklyActivity: (teacherEmail: string) => {
    return fetchAPI(`/teacher/analytics/weekly-activity?teacherEmail=${teacherEmail}`);
  },
};

// ==================== EXTENDED ASSIGNMENT APIs ====================
// Add plagiarism check to assignment API
const extendedAssignmentAPI = {
  ...assignmentAPI,
  checkPlagiarism: (id: string, teacherEmail: string) => {
    return fetchAPI(`/teacher/assignments/${id}/plagiarism-check?teacherEmail=${teacherEmail}`, {
      method: 'POST',
    });
  },
};

// ==================== STUDENT APIs ====================
export const studentAPI = {
  getAll: (teacherEmail: string, courseId?: string) => {
    const params = new URLSearchParams({ teacherEmail });
    if (courseId) params.append('courseId', courseId);
    return fetchAPI(`/teacher/students?${params}`);
  },
};

// ==================== EXPORT ALL ====================
export const teacherAPI = {
  announcements: announcementAPI,
  assignments: extendedAssignmentAPI,
  tests: testAPI,
  questions: questionAPI,
  liveClasses: liveClassAPI,
  batches: batchAPI,
  resources: resourceAPI,
  courses: courseAPI,
  analytics: analyticsAPI,
  students: studentAPI,
};

export default teacherAPI;
