// app/navigation/QuickAccessStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QuickAccess from "../QuickAccess/QuickAccess";
import MyBatchPage from "../QuickAccess/MyBatchPage";
import MyHistoryPage from "../QuickAccess/MyHistoryPage";
import MyDoubtsPage from "../QuickAccess/MyDoubtsPage";
import LeaderboardPage from "../QuickAccess//LeaderboardPage";
import CoursesPage from "../QuickAccess/CoursesPage";
import MyRankPage from "../QuickAccess/MyRankPage";
import BookmarksPage from "../QuickAccess/BookmarksPage";
import DownloadsPage from "../QuickAccess/DownloadsPage";

export type QuickAccessStackParamList = {
  QuickAccessHome: undefined;
  MyBatch: undefined;
  MyHistory: undefined;
  MyDoubts: undefined;
  Leaderboard: undefined;
  Courses: undefined;
  MyRank: undefined;
  Bookmarks: undefined;
  Downloads: undefined;
};

const Stack = createNativeStackNavigator<QuickAccessStackParamList>();

const QuickAccessStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="QuickAccessHome"
      screenOptions={{ headerShown: true }}
    >
      <Stack.Screen
        name="QuickAccessHome"
        component={QuickAccess}
        options={{ title: "Quick Access" }}
      />
      <Stack.Screen name="MyBatch" component={MyBatchPage} options={{ title: "My Batch" }} />
      <Stack.Screen name="MyHistory" component={MyHistoryPage} options={{ title: "My History" }} />
      <Stack.Screen name="MyDoubts" component={MyDoubtsPage} options={{ title: "My Doubts" }} />
      <Stack.Screen name="Leaderboard" component={LeaderboardPage} options={{ title: "Leaderboard" }} />
      <Stack.Screen name="Courses" component={CoursesPage} options={{ title: "Courses" }} />
      <Stack.Screen name="MyRank" component={MyRankPage} options={{ title: "My Rank" }} />
      <Stack.Screen name="Bookmarks" component={BookmarksPage} options={{ title: "Bookmarks" }} />
      <Stack.Screen name="Downloads" component={DownloadsPage} options={{ title: "Downloads" }} />
    </Stack.Navigator>
  );
};

export default QuickAccessStack;
