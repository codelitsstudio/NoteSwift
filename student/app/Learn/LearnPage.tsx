import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';

import PrimaryNav from '../../components/Navigation/PrimaryNav';
import SearchBar from '../../components/InputFields/SearchBar';
import ActiveCourses from './Components/ActiveCourses';
import ModelQuestions from './Components/ModelQuestions';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-6 flex-1 bg-[#FAFAFA]">
          <Text className="text-5xl font-bold mb-3 text-gray-900">
            Lets
            <Text className="text-customBlue font-semibold"> Learn !</Text>
          </Text>

          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

          <View className="flex-row justify-between items-center mt-4 mb-4">
            <Text className="text-2xl font-bold text-gray-900">Your Active Classes</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text className="text-base text-blue-500 font-medium">View More</Text>
            </TouchableOpacity>
          </View>

          <ActiveCourses searchQuery={searchQuery} />
                    <View className="flex-row justify-between items-center mt-4 mb-4">
            <Text className="text-2xl font-bold text-gray-900">Model Questions</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text className="text-base text-blue-500 font-medium">View More</Text>
            </TouchableOpacity>
          </View>

          <ModelQuestions searchQuery={searchQuery} />
        
        </View>
      </ScrollView>

      <PrimaryNav current="Learn" />
    </KeyboardAvoidingView>
  );
}
