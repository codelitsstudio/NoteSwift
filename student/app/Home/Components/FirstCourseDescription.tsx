import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  GestureResponderEvent,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import PrimaryNav from '../../../components/Navigation/PrimaryNav';
import FloatingEnrollButton from '@/components/Buttons/FloatingEnrollButton';
import { useCourseStore } from '../../../stores/courseStore';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '../../../stores/notificationStore';

const FirstCourseDescription = () => {
  const router = useRouter();
  const { 
    featuredCourse,
    isEnrolled,
    enrollInCourse,
    is_loading,
  } = useCourseStore();
  
  const { addNotification } = useNotificationStore();

  const skills = [
    'Structured Study Habits',
    'Time Management',
    'Knowledge Retention',
    'Focus & Concentration',
    'Goal Setting',
    'Effective Note-Taking',
    'Exam Preparation',
  ];

  const learningPoints = [
    'Form consistent, productive study routines',
    'Apply structured techniques to retain knowledge',
    'Implement strategies for better time management',
    'Learn smart study methods that maximize efficiency',
    'Build sustainable habits for lifelong learning',
  ];

  const syllabus = [
    {
      name: 'Study Fundamentals',
      description: '40-minute module guiding learners to create an optimal study environment and productive routine.',
    },
    {
      name: 'Time Management Mastery',
      description: '35-minute module covering proven techniques for effective scheduling, prioritization, and avoiding procrastination.',
    },
    {
      name: 'Memory & Retention Techniques',
      description: '45-minute module teaching scientific methods for improving memory, note-taking strategies, and knowledge retention.',
    },
    {
      name: 'Exam Preparation & Performance',
      description: '30-minute module focusing on test-taking strategies, stress management, and peak performance techniques.',
    },
  ];

  const faqsData = [
    { question: 'Is this course free?', answer: 'Yes, this course is completely free for all learners.' },
    { question: 'Do I need prior experience?', answer: 'No prior knowledge is required; just a motivation to learn.' },
    { question: 'Is it fully online?', answer: 'Yes, you can access all modules entirely online at your own pace.' },
    { question: 'Will I receive a certificate?', answer: 'The course is free; certificates may be available depending on the platform.' },
  ];

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const toggleFaq = (question: string) => setExpandedFaq(expandedFaq === question ? null : question);

  // Check if user is enrolled in the featured course
  const courseId = featuredCourse?.id || featuredCourse?._id;
  const alreadyEnrolled = courseId ? isEnrolled(courseId) : false;
  
  // Get enrollment date if enrolled (for now using today's date as placeholder)
  const enrollmentDate = alreadyEnrolled ? new Date().toLocaleDateString() : null;

  const handleEnroll = async (e: GestureResponderEvent) => {
    if (!featuredCourse || !courseId || alreadyEnrolled) return;
    
    try {
      const success = await enrollInCourse(courseId);
      
      if (success) {
        // Add notification for successful enrollment
        addNotification({
          title: 'Course Enrollment Successful!',
          message: `You've successfully enrolled in "${featuredCourse.title}". Start learning now!`,
          type: 'enrollment',
          courseId: courseId,
          courseName: featuredCourse.title,
        });

        Toast.show({
          type: 'success',
          position: 'top',
          text1: `Enrolled in ${featuredCourse.title}`,
          text2: 'You can now access the course content.',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 50,
        });
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Enrollment failed',
          text2: 'Please try again later.',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 50,
        });
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Something went wrong',
        text2: 'Please try again later.',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 5 }}
      >
        <View className="px-4 py-4">

          {/* Title & Summary */}
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Learn How To Actually Study Before It’s Too Late
          </Text>
          <Text className="text-base text-gray-600 mb-4">
            Free, professional learning program for building effective study habits, improving knowledge retention, and mastering time management.
          </Text>

          {/* Offered By */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-1">Offered by</Text>
            <Text className="text-lg font-semibold text-customBlue">
              ThatGuy (US) & NoteSwift Research Team
            </Text>
          </View>

          {/* About */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Course Overview</Text>
            <Text className="text-base text-gray-700 leading-6">
              This course focuses on beginner learners, teaching actionable techniques to study smartly and efficiently. Participants will form sustainable study habits, manage time effectively, and retain knowledge with proven strategies.
            </Text>
          </View>

          {/* Key Features */}
          <View className="mb-8">
            <FeatureItem icon="phone-iphone" title="Mobile Friendly" subtitle="Complete the course entirely on mobile." textSize="base" />
            <FeatureItem icon="all-inclusive" title="100% Online" subtitle="Learn at your own pace with flexible access." textSize="base" />
            <FeatureItem icon="update" title="Flexible Schedule" subtitle="Adapt study sessions to your routine." textSize="base" />
            <FeatureItem icon="hourglass-empty" title="Duration: 40 mins+" subtitle="Start with Study Fundamentals and progress." textSize="base" />
            <FeatureItem icon="bar-chart" title="Beginner-Friendly" subtitle="No prior experience required." textSize="base" />
          </View>

          {/* Skills */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-3">Skills You Will Master</Text>
            <View className="flex-row flex-wrap">
              {skills.map(skill => (
                <View key={skill} className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2">
                  <Text className="text-gray-800 text-sm">{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Learning Experience */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-3">What You Will Learn</Text>
            {learningPoints.map(point => (
              <View key={point} className="flex-row items-center mb-3">
                <MaterialIcons name="check-circle" size={18} color="#3B82F6" />
                <Text className="text-gray-700 ml-3 flex-1 text-sm">{point}</Text>
              </View>
            ))}
          </View>

          {/* Syllabus */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-3">Syllabus</Text>
            {syllabus.map((module, index) => (
              <View key={module.name} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Text className="text-sm text-gray-500 font-semibold mb-1">Module {index + 1}</Text>
                <Text className="text-base text-gray-800 font-semibold">{module.name}</Text>
                <Text className="text-sm text-gray-600 mt-1">{module.description}</Text>
              </View>
            ))}
          </View>

          {/* FAQ */}
          <View className="mb-1">
            <Text className="text-lg font-bold text-gray-900 mb-3">Frequently Asked Questions</Text>
            {faqsData.map(faq => (
              <TouchableOpacity
                key={faq.question}
                onPress={() => toggleFaq(faq.question)}
                className="mb-2 border-b border-gray-200 py-3"
                activeOpacity={0.8}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-800 text-base flex-1">{faq.question}</Text>
                  <MaterialIcons
                    name={expandedFaq === faq.question ? "remove" : "add"}
                    size={20}
                    color="gray"
                  />
                </View>
                {expandedFaq === faq.question && (
                  <Text className="text-sm text-gray-600 mt-2">{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </ScrollView>
{/* Enroll / Checkout Button */}
<View style={{ width: '100%' }}>
  <FloatingEnrollButton
    title={alreadyEnrolled ? "Go to Learn" : "Enroll to Unlock Full Access"}
    subtitle={alreadyEnrolled ? `Enrolled: ${enrollmentDate || 'Today'}` : "Start Learning Today"}
    onPress={alreadyEnrolled ? () => router.push('/Learn/LearnPage') : handleEnroll}
  />
</View>

      
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, title, subtitle, className, textSize }:
  { icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle: string; className?: string; textSize?: string }) => (
  <View className={`flex-row items-start mb-6 ${className || ''}`}>
    <MaterialIcons name={icon} size={24} className="text-gray-700 mr-4 mt-1" />
    <View>
      <Text className={`font-semibold text-gray-800 ${textSize === 'base' ? 'text-base' : ''}`}>{title}</Text>
      <Text className={`text-gray-600 mt-1 ${textSize === 'base' ? 'text-sm' : ''}`}>{subtitle}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 72,
    zIndex: 50,
    elevation: 50,
  },
});

export default FirstCourseDescription;
