// profile/components/ProgressBar.tsx
import React from 'react';
import { View, Text } from 'react-native';

type ProgressBarProps = {
  label: string;
  progress: number; // 0 to 100
};

const ProgressBar = ({ label, progress }: ProgressBarProps) => {
  return (
    <View className="px-5 py-5">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-semibold text-gray-900">{label}</Text>
        <Text className="text-sm font-bold text-blue-600">{progress}%</Text>
      </View>
      
      <View className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <View 
          className="h-full bg-blue-600 rounded-full" 
          style={{ width: `${progress}%` }} 
        />
      </View>
      
      <Text className="text-xs text-gray-500 mt-2">
        Keep going! You&apos;re doing great.
      </Text>
    </View>
  );
};

export default ProgressBar;