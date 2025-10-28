import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { studentTestAPI, TestResult as TestResultType } from '../../api/student/test';
import Skeleton from '../../components/Container/Skeleton';

export default function TestResult() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const testId = params.testId as string;
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<TestResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSolutions, setShowSolutions] = useState(false);

  useEffect(() => {
    fetchTestResult();
  }, [testId, attemptId]);

  const fetchTestResult = async () => {
    try {
      setLoading(true);
      console.log('🎯 Fetching test results for testId:', testId, 'attemptId:', attemptId);
      const response = await studentTestAPI.getTestResults(testId, attemptId);
      console.log('📥 Results API response:', response);
      if (response.success && response.data) {
        console.log('✅ Results data received:', response.data);
        setResult(response.data);
      } else {
        console.log('❌ Results API failed:', response.error);
        setError('Failed to load test results');
      }
    } catch (err) {
      console.error('❌ Error fetching test result:', err);
      setError('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 px-6 pt-6">
          <Skeleton width={200} height={24} borderRadius={4} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={120} borderRadius={12} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={100} borderRadius={12} style={{ marginBottom: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !result) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="error-outline" size={64} color="#9CA3AF" />
          <Text className="text-lg text-gray-600 mt-4">
            {error || 'Results not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate stats from answers
  const correctAnswers = result.attempt.answers?.filter((a: any) => a.isCorrect).length || 0;
  const wrongAnswers = result.attempt.answers?.filter((a: any) => !a.isCorrect && a.selectedOption !== undefined).length || 0;
  const skippedQuestions = result.test.totalQuestions - (correctAnswers + wrongAnswers);

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: '#10B981', bg: '#D1FAE5' };
    if (percentage >= 80) return { grade: 'A', color: '#10B981', bg: '#D1FAE5' };
    if (percentage >= 70) return { grade: 'B+', color: '#3B82F6', bg: '#DBEAFE' };
    if (percentage >= 60) return { grade: 'B', color: '#3B82F6', bg: '#DBEAFE' };
    if (percentage >= 50) return { grade: 'C', color: '#F59E0B', bg: '#FEF3C7' };
    return { grade: 'F', color: '#EF4444', bg: '#FEE2E2' };
  };

  const gradeInfo = getGrade(result.attempt.percentage);

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return 'Outstanding Performance!';
    if (percentage >= 80) return 'Excellent Work!';
    if (percentage >= 70) return 'Good Job!';
    if (percentage >= 60) return 'Well Done!';
    if (percentage >= 50) return 'Keep Practicing!';
    return 'Need More Practice!';
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <ScrollView className="flex-1">
        {/* Score Card */}
        <View className="px-6 pt-4">
          <View className="bg-white rounded-2xl p-5 mb-3 border border-gray-100">
            <View className="relative">
              {/* Performance Message */}
              <Text className="text-gray-900 text-lg font-bold mb-4 text-center">
                {getPerformanceMessage(result.attempt.percentage)}
              </Text>

              {/* Score Circle */}
              <View className="items-center mb-4">
                <View className="w-32 h-32 bg-blue-50 rounded-full items-center justify-center border-4 border-customBlue">
                  <Text className="text-4xl font-bold text-customBlue">
                    {result.attempt.totalScore}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    / {result.test.totalMarks}
                  </Text>
                </View>
                
                {/* Grade Badge */}
                <View
                  className="mt-4 px-5 py-1.5 rounded-full"
                  style={{ backgroundColor: gradeInfo.bg }}
                >
                  <Text
                    className="text-xl font-bold"
                    style={{ color: gradeInfo.color }}
                  >
                    Grade: {gradeInfo.grade}
                  </Text>
                </View>
              </View>

              {/* Percentage */}
              <View className="bg-blue-50 rounded-xl p-3">
                <Text className="text-customBlue text-center text-base font-semibold">
                  {result.attempt.percentage.toFixed(1)}% Score
                </Text>
              </View>
            </View>
          </View>

          {/* Test Info */}
          <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
            <Text className="text-base font-bold text-gray-900 mb-1">
              {result.test.title}
            </Text>

            <View className="flex-row items-center text-gray-600">
              <MaterialIcons name="calendar-today" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1.5">
                Attempted on {new Date(result.attempt.submittedAt || result.attempt.startedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Statistics */}
          <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
            <Text className="text-base font-bold text-gray-900 mb-3">
              Statistics
            </Text>

            <View className="space-y-3">
              {/* Correct Answers */}
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <MaterialIcons name="check-circle" size={18} color="#10B981" />
                  <Text className="text-sm text-gray-700 ml-2">Correct Answers</Text>
                </View>
                <Text className="text-lg font-bold text-green-600">
                  {correctAnswers}
                </Text>
              </View>

              {/* Wrong Answers */}
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <MaterialIcons name="cancel" size={18} color="#EF4444" />
                  <Text className="text-sm text-gray-700 ml-2">Wrong Answers</Text>
                </View>
                <Text className="text-lg font-bold text-red-600">
                  {wrongAnswers}
                </Text>
              </View>

              {/* Skipped */}
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <MaterialIcons name="remove-circle" size={18} color="#6B7280" />
                  <Text className="text-sm text-gray-700 ml-2">Skipped</Text>
                </View>
                <Text className="text-lg font-bold text-gray-600">
                  {skippedQuestions}
                </Text>
              </View>

              {/* Time Taken */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <MaterialIcons name="access-time" size={18} color="#3B82F6" />
                  <Text className="text-sm text-gray-700 ml-2">Time Taken</Text>
                </View>
                <Text className="text-lg font-bold text-customBlue">
                  {Math.floor(result.attempt.timeSpent / 60)} min
                </Text>
              </View>
            </View>
          </View>

          {/* Accuracy Breakdown */}
          <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
            <Text className="text-base font-bold text-gray-900 mb-3">
              Accuracy
            </Text>

            {/* Progress Bars */}
            <View className="space-y-3">
              {/* Correct */}
              <View>
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-sm text-gray-600">Correct</Text>
                  <Text className="text-sm font-semibold text-green-600">
                    {((correctAnswers / result.test.totalQuestions) * 100).toFixed(1)}%
                  </Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-green-500"
                    style={{
                      width: `${(correctAnswers / result.test.totalQuestions) * 100}%`,
                    }}
                  />
                </View>
              </View>

              {/* Wrong */}
              <View>
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-sm text-gray-600">Wrong</Text>
                  <Text className="text-sm font-semibold text-red-600">
                    {((wrongAnswers / result.test.totalQuestions) * 100).toFixed(1)}%
                  </Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-red-500"
                    style={{
                      width: `${(wrongAnswers / result.test.totalQuestions) * 100}%`,
                    }}
                  />
                </View>
              </View>

              {/* Skipped */}
              <View>
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-sm text-gray-600">Skipped</Text>
                  <Text className="text-sm font-semibold text-gray-600">
                    {((skippedQuestions / result.test.totalQuestions) * 100).toFixed(1)}%
                  </Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-gray-400"
                    style={{
                      width: `${(skippedQuestions / result.test.totalQuestions) * 100}%`,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Solutions Button */}
          {result.attempt.answers && result.attempt.answers.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowSolutions(!showSolutions)}
              className="bg-customBlue py-3 rounded-xl mb-3"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <MaterialIcons
                  name={showSolutions ? 'visibility-off' : 'visibility'}
                  size={18}
                  color="#FFFFFF"
                />
                <Text className="text-white font-semibold text-base ml-2">
                  {showSolutions ? 'Hide Solutions' : 'View Solutions'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Solutions Section */}
          {showSolutions && result.attempt.answers && result.attempt.answers.length > 0 && (
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Solutions & Explanations
              </Text>

              {result.attempt.answers.map((answer: any, index: number) => {
                return (
                  <View key={answer.questionNumber} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
                    {/* Question */}
                    <View className="flex-row items-start mb-3">
                      <View className="w-7 h-7 bg-blue-50 rounded-full items-center justify-center mr-2.5">
                        <Text className="text-customBlue font-semibold text-sm">
                          {answer.questionNumber}
                        </Text>
                      </View>
                      <Text className="flex-1 text-sm font-semibold text-gray-900">
                        {answer.question}
                      </Text>
                    </View>

                    {/* User's Answer */}
                    <View className="ml-9 mb-3">
                      <Text className="text-xs font-semibold text-gray-900 mb-1">
                        Your Answer:
                      </Text>
                      <View className={`p-2.5 rounded-lg ${
                        answer.isCorrect
                          ? 'bg-green-50 border border-green-500'
                          : 'bg-red-50 border border-red-500'
                      }`}>
                        <View className="flex-row items-center">
                          {answer.isCorrect ? (
                            <MaterialIcons name="check-circle" size={16} color="#10B981" />
                          ) : (
                            <MaterialIcons name="cancel" size={16} color="#EF4444" />
                          )}
                          <Text className={`ml-1.5 text-sm ${
                            answer.isCorrect ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {answer.selectedOptionText || 'Not answered'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Correct Answer */}
                    {!answer.isCorrect && (
                      <View className="ml-9 mb-3">
                        <Text className="text-xs font-semibold text-gray-900 mb-1">
                          Correct Answer:
                        </Text>
                        <View className="p-2.5 rounded-lg bg-green-50 border border-green-500">
                          <View className="flex-row items-center">
                            <MaterialIcons name="check-circle" size={16} color="#10B981" />
                            <Text className="ml-1.5 text-sm text-green-900">
                              {answer.correctOptionText}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Explanation */}
                    {answer.explanation && (
                      <View className="ml-9 bg-blue-50 p-3 rounded-lg">
                        <View className="flex-row items-start">
                          <MaterialIcons
                            name="lightbulb"
                            size={16}
                            color="#3B82F6"
                          />
                          <View className="flex-1 ml-1.5">
                            <Text className="text-xs font-semibold text-gray-900 mb-0.5">
                              Explanation:
                            </Text>
                            <Text className="text-sm text-gray-700">
                              {answer.explanation}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Action Buttons */}
          <View className="space-y-2 mb-4">
            <TouchableOpacity
              onPress={() => router.push('/Test/TestPage' as any)}
              className="bg-white border border-customBlue py-3 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-customBlue font-semibold text-sm text-center">
                View More Tests
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/Test/TestPage' as any)}
              className="bg-gray-100 py-3 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-semibold text-sm text-center">
                Back to Dashboard
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
