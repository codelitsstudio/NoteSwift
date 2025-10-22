import React, { useEffect, useRef } from "react";
import { View, ScrollView, Text, TouchableOpacity, Animated } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  active: boolean;
}

interface DashboardSidebarProps {
  visible: boolean;
  sidebarItems: SidebarItem[];
  onNavigate: (sectionId: string) => void;
  subtitle?: string;
}

export default function DashboardSidebar({ 
  visible, 
  sidebarItems, 
  onNavigate, 
  subtitle = "NoteSwift Pro Dashboard" 
}: DashboardSidebarProps) {
  const slideAnim = useRef(new Animated.Value(-264)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : -264,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: visible ? 0.5 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [visible, slideAnim, backdropAnim]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <Animated.View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'black',
          opacity: backdropAnim,
          zIndex: 999,
        }}
      />
      
      {/* Sidebar */}
      <Animated.View 
        style={{
          transform: [{ translateX: slideAnim }],
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 264,
          zIndex: 1000,
        }}
        className="bg-white border-r border-gray-200"
      >
      <ScrollView className="flex-1 py-4">
        <View className="px-4 py-4 border-b border-gray-100 mb-2">
          <View className="flex-row items-center mb-2">
            <Text className="text-xl font-bold text-gray-900 mr-2">NoteSwift</Text>
            <View className="bg-blue-500 px-2 py-1 rounded">
              <Text className="text-white text-xs font-bold">PRO</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600">{subtitle}</Text>
          
          {/* Pro Features Badge */}
          <View className="mt-3 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <View className="flex-row items-center">
              <MaterialIcons name="star" size={16} color="#3B82F6" />
              <Text className="text-xs text-blue-700 ml-1 font-semibold">Premium Dashboard</Text>
            </View>
          </View>
        </View>
        {sidebarItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onNavigate(item.id)}
            className={`flex-row items-center py-3 px-4 mx-2 rounded-lg ${
              item.active ? 'bg-blue-50' : ''
            }`}
          >
            <MaterialIcons 
              name={item.icon as any} 
              size={20} 
              color={item.active ? "#3B82F6" : "#6B7280"} 
            />
            <Text className={`ml-3 ${
              item.active ? 'text-blue-600 font-semibold' : 'text-gray-700'
            }`}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
    </>
  );
}