// app/QuickAccess/index.tsx
import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const QuickAccess: React.FC = () => {
  const router = useRouter();

  const navigateToDownloads = () => {
    console.log('Navigating to Downloads');
    try {
      router.push('/QuickAccess/Downloads' as any);
    } catch (error) {
      console.error('Downloads navigation error:', error);
      Alert.alert('Error', 'Could not navigate to Downloads');
    }
  };

  const navigateToMyBatch = () => {
    console.log('Navigating to MyBatch');
    try {
      router.push('/QuickAccess/MyBatch' as any);
    } catch (error) {
      console.error('MyBatch navigation error:', error);
      Alert.alert('Error', 'Could not navigate to My Batch');
    }
  };

  const navigateToMyHistory = () => {
    console.log('Navigating to MyHistory');
    try {
      router.push('/QuickAccess/MyHistory' as any);
    } catch (error) {
      console.error('MyHistory navigation error:', error);
      Alert.alert('Error', 'Could not navigate to My History');
    }
  };

  const navigateToMyDoubts = () => {
    console.log('Navigating to MyDoubts');
    try {
      router.push('/QuickAccess/MyDoubts' as any);
    } catch (error) {
      console.error('MyDoubts navigation error:', error);
      Alert.alert('Error', 'Could not navigate to My Doubts');
    }
  };

  const navigateToLeaderboard = () => {
    console.log('Navigating to Leaderboard');
    try {
      router.push('/QuickAccess/Leaderboard' as any);
    } catch (error) {
      console.error('Leaderboard navigation error:', error);
      Alert.alert('Error', 'Could not navigate to Leaderboard');
    }
  };

  const navigateToCourses = () => {
    console.log('Navigating to Courses');
    try {
      router.push('/QuickAccess/Courses' as any);
    } catch (error) {
      console.error('Courses navigation error:', error);
      Alert.alert('Error', 'Could not navigate to Courses');
    }
  };

  const navigateToMyRank = () => {
    console.log('Navigating to MyRank');
    try {
      router.push('/QuickAccess/MyRank' as any);
    } catch (error) {
      console.error('MyRank navigation error:', error);
      Alert.alert('Error', 'Could not navigate to My Rank');
    }
  };

  const navigateToBookmarks = () => {
    console.log('Navigating to Bookmarks');
    try {
      router.push('/QuickAccess/Bookmarks' as any);
    } catch (error) {
      console.error('Bookmarks navigation error:', error);
      Alert.alert('Error', 'Could not navigate to Bookmarks');
    }
  };

  return (
    <View className="bg-white p-4 rounded-xl border border-gray-100">
      <View className="flex-row flex-wrap justify-between">
        {/* My Batch */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center bg-blue-50 p-2 rounded-lg"
          activeOpacity={0.7}
          onPress={navigateToMyBatch}
        >
          <MaterialIcons name="group" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">My Batch</Text>
        </TouchableOpacity>

        {/* My History */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center bg-blue-50 p-2 rounded-lg"
          activeOpacity={0.7}
          onPress={navigateToMyHistory}
        >
          <MaterialIcons name="history" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">My History</Text>
        </TouchableOpacity>

        {/* My Doubts */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center bg-blue-50 p-2 rounded-lg"
          activeOpacity={0.7}
          onPress={navigateToMyDoubts}
        >
          <MaterialIcons name="help-outline" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">My Doubts</Text>
        </TouchableOpacity>

        {/* Leaderboard */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center bg-blue-50 p-2 rounded-lg"
          activeOpacity={0.7}
          onPress={navigateToLeaderboard}
        >
          <MaterialIcons name="leaderboard" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">Leaderboard</Text>
        </TouchableOpacity>

        {/* Courses */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center bg-blue-50 p-2 rounded-lg"
          activeOpacity={0.7}
          onPress={navigateToCourses}
        >
          <MaterialIcons name="menu-book" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">Courses</Text>
        </TouchableOpacity>

        {/* My Rank */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center bg-blue-50 p-2 rounded-lg"
          activeOpacity={0.7}
          onPress={navigateToMyRank}
        >
          <MaterialIcons name="emoji-events" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">My Rank</Text>
        </TouchableOpacity>

        {/* Bookmarks */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center bg-blue-50 p-2 rounded-lg"
          activeOpacity={0.7}
          onPress={navigateToBookmarks}
        >
          <MaterialIcons name="bookmark-outline" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">Bookmarks</Text>
        </TouchableOpacity>

        {/* Downloads */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center bg-blue-50 p-2 rounded-lg"
          activeOpacity={0.7}
          onPress={navigateToDownloads}
        >
          <MaterialIcons name="download" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">Downloads</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickAccess;
