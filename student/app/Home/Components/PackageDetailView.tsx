import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView, StyleSheet, StatusBar, Platform } from "react-native";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  type: 'free' | 'paid';
  skills?: string[];
  learningPoints?: string[];
  modules?: {
    name: string;
    description: string;
    duration?: string;
  }[];
  features?: string[];
}

interface PackageDetailViewProps {
  package: Package;
  onBack: () => void;
  onSelect: (packageId: string) => void;
  isSelected: boolean;
}

export default function PackageDetailView({ 
  package: pkg, 
  onBack, 
  onSelect, 
  isSelected 
}: PackageDetailViewProps) {
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedTrialType, setSelectedTrialType] = useState<'free' | 'paid'>('free');
  const [paymentMethod, setPaymentMethod] = useState<string>('khalti');
const bottomSheetRef = useRef<BottomSheetModal>(null);
const snapPoints = useMemo(() => ['55%'], []);

// Handle bottom sheet visibility
useEffect(() => {
  if (showCheckout && bottomSheetRef.current) {
    bottomSheetRef.current.present();
  } else if (!showCheckout && bottomSheetRef.current) {
    bottomSheetRef.current.dismiss();
  }
}, [showCheckout]);
  // Function to get appropriate icon for each service feature
  const getServiceIcon = (moduleName: string): keyof typeof MaterialIcons.glyphMap => {
    const name = moduleName.toLowerCase();
    
    if (name.includes('live') || name.includes('class')) return 'live-tv';
    if (name.includes('video') || name.includes('recorded') || name.includes('lecture')) return 'play-circle-filled';
    if (name.includes('material') || name.includes('study') || name.includes('download')) return 'library-books';
    if (name.includes('test') || name.includes('exam') || name.includes('practice') || name.includes('mock')) return 'quiz';
    if (name.includes('assignment') || name.includes('homework')) return 'assignment';
    if (name.includes('career') || name.includes('counseling') || name.includes('guidance')) return 'psychology';
    if (name.includes('platform') || name.includes('tour') || name.includes('introduction')) return 'explore';
    if (name.includes('competitive') || name.includes('entrance')) return 'school';
    if (name.includes('board') || name.includes('strategy')) return 'account-balance';
    if (name.includes('advanced') || name.includes('premium')) return 'star';
    
    return 'play-circle-filled'; // default icon
  };

  const FeatureItem = ({ 
    icon, 
    title, 
    subtitle, 
    className 
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    subtitle: string;
    className?: string;
  }) => (
    <View className={`flex-row items-start space-x-3 mb-4 ${className}`}>
      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mt-1">
        <MaterialIcons name={icon} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 mb-1">{title}</Text>
        <Text className="text-gray-600 text-sm leading-5">{subtitle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={onBack} className="p-2">
          <MaterialIcons name="chevron-left" size={32} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Package Details</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-6 py-6 bg-gradient-to-br from-blue-50 to-indigo-100">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
              <MaterialIcons name={pkg.icon as any} size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              {pkg.name}
            </Text>
            <Text className="text-gray-600 text-center text-base leading-6">
              {pkg.description}
            </Text>
            <View className="mt-4 bg-blue-500 px-4 py-2 rounded-full">
              <Text className="text-white font-bold text-lg">
                {pkg.type === 'free' ? 'FREE' : `₹${pkg.price}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Skills Section */}
        {pkg.skills && pkg.skills.length > 0 && (
          <View className="px-6 py-2">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Package Highlights
            </Text>
            <View className="flex-row flex-wrap">
              {pkg.skills.map((skill, index) => (
                <View 
                  key={index} 
                  className="bg-blue-100 px-3 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-blue-700 text-sm font-medium">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Learning Points Section */}
        {pkg.learningPoints && pkg.learningPoints.length > 0 && (
          <View className="px-6 py-6 bg-gray-50">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              What's Included
            </Text>
            {pkg.learningPoints.map((point, index) => (
              <View key={index} className="flex-row items-start mb-3">
                <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                  <MaterialIcons name="check" size={16} color="white" />
                </View>
                <Text className="flex-1 text-gray-700 text-base leading-6">{point}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Modules Section */}
        {pkg.modules && pkg.modules.length > 0 && (
          <View className="px-6 py-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Service Features
            </Text>
            {pkg.modules.map((module, index) => (
              <FeatureItem
                key={index}
                icon={getServiceIcon(module.name)}
                title={module.name}
                subtitle={`${module.description}${module.duration ? ` • ${module.duration}` : ''}`}
        className="mb-4 flex-row  gap-3"
              />
            ))}
          </View>
        )}

        {/* Features Section */}
        {pkg.features && pkg.features.length > 0 && (
          <View className="px-6 py-6 bg-gray-50">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              All Package Features
            </Text>
            <View className="flex-row flex-wrap">
              {pkg.features.map((feature, index) => (
                <View key={index} className="flex-row items-center mb-3 w-full">
                  <MaterialIcons name="verified" size={20} color="#10B981" />
                  <Text className="ml-2 text-gray-700 text-sm flex-1">{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="h-16" />
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <View className="px-5">
          <View className="flex-row justify-center">
            <TouchableOpacity
              onPress={() => {
                setSelectedTrialType('free');
                setShowCheckout(true);
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

  <BottomSheetModal
  ref={bottomSheetRef}
  index={1}
  snapPoints={snapPoints}
  onDismiss={() => setShowCheckout(false)}
  backgroundStyle={{ backgroundColor: '#fff' }}
  handleIndicatorStyle={{ backgroundColor: '#E5E7EB' }}
>
  <BottomSheetView className="flex-1 px-6 pb-6">
    <View className="flex-row justify-between items-center mb-6">
      <Text className="text-xl font-bold text-gray-800">Checkout</Text>
      <TouchableOpacity onPress={() => setShowCheckout(false)}>
        <MaterialIcons name="close" size={24} color="#6B7280" />
      </TouchableOpacity>
    </View>


            {/* Package Summary */}
            <View className={`rounded-xl p-4 mb-6 ${
              selectedTrialType === 'free' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">{pkg.name}</Text>
                  <Text className="text-sm text-gray-600">
                    {selectedTrialType === 'free'
                      ? `Try ${pkg.name.toLowerCase()} free for 7 days`
                      : pkg.description
                    }
                  </Text>
                  <Text className="mt-2">
                    <Text className={`text-lg font-bold ${
                      selectedTrialType === 'free' ? 'text-blue-600' : 'text-blue-600'
                    }`}>
                      Rs. {selectedTrialType === 'free' ? '0' : pkg.price.toLocaleString()}
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
                      If you don't cancel before the trial ends, you'll be charged the full price automatically.
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
                    className={`flex-row items-center p-4 rounded-xl border-2 mb-4 ${paymentMethod === 'khalti' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    onPress={() => setPaymentMethod('khalti')}
                  >
                    <MaterialIcons name="payment" size={24} color={paymentMethod === 'khalti' ? '#3B82F6' : '#6B7280'} />
                    <Text className={`ml-3 font-medium ${paymentMethod === 'khalti' ? 'text-blue-900' : 'text-gray-700'}`}>Khalti</Text>
                    {paymentMethod === 'khalti' && <View className="ml-2"><MaterialIcons name="check-circle" size={20} color="#3B82F6" /></View>}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className={`flex-row items-center p-4 rounded-xl border-2 mb-4 ${paymentMethod === 'esewa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    onPress={() => setPaymentMethod('esewa')}
                  >
                    <MaterialIcons name="account-balance-wallet" size={24} color={paymentMethod === 'esewa' ? '#3B82F6' : '#6B7280'} />
                    <Text className={`ml-3 font-medium ${paymentMethod === 'esewa' ? 'text-blue-900' : 'text-gray-700'}`}>eSewa</Text>
                    {paymentMethod === 'esewa' && <View className="ml-2"><MaterialIcons name="check-circle" size={20} color="#3B82F6" /></View>}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className={`flex-row items-center p-4 rounded-xl border-2 ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    onPress={() => setPaymentMethod('card')}
                  >
                    <MaterialIcons name="credit-card" size={24} color={paymentMethod === 'card' ? '#3B82F6' : '#6B7280'} />
                    <Text className={`ml-3 font-medium ${paymentMethod === 'card' ? 'text-blue-900' : 'text-gray-700'}`}>Credit/Debit Card</Text>
                    {paymentMethod === 'card' && <View className="ml-2"><MaterialIcons name="check-circle" size={20} color="#3B82F6" /></View>}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Checkout Button */}
            <TouchableOpacity 
              className="bg-customBlue py-4 rounded-3xl mb-4"
              onPress={() => {
                if (selectedTrialType === 'free') {
                  // Handle free trial activation
                  console.log('Starting free trial for:', pkg.name);
                  setShowCheckout(false);
                  // Navigate to trial success or course access
                } else {
                  // Handle payment processing
                  console.log('Processing payment with:', paymentMethod, 'for:', pkg.name);
                  setShowCheckout(false);
                  // Navigate to payment success
                }
              }}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {selectedTrialType === 'free' ? 'Start My Free Trial' : 'Complete Payment'}
              </Text>
            </TouchableOpacity>

            <Text className="text-xs text-gray-500 text-center">
              {selectedTrialType === 'free' 
                ? 'Your trial data is secured with 256-bit SSL encryption'
                : 'Your payment is secured with 256-bit SSL encryption'
              }
            </Text>
           </BottomSheetView>
</BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    zIndex: 50,
    elevation: 50,
  },
});