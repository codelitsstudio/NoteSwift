// more/components/MenuListItem.tsx
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  isDestructive?: boolean;
};

const MenuListItem = ({ icon, title, subtitle, onPress, isDestructive = false }: Props) => {
  const textColor = isDestructive ? 'text-red-600' : 'text-gray-900';
  const iconColor = isDestructive ? '#DC2626' : '#3B82F6';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-5 py-4"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-4 bg-gray-50">
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      
      <View className="flex-1">
        <Text className={`text-base font-medium ${textColor}`}>{title}</Text>
        <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
      </View>
      
      {!isDestructive && (
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
};

export default MenuListItem;