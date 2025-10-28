import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TestCard from './components/TestCard';
import { studentTestAPI } from '../../api/student/test';
import Skeleton from '@/components/Container/Skeleton';

type FilterType = 'all' | 'mcq' | 'pdf' | 'mixed';
type TestStatus = 'not-started' | 'in-progress' | 'completed';

export default function ModuleTestList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseName = params.courseName as string;
  const subjectName = params.subject as string;

  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await studentTestAPI.getAvailableTests();
      if (response.success && response.data) {
        console.log('📚 Module tests:', response.data.tests);
        // Filter by course and subject if provided
        let filteredTests = response.data.tests || [];
        
        if (courseName) {
          filteredTests = filteredTests.filter((test: any) => test.courseName === courseName);
        }
        
        if (subjectName) {
          filteredTests = filteredTests.filter((test: any) => test.subjectName === subjectName);
        }
        
        setTests(filteredTests);
      } else {
        console.error('❌ Failed to fetch module tests:', response);
        setError('Failed to load tests');
      }
    } catch (err) {
      console.error('🚨 Error fetching module tests:', err);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  // Filter tests based on selected filter
  const filteredTests = filter === 'all' 
    ? tests 
    : tests.filter(t => t.type === filter);

  const handleTestPress = (testId: string, testType: string) => {
    if (testType === 'mcq') {
      router.push(`/Test/MCQTest?testId=${testId}` as any);
    } else if (testType === 'pdf') {
      router.push(`/Test/PDFTest?testId=${testId}` as any);
    } else if (testType === 'mixed') {
      router.push(`/Test/MCQTest?testId=${testId}` as any); // For demo, use MCQ page
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 px-6 pt-3">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="mb-3">
              <Skeleton width="100%" height={100} borderRadius={12} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="error-outline" size={64} color="#9CA3AF" />
          <Text className="text-lg text-gray-600 mt-4">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      {/* Filter Tabs */}
      <View className="px-6 py-3 bg-white">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'mcq', label: 'MCQ' },
              { key: 'pdf', label: 'PDF' },
              { key: 'mixed', label: 'Mixed' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilter(tab.key as FilterType)}
                className={`px-4 py-1.5 rounded-full ${
                  filter === tab.key
                    ? 'bg-customBlue'
                    : 'bg-gray-100'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-medium ${
                    filter === tab.key ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tests List */}
      <ScrollView className="flex-1 px-6 pt-3">
        {loading ? (
          <View>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="mb-3">
                <Skeleton width="100%" height={100} borderRadius={12} />
              </View>
            ))}
          </View>
        ) : filteredTests.length > 0 ? (
          <>
            {filteredTests.map((test) => {
              // Map API response to TestCard expected format
              const mappedTest = {
                id: test._id,
                title: test.title,
                courseId: test.courseName, // Use courseName as courseId for display
                courseName: test.courseName,
                type: test.type,
                difficulty: 'medium' as const, // Default difficulty
                duration: test.duration,
                totalQuestions: test.totalQuestions,
                totalMarks: test.totalMarks,
                description: `${test.type.toUpperCase()} test with ${test.totalQuestions} questions`, // Generate description
                status: (test.attemptInfo?.status === 'submitted' || test.attemptInfo?.status === 'evaluated' 
                  ? 'completed' 
                  : test.attemptInfo?.status === 'in-progress' 
                  ? 'in-progress' 
                  : 'not-started') as TestStatus,
                score: test.attemptInfo?.totalScore,
              };
              
              return (
                <TestCard
                  key={test._id}
                  test={mappedTest}
                  onPress={() => handleTestPress(test._id, test.type)}
                />
              );
            })}
            <View className="h-6" />
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
            <Text className="text-base text-gray-600 mt-3">No tests found</Text>
            <Text className="text-xs text-gray-500 mt-1 text-center px-10">
              There are no {filter !== 'all' ? filter.toUpperCase() : ''} tests available yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
