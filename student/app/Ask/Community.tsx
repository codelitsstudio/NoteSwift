import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { demoCommunityPosts } from './askData';

export default function Community() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Community
          </Text>
          <Text className="text-sm text-gray-500">
            Ask questions & help your peers
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 pb-4">
          <View className="flex-row items-center bg-white rounded-3xl px-4 py-3 border border-gray-100">
            <MaterialIcons name="search" size={22} color="#9CA3AF" />
            <TextInput
              placeholder="Search questions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Subject Filter */}
        <View className="px-6 pb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
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
                    className={`text-base font-semibold ${
                      selectedSubject === subject ? 'text-white' : 'text-black'
                    }`}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Stats Card */}
        <View className="px-6 pb-4">
          <View className="bg-white rounded-2xl p-4 border border-gray-100">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Active Users</Text>
                <Text className="text-2xl font-bold text-gray-900">1,234</Text>
              </View>
              <View className="w-px h-10 bg-gray-200" />
              <View className="flex-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">Questions</Text>
                <Text className="text-2xl font-bold text-customBlue">5,678</Text>
              </View>
              <View className="w-px h-10 bg-gray-200" />
              <View className="flex-1 items-end">
                <Text className="text-sm text-gray-500 mb-1">Answers</Text>
                <Text className="text-2xl font-bold text-green-600">12,345</Text>
              </View>
            </View>
          </View>
        </View>

        {/* New Question Button */}
        <View className="px-6 pb-4">
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-customBlue rounded-xl py-4 items-center"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="add" size={22} color="#FFFFFF" />
              <Text className="text-base font-bold text-white ml-2">
                Ask a Question
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Community Posts */}
        <View className="px-6 pb-20">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Recent Questions
          </Text>

          {demoCommunityPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              activeOpacity={0.7}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
            >
              {/* User Info */}
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                  <Text className="text-base font-bold text-customBlue">
                    {post.userName.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-bold text-gray-900">
                    {post.userName}
                  </Text>
                  <Text className="text-sm text-gray-500">{post.timestamp}</Text>
                </View>
                {post.hasAnswer && (
                  <View className="bg-green-50 px-2 py-1 rounded-md">
                    <Text className="text-sm font-medium text-green-600">Answered</Text>
                  </View>
                )}
              </View>

              {/* Question */}
              <Text className="text-base font-bold text-gray-900 mb-2">
                {post.question}
              </Text>

              {/* Subject Badge */}
              <View className="flex-row items-center mb-3">
                <View className="bg-blue-50 px-2 py-1 rounded-md">
                  <Text className="text-sm font-medium text-customBlue">
                    {post.subject}
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <View className="flex-row items-center">
                  <MaterialIcons name="chat-bubble-outline" size={18} color="#9CA3AF" />
                  <Text className="text-sm text-gray-500 ml-1">{post.replies} replies</Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="thumb-up" size={18} color="#9CA3AF" />
                  <Text className="text-sm text-gray-500 ml-1">{post.upvotes} upvotes</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
