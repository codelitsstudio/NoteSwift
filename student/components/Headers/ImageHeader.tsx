import React from "react";
import { View, Image, ImageSourcePropType, ImageStyle, StyleSheet } from "react-native";

interface ImageHeaderProps {
  source: ImageSourcePropType;
  style?: ImageStyle;
}

export default function ImageHeader({ source, style }: ImageHeaderProps) {
  return (
    <View className="w-full h-[420px] items-center justify-start pt-6">
      <Image
        source={source}
        resizeMode="contain"
        style={[styles.defaultImage, style]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  defaultImage: {
    width: 400,
    height: 400,
  },
});
