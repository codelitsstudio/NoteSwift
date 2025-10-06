import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default function ProCheckout() {
  const router = useRouter();
  const { trialType, selectedPackages } = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<string>('khalti');

  const packages = JSON.parse(selectedPackages as string);

  const availablePackages: Package[] = [
    {
      id: "free-trial",
      name: "Free Trial",
      price: 0,
      description: "Limited free courses for 7 days",
    },
    {
      id: "grade10",
      name: "Grade 10 Package",
      price: 2499,
      description: "Complete study materials and practice tests for Grade 10",
    },
    {
      id: "grade11",
      name: "Grade 11 Package", 
      price: 2499,
      description: "Comprehensive resources for Grade 11 curriculum",
    },
    {
      id: "grade12",
      name: "Grade 12 Package",
      price: 2499,
      description: "Board exam preparation and advanced materials for Grade 12",
    },
  ];

  const paymentMethods = [
    { id: 'khalti', name: 'Khalti', icon: <MaterialCommunityIcons name="wallet" size={24} color="#374151" /> },
    { id: 'esewa', name: 'eSewa', icon: <MaterialCommunityIcons name="bank-transfer" size={24} color="#374151" /> },
    { id: 'card', name: 'Credit/Debit Card', icon: <FontAwesome name="credit-card" size={24} color="#374151" /> },
  ];

  const calculateTotal = () => {
    if (trialType === 'free') return 0; // Free trial packages cost nothing
    return packages.reduce((total: number, packageId: string) => {
      const pkg = availablePackages.find(p => p.id === packageId);
      return total + (pkg?.price || 0);
    }, 0);
  };

  const handleConfirm = () => {
    router.push({
      pathname: '/ProDashboard/DashboardHome' as any,
      params: { 
        trialType,
        selectedPackages: selectedPackages as string,
        paymentMethod,
        totalAmount: calculateTotal().toString()
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-6">
        <TouchableOpacity onPress={handleBack}>
    <MaterialIcons name="chevron-left" size={32} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Step Indicator */}
      <View className="flex-row justify-center items-center mb-6 px-5 mt-4">
        <View className="w-8 h-8 rounded-full items-center justify-center bg-blue-500">
          <Text className="text-sm font-bold text-white">✓</Text>
        </View>
        <View className="w-8 h-0.5 mx-1 bg-blue-500" />
        <View className="w-8 h-8 rounded-full items-center justify-center bg-blue-500">
          <Text className="text-sm font-bold text-white">✓</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 mt-4">

          {/* Trial/Subscription Type Header */}
          {trialType === 'free' ? (
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="schedule" size={24} color="#2563EB" />
                <Text className="text-lg font-bold text-blue-800 ml-2">Free Trial Selected</Text>
              </View>
              <Text className="text-sm text-blue-700">
                You've selected a 7-day free trial. No payment required now.
              </Text>
            </View>
          ) : (
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="star" size={24} color="#2563EB" />
                <Text className="text-lg font-bold text-blue-800 ml-2">Pro Subscription</Text>
              </View>
              <Text className="text-sm text-blue-700">
                You've selected paid packages. Payment required to proceed.
              </Text>
            </View>
          )}

          {/* Selected Packages */}
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            {trialType === 'free' ? 'Free Trial Packages:' : 'Selected Packages:'}
          </Text>
          {packages.map((packageId: string) => {
            const pkg = availablePackages.find(p => p.id === packageId);
            if (!pkg) return null;
            
            const displayPrice = trialType === 'free' ? 0 : pkg.price;
            const isTrialPackage = trialType === 'free';
            
            return (
              <View key={pkg.id} className={`rounded-xl p-4 mb-3 ${
                isTrialPackage ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">{pkg.name}</Text>
                    <Text className="text-sm text-gray-600">
                      {isTrialPackage 
                        ? `Try ${pkg.name.toLowerCase()} free for 7 days` 
                        : pkg.description
                      }
                    </Text>
                    <Text className="mt-2">
                      <Text className={`text-lg font-bold ${
                        isTrialPackage ? 'text-blue-600' : 'text-blue-600'
                      }`}>
                        Rs. {displayPrice.toLocaleString()}
                      </Text>
                      {isTrialPackage ? (
                        <Text className="text-sm text-blue-600"> (Free for 7 days)</Text>
                      ) : displayPrice > 0 ? (
                        <Text className="text-sm text-gray-500"> (One-time payment)</Text>
                      ) : (
                        <Text className="text-sm text-gray-500"> (Free)</Text>
                      )}
                    </Text>
                  </View>
                  {isTrialPackage && (
                    <View className="bg-blue-500 px-3 py-1 rounded-full">
                      <Text className="text-xs text-white font-bold">TRIAL</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* Payment Method Selection (only for paid packages) */}
          {trialType === 'pro' && calculateTotal() > 0 && (
            <>
              <Text className="text-lg font-semibold text-gray-900 mb-3 mt-4">Payment Method:</Text>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setPaymentMethod(method.id)}
                  className={`border rounded-xl p-4 mb-3 flex-row items-center ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <View className="mr-3">{method.icon}</View>
                  <Text className="text-lg font-semibold text-gray-900 flex-1">{method.name}</Text>
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === method.id && (
                      <MaterialIcons name="check" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Total */}
          <View className="border-t mb-4 border-gray-300 pt-4 mt-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-gray-900">
                {trialType === 'free' ? 'Trial Cost' : 'Total'}
              </Text>
              <Text className={`text-2xl font-bold ${
                trialType === 'free' ? 'text-blue-600' : 'text-blue-600'
              }`}>
                Rs. {calculateTotal().toLocaleString()}
                {trialType === 'free' ? (
                  <Text className="text-sm text-blue-600"> (Free for 7 days)</Text>
                ) : calculateTotal() > 0 ? (
                  <Text className="text-sm text-gray-500"> (One-time payment)</Text>
                ) : (
                  <Text className="text-sm text-gray-500"> (Free)</Text>
                )}
              </Text>
            </View>
            {trialType === 'free' && (
              <Text className="text-xs text-gray-500 mt-2 text-right">
                *Auto-converts to paid subscription after trial period
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <View className="px-5">
          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-blue-500 py-4 rounded-3xl mb-3"
          >
            <Text className="text-white text-center text-lg font-bold">
              {trialType === 'free' ? 'Activate Free Trial' : 'Confirm & Pay'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBack}
            className="border border-gray-300 mb-4 py-3 rounded-3xl"
          >
            <Text className="text-gray-700 text-center text-lg font-semibold">Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
