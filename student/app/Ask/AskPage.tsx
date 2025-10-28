import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PrimaryNav from '@/components/Navigation/PrimaryNav';
import Skeleton from '../../components/Container/Skeleton';
import { useFocusEffect } from '@react-navigation/native';
import QuestionCard from './components/QuestionCard';
import { useAuthStore } from '../../stores/authStore';
import { useCourseStore } from '../../stores/courseStore';
import api from '../../api/axios';

export default function AskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'answered' | 'pending'>('all');
  const [questions, setQuestions] = useState<any[]>([]);

  // Get user and course data
  const { user } = useAuthStore();
  const { enrolledCourses, courses, fetchAllCourses, fetchUserEnrollments, selectedCourse } = useCourseStore();

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions');
      console.log('Questions response:', response);
      if (response.data?.success || response.status === 200) {
        setQuestions(response.data?.result?.questions || []);
      }
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      console.error('Error response:', error.response);
      // Don't show alert for now, just log the error
      // Alert.alert('Error', 'Failed to load questions');
    }
  };

  // Fetch courses and enrollments on component mount
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const userId = user.id || (user as any)._id;
        if (userId) {
          console.log('🔄 AskPage: Loading courses and enrollments for user:', userId);
          await Promise.all([
            fetchAllCourses(),
            fetchUserEnrollments(userId)
          ]);
          console.log('✅ AskPage: Data loaded successfully');
          // Fetch questions after user data is loaded
          await fetchQuestions();
        }
      }
    };
    loadData();
  }, [user, fetchAllCourses, fetchUserEnrollments]);

  // Check if user has any Pro course enrollments (same logic as Header.tsx)
  const hasProEnrollment = enrolledCourses.some(enrolledCourseId => {
    const course = courses.find(c => (c.id || c._id) === enrolledCourseId);
    return course?.type === 'pro';
  });

  // Debug logging
  console.log('🔍 AskPage Premium Check:', {
    enrolledCourses,
    coursesCount: courses.length,
    hasProEnrollment,
    proCourses: courses.filter(c => c.type === 'pro').map(c => ({ id: c.id, _id: c._id, title: c.title, type: c.type })),
    enrolledCourseDetails: enrolledCourses.map(enrolledId => {
      const course = courses.find(c => (c.id || c._id) === enrolledId);
      return {
        enrolledId,
        courseFound: !!course,
        courseTitle: course?.title,
        courseType: course?.type,
        isPro: course?.type === 'pro'
      };
    })
  });

  // Set loading state immediately when page is focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }, [])
  );

  // Calculate statistics
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter((q: any) => q.status === 'answered').length;
  const pendingQuestions = questions.filter((q: any) => q.status === 'pending' || q.status === 'in-progress').length;

  // Filter questions
  const filteredQuestions = activeFilter === 'all' 
    ? questions 
    : activeFilter === 'answered'
    ? questions.filter((q: any) => q.status === 'answered')
    : questions.filter((q: any) => q.status === 'pending' || q.status === 'in-progress');

  const handleFeaturePress = (featureId: string) => {
    if (!hasProEnrollment) {
      // Show premium upgrade prompt
      Alert.alert(
        "Premium Feature",
        "This AI-powered learning tool is available for Pro course students. Upgrade to unlock intelligent tutoring, practice questions, and instant doubt solving.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "View Pro Courses", 
            onPress: () => router.push('/AllCourses/AllCoursesPage' as any) 
          }
        ]
      );
      return;
    }

    if (!selectedCourse) {
      Alert.alert(
        "No Course Selected",
        "Please select a course first to use AI learning features.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Select Course", 
            onPress: () => router.push('/AllCourses/AllCoursesPage' as any) 
          }
        ]
      );
      return;
    }

    // Prepare course data for AI features
    const courseData = {
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      subjects: selectedCourse.subjects || [],
      program: selectedCourse.program,
      description: selectedCourse.description
    };

    const courseDataJson = JSON.stringify(courseData);

    // Navigate to appropriate AI feature with course data
    switch (featureId) {
      case 'f1':
        router.push({
          pathname: '/Ask/AIChatBot',
          params: { courseData: courseDataJson }
        } as any);
        break;
      case 'f2':
        router.push({
          pathname: '/Ask/QuestionGenerator',
          params: { courseData: courseDataJson }
        } as any);
        break;
      case 'f3':
        router.push({
          pathname: '/Ask/DoubtSolver',
          params: { courseData: courseDataJson }
        } as any);
        break;
      default:
        console.warn('Unknown feature ID:', featureId);
    }
  };

  const handleQuestionPress = (questionId: string) => {
    router.push(`/Ask/QuestionDetail?questionId=${questionId}` as any);
  };

  const handleCommunityPress = () => {
    router.push('/Ask/Community' as any);
  };

  const handleSupportPress = () => {
    router.push('/More/MorePage' as any);
  };

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
              Ask & Learn
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Get instant help with AI & community
            </Text>
          </View>

          {/* Search Bar */}
          <View className="px-6 pb-4">
            <View className="flex-row items-center bg-white rounded-3xl px-4 py-3 border border-gray-100">
              <MaterialIcons name="search" size={22} color="#9CA3AF" />
              <TextInput
                placeholder="Ask anything..."
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
                source={require('../../assets/images/Loading.gif')}
                style={{ width: 180, height: 180, marginBottom: 16 }}
              />
              <Text className="text-lg font-semibold text-gray-800">
                No course selected
              </Text>
              <Text className="text-sm text-gray-500 mt-1 text-center px-4">
                Select a course in More page to unlock AI-powered learning features
              </Text>
            </View>
          </View>
        </ScrollView>
        <PrimaryNav current="Ask" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      {isLoading ? (
        <View className="flex-1 px-6 pt-6">
          <Skeleton width={150} height={24} borderRadius={4} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 16 }} />
          <View className="flex-row gap-3 mb-4">
            <Skeleton width={110} height={140} borderRadius={12} />
            <Skeleton width={110} height={140} borderRadius={12} />
            <Skeleton width={110} height={140} borderRadius={12} />
          </View>
          {[1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-2xl font-bold text-gray-900">
              Ask & Learn
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              AI assistance for {selectedCourse.title}
            </Text>
          </View>

          {/* Search Bar */}
          <View className="px-6 pb-4">
            <View className="flex-row items-center bg-white rounded-3xl px-4 py-3 border border-gray-100">
              <MaterialIcons name="search" size={22} color="#9CA3AF" />
              <TextInput
                placeholder="Ask anything..."
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
          <View className="px-6 pb-4">
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">Total Qns</Text>
                  <Text className="text-2xl font-bold text-gray-900">{totalQuestions}</Text>
                </View>
                <View className="w-px h-10 bg-gray-200" />
                <View className="flex-1 items-center">
                  <Text className="text-sm text-gray-500 mb-1">Answered</Text>
                  <Text className="text-2xl font-bold text-blue-600">{answeredQuestions}</Text>
                </View>
                <View className="w-px h-10 bg-gray-200" />
                <View className="flex-1 items-end">
                  <Text className="text-sm text-gray-500 mb-1">Pending Qns</Text>
                  <Text className="text-2xl font-bold text-red-600">{pendingQuestions}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* AI-Powered Features Section */}
          <View className="px-6 pb-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-lg font-bold text-gray-900 mr-3">
                AI Learning Assistant
              </Text>
              <View className="w-12 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Text className="text-xs font-bold text-blue-700">PRO</Text>
              </View>
            </View>
            
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              {hasProEnrollment && (
                <View className="bg-gradient-to-r from-green-50 to-emerald-50 border border-blue-200 rounded-xl p-3 mb-4">
                
                  <Text className="text-sm font-medium text-gray-700 mt-1">
                    AI features are available for your selected course with {selectedCourse.subjects?.length || 0} subjects
                  </Text>
                </View>
              )}
              
              {!hasProEnrollment && (
                <View className="bg-gradient-to-r from-gray-50 to-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                  <View className="flex-row items-center">
                    <MaterialIcons name="lock" size={20} color="#6B7280" />
                    <Text className="text-sm font-semibold text-gray-800 ml-2">
                      Premium Required
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">
                    Enroll in a Pro course to unlock AI-powered learning tools
                  </Text>
                </View>
              )}
              
              <View className="space-y-2">
                {/* AI Feature Items */}
                {[
                  {
                    id: 'f1',
                    title: 'AI Chat Bot',
                    description: `Chat with AI about ${selectedCourse.title} topics, subjects, and modules`,
                    icon: 'smart-toy'
                  },
                  {
                    id: 'f2', 
                    title: 'Question Generator',
                    description: `Generate practice questions for ${selectedCourse.title} subjects`,
                    icon: 'psychology'
                  },
                  {
                    id: 'f3',
                    title: 'Doubt Solver', 
                    description: `Get detailed solutions for ${selectedCourse.title} doubts and problems`,
                    icon: 'lightbulb'
                  }
                ].map((feature, index) => {
                  return (
                    <View
                      key={feature.id}
                      // ensure the watermark is clipped to this box only
                      style={{ position: 'relative', overflow: 'hidden' }}
                      className={`${index !== 2 ? 'border-b border-gray-100' : ''} ${!hasProEnrollment ? 'opacity-60' : ''}`}
                    >
                      <TouchableOpacity
                        activeOpacity={hasProEnrollment ? 0.7 : 1}
                        className="flex-row items-center py-3"
                        onPress={hasProEnrollment ? () => handleFeaturePress(feature.id) : undefined}
                        disabled={!hasProEnrollment}
                      >
                        <View>
                          <MaterialIcons 
                            name={feature.icon as any} 
                            size={22} 
                            color={hasProEnrollment ? "#3B82F6" : "#9CA3AF"} 
                          />
                        </View>
                        <View className="flex-1 ml-3">
                          <View className="flex-row items-center">
                            <Text className={`text-base font-semibold ${
                              hasProEnrollment ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {feature.title}
                            </Text>
                          </View>
                          <Text className={`text-sm mt-0.5 ${
                            hasProEnrollment ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {feature.description}
                          </Text>
                        </View>
                        {hasProEnrollment ? (
                          <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
                        ) : (
                          <MaterialIcons name="lock" size={22} color="#9CA3AF" />
                        )}
                      </TouchableOpacity>

                      
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Quick Access Section */}
          <View className="px-6 pb-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Quick Access
            </Text>
            
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="space-y-2">
                {/* Community */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center py-3 border-b border-gray-100"
                  onPress={handleCommunityPress}
                >
                  <MaterialIcons name="groups" size={22} color="#3B82F6" />
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-semibold text-gray-900">
                      Community
                    </Text>
                    <Text className="text-sm text-gray-500 mt-0.5">
                      Ask friends and peers
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Support */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center py-3"
                  onPress={handleSupportPress}
                >
                  <MaterialIcons name="support-agent" size={22} color="#3B82F6" />
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-bold text-gray-900">
                      Support
                    </Text>
                    <Text className="text-sm text-gray-500 mt-0.5">
                      Contact customer support
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Filter Tabs */}
          <View className="px-6 pb-4">
            <View className="flex-row bg-gray-100 rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setActiveFilter('all')}
                className={`flex-1 py-2 rounded-lg ${
                  activeFilter === 'all' ? 'bg-white' : ''
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-base font-semibold ${
                    activeFilter === 'all' ? 'text-customBlue' : 'text-gray-600'
                  }`}
                >
                  All ({totalQuestions})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveFilter('answered')}
                className={`flex-1 py-2 rounded-lg ${
                  activeFilter === 'answered' ? 'bg-white' : ''
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-base font-semibold ${
                    activeFilter === 'answered' ? 'text-customBlue' : 'text-gray-600'
                  }`}
                >
                  Answered ({answeredQuestions})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveFilter('pending')}
                className={`flex-1 py-2 rounded-lg ${
                  activeFilter === 'pending' ? 'bg-white' : ''
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-base font-semibold ${
                    activeFilter === 'pending' ? 'text-customBlue' : 'text-gray-600'
                  }`}
                >
                  Pending ({pendingQuestions})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Your Questions */}
          <View className="px-6 pb-20">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">
                Your Questions
              </Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => router.push('/Ask/AllQuestions' as any)}
              >
                <Text className="text-base text-customBlue font-medium">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {filteredQuestions.slice(0, 3).map((question: any) => (
              <QuestionCard
                key={question._id || question.id}
                question={question}
                onPress={() => handleQuestionPress(question._id || question.id)}
              />
            ))}

            {filteredQuestions.length === 0 && (
              <View className="items-center justify-center py-12">
                <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
                <Text className="text-lg text-gray-600 mt-4">
                  No questions found
                </Text>
                <Text className="text-sm text-gray-500 mt-2 text-center px-10">
                  {activeFilter === 'answered'
                    ? 'You haven\'t received any answers yet.'
                    : 'No pending questions available.'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      <PrimaryNav current="Ask" />
    </SafeAreaView>
  );
}
