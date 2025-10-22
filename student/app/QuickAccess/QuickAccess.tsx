// app/QuickAccess/QuickAccess.tsx
import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const QuickAccess: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (route: string, label: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.error(`Navigation error to ${label}:`, error);
      Alert.alert('Error', `Could not navigate to ${label}`);
    }
  };

  return (
    <View className="bg-white p-4 rounded-xl border border-gray-100">
      <View className="flex-row flex-wrap justify-between">
        {/* My Batch */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            console.log('My Batch icon clicked');
            handleNavigation('/QuickAccess/MyBatch', 'My Batch');
          }}
        >
          <MaterialIcons name="group" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">My Batch</Text>
        </TouchableOpacity>

        {/* My History */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            console.log('My History icon clicked');
            handleNavigation('/QuickAccess/MyHistory', 'My History');
          }}
        >
          <MaterialIcons name="history" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">My History</Text>
        </TouchableOpacity>

        {/* My Doubts */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            console.log('My Doubts icon clicked');
            handleNavigation('/QuickAccess/MyDoubts', 'My Doubts');
          }}
        >
          <MaterialIcons name="help-outline" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">My Doubts</Text>
        </TouchableOpacity>

        {/* Leaderboard */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            console.log('Leaderboard icon clicked');
            handleNavigation('/QuickAccess/Leaderboard', 'Leaderboard');
          }}
        >
          <MaterialIcons name="leaderboard" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">Leaderboard</Text>
        </TouchableOpacity>

        {/* Courses */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            console.log('Courses icon clicked');
            handleNavigation('/AllCourses/AllCoursesPage', 'Courses');
          }}
        >
          <MaterialIcons name="menu-book" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">Courses</Text>
        </TouchableOpacity>

        {/* My Rank */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            console.log('My Rank icon clicked');
            handleNavigation('/QuickAccess/MyRank', 'My Rank');
          }}
        >
          <MaterialIcons name="emoji-events" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">My Rank</Text>
        </TouchableOpacity>

        {/* Bookmarks */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            console.log('Bookmarks icon clicked');
            handleNavigation('/QuickAccess/Bookmarks', 'Bookmarks');
          }}
        >
          <MaterialIcons name="bookmark-outline" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">Bookmarks</Text>
        </TouchableOpacity>

        {/* Downloads */}
        <TouchableOpacity
          className="w-[22%] mb-4 items-center"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            console.log('Downloads icon clicked');
            handleNavigation('/QuickAccess/Downloads', 'Downloads');
          }}
        >
          <MaterialIcons name="download" size={28} color="#374151" />
          <Text className="text-[12px] text-center mt-1 text-gray-700">Downloads</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickAccess;
