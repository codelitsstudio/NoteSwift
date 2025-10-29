import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, ActivityIndicator, Keyboard, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../api/axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface CourseData {
  courseId: string;
  courseTitle: string;
  subjects?: {
    name: string;
    description?: string;
    modules?: any[];
  }[];
  program?: string;
  description?: string;
}

interface SubjectData {
  name: string;
  description?: string;
  modules?: any[];
}

interface ModuleData {
  name: string;
  description?: string;
}

export default function AIChatBot() {
  const { courseData } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you with your studies today?\n\nNote: Chat conversations are automatically deleted after 10 days.',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [courseInfo, setCourseInfo] = useState<CourseData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatHistory, setChatHistory] = useState<{
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
    courseTitle?: string;
  }[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(Date.now().toString());
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animation
  const sidebarAnimation = useRef(new Animated.Value(-320)).current; // -320 is roughly the width of the sidebar

  // Generate context-aware suggested questions
  const getSuggestedQuestions = () => {
    if (selectedModule) {
      return [
        `Explain ${selectedModule.name} in detail`,
        `What are the key concepts in ${selectedModule.name}?`,
        `Give me examples related to ${selectedModule.name}`,
        `How does ${selectedModule.name} relate to ${selectedSubject?.name}?`,
      ];
    } else if (selectedSubject) {
      return [
        `What is ${selectedSubject.name} about?`,
        `Explain the fundamentals of ${selectedSubject.name}`,
        `What are the main topics in ${selectedSubject.name}?`,
        `Help me understand ${selectedSubject.name} better`,
      ];
    } else if (courseInfo) {
      return [
        `What will I learn in ${courseInfo.courseTitle}?`,
        `What are the prerequisites for ${courseInfo.courseTitle}?`,
        `How long does ${courseInfo.courseTitle} take to complete?`,
        `What skills will I gain from ${courseInfo.courseTitle}?`,
      ];
    } else {
      return [
        'Explain quadratic equations',
        'What is photosynthesis?',
        'Help with calculus',
        'Study tips for exams',
      ];
    }
  };

  const suggestedQuestions = getSuggestedQuestions();

  // Parse course data from router params
  useEffect(() => {
    if (courseData && typeof courseData === 'string') {
      try {
        const parsedCourseData = JSON.parse(courseData);
        setCourseInfo(parsedCourseData);
        console.log('📚 Course data loaded:', parsedCourseData);
      } catch (error) {
        console.error('❌ Error parsing course data:', error);
      }
    }
  }, [courseData]);

  // Load chat history from backend on mount
  useEffect(() => {
    loadChatHistoryFromBackend();
  }, []);

  // Keyboard visibility tracking
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom when keyboard appears to keep input visible
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const loadChatHistoryFromBackend = async () => {
    try {
      const response = await api.get('/ai/history');
      if (response.data.success) {
        const backendChats = response.data.data.map((chat: any) => ({
          id: chat.chatId,
          title: chat.title,
          lastMessage: chat.lastMessage,
          timestamp: chat.createdAt,
          courseTitle: chat.courseTitle
        }));
        setChatHistory(backendChats);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      // Prepare API payload
      const payload = {
        message: userMessage.text,
        courseContext: courseInfo ? {
          courseId: courseInfo.courseId,
          courseTitle: courseInfo.courseTitle,
          subjects: courseInfo.subjects,
          program: courseInfo.program,
          description: courseInfo.description
        } : undefined,
        subjectContext: selectedSubject ? {
          subjectName: selectedSubject.name,
          subjectDescription: selectedSubject.description,
          modules: selectedSubject.modules
        } : undefined,
        moduleContext: selectedModule ? {
          moduleName: selectedModule.name,
          moduleDescription: selectedModule.description
        } : undefined,
        conversationHistory
      };

      // Call backend AI API with error handling
      const response = await api.post('/ai/chat', payload, {
        timeout: 30000, // 30 second timeout
      });

      if (response.data.success) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.data.response,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiResponse]);

        // Automatically save chat to history after AI response
        setTimeout(() => {
          saveChatToBackend([...messages, userMessage, aiResponse]);
        }, 500);
      } else {
        throw new Error(response.data.message || 'Failed to get AI response');
      }

    } catch (error: any) {
      console.error('AI Chat Error:', error);

      // Provide more specific error messages
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to the AI service. Please check your internet connection and try again.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'The AI service is temporarily unavailable. Please try again later.';
      }

      const aiErrorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: errorMessage,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleSubjectSelect = (subject: SubjectData) => {
    setSelectedSubject(subject);
    setSelectedModule(null); // Reset module when subject changes
    setShowSubjectSelector(false);
    setShowModuleSelector(false);
  };

  const handleModuleSelect = (module: ModuleData) => {
    setSelectedModule(module);
    setShowModuleSelector(false);
  };

  const clearContext = () => {
    setSelectedSubject(null);
    setSelectedModule(null);
  };

  // Chat History Management
  const saveChatToBackend = async (currentMessages: Message[]) => {
    if (currentMessages.length <= 1) return; // Don't save if only welcome message

    try {
      const chatTitle = currentMessages[1]?.text.slice(0, 50) + (currentMessages[1]?.text.length > 50 ? '...' : '');
      const lastMessage = currentMessages[currentMessages.length - 1]?.text.slice(0, 100) + (currentMessages[currentMessages.length - 1]?.text.length > 100 ? '...' : '');

      const payload = {
        chatId: currentChatId,
        title: chatTitle || 'New Chat',
        lastMessage,
        courseTitle: courseInfo?.courseTitle,
        courseId: courseInfo?.courseId,
        subjectName: selectedSubject?.name,
        moduleName: selectedModule?.name,
        messages: currentMessages
      };

      await api.post('/ai/history', payload);
      console.log('💾 Chat saved to backend');
      
      // Refresh chat history in sidebar
      loadChatHistoryFromBackend();
    } catch (error) {
      console.error('Failed to save chat to backend:', error);
    }
  };

  const startNewChat = async () => {
    // Save current chat before starting new one
    if (messages.length > 1) {
      await saveChatToBackend(messages);
    }

    setCurrentChatId(Date.now().toString());
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your AI assistant. How can I help you with your studies today?\n\nNote: Chat conversations are automatically deleted after 10 days.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');
    setSelectedSubject(null);
    setSelectedModule(null);
    setShowSubjectSelector(false);
    setShowModuleSelector(false);
  };

  const loadChatFromHistory = async (chatId: string) => {
    try {
      const response = await api.get(`/ai/history/${chatId}`);
      if (response.data.success) {
        const chat = response.data.data;
        setMessages(chat.messages);
        setCurrentChatId(chat.chatId);

        // Restore context if available
        if (chat.subjectName && courseInfo?.subjects) {
          const subject = courseInfo.subjects.find(s => s.name === chat.subjectName);
          if (subject) {
            setSelectedSubject(subject);
            if (chat.moduleName && subject.modules) {
              const module = subject.modules.find((m: any) => m.name === chat.moduleName);
              if (module) {
                setSelectedModule(module);
              }
            }
          }
        }
        
        setShowSidebar(false); // Close sidebar after loading chat
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      // Fallback to just closing sidebar
      setShowSidebar(false);
    }
  };

  // Remove auto-cleanup since backend handles TTL deletion

  // Sidebar animation
  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: showSidebar ? 0 : -320,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSidebar, sidebarAnimation]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top', 'bottom']}>
      {/* Sidebar Overlay */}
      {showSidebar && (
        <TouchableOpacity
          activeOpacity={1}
          className="absolute inset-0 bg-black/50 z-50"
          onPress={() => setShowSidebar(false)}
        >
          <View className="flex-1 flex-row">
            {/* Sidebar */}
            <Animated.View
              className="w-80 bg-gray-50"
              style={{
                transform: [{ translateX: sidebarAnimation }],
              }}
            >
              <View className="flex-1">
                {/* Sidebar Header */}
                <View className="px-6 py-5">

                  <View className="flex-row mt-2 items-center justify-between -mx-4 mb-1 px-1 pb-5 border-b border-gray-300">
                    <Text className="text-lg font-semibold text-gray-800">Chat History</Text>
                    <TouchableOpacity
                      onPress={() => setShowSidebar(false)}
                      className="p-2 rounded-lg"
                    >
                      <MaterialIcons name="close" size={20} color="#222" />
                    </TouchableOpacity>

                  </View>
                    <TouchableOpacity
                    onPress={async () => await startNewChat()}
                    className="flex-row items-center px-3 mt-4 py-2 bg-customBlue rounded-lg"
                  >
                    <MaterialIcons name="add" size={20} color="#FFFFFF" />
                    <Text className="text-white font-medium ml-2">New Chat</Text>
                  </TouchableOpacity>
                </View>

                {/* Chat History List */}
                <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                  {chatHistory.length === 0 ? (
                    <View className="items-center justify-center py-16 px-6">
                      <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                        <MaterialIcons name="chat-bubble-outline" size={32} color="#9CA3AF" />
                      </View>
                      <Text className="text-gray-500 text-center text-base font-medium mb-2">
                        No chat history yet
                      </Text>
                      <Text className="text-gray-400 text-center text-sm leading-5">
                        Start a conversation to see your chats here.
                      </Text>
                    </View>
                  ) : (
                    chatHistory.map((chat) => (
                      <TouchableOpacity
                        key={chat.id}
                        onPress={() => loadChatFromHistory(chat.id)}
                        className={`mx-4 my-2 p-4 rounded-xl border ${
                          chat.id === currentChatId
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <View className="flex-row items-start mb-2">
                          <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mr-3 mt-0.5">
                            <MaterialIcons name="chat" size={16} color="#6B7280" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-800 mb-1" numberOfLines={1}>
                              {chat.title}
                            </Text>
                            <Text className="text-xs text-gray-600 mb-3" numberOfLines={2}>
                              {chat.lastMessage}
                            </Text>
                            <View className="flex-row items-center justify-between">
                              <Text className="text-xs text-gray-500 font-medium">
                                {new Date(chat.timestamp).toLocaleDateString()}
                              </Text>
                              {chat.courseTitle && (
                                <View className="bg-gray-100 px-2 py-1 rounded-full">
                                  <Text className="text-xs text-gray-600 font-medium">
                                    {chat.courseTitle.length > 15 ? chat.courseTitle.substring(0, 15) + '...' : chat.courseTitle}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>

                {/* Footer */}
                <View className="px-6 py-4 bg-white border-t border-gray-200">
                  <Text className="text-xs text-gray-500 text-center font-medium">
                    💬 Chats are automatically deleted after 10 days
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      )}

      {/* Header with Course Context - Fixed at top */}
      <View className="px-4 py-4 bg-white border-t border-blue-100 z-10">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setShowSidebar(true)}
            className="p-2 mr-3"
          >
            <MaterialIcons name="menu" size={24} color="#6B7280" />
          </TouchableOpacity>

          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-gray-900">
              AI Learning Assistant
            </Text>
            {courseInfo && (
              <Text className="text-sm text-blue-600 font-medium mt-1">
                {courseInfo.courseTitle}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              router.back()
            }}
            className="p-2"
          >
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Context Selection */}
        {courseInfo && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-gray-800">Learning Context</Text>
              <TouchableOpacity
                onPress={clearContext}
                className="px-3 py-1.5 bg-blue-100 rounded-full border border-blue-200"
              >
                <Text className="text-xs text-blue-700 font-medium">Clear All</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              {/* Subject Selector */}
              <TouchableOpacity
                onPress={() => {
                  setShowSubjectSelector(!showSubjectSelector);
                  setShowModuleSelector(false);
                }}
                className={`flex-1 px-4 py-4 rounded-xl border-2 ${
                  selectedSubject
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-blue-200 bg-white hover:border-blue-300'
                }`}
                style={{
                  transform: [{ scale: showSubjectSelector ? 1.02 : 1 }],
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={`text-sm font-medium ${
                    selectedSubject ? 'text-blue-800' : 'text-gray-700'
                  }`}>
                    {selectedSubject ? selectedSubject.name : 'Select Subject'}
                  </Text>
                  <MaterialIcons
                    name={showSubjectSelector ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={20}
                    color={selectedSubject ? "#1D4ED8" : "#6B7280"}
                  />
                </View>
              </TouchableOpacity>

              {/* Module Selector */}
              {selectedSubject && (
                <TouchableOpacity
                  onPress={() => {
                    setShowModuleSelector(!showModuleSelector);
                    setShowSubjectSelector(false);
                  }}
                  className={`flex-1 px-4 py-4 rounded-xl border-2 ${
                    selectedModule
                      ? 'border-green-400 bg-green-50'
                      : 'border-green-200 bg-white hover:border-green-300'
                  }`}
                  style={{
                    transform: [{ scale: showModuleSelector ? 1.02 : 1 }],
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-sm font-medium ${
                      selectedModule ? 'text-green-800' : 'text-gray-700'
                    }`}>
                      {selectedModule ? selectedModule.name : 'Select Module'}
                    </Text>
                    <MaterialIcons
                      name={showModuleSelector ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                      size={20}
                      color={selectedModule ? "#047857" : "#6B7280"}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Subject Options */}
            {showSubjectSelector && courseInfo.subjects && (
              <View className="mt-2 bg-white border-2 border-blue-200 rounded-xl overflow-hidden">
                <ScrollView showsVerticalScrollIndicator={false} className="max-h-60">
                  {courseInfo.subjects.map((subject, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSubjectSelect(subject)}
                      className="px-4 py-3 border-b border-blue-100 last:border-b-0 active:bg-blue-50 transition-colors duration-150"
                    >
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3">
                          <MaterialIcons name="subject" size={16} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-gray-800 font-medium">{subject.name}</Text>
                          {subject.description && (
                            <Text className="text-xs text-gray-600 mt-1">{subject.description}</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Module Options */}
            {showModuleSelector && selectedSubject?.modules && (
              <View className="mt-2 bg-white border-2 border-green-200 rounded-xl overflow-hidden">
                <ScrollView showsVerticalScrollIndicator={false} className="max-h-60">
                  {selectedSubject.modules.map((module: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleModuleSelect(module)}
                      className="px-4 py-3 border-b border-green-100 last:border-b-0 active:bg-green-50 transition-colors duration-150"
                    >
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
                          <MaterialIcons name="school" size={16} color="#059669" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-gray-800 font-medium">{module.name}</Text>
                          {module.description && (
                            <Text className="text-xs text-gray-600 mt-1">{module.description}</Text>
                          )}
                        </View>
                      </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Main Content - Keyboard Avoiding */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Messages Container */}
          <View className="flex-1 px-4 pt-4">
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`mb-4 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.sender === 'user'
                      ? 'bg-blue-500'
                      : 'bg-white border-2 border-blue-100'
                  }`}
                >
                  <Text
                    className={`text-base leading-6 ${
                      msg.sender === 'user' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {msg.text}
                  </Text>
                </View>
                <Text className={`text-xs mt-2 px-2 ${
                  msg.sender === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-500'
                }`}>
                  {msg.timestamp}
                </Text>
              </View>
            ))}

           {messages.length === 1 && suggestedQuestions.length > 0 && (
    <View className="mt-4">
      <Text className="text-base text-gray-700 font-medium mb-3">
        Suggested questions:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {suggestedQuestions.map((question, index) => (
          <TouchableOpacity
            key={`suggestion-${index}`}
            activeOpacity={0.8}
            className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5 mx-1"
            onPress={() => {
              // Defer state update to next tick
              requestAnimationFrame(() => {
                setMessage(question);
              });
            }}
          >
            <Text className="text-sm text-blue-700 font-semibold">
              {question}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )}
          </View>

          {/* Message Input */}
          <View className={`px-4 py-4 bg-white border-t border-blue-100 ${keyboardVisible ? 'pb-6' : 'pb-4'}`}>
            <View className="flex-row items-center gap-3">
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 2,
                  borderColor: '#BFDBFE',
                }}
              >
                <TextInput
                  placeholder="Ask anything about your studies..."
                  value={message}
                  onChangeText={(text) => {
                    // Use requestAnimationFrame to defer state update
                    requestAnimationFrame(() => {
                      setMessage(text);
                    });
                  }}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: '#111827',
                    textAlignVertical: 'center',
                    padding: 0,
                  }}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                  editable={!isLoading}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: message.trim() && !isLoading ? '#3B82F6' : '#E5E7EB',
                  shadowColor: message.trim() && !isLoading ? '#3B82F6' : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: message.trim() && !isLoading ? 4 : 0,
                }}
                onPress={sendMessage}
                disabled={!message.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialIcons
                    name="send"
                    size={20}
                    color={message.trim() ? '#FFFFFF' : '#9CA3AF'}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
