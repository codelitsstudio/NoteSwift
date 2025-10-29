import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../api/axios';
import { useAuthStore } from '../../../stores/authStore';

interface AskQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  subjectName: string;
  moduleNumber: number;
  chapterTitle: string;
  teacherName?: string;
}

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  visible,
  onClose,
  courseId,
  subjectName,
  moduleNumber,
  chapterTitle,
  teacherName
}) => {
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async () => {
    if (!title.trim() || !questionText.trim()) {
      Alert.alert('Error', 'Please fill in both title and question text');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to ask questions');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/questions', {
        title: title.trim(),
        questionText: questionText.trim(),
        courseId,
        subjectName,
        moduleNumber,
        moduleName: chapterTitle,
        topicName: chapterTitle,
        isAnonymous,
        isPublic: true,
        tags: ['student-question']
      });

      console.log('Question submission response:', response);

      // Handle different response formats
      if (response.data?.success || response.status === 200 || response.status === 201) {
        Alert.alert(
          'Question Submitted',
          'Your question has been sent to the teacher. You will receive a notification when they respond.',
          [{ text: 'OK', onPress: onClose }]
        );
        // Reset form
        setTitle('');
        setQuestionText('');
        setIsAnonymous(false);
      } else {
        throw new Error(response.data?.message || 'Failed to submit question');
      }
    } catch (error: any) {
      console.error('Error submitting question:', error);
      console.error('Error response:', error.response);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to submit question. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setTitle('');
    setQuestionText('');
    setIsAnonymous(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetAndClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
          <TouchableOpacity onPress={resetAndClose} className="p-2">
            <MaterialIcons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Ask a Question</Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Context Info */}
          <View className="bg-blue-50 rounded-lg p-4 mt-4 mb-6">
            <Text className="text-sm font-medium text-gray-900 mb-2">Question Context</Text>
            <View className="space-y-1">
              <Text className="text-sm text-gray-800">
                <Text className="font-medium">Subject:</Text> {subjectName}
              </Text>
              <Text className="text-sm text-gray-800">
                <Text className="font-medium">Module:</Text> {chapterTitle}
              </Text>
              {teacherName && (
                <Text className="text-sm text-gray-800">
                  <Text className="font-medium">Teacher:</Text> {teacherName}
                </Text>
              )}
            </View>
          </View>

          {/* Title Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Question Title</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-sm"
              placeholder="Brief title for your question..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              multiline={false}
            />
            <Text className="text-xs text-gray-500 mt-1">{title.length}/100 characters</Text>
          </View>

          {/* Question Text Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Question Details</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-sm min-h-[120px]"
              placeholder="Describe your question in detail. Include what you don&apos;t understand, specific examples, or what you&apos;ve tried..."
              value={questionText}
              onChangeText={setQuestionText}
              multiline={true}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text className="text-xs text-gray-500 mt-1">{questionText.length}/1000 characters</Text>
          </View>

          {/* Anonymous Option */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => setIsAnonymous(!isAnonymous)}
              className="flex-row items-center"
            >
              <View className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                isAnonymous ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
                {isAnonymous && <MaterialIcons name="check" size={14} color="white" />}
              </View>
              <Text className="text-sm text-gray-700">Ask anonymously</Text>
            </TouchableOpacity>
          </View>

          {/* Guidelines */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="text-sm font-medium text-gray-900 mb-2">Question Guidelines</Text>
            <View className="space-y-1">
              <Text className="text-xs text-gray-600">• Be specific about what you don&apos;t understand</Text>
              <Text className="text-xs text-gray-600">• Include relevant context or examples</Text>
              <Text className="text-xs text-gray-600">• Teachers typically respond within 24-48 hours</Text>
              <Text className="text-xs text-gray-600">• Check the Ask page for responses</Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="px-4 py-4 border-t border-gray-200 bg-white">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !title.trim() || !questionText.trim()}
            className={`py-3 rounded-lg items-center ${
              isLoading || !title.trim() || !questionText.trim()
                ? 'bg-gray-300'
                : 'bg-blue-500'
            }`}
          >
            <Text className={`text-base font-semibold ${
              isLoading || !title.trim() || !questionText.trim()
                ? 'text-gray-500'
                : 'text-white'
            }`}>
              {isLoading ? 'Submitting...' : 'Submit Question'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AskQuestionModal;