// components/Tabs/TabNav.tsx
import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";

export type TabKey = "Dashboard" | "Tests" | "Notes" | "Resources" | "Info";
const TABS: TabKey[] = ["Dashboard", "Tests", "Notes", "Resources", "Info"];

const TabNav: React.FC<{ active: TabKey; onChange: (t: TabKey) => void }> = ({
  active,
  onChange,
}) => {
  return (
    <View className="px-4 py-3 bg-transparent">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <View className="flex-row items-center">
          {TABS.map((t) => {
            const isActive = t === active;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => onChange(t)}
                activeOpacity={0.75}
                className="mr-6 pb-1"
              >
                <Text
                  // bigger tab text
                  className={`text-medium font-semibold ${isActive ? "text-gray-900" : "text-gray-500"}`}
                >
                  {t}
                </Text>

                {isActive && <View className="h-0.5 bg-black mt-1 rounded-full w-8" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default TabNav;
