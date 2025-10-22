import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TestCard from './components/TestCard';
import { demoTests, demoCourses } from './testData';
import Skeleton from '@/components/Container/Skeleton';

type FilterType = 'all' | 'mcq' | 'pdf' | 'mixed';

export default function CourseTestList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;

  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);

  // Get course details
  const course = demoCourses.find(c => c.id === courseId);
  
  // Get tests for this course
  const courseTests = demoTests.filter(t => t.courseId === courseId);
  
  // Filter tests based on selected filter
  const filteredTests = filter === 'all' 
    ? courseTests 
    : courseTests.filter(t => t.type === filter);

  const handleTestPress = (testId: string, testType: string) => {
    if (testType === 'mcq') {
      router.push(`/Test/MCQTest?testId=${testId}` as any);
    } else if (testType === 'pdf') {
      router.push(`/Test/PDFTest?testId=${testId}` as any);
    } else if (testType === 'mixed') {
      router.push(`/Test/MCQTest?testId=${testId}` as any); // For demo, use MCQ page
    }
  };

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="error-outline" size={64} color="#9CA3AF" />
          <Text className="text-lg text-gray-600 mt-4">Course not found</Text>
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
            {filteredTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onPress={() => handleTestPress(test.id, test.type)}
              />
            ))}
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
