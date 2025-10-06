import React, { useEffect } from 'react';
import { View, Modal } from 'react-native';
// import LottieView from 'lottie-react-native';
// import ConfettiCannon from 'react-native-confetti-cannon';
// import * as Haptics from 'expo-haptics';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSequence,
//   withDelay,
//   withSpring,
//   Easing,
// } from 'react-native-reanimated';

// // Get the appropriate Lottie animation based on streak days
// const getStreakLottie = (streakDays: number) => {
//   if (streakDays >= 300) {
//     return require('../../../assets/animations/streak_300_black.json'); // Black flame
//   } else if (streakDays >= 200) {
//     return require('../../../assets/animations/streak_200_blackish.json'); // Blackish flame
//   } else if (streakDays >= 100) {
//     return require('../../../assets/animations/streak_100_blue.json'); // Blue flame
//   } else if (streakDays >= 50) {
//     return require('../../../assets/animations/streak_50_purple.json'); // Purple flame
//   } else if (streakDays >= 10) {
//     return require('../../../assets/animations/streak_10_pink.json'); // Pink flame
//   } else if (streakDays >= 3) {
//     return require('../../../assets/animations/streak_3_darkred.json'); // Dark red flame
//   } else {
//     return require('../../../assets/animations/streak_1_red.json'); // Red flame
//   }
// };

// // Get confetti colors based on streak level
// const getConfettiColors = (streakDays: number) => {
//   const baseColors = ['#FF6B6B', '#FFFFFF']; // Red + White base
//   
//   if (streakDays >= 300) {
//     return ['#000000', '#1a1a1a', '#FFFFFF']; // Black theme
//   } else if (streakDays >= 200) {
//     return ['#1a1a1a', '#4a4a4a', '#FFFFFF']; // Blackish theme
//   } else if (streakDays >= 100) {
//     return ['#1565c0', '#42A5F5', '#FFFFFF']; // Blue theme
//   } else if (streakDays >= 50) {
//     return ['#4a148c', '#7b1fa2', '#FFFFFF']; // Purple theme
//   } else if (streakDays >= 10) {
//     return ['#7b1fa2', '#e91e63', '#FFFFFF']; // Pink-purple theme
//   } else if (streakDays >= 3) {
//     return ['#b71c1c', '#d32f2f', '#FFFFFF']; // Dark red theme
//   } else {
//     return ['#ff5722', '#ff8a65', '#FFFFFF']; // Red theme
//   }
// };

interface StreakCelebrationProps {
  visible: boolean;
  streakDays: number;
  onComplete: () => void;
}

const StreakCelebration: React.FC<StreakCelebrationProps> = ({
  visible,
  streakDays,
  onComplete,
}) => {
  // const lottieRef = useRef<LottieView>(null);
  // const confettiRef = useRef<ConfettiCannon>(null);
  
  // // Animation values
  // const backdropOpacity = useSharedValue(0);
  // const flameScale = useSharedValue(0);
  // const textScale = useSharedValue(0);
  // const textOpacity = useSharedValue(0);

  // const streakLottie = getStreakLottie(streakDays);
  // const confettiColors = getConfettiColors(streakDays);

  useEffect(() => {
    if (visible) {
      console.log(`🔥 Playing Lottie celebration for ${streakDays} day streak! 🔥`);
      
      // // Haptic feedback for better feel
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // // Start animations sequence
      // backdropOpacity.value = withTiming(0.9, { duration: 300 });
      
      // // Flame pops in with bounce
      // flameScale.value = withSequence(
      //   withTiming(0, { duration: 0 }),
      //   withDelay(200, withSpring(1.2, { damping: 8, stiffness: 100 })),
      //   withTiming(1, { duration: 200 })
      // );
      
      // // Day text appears with punch
      // setTimeout(() => {
      //   textOpacity.value = withTiming(1, { duration: 300 });
      //   textScale.value = withSequence(
      //     withSpring(1.3, { damping: 6, stiffness: 120 }),
      //     withTiming(1, { duration: 200 })
      //   );
      // }, 800);
      
      // // Trigger confetti burst
      // setTimeout(() => {
      //   confettiRef.current?.start();
      // }, 600);
      
      // // Start Lottie animation
      // setTimeout(() => {
      //   lottieRef.current?.play();
      // }, 400);
      
      // Auto-close after celebration
      setTimeout(() => {
        onComplete();
      }, 4000);
    }
    // else {
    //   // Reset animation values
    //   backdropOpacity.value = 0;
    //   flameScale.value = 0;
    //   textScale.value = 0;
    //   textOpacity.value = 0;
    // }
  }, [visible, streakDays, onComplete]);

  // const backdropStyle = useAnimatedStyle(() => ({
  //   opacity: backdropOpacity.value,
  // }));

  // const flameStyle = useAnimatedStyle(() => ({
  //   transform: [{ scale: flameScale.value }],
  // }));

  // const textStyle = useAnimatedStyle(() => ({
  //   opacity: textOpacity.value,
  //   transform: [{ scale: textScale.value }],
  // }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {/* Backdrop */}
      {/* <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000000',
          },
          backdropStyle,
        ]}
      /> */}

      {/* Main celebration container */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
      }}>
        {/* Confetti Cannon */}
        {/* <ConfettiCannon
          ref={confettiRef}
          count={40}
          origin={{ x: screenWidth / 2, y: screenHeight / 2 - 100 }}
          autoStart={false}
          fadeOut={true}
          colors={confettiColors}
          explosionSpeed={350}
          fallSpeed={2500}
        /> */}

        {/* Lottie Flame Animation */}
        {/* <Animated.View
          style={[
            {
              width: 200,
              height: 200,
              justifyContent: 'center',
              alignItems: 'center',
            },
            flameStyle,
          ]}
        >
          <LottieView
            ref={lottieRef}
            source={streakLottie}
            autoPlay={false}
            loop={true}
            style={{
              width: 180,
              height: 180,
            }}
            speed={1.2}
          />
        </Animated.View> */}

        {/* Day Text with Animation */}
        {/* <Animated.View
          style={[
            {
              marginTop: 30,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 25,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            },
            textStyle,
          ]}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'center',
            }}
          >
            Day {streakDays}
          </Text>
        </Animated.View> */}

        {/* Celebration Message */}
        {/* <Animated.View
          style={[
            {
              marginTop: 40,
              alignItems: 'center',
            },
            textStyle,
          ]}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              textShadowColor: '#000000',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            🔥 Streak Power! 🔥
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#ffffff',
              textAlign: 'center',
              marginTop: 8,
              opacity: 0.9,
            }}
          >
            You're on fire! Keep it up! 🚀
          </Text>
        </Animated.View> */}

        {/* Nothing to show until Lottie is implemented */}
      </View>
    </Modal>
  );
};

export default StreakCelebration;