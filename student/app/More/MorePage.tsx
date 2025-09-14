// more/MorePage.tsx
import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; 
import { MaterialIcons } from '@expo/vector-icons';
import MenuHeader from './components/MenuHeader';
import StatCard from './components/StatCard';
import MenuListItem from './components/MenuListItem';
import PrimaryNav from '@/components/Navigation/PrimaryNav';

const MorePage = () => {
  const router = useRouter();

  const handleNavigateToSettings = () => {
    router.push('./SettingsPage');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-4">

        <Text className="text-xl px-5 mt-6 font-bold text-gray-900 mb-0">StatCards</Text>
        {/* Today's Progress Card (StatCard) - NOW FIRST */}
        <StatCard />
        
        {/* App Status Card - NOW SECOND */}
        <View className="px-5 mb-2">
          <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">App Status</Text>
              <MaterialIcons name="info" size={20} color="#007AFF" />
            </View>
            <View className="flex-row justify-between items-center">
              <View className="items-center flex-1 px-2">
                <View className="w-14 h-14 rounded-full items-center justify-center mb-3 bg-blue-50">
                  <MaterialIcons name="cloud-done" size={26} color="#007AFF" />
                </View>
                <Text className="text-xs text-gray-600 font-medium text-center leading-tight">All Synced</Text>
              </View>
              
              <View className="items-center flex-1 px-2">
                <View className="w-14 h-14 rounded-full items-center justify-center mb-3 bg-blue-50">
                  <MaterialIcons name="system-update-alt" size={26} color="#007AFF" />
                </View>
                <Text className="text-xs text-gray-600 font-medium text-center leading-tight">Latest Version</Text>
              </View>
              
              <View className="items-center flex-1 px-2">
                <View className="w-14 h-14 rounded-full items-center justify-center mb-3 bg-blue-50">
                  <MaterialIcons name="storage" size={26} color="#007AFF" />
                </View>
                <Text className="text-xs text-gray-600 font-medium text-center leading-tight">2.1GB Used</Text>
              </View>
              
              <View className="items-center flex-1 px-2">
                <View className="w-14 h-14 rounded-full items-center justify-center mb-3 bg-blue-50">
                  <MaterialIcons name="backup" size={26} color="#007AFF" />
                </View>
                <Text className="text-xs text-gray-600 font-medium text-center leading-tight">Auto Backup</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View className="px-5 pb-8">
          
          {/* Study Tools & Features Section */}
          <View className="mb-6 mt-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Study Tools & Features</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MenuListItem 
                icon="group-add" 
                title="Affiliate Program" 
                subtitle="Earn rewards by inviting friends" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <MenuListItem 
                icon="school" 
                title="My Courses" 
                subtitle="View your course list & performance" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <MenuListItem 
                icon="timer" 
                title="Study Tracker" 
                subtitle="Today's hours, weekly goal, chapters" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <MenuListItem 
                icon="edit-note" 
                title="Notebook" 
                subtitle="Your personal study notes" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <MenuListItem 
                icon="calculate" 
                title="Calculators" 
                subtitle="Helpful tools for your study" 
              />
            </View>
          </View>

          {/* Digital Features Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Digital Features</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MenuListItem 
                icon="qr-code-scanner" 
                title="Use Desktop Web Version" 
                subtitle="Scan QR to login on your computer" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <MenuListItem 
                icon="campaign" 
                title="Offers and Promos" 
                subtitle="See the latest deals and offers" 
              />
            </View>
          </View>

          {/* Support & Information Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Support & Information</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MenuListItem 
                icon="support-agent" 
                title="Contact Us" 
                subtitle="Get help and support" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <MenuListItem 
                icon="info-outline" 
                title="About this App" 
                subtitle="Version, terms, and privacy policy" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <MenuListItem 
                icon="system-update-alt" 
                title="Check for Update" 
                subtitle="You are on the latest version" 
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <PrimaryNav current={'More'} />
    </SafeAreaView>
  );
};

export default MorePage;