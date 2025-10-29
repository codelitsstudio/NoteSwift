import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useCourseStore } from '../../stores/courseStore';
import { sendMessageToTeacher, getChatMessages, deleteMessage } from '../../api/student/messages';

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
  const { selectedCourse } = useCourseStore();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubjectSelection, setShowSubjectSelection] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [courseTeachers, setCourseTeachers] = useState<any[]>(initialCourseTeachers || []);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardListenersRef = useRef<any[]>([]);

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

  // Keyboard visibility tracking - FIXED
  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Store listeners in ref for cleanup
    keyboardListenersRef.current = [showListener, hideListener];

    return () => {
      // Proper cleanup
      keyboardListenersRef.current.forEach(listener => {
        listener?.remove?.();
      });
      keyboardListenersRef.current = [];
    };
  }, []);

  // Load messages for a subject
  const loadMessages = useCallback(async (subjectName: string) => {
    if (!user || !selectedSubject?.teacher) return;

    setIsLoadingMessages(true);
    try {
      const response = await getChatMessages(selectedSubject.teacher.id, subjectName);
      if (response.result) {
        const fetchedMessages = response.result.messages || [];
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
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user, selectedSubject]);

  // Load messages when subject changes
  useEffect(() => {
    if (selectedSubject?.teacher) {
      loadMessages(selectedSubject.name);
    }
  }, [selectedSubject, loadMessages]);

  // Manual refresh function
  const refreshMessages = useCallback(() => {
    if (selectedSubject?.teacher) {
      loadMessages(selectedSubject.name);
    }
  }, [selectedSubject, loadMessages]);

  // Periodic refresh for real-time updates
  useEffect(() => {
    if (!selectedSubject?.teacher) return;

    const interval = setInterval(() => {
      if (!isLoadingMessages) {
        refreshMessages();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoadingMessages, selectedSubject, refreshMessages]);

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
    loadMessages(subject.name);
  }, [loadMessages]);

  // Send message
  const handleSendMessage = useCallback(async () => {
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

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    setIsLoading(true);

    try {
      const response = await sendMessageToTeacher({
        message: message.text,
        subjectName: message.subjectName!,
        teacherId: message.receiverId!
      });

      if (response.result) {
        console.log('Message sent successfully');
      } else {
        setMessages(prev => prev.filter(m => m.id !== message.id));
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error: any) {
      setMessages(prev => prev.filter(m => m.id !== message.id));
      console.error('Error sending message:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [newMessage, selectedSubject, user, isLoading]);

  // Delete message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await deleteMessage(messageId);
      if (!response.error) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId && msg._id !== messageId));
        Alert.alert('Success', 'Message deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete message');
      }
    } catch (error: any) {
      console.error('Error deleting message:', error);
      Alert.alert('Error', error.message || 'Failed to delete message');
    }
  }, []);

  // Handle long press on message
  const handleMessageLongPress = useCallback((message: Message) => {
    // Only allow deleting own messages
    if (message.sender === 'user' && (message.senderId === user?.id || message.senderId === (user as any)?._id)) {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => handleDeleteMessage(message._id || message.id)
          }
        ]
      );
    }
  }, [user, handleDeleteMessage]);

  // Render message item
  const renderMessage = useCallback((item: Message) => {
    const timestamp = typeof item.timestamp === 'string' ? new Date(item.timestamp) : item.timestamp;
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity 
        key={item.id}
        onLongPress={() => handleMessageLongPress(item)}
        style={{
          flexDirection: 'row',
          marginBottom: 16,
          justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start'
        }}
        activeOpacity={0.8}
      >
        <View 
          style={{
            maxWidth: '75%',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: item.sender === 'user' ? '#3B82F6' : '#FFFFFF',
            borderWidth: item.sender === 'teacher' ? 1 : 0,
            borderColor: '#F3F4F6',
            borderBottomRightRadius: item.sender === 'user' ? 4 : 16,
            borderBottomLeftRadius: item.sender === 'teacher' ? 4 : 16,
          }}
        >
          <Text 
            style={{
              fontSize: 12,
              lineHeight: 20,
              color: item.sender === 'user' ? '#FFFFFF' : '#111827'
            }}
          >
            {item.text}
          </Text>
          <Text 
            style={{
              fontSize: 12,
              marginTop: 8,
              color: item.sender === 'user' ? '#DBEAFE' : '#6B7280'
            }}
          >
            {timeString}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleMessageLongPress]);

  // Handle back navigation safely
  const handleBack = useCallback(() => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/Ask/AskPage');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [router]);

  // If no course selected
  if (!selectedCourse) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <MaterialIcons name="school" size={64} color="#9CA3AF" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 16 }}>
            No Course Selected
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
            Please select a course to chat with teachers
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              marginTop: 24,
              backgroundColor: '#3B82F6',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top', 'bottom']}>
      {/* Background Decorative Elements */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: -80, right: -80, width: 160, height: 160, backgroundColor: '#DBEAFE', borderRadius: 80, opacity: 0.2 }} />
        <View style={{ position: 'absolute', bottom: -128, left: -128, width: 256, height: 256, backgroundColor: '#EFF6FF', borderRadius: 128, opacity: 0.3 }} />
        <View style={{ position: 'absolute', top: '33%', right: -64, width: 128, height: 128, backgroundColor: '#E0E7FF', borderRadius: 64, opacity: 0.25 }} />
      </View>

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 10
      }}>
        <TouchableOpacity onPress={handleBack} style={{ padding: 8, borderRadius: 9999, backgroundColor: '#F9FAFB' }}>
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
            {selectedSubject ? `Chat - ${selectedSubject.name}` : 'Select Subject'}
          </Text>
          {selectedSubject?.teacher && (
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              with {selectedSubject.teacher.name}
            </Text>
          )}
        </View>
        {selectedSubject && (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={refreshMessages}
              disabled={isLoadingMessages}
              style={{ padding: 8, marginRight: 8, borderRadius: 9999, backgroundColor: '#F9FAFB' }}
            >
              <MaterialIcons
                name="refresh"
                size={20}
                color={isLoadingMessages ? "#9CA3AF" : "#6B7280"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSubjectSelection(true)}
              style={{ padding: 8, borderRadius: 9999, backgroundColor: '#F9FAFB' }}
            >
              <MaterialIcons name="edit" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingMessages}
              onRefresh={refreshMessages}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        >
          {showSubjectSelection ? (
            /* Subject Selection */
            <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                Select a Subject to Chat
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, marginBottom: 16 }}>
                Choose a subject below to start a conversation with the respective teacher.
              </Text>

              {availableSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject.name}
                  onPress={() => handleSubjectSelect(subject)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#F3F4F6'
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 56,
                      height: 56,
                      backgroundColor: '#DBEAFE',
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      <MaterialIcons name="subject" size={26} color="#3B82F6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                        {subject.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        Teacher: {subject.teacher?.name || 'Not assigned'}
                      </Text>
                    </View>
                    <View style={{
                      width: 32,
                      height: 32,
                      backgroundColor: '#EFF6FF',
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MaterialIcons name="chevron-right" size={20} color="#3B82F6" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {availableSubjects.length === 0 && (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                  <MaterialIcons name="school" size={48} color="#9CA3AF" />
                  <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 16 }}>
                    No subjects available
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, textAlign: 'center' }}>
                    Subjects will appear here once they&apos;re added to your course
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* Chat Interface */
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
              {/* Messages */}
              <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 16 }}>
                {messages.map(renderMessage)}
                {messages.length === 0 && (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64 }}>
                    <View style={{
                      width: 80,
                      height: 80,
                      backgroundColor: '#DBEAFE',
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}>
                      <MaterialIcons name="chat" size={32} color="#3B82F6" />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                      No messages yet
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', maxWidth: 300 }}>
                      Start a conversation with your teacher by sending your first message
                    </Text>
                  </View>
                )}
              </View>

              {/* Message Input */}
              <View style={{
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB',
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: keyboardVisible ? 24 : 16
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <View style={{
                    flex: 1,
                    backgroundColor: '#F9FAFB',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 0,
                    borderWidth: 1,
                    borderColor: '#E5E7EB'
                  }}>
                    <TextInput
                      style={{
                        fontSize: 12,
                        color: '#111827',
                        lineHeight: 20,
                        maxHeight: 80,
                        minHeight: 20,
                        paddingVertical: 12,
                        textAlignVertical: 'center'
                      }}
                      placeholder="Type your message..."
                      placeholderTextColor="#9CA3AF"
                      value={newMessage}
                      onChangeText={setNewMessage}
                      multiline={true}
                      maxLength={500}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: newMessage.trim() && !isLoading ? '#3B82F6' : '#D1D5DB'
                    }}
                  >
                    <MaterialIcons
                      name="send"
                      size={18}
                      color={newMessage.trim() && !isLoading ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                </View>
                {newMessage.length > 400 && (
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'right' }}>
                    {newMessage.length}/500
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}