import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PrimaryNav from '@/components/Navigation/PrimaryNav';
import Skeleton from '../../components/Container/Skeleton';
import { useFocusEffect } from '@react-navigation/native';
import QuestionCard from './components/QuestionCard';
import FeatureCard from './components/FeatureCard';
import { demoQuestions, demoAIFeatures } from './askData';

export default function AskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'answered' | 'pending'>('all');

  // Set loading state immediately when page is focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }, [])
  );

  // Calculate statistics
  const totalQuestions = demoQuestions.length;
  const answeredQuestions = demoQuestions.filter(q => q.status === 'answered').length;
  const pendingQuestions = demoQuestions.filter(q => q.status === 'pending' || q.status === 'in-progress').length;

  // Filter questions
  const filteredQuestions = activeFilter === 'all' 
    ? demoQuestions 
    : activeFilter === 'answered'
    ? demoQuestions.filter(q => q.status === 'answered')
    : demoQuestions.filter(q => q.status === 'pending' || q.status === 'in-progress');

  const handleFeaturePress = (featureId: string) => {
    switch(featureId) {
      case 'f1':
        router.push('/Ask/AIChatBot' as any);
        break;
      case 'f2':
        router.push('/Ask/QuestionGenerator' as any);
        break;
      case 'f3':
        router.push('/Ask/DoubtSolver' as any);
        break;
      case 'f5':
        router.push('/Ask/StudyTips' as any);
        break;
      case 'f4':
      case 'f6':
        // Coming soon features
        break;
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
            <Text className="text-lg font-bold text-gray-900 mb-3">
              AI-Powered Features
            </Text>
            
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="space-y-2">
                {/* Feature Items */}
                {demoAIFeatures.slice(0, 4).map((feature, index) => (
                  <TouchableOpacity
                    key={feature.id}
                    activeOpacity={0.7}
                    className={`flex-row items-center py-3 ${
                      index !== 3 ? 'border-b border-gray-100' : ''
                    }`}
                    onPress={() => handleFeaturePress(feature.id)}
                  >
                    <MaterialIcons name={feature.icon as any} size={22} color="#3B82F6" />
                    <View className="flex-1 ml-3">
                      <Text className="text-base font-semibold text-gray-900">
                        {feature.title}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-0.5">
                        {feature.description}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
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

            {filteredQuestions.slice(0, 3).map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onPress={() => handleQuestionPress(question.id)}
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
