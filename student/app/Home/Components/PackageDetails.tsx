import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  GestureResponderEvent,
  Platform,
  StatusBar,
  TextInput,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import FloatingEnrollButton from '@/components/Buttons/FloatingEnrollButton';
import { useCourseStore } from '../../../stores/courseStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotificationStore } from '../../../stores/notificationStore';
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { redeemUnlockCode } from '../../../api/student/learn';

interface Module {
  name: string;
  description: string;
  duration: string;
}

interface Subject {
  subject: string;
  description: string;
  modules: Module[];
}

interface Package {
  id: string;
  title?: string;
  name?: string;
  description: string;
  type: 'free' | 'pro';
  isFeatured?: boolean;
  price?: number;
  skills: string[];
  learningPoints: string[];
  subjects?: Subject[];
  features: string[];
  teacherName?: string;
  keyFeatures?: string[];
  faq?: {
    question: string;
    answer: string;
  }[];
}

interface PackageDetailsProps {
  package: Package;
}

const PackageDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const pkg = params.packageData ? JSON.parse(params.packageData as string) : null;

  // Predefined key features options (matching admin interface)
  const availableKeyFeatures = [
    { id: 'mobile-friendly', icon: 'phone-iphone', title: 'Mobile Friendly', subtitle: 'Complete the course entirely on mobile.' },
    { id: 'online', icon: 'all-inclusive', title: '100% Online', subtitle: 'Learn at your own pace with flexible access.' },
    { id: 'flexible-schedule', icon: 'update', title: 'Flexible Schedule', subtitle: 'Adapt study sessions to your routine.' },
    { id: 'time-saving', icon: 'hourglass-empty', title: 'Time Saving', subtitle: 'Time efficient learning modules.' },
    { id: 'beginner-friendly', icon: 'bar-chart', title: 'Beginner-Friendly', subtitle: 'No prior experience required.' },
    { id: 'certified', icon: 'verified', title: 'Certified', subtitle: 'Receive a certificate upon completion.' },
    { id: 'lifetime-access', icon: 'all-inclusive', title: 'Lifetime Access', subtitle: 'Access content anytime, anywhere.' },
    { id: 'expert-instructors', icon: 'school', title: 'Expert Instructors', subtitle: 'Learn from industry professionals.' },
  ];

  // Safety check - if no package data, show error state
  if (!pkg) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Package Not Found</Text>
          <Text className="text-gray-600 text-center mb-4">The package details could not be loaded.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const packageTitle = pkg.title || pkg.name || 'Package';

  // Additional safety check for required fields
  if (!packageTitle || !pkg.description) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Invalid Package Data</Text>
          <Text className="text-gray-600 text-center mb-4">The package data is incomplete.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const { isEnrolled, enrollInCourse } = useCourseStore();
  const { addNotification } = useNotificationStore();
  
  // Bottom sheet states and refs
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedTrialType, setSelectedTrialType] = useState<'free' | 'paid'>('free');
  const [paymentMethod, setPaymentMethod] = useState<string>('khalti');
  const [unlockCode, setUnlockCode] = useState<string>('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => keyboardVisible ? ['95%'] : ['55%'], [keyboardVisible]);

  const [expandedSubject, setExpandedSubject] = useState<number>(0);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Keyboard handling for bottom sheet
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // FAQ Data
  const faqsData = [
    { 
      question: 'Is this package free?', 
      answer: pkg.type === 'free' 
        ? 'Yes, this package is completely free for all learners.' 
        : 'This is a premium package with a free trial option.' 
    },
    { 
      question: 'Do I need prior experience?', 
      answer: 'No prior knowledge is required; just a motivation to learn.' 
    },
    { 
      question: 'Is it fully online?', 
      answer: 'Yes, you can access all modules entirely online at your own pace.' 
    },
    { 
      question: 'Will I receive a certificate?', 
      answer: pkg.type === 'free' 
        ? 'Certificates may be available depending on the platform.' 
        : 'Yes, you will receive a verified certificate upon completion.' 
    },
  ];

  const toggleFaq = (question: string) => setExpandedFaq(expandedFaq === question ? null : question);

  const handleRedeemCode = async () => {
    if (!unlockCode.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter an unlock code',
      });
      return;
    }

    setIsRedeeming(true);
    try {
      // Generate device hash (simple for now)
      const deviceHash = 'device-' + Date.now(); // TODO: proper device fingerprint

      const result = await redeemUnlockCode(unlockCode, pkg._id, deviceHash);
      
      Toast.show({
        type: 'success',
        text1: 'Code redeemed successfully!',
        text2: 'You are now enrolled in this course.',
      });

      // Refresh enrollment status
      await enrollInCourse(pkg._id);
      
      bottomSheetRef.current?.dismiss();
      setUnlockCode('');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to redeem code',
        text2: error.response?.data?.message || 'Please check your code and try again.',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  // Check enrollment status
  const alreadyEnrolled = pkg.id ? isEnrolled(pkg.id) : false;
  const enrollmentDate = alreadyEnrolled ? new Date().toLocaleDateString() : null;

  const handleEnroll = async (e: GestureResponderEvent) => {
    if (!pkg.id || alreadyEnrolled) return;
    
    try {
      const success = await enrollInCourse(pkg.id);
      
      if (success) {
        addNotification({
          title: 'Package Enrollment Successful!',
          message: `You've successfully enrolled in "${packageTitle}". Start learning now!`,
          type: 'enrollment',
          courseId: pkg.id,
          courseName: packageTitle,
        });

        Toast.show({
          type: 'success',
          position: 'top',
          text1: `Enrolled in ${packageTitle}`,
          text2: 'You can now access the package content.',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 50,
        });

        // Navigate to learn page for free packages
        if (pkg.type === 'free') {
          router.push('/Learn/LearnPage');
        }
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
  <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
  <View className="px-4 py-4">
          {/* Package Type Badge */}
          <View className="mb-3 flex-row items-center">
            <View className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 flex-row items-center">
              <MaterialIcons 
                name={pkg.isFeatured ? "star" : (pkg.price && pkg.price > 0) ? "workspace-premium" : "school"}  
                size={16} 
                color="#3B82F6" 
              />
              <Text className="text-blue-700 font-medium text-sm ml-1">
                {pkg.isFeatured ? (pkg.price && pkg.price > 0 ? "Featured Pro" : "Featured") : (pkg.price && pkg.price > 0 ? "Pro" : "Free")} Package
              </Text>
            </View>
          </View>

          {/* Title & Summary */}
          <Text className="text-xl font-bold text-gray-900 mb-2">{packageTitle}</Text>

          {/* Price Badge */}
          <View className="mb-4 flex-row items-center">
            <View className="flex-row items-center">
              <View className="px-3 py-1.5 rounded-lg bg-blue-100 flex-row items-center">
                {(pkg.price && pkg.price > 0) ? (
                  <Text className="font-semibold text-sm text-blue-700">
                    Rs. {pkg.price}
                  </Text>
                ) : (
                  <Text className="font-semibold text-sm text-blue-700">
                    Free
                  </Text>
                )}
              </View>
              <Text className="ml-2 text-sm text-gray-600">
                {(pkg.price && pkg.price > 0) ? '• 1 year Premium Access' : '• Lifetime Access'}
              </Text>
            </View>
          </View>

          {/* Offered By */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-1">Offered by</Text>
            <Text className="text-lg font-semibold text-customBlue">
              {pkg.teacherName || 'NoteSwift Team'}
            </Text>
          </View>

         

          {/* Course Overview */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Package Overview</Text>
            <Text className="text-base text-gray-700 leading-6">{pkg.description}</Text>
          </View>

          {/* Key Features */}
          {pkg.keyFeatures && pkg.keyFeatures.length > 0 && (
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-4">Key Features</Text>
              {pkg.keyFeatures.map((featureId: string) => {
                const feature = availableKeyFeatures.find(f => f.id === featureId);
                return feature ? (
                  <FeatureItem
                    key={feature.id}
                    icon={feature.icon as keyof typeof MaterialIcons.glyphMap}
                    title={feature.title}
                    subtitle={feature.subtitle}
                    textSize="base"
                  />
                ) : null;
              })}
            </View>
          )}

          {/* What's Included */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-4">What&apos;s Included</Text>
            {(pkg.learningPoints || []).map((point: string) => (
              <View key={point} className="flex-row items-start mb-3">
                <MaterialIcons name="verified" size={20} color="#10B981" />
                <Text className="flex-1 ml-2 text-gray-700 text-base leading-6">{point}</Text>
              </View>
            ))}
          </View>

        {/* Skills */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-3">Skills You Will Master</Text>
            <View className="flex-row flex-wrap">
              {(pkg.skills || []).map((skill: string) => (
                <View key={skill} className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2">
                  <Text className="text-gray-800 text-sm">{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* All Package Features */}
          <View className="py-6 bg-gray-50 -mx-4 px-4 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">All Package Features</Text>
            <View className="flex-row flex-wrap">
              {(pkg.features || []).map((feature: string, index: number) => (
                <View key={index} className="flex-row items-center mb-3 w-full">
                  <MaterialIcons name="verified" size={20} color="#10B981" />
                  <Text className="ml-2 text-gray-700 text-base flex-1">{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Syllabus with Subject and Module Details */}
          {pkg.subjects && (
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-3">Course Content</Text>
              {pkg.subjects.map((subject: Subject, subjectIndex: number) => (
                <View key={`subject-${subjectIndex}`} className="mb-3">
                  <TouchableOpacity
                    onPress={() => setExpandedSubject(expandedSubject === subjectIndex ? -1 : subjectIndex)}
                    className="flex-row items-center justify-between p-4 bg-gray-50 rounded-t-lg border border-gray-200"
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-sm text-blue-600 font-medium">Subject {subjectIndex + 1}</Text>
                        <Text className="text-sm text-gray-500 ml-2">• {subject.modules.length} modules</Text>
                      </View>
                      <Text className="text-base text-gray-900 font-semibold">{subject.subject}</Text>
                      <Text className="text-sm text-gray-600 mt-1">{subject.description}</Text>
                    </View>
                    <MaterialIcons
                      name={expandedSubject === subjectIndex ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                      size={24}
                      color="#4B5563"
                    />
                  </TouchableOpacity>
                  
                  {expandedSubject === subjectIndex && (
                    <View className="border-x border-b border-gray-200 rounded-b-lg">
                      {subject.modules.map((module: Module, moduleIndex: number) => (
                        <View 
                          key={`module-${subjectIndex}-${moduleIndex}`}
                          className={`p-4 bg-white ${
                            moduleIndex !== subject.modules.length - 1 ? 'border-b border-gray-100' : ''
                          }`}
                        >
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-sm font-medium text-gray-700">
                              Module {moduleIndex + 1}
                            </Text>
                            <Text className="text-sm text-gray-500">{module.duration}</Text>
                          </View>
                          <Text className="text-base text-gray-800 mb-1">{module.name}</Text>
                          <Text className="text-sm text-gray-600">{module.description}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* FAQ */}
          <View className="mb-1">
            <Text className="text-lg font-bold text-gray-900 mb-3">Frequently Asked Questions</Text>
            {(pkg.faq && pkg.faq.length > 0 ? pkg.faq : faqsData).map((faq: { question: string; answer: string }) => (
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

      {/* Bottom Button Section */}
      {pkg.type === 'free' ? (
        // Free Package - Single Enroll Button
        <View style={{ width: '100%' }}>
          <FloatingEnrollButton
            title={alreadyEnrolled ? "Go to Learn" : "Enroll to Unlock Full Access"}
            subtitle={alreadyEnrolled ? `Enrolled: ${enrollmentDate || 'Today'}` : "Start Learning Today"}
            onPress={alreadyEnrolled ? () => router.push('/Learn/LearnPage') : handleEnroll}
          />
        </View>
      ) : (
        // Pro Package - Trial and Enroll Buttons
        <View className="absolute bottom-6 left-0 right-0 bg-white border-t border-gray-200 py-4">
          <View className="px-5">
            <View className="flex-row justify-center">
              <TouchableOpacity
                onPress={() => {
                  setSelectedTrialType('free');
                  setShowCheckout(true);
                  bottomSheetRef.current?.present();
                }}
                className="w-40 py-4 rounded-3xl border border-blue-500 bg-white mr-4"
              >
                <Text className="text-center text-lg font-semibold text-blue-500">
                  Free Trial
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTrialType('paid');
                  setShowCheckout(true);
                  bottomSheetRef.current?.present();
                }}
                className="w-40 py-4 rounded-3xl bg-blue-500"
              >
                <Text className="text-center text-lg font-bold text-white">
                  Enroll Now
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-gray-400 text-center mt-2 mb-3 text-sm">
              One-time payment – no recurring charges.
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Sheet for Pro Packages */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={() => {
          setShowCheckout(false);
          Keyboard.dismiss();
        }}
        backgroundStyle={{ backgroundColor: '#fff' }}
        handleIndicatorStyle={{ backgroundColor: '#E5E7EB' }}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView className="flex-1 px-6 pb-6">
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">Checkout</Text>
            <TouchableOpacity onPress={() => {
              setShowCheckout(false);
              bottomSheetRef.current?.dismiss();
            }}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Package Summary */}
          <View className={`rounded-xl p-4 mb-6 ${
            selectedTrialType === 'free' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
          }`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{packageTitle}</Text>
                <Text className="text-sm text-gray-600">
                  {selectedTrialType === 'free'
                    ? `Try ${packageTitle.toLowerCase()} free for 7 days`
                    : pkg.description
                  }
                </Text>
                <Text className="mt-2">
                  <Text className={`text-lg font-bold ${
                    selectedTrialType === 'free' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    Rs. {selectedTrialType === 'free' ? '0' : pkg.price?.toLocaleString()}
                  </Text>
                  {selectedTrialType === 'free' ? (
                    <Text className="text-sm text-blue-600"> (Free for 7 days)</Text>
                  ) : (
                    <Text className="text-sm text-gray-500"> (One-time payment)</Text>
                  )}
                </Text>
              </View>
              {selectedTrialType === 'free' && (
                <View className="bg-blue-500 px-3 py-1 rounded-full">
                  <Text className="text-xs text-white font-bold">TRIAL</Text>
                </View>
              )}
            </View>
          </View>

          {/* Conditional Content Based on Trial Type */}
          {selectedTrialType === 'free' ? (
            <>
              {/* Free Trial Information */}
              <Text className="text-lg font-semibold text-gray-800 mb-4">Start Your Free Trial</Text>
              <View className="mb-6">
                <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <View className="flex-row items-center mb-3">
                    <MaterialIcons name="info" size={20} color="#6B7280" />
                    <Text className="ml-2 text-sm font-semibold text-gray-900">Trial Terms</Text>
                  </View>
                  <Text className="text-sm text-gray-700 leading-5 mb-3">
                    • Your free trial lasts 7 days from activation{'\n'}
                    • Full access to all premium features{'\n'}
                    • Cancel anytime during the trial period{'\n'}
                    • No payment required to start
                  </Text>
                  <Text className="text-xs text-gray-600">
                    If you don&apos;t cancel before the trial ends, you&apos;ll be charged the full price automatically.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Payment Method Selection */}
              <Text className="text-lg font-semibold text-gray-800 mb-4">Payment Method</Text>
              <View className="mb-6">


                <TouchableOpacity 
                  className={`flex-row items-center p-4 rounded-xl border-2 ${
                    paymentMethod === 'code' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setPaymentMethod('code')}
                >
                  <MaterialIcons 
                    name="lock-open" 
                    size={24} 
                    color={paymentMethod === 'code' ? '#3B82F6' : '#6B7280'} 
                  />
                  <Text className={`ml-3 font-medium ${
                    paymentMethod === 'code' ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    Enter Unlock Code
                  </Text>
                  {paymentMethod === 'code' && (
                    <View className="ml-2">
                      <MaterialIcons name="check-circle" size={20} color="#3B82F6" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Checkout/Redeem Section */}
          {paymentMethod === 'code' ? (
            <>
              <View className="mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-2">Enter Unlock Code</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
                  placeholder="e.g. IEA-21JA-WA"
                  value={unlockCode}
                  onChangeText={setUnlockCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus={paymentMethod === 'code'}
                  keyboardType="default"
                  returnKeyType="done"
                  onSubmitEditing={handleRedeemCode}
                />
              </View>
              <TouchableOpacity
                className={`py-4 rounded-3xl mb-4 ${isRedeeming ? 'bg-gray-400' : 'bg-blue-500'}`}
                onPress={handleRedeemCode}
                disabled={isRedeeming}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {isRedeeming ? 'Redeeming...' : 'Verify & Enroll'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View
              className="bg-gray-300 py-4 rounded-3xl mb-4 opacity-70"
              style={{ pointerEvents: 'none' }}
            >
              <Text className="text-gray-500 text-center font-semibold text-lg">
                Available Soon
              </Text>
            </View>
          )}

          <Text className="text-xs text-gray-500 text-center">
            {selectedTrialType === 'free' 
              ? 'Your trial data is secured with 256-bit SSL encryption'
              : 'Your payment is secured with 256-bit SSL encryption'
            }
          </Text>
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const FeatureItem = ({ 
  icon, 
  title, 
  subtitle, 
  className, 
  textSize 
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  className?: string;
  textSize?: string;
}) => (
  <View className={`flex-row items-start mb-6 ${className || ''}`}>
    <MaterialIcons name={icon} size={24} className="text-gray-700 mr-4 mt-1" />
    <View>
      <Text className={`font-semibold text-gray-800 ${textSize === 'base' ? 'text-base' : ''}`}>
        {title}
      </Text>
      <Text className={`text-gray-600 mt-1 ${textSize === 'base' ? 'text-sm' : ''}`}>
        {subtitle}
      </Text>
    </View>
  </View>
);

export default PackageDetails;