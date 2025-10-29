import React, { useEffect, useRef } from "react";
import { View, Image, Text, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

type SplashScreenProps = {
  onFinish: () => void;
};

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // start slightly smaller
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, [onFinish, opacityAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          alignItems: "center",
        }}
      >
        <Image
          source={require("../../assets/images/noteswift-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* <View style={styles.poweredContainer}>
        <Text style={styles.powered}>Powered by</Text>
        <Image
          source={require("../../assets/images/cls-logo.png")}
          style={styles.poweredLogo}
        />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.6, // increased from 0.5
    height: height * 0.25, // increased from 0.2
  },
  text: {
    marginTop: 12, // slightly more spacing
    fontSize: 16, // increased from 14
    color: "#000",
    textAlign: "center",
  },
  // poweredContainer: {
  //   position: "absolute",
  //   bottom: 60,
  //   alignItems: "center",
  // },
  // powered: {
  //   fontSize: 14, // increased from 12
  //   color: "#333",
  // },
  // poweredLogo: {
  //   marginTop: 4, // slightly more spacing
  //   width: 50, // increased from 40
  //   height: 50, // increased from 40
  //   borderRadius: 25, // updated to maintain circle
  // },
});


export default SplashScreen;
