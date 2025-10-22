import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import DashboardLayout from "./components/DashboardLayout";

export default function AccountSettings() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRenewal, setAutoRenewal] = useState(true);

  const userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+977 9812345678",
    subscriptionType: "NoteSwift Pro",
    subscriptionStatus: "Active",
    nextBillingDate: "2025-09-13"
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your NoteSwift Pro subscription? You will lose access to all premium features.",
      [
        { text: "Keep Subscription", style: "cancel" },
        { 
          text: "Cancel Subscription", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Subscription Cancelled", "Your subscription will remain active until the next billing date.");
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            router.push('/onboarding/LoginScreen' as any);
          }
        }
      ]
    );
  };

  return (
    <DashboardLayout 
      title="Account Settings" 
      subtitle="Account Management"
      activeSection="settings"
    >
      <ScrollView className="flex-1 p-6">
        <Text className="text-xl font-bold text-gray-900 mb-6">Manage Your Account</Text>
        
        {/* Profile Section */}
        <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <Text className="text-lg font-bold text-gray-900 mb-4">Profile Information</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Full Name</Text>
              <Text className="text-gray-900 font-semibold">{userProfile.name}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Email</Text>
              <Text className="text-gray-900 font-semibold">{userProfile.email}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Phone</Text>
              <Text className="text-gray-900 font-semibold">{userProfile.phone}</Text>
            </View>
            
            <TouchableOpacity className="bg-blue-500 py-3 rounded-lg mt-4">
              <Text className="text-white text-center font-semibold">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Section */}
        <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <Text className="text-lg font-bold text-gray-900 mb-4">Subscription Details</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Plan</Text>
              <Text className="text-gray-900 font-semibold">{userProfile.subscriptionType}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Status</Text>
              <View className="px-3 py-1 bg-blue-100 rounded-full">
                <Text className="text-blue-600 text-xs font-semibold">{userProfile.subscriptionStatus.toUpperCase()}</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Next Billing</Text>
              <Text className="text-gray-900 font-semibold">{userProfile.nextBillingDate}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-gray-600">Auto Renewal</Text>
              <TouchableOpacity
                onPress={() => setAutoRenewal(!autoRenewal)}
                className={`w-12 h-6 rounded-full ${autoRenewal ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <View className={`w-5 h-5 rounded-full bg-white mt-0.5 ${autoRenewal ? 'ml-6' : 'ml-0.5'}`} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <Text className="text-lg font-bold text-gray-900 mb-4">Preferences</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Push Notifications</Text>
              <TouchableOpacity
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full ${notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <View className={`w-5 h-5 rounded-full bg-white mt-0.5 ${notificationsEnabled ? 'ml-6' : 'ml-0.5'}`} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600">Language</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-semibold mr-2">English</Text>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row justify-between items-center py-3">
              <Text className="text-gray-600">Privacy Settings</Text>
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <Text className="text-lg font-bold text-gray-900 mb-4">Support & Help</Text>
          
          <View className="space-y-2">
            <TouchableOpacity className="flex-row items-center py-3">
              <MaterialIcons name="help-outline" size={24} color="#6B7280" />
              <Text className="text-gray-700 ml-3">Help Center</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-3">
              <MaterialIcons name="contact-support" size={24} color="#6B7280" />
              <Text className="text-gray-700 ml-3">Contact Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-3">
              <MaterialIcons name="bug-report" size={24} color="#6B7280" />
              <Text className="text-gray-700 ml-3">Report a Bug</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center py-3">
              <MaterialIcons name="star-rate" size={24} color="#6B7280" />
              <Text className="text-gray-700 ml-3">Rate App</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="bg-white rounded-xl p-6 mb-6 border border-red-200">
          <Text className="text-lg font-bold text-red-600 mb-4">Danger Zone</Text>
          
          <TouchableOpacity
            onPress={handleCancelSubscription}
            className="border border-red-500 py-3 rounded-lg mb-3"
          >
            <Text className="text-red-500 text-center font-semibold">Cancel Subscription</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="bg-white rounded-xl p-6 border border-gray-200">
          <Text className="text-lg font-bold text-gray-900 mb-4">App Information</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Version</Text>
              <Text className="text-gray-900">1.0.0</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Build</Text>
              <Text className="text-gray-900">2024091301</Text>
            </View>
            
            <TouchableOpacity className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Terms of Service</Text>
              <MaterialIcons name="open-in-new" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row justify-between items-center py-2">
              <Text className="text-gray-600">Privacy Policy</Text>
              <MaterialIcons name="open-in-new" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}