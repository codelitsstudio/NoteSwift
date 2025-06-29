// pages/Home/HomePage.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import LiveClasses from './Components/LiveClasses';
import QuickAccess from '../../components/Container/QuickAccess';
import UpcomingCourses from './Components/UpcomingCourses';
import PrimaryNav from '../../components/Navigation/PrimaryNav';

export default function HomePage() {
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
          <LiveClasses />

          <Text className="text-2xl font-bold mb-3 text-gray-900">Quick Access</Text>
          <QuickAccess />

          <View className="flex-row justify-between items-center mt-4 mb-4">
            <Text className="text-2xl font-bold text-gray-900">Upcoming Classes</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text className="text-base text-blue-500 font-medium">View More</Text>
            </TouchableOpacity>
          </View>
            <UpcomingCourses />
     
       
        </View>

      
      
      </ScrollView>
        <PrimaryNav current="Home" />
    </KeyboardAvoidingView>
    
  );
}
