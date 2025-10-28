import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface LiveClassJoinBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  classData: {
    id: string;
    title: string;
    teacher: string;
    subject: string;
    participants: number;
  };
}

const LiveClassJoinBottomSheet: React.FC<LiveClassJoinBottomSheetProps> = ({
  isVisible,
  onClose,
  classData,
}) => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const handleClose = () => {
    setAudioEnabled(true);
    onClose();
  };

  const handleJoin = () => {
    router.push({
      pathname: '/Learn/LiveClass/Room',
      params: {
        id: classData.id,
        title: classData.title,
        teacher: classData.teacher,
        subject: classData.subject,
        audioEnabled: audioEnabled.toString(),
      }
    });
    handleClose();
  };

  // Don't render at all if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['55%', '60%']}
      onClose={handleClose}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="extend"
      backgroundStyle={{ backgroundColor: '#fff' }}
      handleIndicatorStyle={{ backgroundColor: '#E5E7EB' }}
    >
      <BottomSheetScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="px-5 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-900">Join Live Class</Text>
            <TouchableOpacity onPress={handleClose} className="p-2 -mr-2">
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Live Badge */}
          <View className="flex-row items-center mb-2">
            <View className="flex-row items-center bg-red-50 px-2.5 py-1 rounded-full mr-2">
              <View className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />
              <Text className="text-xs text-red-600 font-semibold">LIVE</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="people" size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 font-medium ml-1">{classData.participants} online</Text>
            </View>
          </View>

          {/* Class Info */}
          <Text className="text-lg font-bold text-gray-900 mb-1">{classData.title}</Text>
          <Text className="text-sm text-gray-600">{classData.teacher} • {classData.subject}</Text>
        </View>

        {/* Description Card
        <View className="mx-5 mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <View className="flex-row items-start" style={{ gap: 12 }}>
            <View className="bg-blue-100 rounded-full p-2 mt-0.5">
              <MaterialIcons name="video-call" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                Ready to Learn?
              </Text>
              <Text className="text-xs text-gray-700 leading-5">
                Set your audio and video preferences before joining. You can adjust these anytime during the class.
              </Text>
            </View>
          </View>
        </View> */}

        {/* Settings */}
        <View className="mx-5 mb-6">
          <Text className="text-sm font-semibold text-gray-900 mb-3">Audio Settings</Text>
          
          {/* Audio Toggle */}
          <View className="bg-gray-50 rounded-xl p-3.5 mb-2.5 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                audioEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
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
        </View>

        {/* Action Buttons */}
        <View className="px-5">
          <TouchableOpacity
            onPress={handleJoin}
            className="bg-red-500 rounded-xl py-3.5 items-center mb-2.5"
            activeOpacity={0.85}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="video-call" size={20} color="#FFFFFF" />
              <Text className="text-white text-sm font-semibold ml-2">Join Now</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClose}
            className="bg-gray-100 rounded-xl py-3.5 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 text-sm font-medium">Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default LiveClassJoinBottomSheet;
