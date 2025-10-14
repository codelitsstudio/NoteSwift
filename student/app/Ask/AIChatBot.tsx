import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function AIChatBot() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you with your studies today?',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const suggestedQuestions = [
    'Explain quadratic equations',
    'What is photosynthesis?',
    'Help with calculus',
    'Study tips for exams',
  ];

  const sendMessage = () => {
    if (message.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're asking about "${message}". Let me help you with that. [This is a demo response - in the real app, AI will provide detailed explanations]`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`mb-4 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <View
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.sender === 'user'
                    ? 'bg-customBlue'
                    : 'bg-white border border-gray-100'
                }`}
              >
                <Text
                  className={`text-base ${
                    msg.sender === 'user' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {msg.text}
                </Text>
              </View>
              <Text className="text-sm text-gray-500 mt-1">{msg.timestamp}</Text>
            </View>
          ))}

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <View className="mt-4">
              <Text className="text-base text-gray-500 mb-3">Suggested questions:</Text>
              <View className="flex-row flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2"
                    onPress={() => handleSuggestedQuestion(question)}
                  >
                    <Text className="text-base text-gray-700">{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="px-6 py-4 bg-white border-t border-gray-100">
          <View className="flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
              <TextInput
                placeholder="Ask anything..."
                value={message}
                onChangeText={setMessage}
                className="flex-1 text-base text-gray-900"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              className={`w-12 h-12 rounded-xl items-center justify-center ${
                message.trim() ? 'bg-customBlue' : 'bg-gray-200'
              }`}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <MaterialIcons 
                name="send" 
                size={20} 
                color={message.trim() ? '#FFFFFF' : '#9CA3AF'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
