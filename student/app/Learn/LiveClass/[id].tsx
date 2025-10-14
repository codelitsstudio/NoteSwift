import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function LiveClassPreJoin() {
  const router = useRouter();
  const { id, title, teacher, subject } = useLocalSearchParams();
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const handleJoin = () => {
    router.push({
      pathname: '/Learn/LiveClass/Room',
      params: {
        id,
        title,
        teacher,
        subject,
        audioEnabled: audioEnabled.toString(),
        videoEnabled: videoEnabled.toString(),
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-5 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row items-center bg-red-50 px-2.5 py-1 rounded-full">
            <View className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" />
            <Text className="text-xs text-red-600 font-semibold">LIVE</Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="people" size={16} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 font-medium ml-1">42</Text>
          </View>
        </View>
        <Text className="text-lg font-bold text-gray-900 mb-0.5">{title}</Text>
        <Text className="text-sm text-gray-500">{teacher} • {subject}</Text>
      </View>

      {/* Preview Section */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center px-5">
          {/* Video Preview - Compact */}
          <View className="bg-gray-900 rounded-2xl overflow-hidden mb-5 w-full" style={{ aspectRatio: 16/9 }}>
            <View className="flex-1 items-center justify-center">
              {videoEnabled ? (
                <View className="items-center">
                  <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-2">
                    <MaterialIcons name="person" size={32} color="#FFFFFF" />
                  </View>
                  <Text className="text-white text-sm font-medium">You</Text>
                </View>
              ) : (
                <View className="items-center">
                  <MaterialIcons name="videocam-off" size={32} color="#6B7280" />
                  <Text className="text-gray-400 text-sm mt-2">Camera Off</Text>
                </View>
              )}
            </View>
          </View>

          {/* Settings - Minimal */}
          <Text className="text-sm font-semibold text-gray-900 mb-3 w-full">Before you join</Text>
          
          {/* Audio Toggle - Compact */}
          <View className="bg-gray-50 rounded-xl p-3.5 mb-2.5 flex-row items-center justify-between w-full">
            <View className="flex-row items-center flex-1">
              <View className={`w-9 h-9 ${audioEnabled ? 'bg-blue-500' : 'bg-gray-300'} rounded-full items-center justify-center mr-3`}>
                <MaterialIcons 
                  name={audioEnabled ? "mic" : "mic-off"} 
                  size={18} 
                  color="#FFFFFF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">Microphone</Text>
                <Text className="text-xs text-gray-500">{audioEnabled ? 'On' : 'Off'}</Text>
              </View>
            </View>
            <Switch
              value={audioEnabled}
              onValueChange={setAudioEnabled}
              trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
              thumbColor={audioEnabled ? '#3B82F6' : '#F3F4F6'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          {/* Video Toggle - Compact */}
          <View className="bg-gray-50 rounded-xl p-3.5 mb-4 flex-row items-center justify-between w-full">
            <View className="flex-row items-center flex-1">
              <View className={`w-9 h-9 ${videoEnabled ? 'bg-blue-500' : 'bg-gray-300'} rounded-full items-center justify-center mr-3`}>
                <MaterialIcons 
                  name={videoEnabled ? "videocam" : "videocam-off"} 
                  size={18} 
                  color="#FFFFFF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">Camera</Text>
                <Text className="text-xs text-gray-500">{videoEnabled ? 'On' : 'Off'}</Text>
              </View>
            </View>
            <Switch
              value={videoEnabled}
              onValueChange={setVideoEnabled}
              trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
              thumbColor={videoEnabled ? '#3B82F6' : '#F3F4F6'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          {/* Simple Note */}
          <View className="flex-row items-center bg-blue-50 rounded-xl p-3 border border-blue-100 w-full">
            <MaterialIcons name="info-outline" size={16} color="#3B82F6" />
            <Text className="text-xs text-blue-700 ml-2 flex-1">
              You can adjust these settings during the class
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Join Button - Fixed at bottom */}
      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <View className="px-5 py-3">
          <TouchableOpacity
            className="bg-red-500 rounded-xl py-3.5 items-center shadow-sm"
            activeOpacity={0.85}
            onPress={handleJoin}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="video-call" size={20} color="#FFFFFF" />
              <Text className="text-white text-sm font-semibold ml-2">Join Now</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}
