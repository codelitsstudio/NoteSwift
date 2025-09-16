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
