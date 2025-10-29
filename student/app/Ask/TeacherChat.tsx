import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useCourseStore } from '../../stores/courseStore';
import api from '../../api/axios';
import { sendMessageToTeacher, getChatMessages } from '../../api/student/messages';

/**
 * Teacher Chat Component
 *
 * BACKEND IMPLEMENTATION REQUIRED:
 * This component expects the following backend API endpoints:
 *
 * Student-side endpoints (under /api/student):
 * - POST /messages/teacher - Send message from student to teacher
 *   Body: { message, subjectName, studentId, teacherId, senderType: 'student' }
 *
 * - GET /messages/student/chat/:teacherId/:subjectName - Get chat messages
 *   Returns: { success: true, result: { messages: [...] } }
 *
 * Teacher-side endpoints (under /api/teacher):
 * - GET /messages/chats?teacherEmail=... - Get all teacher chats
 * - GET /messages/chat?teacherEmail=...&studentId=...&subjectName=... - Get specific chat
 * - POST /messages/send - Send message from teacher to student
 *
 * Database Model Required:
 * - Message collection with fields: studentId, teacherId, subjectName, courseName,
 *   message, senderType ('student'|'teacher'), timestamp, isRead, etc.
 */

interface Message {
  _id?: string;
  id: string;
  text: string;
  message?: string;
  sender: 'user' | 'teacher';
  senderId?: string;
  receiverId?: string;
  subjectName?: string;
  timestamp: string | Date;
  createdAt?: string;
  isRead?: boolean;
}

interface Subject {
  name: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
}

interface TeacherChatPageProps {
  courseTeachers?: {
    subjectName: string;
    teacher: {
      id: string;
      name: string;
      email: string;
    } | null;
  }[];
}

