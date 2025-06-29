import React from 'react';
import { View, Text, Image } from 'react-native';
import ButtonThird from '../Buttons/ButtonThird';

type Props = {
  time: string;
  title: string;
  teacher: string;
  imageUrl: string;
  onPress: () => void;
};

export default function LiveClassCard({ time, title, teacher, imageUrl, onPress }: Props) {
  return (
    <View className="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
      <View className="flex-row rounded-2xl">
        {/* Left: Image covers 50% of the box, no padding */}
        <Image
          source={{ uri: imageUrl }}
          style={{
  width: '40%',
  height: 140,
  borderRadius: 24, 
}}

        />

        {/* Right: Content with padding */}
        <View className="flex-1 px-4 py-2 justify-center">
          <Text className="text-sm text-customBlue font-medium">{time}</Text>
          <Text className="text-lg font-bold text-gray-900 mt-1">{title}</Text>
          <Text className="text-gray-600 text-sm mt-2 mb-3">{teacher}</Text>
          <ButtonThird label="Join Now" onPress={onPress} />
        </View>
      </View>
    </View>
  );
}
