import api from "../axios";

export interface SendMessageRequest {
  message: string;
  subjectName: string;
  teacherId: string;
}

export interface SendMessageResponse {
  result: {
    message: {
      _id: string;
      message: string;
      senderType: 'student';
      timestamp: string;
      isRead: boolean;
    };
  };
  error: boolean;
  status: number;
  message: string;
}

export interface GetChatMessagesResponse {
  result: {
    messages: Array<{
      _id: string;
      studentId: string;
      teacherId: string;
      subjectName: string;
      courseName: string;
      message: string;
      senderType: 'student' | 'teacher';
      timestamp: string;
      isRead: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  error: boolean;
  status: number;
  message: string;
}

export const sendMessageToTeacher = async (data: SendMessageRequest): Promise<SendMessageResponse> => {
  const res = await api.post("/messages/teacher", data);
  const response = res.data as SendMessageResponse;

  // Check if the response contains an error
  if (response.error) {
    throw new Error(response.message || 'Failed to send message');
  }

  return response;
};

export const getChatMessages = async (teacherId: string, subjectName: string): Promise<GetChatMessagesResponse> => {
  const res = await api.get(`/messages/student/chat/${teacherId}/${subjectName}`);
  const response = res.data as GetChatMessagesResponse;

  // Check if the response contains an error
  if (response.error) {
    throw new Error(response.message || 'Failed to fetch chat messages');
  }

  return response;
};