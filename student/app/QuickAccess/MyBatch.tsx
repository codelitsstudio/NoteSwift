// app/QuickAccess/MyBatch.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MyBatch: React.FC = () => {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-1 bg-slate-50">
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 18, paddingBottom: 18, paddingHorizontal: 18, backgroundColor: '#fff'}}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#222" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, color: '#222', flex: 1, textAlign: 'center', marginRight: 32 }} className="font-bold">My Batch</Text>
        </View>
        {/* Empty State */}
        <View className="absolute inset-0 justify-center items-center">
          <MaterialIcons name="groups" size={48} color="#555" />
          <Text className="text-[#666] mt-3">No batches yet.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MyBatch;