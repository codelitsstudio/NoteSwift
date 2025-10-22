import React from "react";
import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavStore } from "../../stores/navigationStore";
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
      router.replace(item.route as any);
      // Update tab state immediately after navigation
      setTab(item.key);
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <View
        style={{
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          overflow: "hidden",
          flex: 1,
        }}
      >
    <BlurView
  intensity={Platform.OS === "ios" ? 100 : 0} // blur only on iOS
  tint="light"
  className="flex-row justify-between px-6 pt-4"
  style={{
    paddingBottom: insets.bottom,
    backgroundColor:
      Platform.OS === "android" ? "white" : "rgba(255,255,255,0.3)", // white on Android, translucent for iOS
  }}
>
          {navItems.map((item) => {
            const isActive = current === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => handlePress(item)}
                style={styles.navItem}
              >
                <MaterialIcons
                  name={item.icon}
                  size={26}
                  color={isActive ? "#2563eb" : "#434242"}
                />
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    fontWeight: "500",
                    color: isActive ? "#2563eb" : "#434242",
                  }}
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

const styles = StyleSheet.create({
  blurContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: "rgba(255,255,255,0.4)", // semi-transparent for glass effect
    paddingHorizontal: 24,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10, // for Android shadow
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
});

export default PrimaryNav;
