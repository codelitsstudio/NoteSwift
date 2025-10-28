import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../api/axios';

export default function QuestionDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const questionId = params.questionId as string;

  const [question, setQuestion] = useState<any>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);

  // Fetch question details
  const fetchQuestion = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/questions/${questionId}`);
      console.log('Full question response:', response.data);
      if (response.data.result && response.data.result.question) {
  setQuestion(response.data.result.question);
} else if (response.data.question) {
  setQuestion(response.data.question);
} else {
  setQuestion(null);
}
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  // Fetch related questions
  const fetchRelatedQuestions = useCallback(async () => {
    try {
      const response = await api.get('/questions');
      console.log('Full related questions response:', response.data);
      if (response.data.result && response.data.result.questions) {
        const allQuestions = response.data.result.questions;
        // Filter questions with same subject, excluding current question
        const related = allQuestions
          .filter((q: any) => q._id !== questionId && q.subjectName === question?.subjectName)
          .slice(0, 3);
        setRelatedQuestions(related);
      }
    } catch (error) {
      console.error('Error fetching related questions:', error);
    }
  }, [questionId, question?.subjectName]);

  // Fetch data on component mount
  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, fetchQuestion]);

  // Fetch related questions when question is loaded
  useEffect(() => {
    if (question) {
      fetchRelatedQuestions();
    }
  }, [question, fetchRelatedQuestions]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!question) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="error-outline" size={64} color="#9CA3AF" />
          <Text className="text-lg font-bold text-gray-900 mt-4">
            Question Not Found
          </Text>
          <Text className="text-base text-gray-500 text-center mt-2">
            The question you&apos;re looking for doesn&apos;t exist.
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="bg-customBlue rounded-xl px-6 py-3 mt-6"
          >
            <Text className="text-base font-bold text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleUpvote = async () => {
    if (!question) return;
    
    try {
      const response = await api.post(`/student/questions/${question._id}/vote`, { voteType: 'upvote' });
      if (response.data.success) {
        setUpvoted(!upvoted);
        // Update question with new vote counts
        setQuestion((prev: any) => ({
          ...prev,
          upvotes: response.data.data.upvotes,
          downvotes: response.data.data.downvotes
        }));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleShare = () => {
    console.log('Share question');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Question Card */}
          <View className="px-6 pt-6 pb-4">
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              {/* Status and Subject */}
              <View className="flex-row items-center mb-3">
                <View
                  className={`px-2 py-1 rounded-md ${
                    question.status === 'answered' ? 'bg-green-50' : 'bg-orange-50'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      question.status === 'answered' ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {question.status === 'answered' ? 'Answered' : 'Pending'}
                  </Text>
                </View>
                <View className="bg-blue-50 px-2 py-1 rounded-md ml-2">
                  <Text className="text-sm font-medium text-customBlue">
                    {question.subjectName}
                  </Text>
                </View>
                <Text className="text-sm text-gray-400 ml-auto">
                  {new Date(question.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {/* Question Text */}
              <Text className="text-lg font-bold text-gray-900 mb-2">
                {question.title}
              </Text>
              <Text className="text-base text-gray-700 leading-6 mb-4">
                {question.questionText || 'No additional description provided.'}
              </Text>

              {/* Attachments */}
              {question.attachments && question.attachments.length > 0 && (
                <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2 mb-4">
                  <MaterialIcons name="attach-file" size={18} color="#3B82F6" />
                  <Text className="text-sm text-gray-700 ml-2">
                    {question.attachments.length} attachment{question.attachments.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row items-center pt-3 border-t border-gray-100">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleUpvote}
                  className={`flex-row items-center px-4 py-2 rounded-xl mr-3 ${
                    upvoted ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <MaterialIcons
                    name={upvoted ? 'thumb-up' : 'thumb-up-off-alt'}
                    size={18}
                    color={upvoted ? '#3B82F6' : '#6B7280'}
                  />
                  <Text
                    className={`text-base font-medium ml-2 ${
                      upvoted ? 'text-customBlue' : 'text-gray-700'
                    }`}
                  >
                    {upvoted ? (question.upvotes?.length || 0) + 1 : (question.upvotes?.length || 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleShare}
                  className="flex-row items-center px-4 py-2 rounded-xl bg-gray-50"
                >
                  <MaterialIcons name="share" size={18} color="#6B7280" />
                  <Text className="text-base font-medium text-gray-700 ml-2">
                    Share
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center ml-auto">
                  <MaterialIcons name="visibility" size={18} color="#9CA3AF" />
                  <Text className="text-sm text-gray-500 ml-1">{question.views || 0} views</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Answer Section */}
          {question.answers && question.answers.length > 0 && (
            <View className="px-6 pb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Answer{question.answers.length > 1 ? 's' : ''}
              </Text>
              {question.answers.map((answer: any, index: number) => (
                <View key={answer._id || index} className="bg-green-50 rounded-2xl p-4 border border-green-100 mb-3">
                  <View className="flex-row items-center mb-3">
                    <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center">
                      <Text className="text-base font-bold text-white">
                        {answer.answeredBy?.fullName?.charAt(0) || 'T'}
                      </Text>
                    </View>
                    <View className="ml-3">
                      <Text className="text-base font-bold text-gray-900">
                        {answer.answeredBy?.fullName || 'Teacher'}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Answered {new Date(answer.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="ml-auto bg-green-600 rounded-full px-2 py-1">
                      <View className="flex-row items-center">
                        <MaterialIcons name="verified" size={14} color="#FFFFFF" />
                        <Text className="text-sm font-medium text-white ml-1">Verified</Text>
                      </View>
                    </View>
                  </View>
                  <Text className="text-base text-gray-900 leading-6">
                    {answer.answerText}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Related Questions */}
          <View className="px-6 pb-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Related Questions
            </Text>
            {relatedQuestions.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
                <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
                <Text className="text-lg font-bold text-gray-900 mt-4">
                  No Related Questions
                </Text>
                <Text className="text-base text-gray-500 text-center mt-2">
                  No other questions found in this subject
                </Text>
              </View>
            ) : (
              relatedQuestions.map((relatedQ: any) => (
                <TouchableOpacity
                  key={relatedQ._id}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/Ask/QuestionDetail', params: { questionId: relatedQ._id } })}
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
                >
                  <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
                    {relatedQ.title}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View className="bg-blue-50 px-2 py-1 rounded-md">
                      <Text className="text-sm font-medium text-customBlue">
                        {relatedQ.subjectName}
                      </Text>
                    </View>
                    <View
                      className={`px-2 py-1 rounded-md ml-2 ${
                        relatedQ.status === 'answered' ? 'bg-green-50' : 'bg-orange-50'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          relatedQ.status === 'answered' ? 'text-green-600' : 'text-orange-600'
                        }`}
                      >
                        {relatedQ.status === 'answered' ? 'Answered' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Follow-up Section for Students */}
          {question.status === 'pending' && (
            <View className="px-6 pb-20">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Need More Help?
              </Text>
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <Text className="text-base text-gray-700 mb-4">
                  Your question is being reviewed by our teachers. You&apos;ll receive a notification when an answer is posted.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="bg-customBlue rounded-xl py-3 items-center"
                  onPress={() => router.push('/Ask/AskPage')}
                >
                  <Text className="text-base font-bold text-white">
                    Ask Another Question
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