export default function TeacherChatPage({ courseTeachers: initialCourseTeachers }: TeacherChatPageProps = {}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedCourse, courses } = useCourseStore();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubjectSelection, setShowSubjectSelection] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [courseTeachers, setCourseTeachers] = useState<any[]>(initialCourseTeachers || []);

  // Get params from navigation
  const params = useLocalSearchParams();
  const courseTeachersParam = params.courseTeachers as string;

  // Parse courseTeachers from params if available
  useEffect(() => {
    if (courseTeachersParam && courseTeachersParam !== 'undefined') {
      try {
        const parsedTeachers = JSON.parse(courseTeachersParam);
        setCourseTeachers(parsedTeachers);
      } catch (error) {
        console.error('Error parsing courseTeachers param:', error);
      }
    }
  }, [courseTeachersParam]);

  // Get available subjects with real teachers
  const availableSubjects = selectedCourse?.subjects?.map(subject => ({
    name: subject.name,
    teacher: getSubjectTeacher(subject.name)
  })) || [];

  // Get real teacher for a specific subject
  function getSubjectTeacher(subjectName: string) {
    if (courseTeachers) {
      const subjectTeacher = courseTeachers.find(ct => ct.subjectName === subjectName);
      if (subjectTeacher?.teacher) {
        return subjectTeacher.teacher;
      }
    }
    // Fallback to course offered by if no specific teacher assigned
    return {
      id: 'default-teacher',
      name: 'Course Instructor',
      email: 'instructor@school.com'
    };
  }

  // Handle subject selection
  const handleSubjectSelect = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setShowSubjectSelection(false);
    // Load existing messages for this subject
    loadMessages(subject.name);
  }, []);

  // Load messages for a subject
  const loadMessages = async (subjectName: string) => {
    if (!user || !selectedSubject?.teacher) return;

    setIsLoadingMessages(true);
    try {
      // Use the new API method
      const response = await getChatMessages(selectedSubject.teacher.id, subjectName);
      if (response.result) {
        const fetchedMessages = response.result.messages || [];
        // Transform messages to match our interface
        const transformedMessages: Message[] = fetchedMessages.map((msg: any) => ({
          id: msg._id || msg.id,
          text: msg.message || msg.text,
          sender: msg.senderType === 'student' ? 'user' : 'teacher',
          senderId: msg.studentId,
          receiverId: msg.teacherId,
          subjectName: msg.subjectName,
          timestamp: msg.timestamp || msg.createdAt,
          createdAt: msg.createdAt,
          isRead: msg.isRead,
        }));
        setMessages(transformedMessages);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      // For now, show empty chat until backend is implemented
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSubject || !user || isLoading) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      senderId: user.id || (user as any)._id,
      receiverId: selectedSubject.teacher?.id,
      subjectName: selectedSubject.name,
      timestamp: new Date(),
    };

    // Add message to local state immediately for better UX
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Use the new API method
      const response = await sendMessageToTeacher({
        message: message.text,
        subjectName: message.subjectName!,
        teacherId: message.receiverId!
      });

      if (response.result) {
        // Message sent successfully - update with server response
        console.log('Message sent successfully');
      } else {
        // Remove message from local state if failed
        setMessages(prev => prev.filter(m => m.id !== message.id));
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error: any) {
      // Remove message from local state if failed
      setMessages(prev => prev.filter(m => m.id !== message.id));
      console.error('Error sending message:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => {
    const timestamp = typeof item.timestamp === 'string' ? new Date(item.timestamp) : item.timestamp;
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View className={`flex-row mb-3 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <View className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          item.sender === 'user'
            ? 'bg-blue-500 rounded-br-sm'
            : 'bg-gray-200 rounded-bl-sm'
        }`}>
          <Text className={`text-sm ${
            item.sender === 'user' ? 'text-white' : 'text-gray-900'
          }`}>
            {item.text}
          </Text>
          <Text className={`text-xs mt-1 ${
            item.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {timeString}
          </Text>
        </View>
      </View>
    );
  };

  // If no course selected
  if (!selectedCourse) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="school" size={64} color="#9CA3AF" />
          <Text className="text-lg font-semibold text-gray-800 mt-4">
            No Course Selected
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center">
            Please select a course to chat with teachers
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-lg font-semibold text-gray-900">
            {selectedSubject ? `Chat - ${selectedSubject.name}` : 'Select Subject'}
          </Text>
          {selectedSubject?.teacher && (
            <Text className="text-sm text-gray-500">
              with {selectedSubject.teacher.name}
            </Text>
          )}
        </View>
        {selectedSubject && (
          <TouchableOpacity
            onPress={() => setShowSubjectSelection(true)}
            className="p-2"
          >
            <MaterialIcons name="edit" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {showSubjectSelection ? (
        /* Subject Selection */
        <View className="flex-1 px-4 py-6">
          <Text className="text-xl font-bold text-gray-900 mb-6">
            Select a Subject to Chat
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {availableSubjects.map((subject, index) => (
              <TouchableOpacity
                key={subject.name}
                onPress={() => handleSubjectSelect(subject)}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <MaterialIcons name="subject" size={24} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {subject.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Teacher: {subject.teacher?.name || 'Not assigned'}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}

            {availableSubjects.length === 0 && (
              <View className="items-center justify-center py-12">
                <MaterialIcons name="school" size={48} color="#9CA3AF" />
                <Text className="text-lg text-gray-600 mt-4">
                  No subjects available
                </Text>
                <Text className="text-sm text-gray-500 mt-2 text-center">
                  Subjects will appear here once they're added to your course
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        /* Chat Interface */
        <View className="flex-1">
          {/* Messages */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            inverted={false}
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <MaterialIcons name="chat" size={48} color="#9CA3AF" />
                <Text className="text-lg text-gray-600 mt-4">
                  No messages yet
                </Text>
                <Text className="text-sm text-gray-500 mt-2 text-center">
                  Start a conversation with your teacher
                </Text>
              </View>
            }
          />

          {/* Message Input */}
          <View className="bg-white border-t border-gray-200 px-4 py-3">
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3 text-sm"
                placeholder="Type your message..."
                value={newMessage}
                onChangeText={setNewMessage}
                multiline={false}
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  newMessage.trim() && !isLoading
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              >
                <MaterialIcons
                  name="send"
                  size={20}
                  color={newMessage.trim() && !isLoading ? 'white' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}