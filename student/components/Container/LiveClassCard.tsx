import React from 'react';
import { View, Text, Image } from 'react-native';
import ButtonFourth from '../Buttons/ButtonFourth';

type Props = {
  time: string;
  title: string;
  teacher: string;
  imageUrl: string;
  onPress: () => void;
  isLive?: boolean;
};

export default function LiveClassCard({
  time,
  title,
  teacher,
  imageUrl,
  onPress,
  isLive = false,
}: Props) {
  return (
    <View className="bg-white rounded-3xl border border-gray-100 mb-4 overflow-hidden relative">
      <View className="flex-row rounded-2xl">
        {/* Left: Image */}
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: '40%',
            height: 140,
            borderRadius: 24,
          }}
        />

        {/* Right: Content */}
        <View className="flex-1 px-4 py-2 justify-center">
          <Text className="text-sm text-customBlue font-medium">{time}</Text>
          <Text className="text-lg font-bold text-gray-900 mt-1">{title}</Text>
          <Text className="text-gray-600 text-sm mt-2 mb-3">{teacher}</Text>

          {/* Dynamic Button */}
          <ButtonFourth
            label={isLive ? 'Join Now' : 'Notify Me'}
            type={isLive ? 'live' : 'upcoming'}
            onPress={onPress}
          />
        </View>
      </View>

      {/* LIVE Badge */}
      {isLive && (
        <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-md flex-row items-center">
          <View className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
          <Text className="text-white text-xs font-bold">LIVE</Text>
        </View>
      )}
    </View>
  );
}
