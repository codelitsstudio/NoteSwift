import React from "react";
import {
  View,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";

interface ImageHeaderProps {
  source: ImageSourcePropType;
  style?: any;
}

const { height } = Dimensions.get("window");

// Dynamically calculate height and top margin
const getHeaderHeight = () => {
  if (height < 640) return height * 0.24;
  if (height < 740) return height * 0.28;
  if (height < 840) return height * 0.32;
  return height * 0.36;
};

const getTopMargin = () => {
  if (height < 640) return 8;
  if (height < 740) return 12;
  if (height < 840) return 16;
  return 20;
};

export default function ImageHeader({ source, style }: ImageHeaderProps) {
  return (
    <View
      style={[
        styles.container,
        {
          height: getHeaderHeight(),
          marginTop: getTopMargin(),
        },
      ]}
    >
      <Image source={source} resizeMode="cover" style={[styles.image, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
