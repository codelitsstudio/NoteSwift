// student/app/Search/SearchPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

import { useCourseStore, Course } from "../../stores/courseStore";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { OfflineScreen } from "../../components/Container/OfflineScreen";
import Skeleton from "../../components/Container/Skeleton";
import api from '../../api/axios';

// Generic Search Result Item Component
const GenericSearchResultItem: React.FC<{
  item: any;
  searchType: 'courses' | 'questions' | 'tests';
  onPress: () => void;
}> = React.memo(({ item, searchType, onPress }) => {
  if (searchType === 'courses') {
    const course = item as Course;
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-white rounded-xl p-4 mb-3 mx-6"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1" numberOfLines={1}>
              {course.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {course.description || "No description available"}
            </Text>
            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <MaterialIcons name="school" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {course.program || "General"}
                </Text>
              </View>
              {(course.price !== undefined && course.price !== null) && (
                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-500 ml-1">
                    {course.price === 0 ? "Free" : `Rs. ${course.price}`}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  } else if (searchType === 'questions') {
    const question = item;
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'answered':
          return '#10B981'; // green
        case 'pending':
          return '#F59E0B'; // yellow
        case 'in-progress':
          return '#3B82F6'; // blue
        default:
          return '#6B7280'; // gray
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'answered':
          return 'Answered';
        case 'pending':
          return 'Pending';
        case 'in-progress':
          return 'In Progress';
        default:
          return 'Unknown';
      }
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-white rounded-xl p-4 mb-3 mx-6"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        <View className="flex-row items-start">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-2" numberOfLines={2}>
              {question.title || question.question}
            </Text>
            <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
              {question.description || question.question}
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: getStatusColor(question.status) }}
                  />
                  <Text className="text-xs text-gray-500">
                    {getStatusText(question.status)}
                  </Text>
                </View>
                {question.subject && (
                  <View className="flex-row items-center">
                    <MaterialIcons name="subject" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500 ml-1">
                      {question.subject}
                    </Text>
                  </View>
                )}
              </View>
              {question.createdAt && (
                <Text className="text-xs text-gray-400">
                  {new Date(question.createdAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  } else if (searchType === 'tests') {
    const test = item;
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed':
          return '#10B981'; // green
        case 'in-progress':
          return '#3B82F6'; // blue
        case 'not-started':
          return '#F59E0B'; // yellow
        default:
          return '#6B7280'; // gray
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'completed':
          return 'Completed';
        case 'in-progress':
          return 'In Progress';
        case 'not-started':
          return 'Not Started';
        default:
          return 'Unknown';
      }
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-white rounded-xl p-4 mb-3 mx-6"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        <View className="flex-row items-start">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-2" numberOfLines={2}>
              {test.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
              {test.description || `${test.type?.toUpperCase() || 'TEST'} test with ${test.totalQuestions || 0} questions`}
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: getStatusColor(test.status) }}
                  />
                  <Text className="text-xs text-gray-500">
                    {getStatusText(test.status)}
                  </Text>
                </View>
                {test.type && (
                  <View className="flex-row items-center">
                    <MaterialIcons name="quiz" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500 ml-1">
                      {test.type.toUpperCase()}
                    </Text>
                  </View>
                )}
                {(test.score !== undefined && test.score !== null) && (
                  <View className="flex-row items-center">
                    <MaterialIcons name="grade" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500 ml-1">
                      {test.score}%
                    </Text>
                  </View>
                )}
              </View>
              {test.totalQuestions && (
                <Text className="text-xs text-gray-400">
                  {test.totalQuestions} Qs
                </Text>
              )}
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  }

  return null;
});

GenericSearchResultItem.displayName = 'GenericSearchResultItem';

// Search Results Skeleton
const SearchResultsSkeleton: React.FC = React.memo(() => {
  return (
    <View className="px-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton
          key={i}
          width="100%"
          height={100}
          borderRadius={12}
          style={{ marginBottom: 12 }}
        />
      ))}
    </View>
  );
});

SearchResultsSkeleton.displayName = 'SearchResultsSkeleton';

