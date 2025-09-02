import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, SafeAreaView, ScrollView, Linking, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import ButtonOnboard from '../../../components/Buttons/ButtonOnboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const OnboardingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const isSmallDevice = height < 700;

  const slides = [
    {
      id: 0,
      title: "Your Education, Right at",
      titleHighlight: "Your Fingertips",
      description: "Manage your classes and lectures easily from your mobile.",
      image: require('../../../assets/images/onb-1.png'),
      bgColor: '#FFF7ED'
    },
    {
      id: 1,
      title: "Interactive",
      titleHighlight: "Learning Environment",
      description: "Learn with live classes, quizzes, and real-time feedback.",
      image: require('../../../assets/images/onb-2.png'),
      bgColor: '#EFF6FF'
    },
    {
      id: 2,
      title: "Progress Tracking &",
      titleHighlight: "Analytics",
      description: "Track your growth with smart insights and performance stats.",
      image: require('../../../assets/images/onb-3.png'),
      bgColor: '#F0FDF4'
    },
    {
      id: 3,
      title: "Available both Offline &",
      titleHighlight: "Online",
      description: "Run your classes at any time seamlessly, even without an internet connection.",
      image: require('../../../assets/images/onb-4.png'),
      bgColor: '#FAF5FF'
    },
    {
      id: 4,
      title: "Begin Your Learning Journey with",
      titleHighlight: "Purpose",
      description: "One account. Endless possibilities. Zero pressure.",
      image: require('../../../assets/images/onb-5.png'),
      bgColor: '#EEF2FF'
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index: number) => setCurrentSlide(index);

const handleGetStarted = async () => {
  await AsyncStorage.setItem('onboarding_completed', 'true'); // mark onboarding done
  router.replace('/Home/HomePage'); // replace route so user cannot back
};
const handleSkip = () => {
  router.replace('/Home/HomePage');
};


  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Skip Button */}
      <View className="flex-row justify-end pt-4 pr-6 pb-2">
        <TouchableOpacity onPress={handleSkip} className="py-1 px-2">
          <Text className="text-blue-500 text-lg font-medium">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slides */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: currentSlide * width, y: 0 }}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlide(slideIndex);
        }}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={{ width }} className="flex-1 px-6">
           <ScrollView
        contentContainerStyle={{
          flexGrow: 1,                 // allows the content to expand
          justifyContent: 'center',    // centers content vertically on tall screens
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
              {/* Image */}
              <View
                className="items-center"
                style={{
                  justifyContent: 'flex-start', // Move image to top
                  height: isSmallDevice ? height * 0.33 : height * 0.42, // Slightly smaller height
                  marginBottom: height * 0.005, // Reduce bottom spacing
                }}
              >
                <Image
                  source={slide.image}
                  style={{
                    width: isSmallDevice ? width * 0.8 : width * 0.9,
                    height: isSmallDevice ? height * 0.35 : height * 0.42, // Reduce height a bit
                  }}
                  resizeMode="contain"
                />
              </View>

              {/* Dots */}
              <View className="flex-row justify-center items-center mb-2" style={{ gap: width * 0.02 }}>
                {slides.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => goToSlide(index)}
                    className={`${index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'} rounded-full`}
                    style={{
                      width: index === currentSlide ? width * 0.08 : 8,
                      height: 8,
                    }}
                  />
                ))}
              </View>

              {/* Text */}
              <View className="items-center px-4" style={{ marginTop: isSmallDevice ? height * 0.01 : height * 0.02, marginBottom: height * 0.03 }}>
                <Text className="text-center text-gray-900 font-bold" style={{ fontSize: width * 0.065, lineHeight: width * 0.08, marginBottom: height * 0.015 }}>
                  {slide.title} <Text className="text-blue-500">{slide.titleHighlight}</Text>
                </Text>
                <Text className="text-center text-gray-500" style={{ fontSize: width * 0.04, lineHeight: width * 0.055 }}>
                  {slide.description}
                </Text>
              </View>

              {/* Navigation Buttons */}
              <ButtonOnboard
                onNext={nextSlide}
                onBack={prevSlide}
                onGetStarted={handleGetStarted}
                currentSlide={currentSlide}
                totalSlides={slides.length}
                isLastSlide={isLastSlide}
                isFirstSlide={isFirstSlide}
              />

              {/* Help */}
              <View className="flex-row items-center justify-center mt-14" style={{ gap: width * 0.02 }}>
                <Text className="text-gray-500 font-semibold text-base">Any Troubles?</Text>
              <TouchableOpacity
  onPress={() => Linking.openURL('https://noteswift.in/')}
>
  <Text className="text-blue-500 font-semibold text-base">Help</Text>
</TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingPage;
