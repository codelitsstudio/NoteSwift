// components/LessonDetail/FooterNav.tsx
import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

interface Props {
  onPrevious?: () => void;
  onSave?: () => void;
  onNext?: () => void;
}

const FooterNav: React.FC<Props> = ({ onPrevious, onSave, onNext }) => {
  const insets = useSafeAreaInsets();

  const handlePress = (key: "Previous" | "Save" | "Next") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (key === "Previous" && onPrevious) onPrevious();
    if (key === "Save" && onSave) onSave();
    if (key === "Next" && onNext) onNext();
  };

  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
      <View style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: "hidden" }}>
        <BlurView intensity={100} tint="light" style={styles.blurContainer}>
          <View style={styles.navGroup}>
            {/* Previous */}
            <Pressable
              onPress={() => handlePress("Previous")}
              style={[styles.navButton, styles.circularBox, { marginRight: 8 }]}
            >
              <MaterialIcons name="arrow-back-ios" size={18} color="#2563eb" style={{ marginRight: 4 }} />
              <Text style={styles.navText}>Previous</Text>
            </Pressable>

            {/* Save button */}
            <Pressable
              onPress={() => handlePress("Save")}
              style={[styles.navButton, styles.circularBox, { marginHorizontal: 8 }]}
            >
              <MaterialIcons name="save" size={18} color="#2563eb" style={{ marginRight: 4 }} />
              <Text style={styles.navText}>Save</Text>
            </Pressable>

            {/* Next */}
            <Pressable
              onPress={() => handlePress("Next")}
              style={[styles.navButton, styles.circularBox, { marginLeft: 8 }]}
            >
              <Text style={styles.navText}>Notes</Text>
              <MaterialIcons name="arrow-forward-ios" size={18} color="#2563eb" style={{ marginLeft: 4 }} />
            </Pressable>
          </View>
        </BlurView>
      </View>

      {/* Spacer for home bar */}
      <View style={{ height: insets.bottom, backgroundColor: "transparent" }} />
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  navGroup: {
    flexDirection: "row",
    justifyContent: "center", // center buttons
    alignItems: "center",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 20, // dynamic width based on content
  },
  circularBox: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    borderRadius: 10,
  },
  navText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
});

export default FooterNav;