const SearchPage = React.memo(function SearchPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isOnline = useNetworkStatus();
  const { courses, fetchAllCourses } = useCourseStore();

  const searchType = (params.searchType as 'courses' | 'questions' | 'tests') || 'courses';
  const placeholder = params.placeholder as string || (searchType === 'courses' ? 'Search for courses, subjects...' : searchType === 'questions' ? 'Search questions...' : 'Search tests...');

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [allItems, setAllItems] = useState<any[]>([]);

  // Load data based on search type
  useEffect(() => {
    const loadData = async () => {
      if (searchType === 'courses') {
        if (!courses || courses.length === 0) {
          try {
            await fetchAllCourses();
            setAllItems(courses || []);
          } catch (error) {
            console.error("Error loading courses:", error);
            Toast.show({
              type: "error",
              position: "top",
              text1: "Error",
              text2: "Failed to load courses",
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 50,
            });
          }
        } else {
          setAllItems(courses);
        }
      } else if (searchType === 'questions') {
        try {
          const response = await api.get('/questions');
          console.log('Questions response:', response);
          if (response.data?.success || response.status === 200) {
            setAllItems(response.data?.result?.questions || []);
          }
        } catch (error: any) {
          console.error('Error fetching questions:', error);
          Toast.show({
            type: "error",
            position: "top",
            text1: "Error",
            text2: "Failed to load questions",
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
          });
        }
      } else if (searchType === 'tests') {
        // For tests, use the initialData passed from the calling page
        const initialData = params.initialData as string;
        if (initialData) {
          try {
            const testData = JSON.parse(initialData);
            setAllItems(testData);
          } catch (error) {
            console.error('Error parsing test data:', error);
            setAllItems([]);
          }
        } else {
          setAllItems([]);
        }
      }
    };

    loadData();
  }, [courses, fetchAllCourses, searchType, params.initialData]);

  // Filter items based on search query
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredItems([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);

    // Simple search implementation
    const filtered = allItems.filter((item: any) => {
      const searchTerm = query.toLowerCase();

      if (searchType === 'courses') {
        const course = item as Course;
        const title = (course.title || "").toLowerCase();
        const description = (course.description || "").toLowerCase();
        const program = (course.program || "").toLowerCase();

        return (
          title.includes(searchTerm) ||
          description.includes(searchTerm) ||
          program.includes(searchTerm)
        );
      } else if (searchType === 'questions') {
        const title = (item.title || item.question || "").toLowerCase();
        const description = (item.description || item.question || "").toLowerCase();
        const subject = (item.subject || "").toLowerCase();

        return title.includes(searchTerm) ||
               description.includes(searchTerm) ||
               subject.includes(searchTerm);
      } else if (searchType === 'tests') {
        const title = (item.title || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const subjectName = (item.subjectName || "").toLowerCase();
        const type = (item.type || "").toLowerCase();

        return title.includes(searchTerm) ||
               description.includes(searchTerm) ||
               subjectName.includes(searchTerm) ||
               type.includes(searchTerm);
      }

      return false;
    });

    // Simulate search delay for better UX
    setTimeout(() => {
      setFilteredItems(filtered);
      setIsSearching(false);
      setHasSearched(true);
    }, 300);
  }, [allItems, searchType]);

  // Handle search input change
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    performSearch(text);
  }, [performSearch]);

  // Handle item selection
  const handleItemPress = useCallback((item: any) => {
    if (searchType === 'courses') {
      // Navigate to package details page with course data
      router.push({
        pathname: '/Home/Components/PackageDetails',
        params: {
          packageData: JSON.stringify(item)
        }
      });
    } else if (searchType === 'questions') {
      // Navigate to question detail
      router.push(`/Ask/QuestionDetail?questionId=${item._id || item.id}` as any);
    } else if (searchType === 'tests') {
      // Navigate to test based on type
      const test = item;
      if (test.status === 'completed') {
        router.push(`/Test/TestResult?testId=${test.id}` as any);
      } else if (test.type === 'mcq' || test.type === 'mixed') {
        router.push(`/Test/MCQTest?testId=${test.id}` as any);
      } else if (test.type === 'pdf') {
        router.push(`/Test/PDFTest?testId=${test.id}` as any);
      }
    }
  }, [router, searchType]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setFilteredItems([]);
    setHasSearched(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Show offline screen when no internet */}
        {!isOnline && <OfflineScreen />}

        {/* Header */}
        <View className="bg-white mt-2 px-6 pb-4">
          {/* Search Input */}
          <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-xl">
            <MaterialIcons name="search" size={24} color="#8c8c8c" />
            <TextInput
              placeholder={placeholder}
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={handleSearchChange}
              className="ml-3 text-[14px] flex-1 text-[#292E45]"
              autoFocus={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="ml-2">
                <AntDesign name="close" size={20} color="#8c8c8c" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isSearching ? (
            <SearchResultsSkeleton />
          ) : hasSearched && filteredItems.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6 py-12">
              <MaterialIcons name="search-off" size={64} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                No {searchType === 'courses' ? 'courses' : searchType === 'questions' ? 'questions' : 'tests'} found
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                Try searching with different keywords or check your spelling
              </Text>
            </View>
          ) : filteredItems.length > 0 ? (
            <View className="py-4">
              <Text className="text-sm text-gray-600 mb-3 px-6">
                Found {filteredItems.length} {searchType === 'courses' ? 'course' : searchType === 'questions' ? 'question' : 'test'}{filteredItems.length !== 1 ? 's' : ''}
              </Text>
              {filteredItems.map((item) => (
                <GenericSearchResultItem
                  key={item._id || item.id}
                  item={item}
                  searchType={searchType}
                  onPress={() => handleItemPress(item)}
                />
              ))}
            </View>
          ) : searchQuery.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6 py-12">
              <MaterialIcons name={searchType === 'courses' ? "search" : searchType === 'questions' ? "question-answer" : "quiz"} size={64} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                {searchType === 'courses' ? 'Search for courses' : searchType === 'questions' ? 'Search Questions' : 'Search Tests'}
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                {searchType === 'courses' 
                  ? 'Enter keywords to find relevant courses and subjects'
                  : searchType === 'questions'
                    ? 'Enter keywords to find relevant questions and answers'
                    : 'Enter keywords to find relevant tests and quizzes'
                }
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

SearchPage.displayName = 'SearchPage';

export default SearchPage;