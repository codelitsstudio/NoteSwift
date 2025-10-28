import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuestionGenerator() {
  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center pb-8 items-center mt-6 px-6">
          <Image
            source={require('../../assets/images/coming-soon.gif')}
            style={{ width: 360, height: 360, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-semibold text-gray-700">
            Question Generator Coming Soon
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center px-4">
            We&apos;re working on AI-powered question generation. Check back soon!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
