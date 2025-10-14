import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PrimaryNav from '@/components/Navigation/PrimaryNav';
import Skeleton from '../../components/Container/Skeleton';
import { useFocusEffect } from '@react-navigation/native';
import CourseCard from './components/CourseCard';
import TestCard from './components/TestCard';
import { demoCourses, demoTests } from './testData';

export default function TestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'mcq' | 'pdf' | 'mixed'>('all');

  // Set loading state immediately when page is focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      // Brief loading for consistency
      setTimeout(() => setIsLoading(false), 300);
    }, [])
  );

  // Calculate statistics
  const totalTests = demoTests.length;
  const completedTests = demoTests.filter(t => t.status === 'completed').length;
  const pendingTests = totalTests - completedTests;
  const averageScore = demoTests
    .filter(t => t.score !== undefined)
    .reduce((acc, t) => acc + (t.score || 0), 0) / completedTests || 0;

  // Filter tests by status and type
  const getFilteredTests = () => {
    let tests = demoTests;
    
    // Filter by status
    switch (activeTab) {
      case 'completed':
        tests = tests.filter(t => t.status === 'completed');
        break;
      case 'pending':
        tests = tests.filter(t => t.status !== 'completed');
        break;
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      tests = tests.filter(t => t.type === typeFilter);
    }
    
    return tests;
  };

  const filteredTests = getFilteredTests();

  const handleCoursePress = (courseId: string) => {
    router.push(`/Test/CourseTestList?courseId=${courseId}` as any);
  };

  const handleTestPress = (testId: string, testType: string) => {
    const test = demoTests.find(t => t.id === testId);
    if (test?.status === 'completed') {
      router.push(`/Test/TestResult?testId=${testId}` as any);
    } else if (testType === 'mcq' || testType === 'mixed') {
      router.push(`/Test/MCQTest?testId=${testId}` as any);
    } else if (testType === 'pdf') {
      router.push(`/Test/PDFTest?testId=${testId}` as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      {isLoading ? (
        <View className="flex-1 px-6 pt-6">
          <Skeleton width={150} height={24} borderRadius={4} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 16 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={100} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-2xl font-bold text-gray-900">
              Tests
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Enroll in tests and grow your knowledge
            </Text>
          </View>

          {/* Statistics Card */}
          <View className="px-6 pb-4">
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">Total Tests</Text>
                  <Text className="text-2xl font-bold text-gray-900">{totalTests}</Text>
                </View>
                <View className="w-px h-10 bg-gray-200" />
                <View className="flex-1 items-center">
                  <Text className="text-sm text-gray-500 mb-1">Completed</Text>
                  <Text className="text-2xl font-bold text-customBlue">{completedTests}</Text>
                </View>
                <View className="w-px h-10 bg-gray-200" />
                <View className="flex-1 items-end">
                  <Text className="text-sm text-gray-500 mb-1">Avg Score</Text>
                  <Text className="text-2xl font-bold text-gray-900">{averageScore.toFixed(0)}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Courses Section */}
          <View className="px-6 pb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">
                My Courses
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-base text-customBlue font-medium">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {demoCourses.slice(0, 4).map((course) => (
                  <View key={course.id} className="w-56">
                    <CourseCard
                      course={course}
                      onPress={() => handleCoursePress(course.id)}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

    

          {/* Tests Section */}
          <View className="px-6 pt-2 pb-20">
            {/* Header with Tabs */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">
                Your Tests
              </Text>
            </View>

            {/* Filter Tabs */}
            <View className="flex-row bg-gray-100 rounded-xl p-1 mb-3">
              <TouchableOpacity
                onPress={() => setActiveTab('all')}
                className={`flex-1 py-2 rounded-lg ${
                  activeTab === 'all' ? 'bg-white' : ''
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    activeTab === 'all' ? 'text-customBlue' : 'text-gray-600'
                  }`}
                >
                  All ({totalTests})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('completed')}
                className={`flex-1 py-2 rounded-lg ${
                  activeTab === 'completed' ? 'bg-white' : ''
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    activeTab === 'completed' ? 'text-customBlue' : 'text-gray-600'
                  }`}
                >
                  Completed ({completedTests})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('pending')}
                className={`flex-1 py-2 rounded-lg ${
                  activeTab === 'pending' ? 'bg-white' : ''
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    activeTab === 'pending' ? 'text-customBlue' : 'text-gray-600'
                  }`}
                >
                  Pending ({pendingTests})
                </Text>
              </TouchableOpacity>
            </View>


 {/* Browse by Type Section */}
          <View className="px-2 pb-4">
         
            
            <View className="flex-row gap-3">
              {/* MCQ Tests */}
              <TouchableOpacity
                activeOpacity={0.7}
                className={`flex-1 bg-white rounded-xl p-4 border ${
                  typeFilter === 'mcq' ? 'border-customBlue' : 'border-gray-100'
                }`}
                onPress={() => {
                  setTypeFilter(typeFilter === 'mcq' ? 'all' : 'mcq');
                  setActiveTab('all');
                }}
              >
                <View className="items-center">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                    typeFilter === 'mcq' ? 'bg-customBlue' : 'bg-blue-50'
                  }`}>
                    <MaterialIcons 
                      name="question-answer" 
                      size={24} 
                      color={typeFilter === 'mcq' ? '#FFFFFF' : '#3B82F6'} 
                    />
                  </View>
                  <Text className={`text-base font-bold ${
                    typeFilter === 'mcq' ? 'text-customBlue' : 'text-gray-900'
                  }`}>MCQ</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {demoTests.filter(t => t.type === 'mcq').length} Tests
                  </Text>
                </View>
              </TouchableOpacity>

              {/* PDF Tests */}
              <TouchableOpacity
                activeOpacity={0.7}
                className={`flex-1 bg-white rounded-xl p-4 border ${
                  typeFilter === 'pdf' ? 'border-customBlue' : 'border-gray-100'
                }`}
                onPress={() => {
                  setTypeFilter(typeFilter === 'pdf' ? 'all' : 'pdf');
                  setActiveTab('all');
                }}
              >
                <View className="items-center">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                    typeFilter === 'pdf' ? 'bg-customBlue' : 'bg-blue-50'
                  }`}>
                    <MaterialIcons 
                      name="picture-as-pdf" 
                      size={24} 
                      color={typeFilter === 'pdf' ? '#FFFFFF' : '#3B82F6'} 
                    />
                  </View>
                  <Text className={`text-base font-bold ${
                    typeFilter === 'pdf' ? 'text-customBlue' : 'text-gray-900'
                  }`}>PDF Tests</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {demoTests.filter(t => t.type === 'pdf').length} Tests
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Mixed Tests */}
              <TouchableOpacity
                activeOpacity={0.7}
                className={`flex-1 bg-white rounded-xl p-4 border ${
                  typeFilter === 'mixed' ? 'border-customBlue' : 'border-gray-100'
                }`}
                onPress={() => {
                  setTypeFilter(typeFilter === 'mixed' ? 'all' : 'mixed');
                  setActiveTab('all');
                }}
              >
                <View className="items-center">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                    typeFilter === 'mixed' ? 'bg-customBlue' : 'bg-blue-50'
                  }`}>
                    <MaterialIcons 
                      name="dashboard" 
                      size={24} 
                      color={typeFilter === 'mixed' ? '#FFFFFF' : '#3B82F6'} 
                    />
                  </View>
                  <Text className={`text-base font-bold ${
                    typeFilter === 'mixed' ? 'text-customBlue' : 'text-gray-900'
                  }`}>Mixed</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {demoTests.filter(t => t.type === 'mixed').length} Tests
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>


            {/* Tests List */}
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onPress={() => handleTestPress(test.id, test.type)}
                />
              ))
            ) : (
              <View className="items-center justify-center py-12">
                <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
                <Text className="text-lg text-gray-600 mt-4">
                  No tests found
                </Text>
                <Text className="text-sm text-gray-500 mt-2 text-center px-10">
                  {activeTab === 'completed'
                    ? 'You haven\'t completed any tests yet.'
                    : 'No pending tests available.'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      <PrimaryNav current="Test" />
    </SafeAreaView>
  );
}
