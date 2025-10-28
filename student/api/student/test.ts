import api from '../axios';

export interface Test {
  _id: string;
  title: string;
  description: string;
  type: 'mcq' | 'mixed' | 'pdf';
  category: string;
  duration: number;
  totalMarks: number;
  passingMarks?: number;
  totalQuestions: number;
  courseName: string;
  subjectName: string;
  moduleName?: string;
  startTime?: string;
  endTime?: string;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  showResultsImmediately: boolean;
  instructions?: string;
  attemptInfo?: {
    attemptNumber: number;
    status: string;
    startedAt: string;
    submittedAt?: string;
    totalScore: number;
    percentage: number;
    timeSpent: number;
  };
  canAttempt: boolean;
}

export interface TestDetail {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  type: 'mcq' | 'mixed' | 'pdf';
  duration: number;
  totalMarks: number;
  totalQuestions: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  courseName: string;
  subjectName: string;
  moduleName?: string;
  questions?: Question[];
  pdfUrl?: string;
  pdfFileName?: string;
  answerKeyUrl?: string;
  attemptInfo?: {
    attemptId: string;
    startedAt: string;
    timeSpent: number;
    answers: any[];
  };
}

export interface Question {
  questionNumber: number;
  question: string;
  options: string[];
  type: string;
  marks: number;
  explanation?: string;
}

export interface TestAttempt {
  attemptId: string;
  totalScore: number;
  percentage: number;
  passed: boolean;
  showResults: boolean;
}

export interface TestResult {
  test: {
    _id: string;
    title: string;
    type: string;
    totalMarks: number;
    passingMarks?: number;
    totalQuestions: number;
    showCorrectAnswers: boolean;
  };
  attempt: {
    attemptId: string;
    attemptNumber: number;
    startedAt: string;
    submittedAt?: string;
    timeSpent: number;
    totalScore: number;
    percentage: number;
    status: string;
    feedback?: string;
    gradedAt?: string;
    passed: boolean;
    answers?: DetailedAnswer[];
  };
}

export interface DetailedAnswer {
  questionNumber: number;
  question: string;
  selectedOption?: number;
  selectedOptionText?: string;
  isCorrect: boolean;
  correctOption?: number;
  correctOptionText?: string;
  marks: number;
  explanation?: string;
}

export const studentTestAPI = {
  // Get student's available tests
  getAvailableTests: async () => {
    const res = await api.get('/student/tests');
    // Backend returns { error, message, result, status }
    // Transform to expected format for frontend
    if (res.data.error === false) {
      return {
        success: true,
        data: res.data.result
      };
    } else {
      return {
        success: false,
        error: res.data.message || 'Failed to fetch tests'
      };
    }
  },

  // Get test details for taking
  getTestDetails: async (testId: string) => {
    const res = await api.get(`/student/tests/${testId}`);
    if (res.data.error === false) {
      return {
        success: true,
        data: res.data.result
      };
    } else {
      return {
        success: false,
        error: res.data.message || 'Failed to fetch test details'
      };
    }
  },

  // Start a test attempt
  startTestAttempt: async (testId: string) => {
    const res = await api.post(`/student/tests/${testId}/start`);
    console.log('🔍 Raw start response:', res.data);
    if (res.data.error === false) {
      console.log('✅ Start API success, result:', res.data.result);
      return {
        success: true,
        data: res.data.result
      };
    } else {
      console.log('❌ Start API failed:', res.data.message);
      return {
        success: false,
        error: res.data.message || 'Failed to start test'
      };
    }
  },

  // Submit test answers
  submitTest: async (testId: string, data: { answers: any[]; timeSpent: number }) => {
    const res = await api.post(`/student/tests/${testId}/submit`, data);
    console.log('🔍 Raw submit response:', res.data);
    if (res.data.error === false) {
      console.log('✅ Submit API success, result:', res.data.result);
      return {
        success: true,
        data: res.data.result
      };
    } else {
      console.log('❌ Submit API failed:', res.data.message);
      return {
        success: false,
        error: res.data.message || 'Failed to submit test'
      };
    }
  },

  // Get test results
  getTestResults: async (testId: string, attemptId: string) => {
    console.log('🔍 Calling results API with testId:', testId, 'attemptId:', attemptId);
    const res = await api.get(`/student/tests/${testId}/results/${attemptId}`);
    console.log('🔍 Raw results response:', res.data);
    if (res.data.error === false) {
      console.log('✅ Results API success, result:', res.data.result);
      return {
        success: true,
        data: res.data.result
      };
    } else {
      console.log('❌ Results API failed:', res.data.message);
      return {
        success: false,
        error: res.data.message || 'Failed to fetch test results'
      };
    }
  },
};

export default studentTestAPI;