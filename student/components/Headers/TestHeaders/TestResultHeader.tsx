import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TestResultHeader() {
  const router = useRouter();

  return (
        <SafeAreaView className="bg-white" edges={['top']}>
    <View className="px-6 pt-3 pb-3 bg-white border-b border-gray-100">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.push('/Test/TestPage' as any)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Test Results
        </Text>
        <View className="w-7" />
      </View>
    </View>
</SafeAreaView>
  );
}
