import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PrimaryNav from '@/components/Navigation/PrimaryNav';
import Skeleton from '../../components/Container/Skeleton';
import { useFocusEffect } from '@react-navigation/native';
import TestCard from './components/TestCard';
import { studentTestAPI, Test } from '../../api/student/test';
import { useCourseStore } from '../../stores/courseStore';
import { getSubjectContent } from '../../api/lessonProgress';

export default function TestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'mcq' | 'pdf' | 'mixed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get selected course from store
  const { selectedCourse } = useCourseStore();

  // Subject content state
  const [subjectContents, setSubjectContents] = useState<any>({});

  // Set loading state immediately when page is focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchTests();
    }, [])
  );

  // Fetch subject content for all subjects
  useEffect(() => {
    const fetchSubjectContents = async () => {
      if (!selectedCourse?._id && !selectedCourse?.id) return;
      if (!selectedCourse.subjects || selectedCourse.subjects.length === 0) return;

      const courseId = selectedCourse._id || selectedCourse.id;
      const contents: any = {};

      try {
        // Fetch subject content for each subject
        const promises = selectedCourse.subjects.map(async (subject: any) => {
          try {
            const response = await getSubjectContent(courseId, subject.name);
            if (response.success) {
              contents[subject.name] = response.data;
              console.log(`📚 Loaded subject content for ${subject.name}:`, response.data.modules?.length || 0, 'modules');
            }
          } catch (error) {
            console.error(`❌ Error fetching subject content for ${subject.name}:`, error);
          }
        });

        await Promise.all(promises);
        setSubjectContents(contents);
        console.log('📚 All subject contents loaded:', Object.keys(contents).length);
      } catch (error) {
        console.error('❌ Error fetching subject contents:', error);
      }
    };

    fetchSubjectContents();
  }, [selectedCourse]);

  const fetchTests = async () => {
    try {
      const response = await studentTestAPI.getAvailableTests();
      if (response.success && response.data) {
        console.log('📚 Available tests:', response.data.tests);
        setTests(response.data.tests || []);
      } else {
        console.error('❌ Failed to fetch tests:', response);
        setTests([]);
      }
    } catch (error) {
      console.error('🚨 Error fetching tests:', error);
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on selected course
  const courseTests = selectedCourse
    ? tests.filter(test => test.courseName === selectedCourse.title)
    : tests;
    
  // Transform subjects with enriched content
  const courseSubjects = useMemo(() => {
    return selectedCourse?.subjects?.map((subject: any) => {
      // Get subject content data if available
      const subjectContent = subjectContents[subject.name];
      
      // Use subject content modules if available, otherwise fall back to course subject modules
      const subjectModules = subjectContent?.modules || subject.modules || [];
      
      return {
        ...subject,
        modules: subjectModules,
        description: subjectContent?.description || subject.description || 'Subject description and modules',
      };
    }) || [];
  }, [selectedCourse, subjectContents]);

  // Debug effect to monitor subject data
  useEffect(() => {
    console.log('📊 TestPage Subject Data:', {
      selectedCourseTitle: selectedCourse?.title,
      subjectsCount: courseSubjects.length,
      subjectNames: courseSubjects.map(s => s.name),
      subjectContentsKeys: Object.keys(subjectContents),
      totalTests: courseTests.length
    });
  }, [selectedCourse, courseSubjects, subjectContents, courseTests]);

  // Calculate statistics based on course tests
  const totalTests = courseTests.length;
  const completedTests = courseTests.filter(t => t.attemptInfo?.status === 'submitted' || t.attemptInfo?.status === 'evaluated').length;
  const pendingTests = totalTests - completedTests;
  const averageScore = courseTests
    .filter(t => t.attemptInfo?.percentage !== undefined)
    .reduce((acc, t) => acc + (t.attemptInfo?.percentage || 0), 0) / completedTests || 0;

  // Filter tests by status and type
  const getFilteredTests = () => {
    let filteredTests = courseTests;
    
    // Filter by status
    switch (activeTab) {
      case 'completed':
        filteredTests = filteredTests.filter(t => t.attemptInfo?.status === 'submitted' || t.attemptInfo?.status === 'evaluated');
        break;
      case 'pending':
        filteredTests = filteredTests.filter(t => !t.attemptInfo || t.attemptInfo.status === 'in-progress' || t.canAttempt);
        break;
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      filteredTests = filteredTests.filter(t => t.type === typeFilter);
    }
    
    return filteredTests;
  };

  const filteredTests = getFilteredTests();

  // If no course is selected, show message
  if (!selectedCourse) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-2xl font-bold text-gray-900">
              Tests
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Select a course to view tests
            </Text>
          </View>

          {/* Search Bar */}
          <View className="px-6 pb-4">
            <View className="flex-row items-center bg-white rounded-3xl px-4 py-3 border border-gray-100">
              <MaterialIcons name="search" size={22} color="#9CA3AF" />
              <TextInput
                placeholder="Search tests..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-2 text-base text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={22} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="mt-8">
            <View className="flex-1 justify-center items-center mb-4 mt-6">
              <Image
                source={require('../../assets/images/questions.gif')}
                style={{ width: 180, height: 180, marginBottom: 16 }}
              />
              <Text className="text-lg font-semibold text-gray-800">
                No course selected
              </Text>
              <Text className="text-sm text-gray-500 mt-1 text-center px-4">
                Go to More page to select a course to start testing
              </Text>
            </View>
          </View>
        </ScrollView>
        <PrimaryNav current="Test" />
      </SafeAreaView>
    );
  }

  const handleSubjectPress = (subjectName: string) => {
    if (selectedCourse) {
      // Navigate to module test list - let the page handle filtering and empty states
      console.log(`📝 Navigating to subject ${subjectName}`);
      router.push(`/Test/ModuleTestList?courseName=${encodeURIComponent(selectedCourse.title)}&subject=${encodeURIComponent(subjectName)}` as any);
    }
  };

  const handleTestPress = (testId: string, testType: string) => {
    const test = courseTests.find(t => t._id === testId);
    if (test?.attemptInfo && (test.attemptInfo.status === 'submitted' || test.attemptInfo.status === 'evaluated')) {
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
              {selectedCourse ? `Tests for ${selectedCourse.title}` : 'Select a course to view tests'}
            </Text>
          </View>

          {/* Search Bar */}
          <View className="px-6 pb-4">
            <View className="flex-row items-center bg-white rounded-3xl px-4 py-3 border border-gray-100">
              <MaterialIcons name="search" size={22} color="#9CA3AF" />
              <TextInput
                placeholder="Search tests..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-2 text-base text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={22} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Statistics Card */}
          {selectedCourse && (
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
          )}

          {/* Subject Section */}
          {selectedCourse && (
            <View className="px-6 pb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  My Subjects
                </Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-base text-customBlue font-medium">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {courseSubjects.slice(0, 4).map((subject, index) => {
                    // Count tests for this subject from API data
                    const subjectTests = courseTests.filter(test => test.subjectName === subject.name);
                    const completedSubjectTests = subjectTests.filter(t => t.attemptInfo?.status === 'submitted' || t.attemptInfo?.status === 'evaluated').length;
                    
                    return (
                      <View key={subject.name} className="w-56">
                        <TouchableOpacity
                          onPress={() => handleSubjectPress(subject.name)}
                          activeOpacity={0.7}
                          className="bg-white rounded-2xl overflow-hidden border border-gray-100"
                        >
                          {/* Thumbnail */}
                          <View className="h-28 bg-blue-100 flex items-center justify-center">
                            <MaterialIcons name="subject" size={48} color="#3B82F6" />
                          </View>

                          {/* Content */}
                          <View className="p-3">
                            {/* Title */}
                            <Text className="text-sm font-bold text-gray-900 mb-1" numberOfLines={2}>
                              {subject.name}
                            </Text>

                            {/* Course & Tests Info */}
                            <Text className="text-xs text-gray-500 mb-2">
                              {selectedCourse.title}
                            </Text>

                            {/* Tests Info */}
                            <View className="flex-row items-center justify-between mb-2">
                              <Text className="text-sm text-gray-600">
                                {subjectTests.length} Tests
                              </Text>
                              <Text className="text-sm font-medium text-customBlue">
                                {completedSubjectTests} Done
                              </Text>
                            </View>

                            {/* Progress Bar */}
                            <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <View
                                className="h-full bg-customBlue rounded-full"
                                style={{ 
                                  width: `${subjectTests.length > 0 ? Math.round((completedSubjectTests / subjectTests.length) * 100) : 0}%` 
                                }}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Tests Section */}
          {selectedCourse && (
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
                    {courseTests.filter(t => t.type === 'mcq').length} Tests
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
                    {courseTests.filter(t => t.type === 'pdf').length} Tests
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
                    {courseTests.filter(t => t.type === 'mixed').length} Tests
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>


            {/* Tests List */}
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <TestCard
                  key={test._id}
                  test={{
                    id: test._id,
                    title: test.title,
                    description: test.description || `${test.type.toUpperCase()} test with ${test.totalQuestions} questions`,
                    type: test.type,
                    courseId: test.courseName,
                    courseName: test.courseName,
                    difficulty: 'medium' as const, // Default difficulty
                    status: (test.attemptInfo?.status === 'submitted' || test.attemptInfo?.status === 'evaluated') 
                      ? 'completed' 
                      : test.attemptInfo?.status === 'in-progress' 
                        ? 'in-progress' 
                        : 'not-started',
                    score: test.attemptInfo?.percentage,
                    thumbnail: require('../../assets/images/illl-1.png'), // Default thumbnail
                    duration: test.duration,
                    totalQuestions: test.totalQuestions,
                    totalMarks: test.totalMarks
                  }}
                  onPress={() => handleTestPress(test._id, test.type)}
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
          )}

        </ScrollView>
      )}

      <PrimaryNav current="Test" />
    </SafeAreaView>
  );
}