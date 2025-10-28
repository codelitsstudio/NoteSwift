import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { studentTestAPI, TestDetail } from '../../api/student/test';

export default function MCQTest() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const testId = params.testId as string;

  const [testDetail, setTestDetail] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  useEffect(() => {
    if (!isTestStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, timeRemaining]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      const response = await studentTestAPI.getTestDetails(testId);
      if (response.success && response.data) {
        setTestDetail(response.data);
        // Set timer based on test duration (convert minutes to seconds)
        setTimeRemaining(response.data.duration * 60);
        
        // If there's existing attempt info, set the attemptId and mark as started
        if (response.data.attemptInfo) {
          console.log('📝 Found existing attempt:', response.data.attemptInfo.attemptId);
          setAttemptId(response.data.attemptInfo.attemptId);
          setIsTestStarted(true);
          setStartTime(Date.now() - (response.data.attemptInfo.timeSpent || 0) * 1000);
          
          // Restore selected answers
          if (response.data.attemptInfo.answers) {
            const restoredAnswers: { [key: number]: number } = {};
            response.data.attemptInfo.answers.forEach((answer: any) => {
              // Convert letter answer back to index
              const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
              restoredAnswers[answer.questionNumber] = letterToIndex[answer.answer as keyof typeof letterToIndex] || 0;
            });
            setSelectedAnswers(restoredAnswers);
          }
        }
      } else {
        setError('Failed to load test details');
      }
    } catch (err) {
      console.error('Error fetching test details:', err);
      setError('Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const startTestAttempt = async () => {
    try {
      console.log('🎯 Starting test attempt for testId:', testId);
      const response = await studentTestAPI.startTestAttempt(testId);
      console.log('📤 Start attempt response:', JSON.stringify(response, null, 2));
      console.log('📤 Start attempt response data:', response.data);
      if (response.success && response.data) {
        console.log('✅ Setting attemptId:', response.data.attemptId);
        setAttemptId(response.data.attemptId);
        setIsTestStarted(true);
        setStartTime(Date.now());
      } else {
        console.log('❌ Start attempt failed:', response.error);
        Alert.alert('Error', response.error || 'Failed to start test attempt');
      }
    } catch (err) {
      console.error('Error starting test:', err);
      Alert.alert('Error', 'Failed to start test attempt');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="refresh" size={48} color="#9CA3AF" />
          <Text className="text-lg text-gray-600 mt-4">Loading test...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !testDetail) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="error-outline" size={64} color="#9CA3AF" />
          <Text className="text-lg text-gray-600 mt-4">
            {error || 'Test not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = testDetail.questions?.[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = testDetail.questions ? ((currentQuestionIndex + 1) / testDetail.questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionNumber: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionNumber]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (testDetail.questions && currentQuestionIndex < testDetail.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleAutoSubmit = async () => {
    if (!attemptId) return;
    
    try {
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const answers = Object.entries(selectedAnswers)
        .filter(([_, selectedOption]) => selectedOption !== undefined && selectedOption !== null)
        .map(([questionNumber, selectedOption]) => ({
          questionNumber: parseInt(questionNumber),
          answer: ['A', 'B', 'C', 'D'][selectedOption as number], // Convert index to letter
        }));
      console.log('📤 Submitting answers:', answers);

      const response = await studentTestAPI.submitTest(testId, { answers, timeSpent });
      
      Alert.alert('Time Up!', 'Your test has been automatically submitted.', [
        {
          text: 'View Results',
          onPress: () => {
            const resultAttemptId = attemptId;
            router.push(`/Test/TestResult?testId=${testId}&attemptId=${resultAttemptId}` as any);
          },
        },
      ]);
    } catch (err) {
      console.error('Error auto-submitting test:', err);
      Alert.alert('Error', 'Failed to submit test automatically');
    }
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    if (!attemptId) return;
    
    try {
      setShowSubmitModal(false);
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      const answers = Object.entries(selectedAnswers)
        .filter(([_, selectedOption]) => selectedOption !== undefined && selectedOption !== null)
        .map(([questionNumber, selectedOption]) => ({
          questionNumber: parseInt(questionNumber),
          answer: ['A', 'B', 'C', 'D'][selectedOption as number], // Convert index to letter
        }));

      const response = await studentTestAPI.submitTest(testId, { answers, timeSpent });
      console.log('📤 Submit response:', JSON.stringify(response, null, 2));
      console.log('📤 Submit response data:', response.data);
      console.log('📤 Attempt ID from response:', response.data?.attemptId);
      
      if (response.success) {
        // Use attemptId from state (should be set from start or attemptInfo)
        const resultAttemptId = attemptId;
        console.log('🎯 Navigating to results with attemptId:', resultAttemptId);
        router.push(`/Test/TestResult?testId=${testId}&attemptId=${resultAttemptId}` as any);
      } else {
        console.log('❌ Submit failed:', response.error);
        Alert.alert('Error', response.error || 'Failed to submit test');
      }
    } catch (err) {
      console.error('Error submitting test:', err);
      Alert.alert('Error', 'Failed to submit test');
    }
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    setShowExitModal(false);
    router.back();
  };

  // Start Test Screen
  if (!isTestStarted) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1">
          <ScrollView className="flex-1 px-6 pt-4">
            {/* Test Info Card */}
            <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                {testDetail.title}
              </Text>

              {/* Stats */}
              <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <View>
                  <Text className="text-sm text-gray-500">Questions</Text>
                  <Text className="text-base font-semibold text-gray-900 mt-0.5">
                    {testDetail.questions?.length || 0}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-sm text-gray-500">Duration</Text>
                  <Text className="text-base font-semibold text-gray-900 mt-0.5">
                    {testDetail.duration} min
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-500">Total Marks</Text>
                  <Text className="text-base font-semibold text-gray-900 mt-0.5">
                    {testDetail.totalMarks}
                  </Text>
                </View>
              </View>
            </View>

            {/* Instructions */}
            <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Instructions
              </Text>
              
              <View className="space-y-2">
                {[
                  'Read each question carefully before selecting your answer.',
                  'You can navigate between questions using Next/Previous buttons.',
                  'Selected answers are automatically saved.',
                  'Timer will start as soon as you begin the test.',
                  'Test will auto-submit when time runs out.',
                ].map((instruction, index) => (
                  <View key={index} className="flex-row mb-2">
                    <MaterialIcons name="check-circle" size={16} color="#3B82F6" />
                    <Text className="text-sm text-gray-600 ml-2 flex-1">
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Description */}
            <View className="bg-customBlue/5 rounded-2xl p-4 mb-4 border border-customBlue/10">
              <Text className="text-xs font-semibold text-customBlue mb-1">
                About this test
              </Text>
              <Text className="text-xs text-gray-700">
                {testDetail.description}
              </Text>
            </View>
          </ScrollView>

          {/* Start Button */}
          <View className="px-6 py-4 bg-white border-t border-gray-100">
            <TouchableOpacity
              onPress={startTestAttempt}
              className="bg-customBlue py-3 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">
                Start Test
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Test Screen
  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity onPress={handleExit} activeOpacity={0.7}>
            <MaterialIcons name="close" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Timer */}
          <View className={`flex-row items-center px-3 py-1.5 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-50' : 'bg-customBlue/10'
          }`}>
            <MaterialIcons
              name="access-time"
              size={16}
              color={timeRemaining < 300 ? '#DC2626' : '#3B82F6'}
            />
            <Text className={`ml-1.5 font-semibold text-sm ${
              timeRemaining < 300 ? 'text-red-600' : 'text-customBlue'
            }`}>
              {formatTime(timeRemaining)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-customBlue px-4 py-1.5 rounded-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-sm">Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View>
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-xs text-gray-500">
              Question {currentQuestionIndex + 1} of {testDetail.questions?.length || 0}
            </Text>
            <Text className="text-xs text-gray-500">
              Answered: {answeredCount}/{testDetail.questions?.length || 0}
            </Text>
          </View>
          <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-customBlue"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Question */}
        <View className="px-6 pt-4">
          <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
            <View className="flex-row items-start mb-4">
              <View className="bg-customBlue w-8 h-8 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-semibold text-base">
                  {currentQuestionIndex + 1}
                </Text>
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900">
                {currentQuestion?.question}
              </Text>
            </View>

            {/* Options */}
            <View className="space-y-3">
              {currentQuestion?.options.map((option: string, optionIndex: number) => {
                const isSelected = selectedAnswers[currentQuestion.questionNumber] === optionIndex;
                return (
                  <TouchableOpacity
                    key={optionIndex}
                    onPress={() => handleAnswerSelect(currentQuestion.questionNumber, optionIndex)}
                    className={`p-3.5 rounded-xl border mb-2 ${
                      isSelected
                        ? 'border-customBlue bg-customBlue/5'
                        : 'border-gray-200 bg-white'
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                          isSelected
                            ? 'border-customBlue bg-customBlue'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <MaterialIcons name="check" size={14} color="#FFFFFF" />
                        )}
                      </View>
                      <Text
                        className={`flex-1 text-base ${
                          isSelected ? 'text-customBlue font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row mb-4">
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex-1 py-3 rounded-xl border mr-2 flex-row items-center justify-center ${
                currentQuestionIndex === 0
                  ? 'border-gray-200 bg-gray-100'
                  : 'border-customBlue bg-white'
              }`}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="chevron-left" 
                size={20} 
                color={currentQuestionIndex === 0 ? '#9CA3AF' : '#3B82F6'} 
              />
              <Text
                className={`text-sm font-semibold ${
                  currentQuestionIndex === 0 ? 'text-gray-400' : 'text-customBlue'
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              disabled={currentQuestionIndex === (testDetail.questions?.length || 0) - 1}
              className={`flex-1 py-3 rounded-xl ml-2 flex-row items-center justify-center ${
                currentQuestionIndex === (testDetail.questions?.length || 0) - 1
                  ? 'bg-gray-200'
                  : 'bg-customBlue'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-semibold ${
                  currentQuestionIndex === (testDetail.questions?.length || 0) - 1
                    ? 'text-gray-400'
                    : 'text-white'
                }`}
              >
                Next
              </Text>
              <MaterialIcons 
                name="chevron-right" 
                size={20} 
                color={currentQuestionIndex === (testDetail.questions?.length || 0) - 1 ? '#9CA3AF' : '#FFFFFF'} 
              />
            </TouchableOpacity>
          </View>

          {/* Question Navigator */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="text-sm font-bold text-gray-900 mb-3">
              Question Navigator
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {testDetail.questions?.map((q: any, index: number) => {
                const isAnswered = !!selectedAnswers[q.questionNumber];
                const isCurrent = index === currentQuestionIndex;
                return (
                  <TouchableOpacity
                    key={q.questionNumber}
                    onPress={() => handleQuestionJump(index)}
                    className={`w-10 h-10 rounded-lg items-center justify-center ${
                      isCurrent
                        ? 'bg-customBlue'
                        : isAnswered
                        ? 'bg-customBlue/10 border border-customBlue'
                        : 'bg-gray-100 border border-gray-200'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-white'
                          : isAnswered
                          ? 'text-customBlue'
                          : 'text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View className="flex-row flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <View className="w-5 h-5 bg-customBlue rounded mr-1.5" />
                <Text className="text-xs text-gray-600">Current</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-5 h-5 bg-customBlue/10 border border-customBlue rounded mr-1.5" />
                <Text className="text-xs text-gray-600">Answered</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-5 h-5 bg-gray-100 border border-gray-200 rounded mr-1.5" />
                <Text className="text-xs text-gray-600">Unanswered</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-gray-900 mb-1.5">
              Exit Test?
            </Text>
            <Text className="text-sm text-gray-600 mb-5">
              Your progress will be lost. Are you sure you want to exit?
            </Text>
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => setShowExitModal(false)}
                className="flex-1 py-2.5 bg-gray-100 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-center text-sm font-semibold text-gray-700">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmExit}
                className="flex-1 py-2.5 bg-red-500 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-center text-sm font-semibold text-white">
                  Exit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-gray-900 mb-1.5">
              Submit Test?
            </Text>
            <Text className="text-sm text-gray-600 mb-3">
              You have answered {answeredCount} out of {testDetail.questions?.length || 0} questions.
            </Text>
            {answeredCount < (testDetail.questions?.length || 0) && (
              <View className="bg-orange-50 p-3 rounded-xl mb-3 border border-orange-100">
                <Text className="text-xs text-orange-800">
                  ⚠️ You have {(testDetail.questions?.length || 0) - answeredCount} unanswered question(s).
                </Text>
              </View>
            )}
            <Text className="text-sm text-gray-600 mb-5">
              Are you sure you want to submit?
            </Text>
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 bg-gray-100 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-center text-sm font-semibold text-gray-700">
                  Review
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSubmit}
                className="flex-1 py-2.5 bg-customBlue rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-center text-sm font-semibold text-white">
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
