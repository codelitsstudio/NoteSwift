import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import DashboardLayout from "./components/DashboardLayout";

export default function DashboardHome() {
  const router = useRouter();
  const { trialType, selectedPackages, paymentMethod, totalAmount } = useLocalSearchParams();

  const packages = selectedPackages ? JSON.parse(selectedPackages as string) : [];

  const navigateToSection = (sectionId: string) => {
    switch(sectionId) {
      case 'packages':
        router.push('/ProDashboard/MyPackages' as any);
        break;
      case 'history':
        router.push('/ProDashboard/PaymentHistory' as any);
        break;
      case 'marketplace':
        router.push('/ProDashboard/AddMorePackages' as any);
        break;
      case 'settings':
        router.push('/ProDashboard/AccountSettings' as any);
        break;
    }
  };

  const getActivePackagesCount = () => {
    return packages.length;
  };

  const getDaysLeft = () => {
    return trialType === 'free' ? 7 : 365;
  };

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle={trialType === 'free' ? 'Free Trial Active' : 'Pro Subscription Active'}
      activeSection="home"
      isHome={true}
    >
      <ScrollView className="flex-1 p-6">
        {/* Pro Welcome Banner */}
        <View className="bg-blue-500 rounded-xl p-6 mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="workspace-premium" size={24} color="white" />
                <Text className="text-white text-lg font-bold ml-2">Welcome to Pro!</Text>
              </View>
              <Text className="text-blue-100 text-sm">
                {trialType === 'free' 
                  ? 'Your 7-day free trial is active. Enjoy premium features!'
                  : 'Your Pro subscription is active. Unlock your full potential!'
                }
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} className="px-3 py-2 rounded-lg">
              <Text className="text-white text-xs font-bold">
                {trialType === 'free' ? 'TRIAL' : 'ACTIVE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Premium Stats */}
        <View className="flex-row mb-6">
          <View className="flex-1 bg-white rounded-xl p-4 mr-3 border border-gray-200">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="library-books" size={20} color="#3B82F6" />
              <Text className="text-xs text-gray-500 ml-2 font-semibold">ACTIVE PACKAGES</Text>
            </View>
            <Text className="text-2xl font-bold text-blue-600">{getActivePackagesCount()}</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 ml-3 border border-gray-200">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="schedule" size={20} color="#3B82F6" />
              <Text className="text-xs text-gray-500 ml-2 font-semibold">DAYS REMAINING</Text>
            </View>
            <Text className="text-2xl font-bold text-blue-600">{getDaysLeft()}</Text>
          </View>
        </View>

        {/* Pro Packages */}
        <View className="flex-row items-center mb-4">
          <MaterialIcons name="verified" size={24} color="#3B82F6" />
          <Text className="text-xl font-bold text-gray-900 ml-2">Your Pro Packages</Text>
        </View>
        {packages.map((pkg: any, index: number) => {
          return (
            <View key={index} className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">{pkg.name}</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Activated: {new Date().toLocaleDateString()}
                  </Text>
                </View>
                <View className="bg-blue-500 px-3 py-1 rounded-full">
                  <Text className="text-xs text-white font-bold">PRO ACTIVE</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Payment Summary (for paid subscriptions) */}
        {trialType !== 'free' && (
          <>
            <Text className="text-xl font-bold text-gray-900 mb-4 mt-6">Payment Summary</Text>
            <View className="bg-white rounded-xl p-4 border border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-md text-gray-700">Total Amount</Text>
                <Text className="text-lg font-bold text-blue-600">
                  Rs {parseInt(totalAmount as string || '0')}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-md text-gray-700">Payment Method</Text>
                <Text className="text-md text-gray-900 capitalize">{paymentMethod}</Text>
              </View>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-md text-gray-700">Status</Text>
                <Text className="text-md text-blue-600 font-semibold">Paid</Text>
              </View>
            </View>
          </>
        )}

        {/* Action Buttons */}
        <View className="flex-row mt-8 mb-6">
          <TouchableOpacity
            onPress={() => navigateToSection('packages')}
            className="flex-1 bg-blue-500 py-4 rounded-xl mr-2"
          >
            <Text className="text-white text-center font-bold">View My Packages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateToSection('marketplace')}
            className="flex-1 border border-blue-500 py-4 rounded-xl ml-2"
          >
            <Text className="text-blue-500 text-center font-bold">Add More Packages</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access */}
        <Text className="text-xl font-bold text-gray-900 mb-4">Quick Access</Text>
        <View className="flex-row flex-wrap">
          <TouchableOpacity
            onPress={() => navigateToSection('history')}
            className="bg-white rounded-xl p-4 mr-3 mb-3 border border-gray-200 flex-row items-center"
          >
            <MaterialIcons name="payment" size={24} color="#3B82F6" />
            <Text className="text-gray-700 ml-3 font-semibold">Payment History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateToSection('settings')}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-200 flex-row items-center"
          >
            <MaterialIcons name="settings" size={24} color="#3B82F6" />
            <Text className="text-gray-700 ml-3 font-semibold">Account Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}