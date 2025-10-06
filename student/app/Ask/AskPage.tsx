import { View, Text, SafeAreaView } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Image } from 'expo-image';
import PrimaryNav from '@/components/Navigation/PrimaryNav';
import Skeleton from '../../components/Container/Skeleton';
import { useFocusEffect } from '@react-navigation/native';

export default function AskPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Set loading state immediately when page is focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      // Brief loading for consistency
      setIsLoading(false);
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      {isLoading ? (
        <View className="flex-1 items-center justify-center pb-20">
          <Skeleton width={310} height={310} borderRadius={16} />
          <Skeleton width={200} height={32} borderRadius={4} style={{ marginTop: 32 }} />
          <Skeleton width={250} height={20} borderRadius={4} style={{ marginTop: 16 }} />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center pb-20">
          
          {/* Coming Soon Image */}
          <View className="w-52 h-48 rounded-2xl items-center justify-center">
            <Image
              source={require('../../assets/images/coming-soon.gif')}
              style={{ width: 310, height: 310 }}
              contentFit="contain" // Ensures proper scaling
              transition={1000}   // Optional: smooth fade-in
            />
          </View>

          {/* Main Text */}
          <Text className="text-2xl font-bold text-gray-800 mt-8">
            This Page is Coming Soon
          </Text>

          {/* Sub Text */}
          <Text className="text-base text-gray-500 mt-2 text-center px-10">
            We&apos;re working hard to bring you this feature. Stay tuned!
          </Text>
          
        </View>
      )}
      <PrimaryNav current="Ask" />
    </SafeAreaView>
  );
}
