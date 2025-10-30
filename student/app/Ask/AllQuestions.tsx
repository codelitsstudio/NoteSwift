import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QuestionCard from './components/QuestionCard';
import api from '../../api/axios';

function AllQuestions() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [questions, setQuestions] = useState<any[]>([]);

  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions');
      // Accept both { success, result: { questions } } and { error, result: { questions } }
      if (
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result.questions)
      ) {
        setQuestions(response.data.result.questions);
      } else if (
        response.data &&
        Array.isArray(response.data.questions)
      ) {
        setQuestions(response.data.questions);
      } else {
        // Log unexpected response for debugging
        console.warn('Unexpected questions API response:', response.data);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    }
  };

  // Fetch questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter questions
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      (question.title && question.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (question.subjectName && question.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (question.questionText && question.questionText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubject === 'All' ||
      question.subjectName === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Your Questions
          </Text>
          <Text className="text-sm text-gray-500">
            Manage all your questions in one place
          </Text>
        </View>
 {/* Search Bar */}
        <View className="px-6 pb-4">
          <View className="bg-white rounded-3xl flex-row items-center px-4 py-3 border border-gray-200">
            <MaterialIcons name="search" size={22} color="#9CA3AF" />
            <TextInput
              placeholder="Search questions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
       

        {/* Status Filter */}
        {/* <View className="px-6 pb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Filter by Status</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              className={`flex-1 px-4 py-2 rounded-xl border ${
                selectedStatus === 'all'
                  ? 'bg-customBlue border-customBlue'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => setSelectedStatus('all')}
            >
              <Text
                className={`text-base font-medium text-center ${
                  selectedStatus === 'all' ? 'text-white' : 'text-gray-700'
                }`}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              className={`flex-1 px-4 py-2 rounded-xl border ${
                selectedStatus === 'answered'
                  ? 'bg-customBlue border-customBlue'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => setSelectedStatus('answered')}
            >
              <Text
                className={`text-base font-medium text-center ${
                  selectedStatus === 'answered' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Answered
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              className={`flex-1 px-4 py-2 rounded-xl border ${
                selectedStatus === 'pending'
                  ? 'bg-customBlue border-customBlue'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => setSelectedStatus('pending')}
            >
              <Text
                className={`text-base font-medium text-center ${
                  selectedStatus === 'pending' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Pending
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Subject Filter */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Filter by Subject</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject}
                activeOpacity={0.7}
                className={`px-4 py-2 rounded-xl border ${
                  selectedSubject === subject
                    ? 'bg-customBlue border-customBlue'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => setSelectedSubject(subject)}
              >
                <Text
                  className={`text-base font-medium ${
                    selectedSubject === subject ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Questions List */}
        <View className="px-6 pb-20">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            {filteredQuestions.length} {filteredQuestions.length === 1 ? 'Question' : 'Questions'}
          </Text>
          
          {filteredQuestions.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
              <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
              <Text className="text-lg font-bold text-gray-900 mt-4">
                No Questions Found
              </Text>
              <Text className="text-base text-gray-500 text-center mt-2">
                Try adjusting your filters or search query
              </Text>
            </View>
          ) : (
            filteredQuestions.map((question) => (
              <QuestionCard 
                key={question._id || question.id} 
                question={question} 
                onPress={() => router.push({ pathname: '/Ask/QuestionDetail', params: { questionId: question._id || question.id } })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

AllQuestions.displayName = 'AllQuestions';
export default AllQuestions;
