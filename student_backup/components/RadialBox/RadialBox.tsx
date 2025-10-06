import React from "react";
import { View, Pressable, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavStore } from "../../stores/navigationStore";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

interface NavItem {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
}

interface Props {
  current: string;
}

const navItems: NavItem[] = [
  { key: "Home", label: "Home", icon: "home-filled", route: "/Home/HomePage" },
  { key: "Learn", label: "Learn", icon: "menu-book", route: "/Learn/LearnPage" },
  { key: "Test", label: "Test", icon: "quiz", route: "/Test/TestPage" },
  { key: "Ask", label: "Ask", icon: "question-answer", route: "/Ask/AskPage" },
  { key: "More", label: "More", icon: "more-horiz", route: "/More/MorePage" },
];

const PrimaryNav: React.FC<Props> = ({ current }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setTab = useNavStore((state) => state.setTab);

  const handlePress = (item: NavItem) => {
    if (current !== item.key) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTab(item.key);
      router.push(item.route as any);
    }
  };

  return (
    <View className="absolute bottom-0 left-0 right-0">
      <View className="overflow-hidden flex-1 rounded-t-[40px]">
     <BlurView
  intensity={Platform.OS === "ios" ? 100 : 0} // disable blur on Android
  tint="light"
  className={`flex-row justify-between px-6 pt-4`}
  style={{
    paddingBottom: insets.bottom,
    backgroundColor: Platform.OS === "android" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
  }}
>
          {navItems.map((item) => {
            const isActive = current === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => handlePress(item)}
                className="flex-1 items-center"
              >
                <MaterialIcons
                  name={item.icon}
                  size={26}
                  color={isActive ? "#2563eb" : "#434242"}
                />
                <Text
                  className={`mt-1 text-[12px] font-medium ${
                    isActive ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
};

export default PrimaryNav;
