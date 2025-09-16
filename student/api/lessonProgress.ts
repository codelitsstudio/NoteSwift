import api from "./axios";

export const getLessonProgress = async (courseId: string) => {
  const res = await api.get(`/courses/progress/${courseId}`);
  return res.data;
};

export const updateLessonProgress = async (courseId: string, lessonId: string, completed: boolean, totalLessons: number) => {
  const res = await api.post(`/courses/progress/${courseId}`, {
    lessonId,
    completed,
    totalLessons,
  });
  return res.data;
};

// New module progress endpoints
export const getModuleProgress = async (courseId: string, moduleNumber: number) => {
  const res = await api.get(`/courses/progress/${courseId}/module/${moduleNumber}`);
  return res.data;
};

export const updateModuleProgress = async (courseId: string, moduleNumber: number, videoCompleted?: boolean, notesCompleted?: boolean, progress?: number) => {
  const res = await api.post(`/courses/progress/${courseId}/module`, {
    moduleNumber,
    videoCompleted,
    notesCompleted,
    progress,
  });
  return res.data;
};
