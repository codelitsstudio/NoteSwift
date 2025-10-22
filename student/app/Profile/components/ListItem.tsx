// profile/components/ListItem.tsx
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type ListItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  showEdit?: boolean;
  isEditing?: boolean;
};

const ListItem = ({ icon, label, value, onPress, destructive = false, showEdit = false, isEditing = false }: ListItemProps) => {
  const textColor = destructive ? 'text-red-600' : 'text-gray-900';
  const iconColor = destructive ? '#DC2626' : '#3B82F6';
  const valueColor = 'text-gray-500';

  return (
    <View className={`flex-row items-center px-5 py-4 ${isEditing ? 'bg-blue-50' : ''}`}>
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
        isEditing ? 'bg-blue-100' : 'bg-gray-50'
      }`}>
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      
      <TouchableOpacity 
        className="flex-1" 
        onPress={showEdit ? undefined : onPress}
        activeOpacity={showEdit ? 1 : 0.7}
      >
        <Text className={`text-base font-medium ${textColor}`}>{label}</Text>
        {value && (
          <Text className={`text-sm mt-0.5 ${isEditing ? 'text-blue-600' : valueColor}`}>
            {isEditing ? 'Tap to edit...' : value}
          </Text>
        )}
      </TouchableOpacity>
      
      {showEdit ? (
        <TouchableOpacity
          onPress={onPress}
          className="p-2 rounded-full"
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons 
            name={isEditing ? "check" : "edit"} 
            size={18} 
            color={isEditing ? "#16A34A" : "#3B82F6"} 
          />
        </TouchableOpacity>
      ) : !value ? (
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      ) : null}
    </View>
  );
};

export default ListItem;