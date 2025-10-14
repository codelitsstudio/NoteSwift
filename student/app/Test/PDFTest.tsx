import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { demoTests } from './testData';

const { width, height } = Dimensions.get('window');

export default function PDFTest() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const testId = params.testId as string;

  const test = demoTests.find(t => t.id === testId);

  const [timeRemaining, setTimeRemaining] = useState(test?.duration ? test.duration * 60 : 0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; // Demo PDF has 5 pages

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

  if (!test) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="error-outline" size={64} color="#9CA3AF" />
          <Text className="text-lg text-gray-600 mt-4">Test not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAutoSubmit = () => {
    Alert.alert('Time Up!', 'Your test has been automatically submitted.', [
      {
        text: 'View Results',
        onPress: () => router.push(`/Test/TestResult?testId=${testId}` as any),
      },
    ]);
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    setShowSubmitModal(false);
    router.push(`/Test/TestResult?testId=${testId}` as any);
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
          <View className="flex-1 px-6 pt-4">
            {/* Test Info Card */}
            <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                  <MaterialIcons name="picture-as-pdf" size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 mb-0.5">
                    {test.title}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {test.courseName}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View className="flex-row justify-between pt-3 border-t border-gray-100">
                <View className="items-center">
                  <Text className="text-sm text-gray-500 mb-1">Questions</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {test.totalQuestions}
                  </Text>
                </View>
                
                <View className="w-px bg-gray-100" />

                <View className="items-center">
                  <Text className="text-sm text-gray-500 mb-1">Duration</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {test.duration} min
                  </Text>
                </View>
                
                <View className="w-px bg-gray-100" />

                <View className="items-center">
                  <Text className="text-sm text-gray-500 mb-1">Total Marks</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {test.totalMarks}
                  </Text>
                </View>
              </View>
            </View>

            {/* Instructions */}
            <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                PDF Test Instructions
              </Text>
              
              <View className="space-y-3">
                {[
                  'This is a PDF-based test with subjective questions.',
                  'Download the PDF document to view questions.',
                  'Write your answers on paper or digitally.',
                  'You can zoom and navigate through the PDF pages.',
                  'Timer will start as soon as you begin the test.',
                  'Upload your answer sheet before time runs out.',
                  'Make sure your answers are clear and legible.',
                ].map((instruction, index) => (
                  <View key={index} className="flex-row mb-2">
                    <MaterialIcons name="check-circle" size={16} color="#3B82F6" />
                    <Text className="text-sm text-gray-700 ml-2 flex-1">
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Description */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-3">
              <View className="flex-row items-start">
                <MaterialIcons name="info" size={20} color="#3B82F6" />
                <View className="flex-1 ml-2">
                  <Text className="text-xs font-semibold text-gray-900 mb-1">
                    About this test
                  </Text>
                  <Text className="text-xs text-gray-700">
                    {test.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Start Button */}
          <View className="px-6 py-3 bg-white border-t border-gray-100">
            <TouchableOpacity
              onPress={() => setIsTestStarted(true)}
              className="bg-customBlue py-3 rounded-full items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">
                Start PDF Test
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // PDF Test Screen
  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      {/* Header */}
      <View className="px-6 pt-3 pb-2 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity onPress={handleExit} activeOpacity={0.7}>
            <MaterialIcons name="close" size={22} color="#111827" />
          </TouchableOpacity>

          <Text className="text-sm font-bold text-gray-900">
            {test.title}
          </Text>

          {/* Timer */}
          <View className={`flex-row items-center px-2.5 py-1.5 rounded-full ${
            timeRemaining < 300 ? 'bg-red-50' : 'bg-blue-50'
          }`}>
            <MaterialIcons
              name="access-time"
              size={14}
              color={timeRemaining < 300 ? '#DC2626' : '#3B82F6'}
            />
            <Text className={`ml-1 font-medium text-xs ${
              timeRemaining < 300 ? 'text-red-600' : 'text-customBlue'
            }`}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        </View>

        {/* Page Navigation */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded-lg ${
              currentPage === 1 ? 'bg-gray-50' : 'bg-blue-50'
            }`}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="chevron-left"
              size={20}
              color={currentPage === 1 ? '#9CA3AF' : '#3B82F6'}
            />
          </TouchableOpacity>

          <Text className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded-lg ${
              currentPage === totalPages ? 'bg-gray-50' : 'bg-blue-50'
            }`}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={currentPage === totalPages ? '#9CA3AF' : '#3B82F6'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF Viewer Placeholder */}
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center bg-white m-3 rounded-2xl border border-gray-100">
          <MaterialIcons name="picture-as-pdf" size={64} color="#3B82F6" />
          <Text className="text-lg font-bold text-gray-900 mt-3">
            PDF Viewer
          </Text>
          <Text className="text-sm text-gray-600 mt-1 text-center px-8">
            Page {currentPage} of the test document would be displayed here
          </Text>
          
          {/* Demo Content */}
          <View className="mt-4 w-full px-6">
            <View className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
              <Text className="text-sm font-bold text-gray-900 mb-2">
                Question {currentPage}:
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                This is a sample question from the PDF document. In a real implementation, the actual PDF content would be rendered here using a PDF viewer library like react-native-pdf.
              </Text>
              
              <View className="mt-3 pt-3 border-t border-gray-200">
                <Text className="text-xs text-gray-500">
                  [Space for detailed question with diagrams, formulas, and images]
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View className="px-6 py-3 bg-white border-t border-gray-100">
        <View className="flex-row gap-2 mb-2">
          {/* Download PDF Button */}
          <TouchableOpacity
            className="flex-1 bg-gray-100 py-2.5 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.7}
            onPress={() => Alert.alert('Download', 'PDF download would start here')}
          >
            <MaterialIcons name="download" size={18} color="#374151" />
            <Text className="text-gray-700 font-medium ml-1.5 text-sm">
              Download
            </Text>
          </TouchableOpacity>

          {/* Zoom Button */}
          <TouchableOpacity
            className="bg-gray-100 px-4 py-2.5 rounded-xl"
            activeOpacity={0.7}
            onPress={() => Alert.alert('Zoom', 'Zoom controls would appear here')}
          >
            <MaterialIcons name="zoom-in" size={18} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-customBlue py-3 rounded-full items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold">
            Submit Test
          </Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 text-center mt-2">
          Make sure to upload your answer sheet before submitting
        </Text>
      </View>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              Exit Test?
            </Text>
            <Text className="text-sm text-gray-600 mb-5">
              Your progress will be lost. Are you sure you want to exit?
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowExitModal(false)}
                className="flex-1 py-2.5 bg-gray-100 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-center font-semibold text-gray-700 text-sm">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmExit}
                className="flex-1 py-2.5 bg-red-500 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-center font-semibold text-white text-sm">
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
            <Text className="text-lg font-bold text-gray-900 mb-1">
              Submit Test?
            </Text>
            <View className="bg-blue-50 p-3 rounded-xl mb-3">
              <View className="flex-row items-start">
                <MaterialIcons name="info" size={18} color="#3B82F6" />
                <Text className="text-xs text-gray-700 ml-2 flex-1">
                  Please ensure you have completed all questions and uploaded your answer sheet.
                </Text>
              </View>
            </View>
            <Text className="text-sm text-gray-600 mb-5">
              Once submitted, you cannot make any changes. Continue?
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 bg-gray-100 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-center font-semibold text-gray-700 text-sm">
                  Review
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSubmit}
                className="flex-1 py-2.5 bg-customBlue rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-center font-semibold text-white text-sm">
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
