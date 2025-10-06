// more/MorePage.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StatusBar, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useAppUpdate } from '../hooks/useAppUpdate';
import { MaterialIcons } from '@expo/vector-icons';
import MenuHeader from './components/MenuHeader';
import StatCard from './components/StatCard';
import MenuListItem from './components/MenuListItem';
import AppStatus from './components/AppStatus';
import PrimaryNav from '@/components/Navigation/PrimaryNav';


const MorePage = () => {
  const router = useRouter();

  const handleNavigateToSettings = () => {
    router.push('./SettingsPage');
  };

  // App update logic
  const {
    status,
    latestVersion,
    otaUpdateInfo,
    error,
    checkForUpdate,
    promptForStoreUpdate,
    applyOtaUpdate,
  } = useAppUpdate();

  // UI for update status and actions
  const renderUpdateButton = () => {
    switch (status) {
      case 'idle':
      case 'up-to-date':
        return (
          <MenuListItem
            icon="system-update-alt"
            title="Check for Update"
            subtitle="You are on the latest version"
            onPress={checkForUpdate}
          />
        );
      case 'checking':
        return (
          <MenuListItem
            icon="system-update-alt"
            title="Checking for Update..."
            subtitle="Please wait"
          />
        );
      case 'store-update-available':
        return (
          <MenuListItem
            icon="system-update-alt"
            title="App Store Update Available"
            subtitle={`Latest: v${latestVersion}`}
            onPress={promptForStoreUpdate}
          />
        );
      case 'ota-update-available':
        return (
          <MenuListItem
            icon="system-update-alt"
            title="OTA Update Available"
            subtitle="Tap to update now"
            onPress={applyOtaUpdate}
          />
        );
      case 'error':
        return (
          <MenuListItem
            icon="error"
            title="Update Check Failed"
            subtitle={error || 'Unknown error'}
            onPress={checkForUpdate}
          />
        );
      default:
        return null;
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-50" >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-12">
        <Text className="text-xl px-5 mt-6 font-bold text-gray-900 mb-0">StatCards</Text>
        {/* Today's Progress Card (StatCard) - NOW FIRST */}
        <StatCard />
        {/* App Status Component */}
        <AppStatus />

        <View className="px-5 pb-8">
          {/* App Tools Section */}
          <View className="mb-6 mt-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">App Tools</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MenuListItem 
                icon="group-add" 
                title="Affiliate Program" 
                subtitle="Earn rewards by inviting friends" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <MenuListItem 
                icon="settings" 
                title="Settings" 
                subtitle="App preferences and configuration" 
                onPress={() => router.push('/Settings/SettingsPage')}
              />
            </View>
          </View>
          {/* Study Tools Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Study Tools</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MenuListItem 
                icon="school" 
                title="My Courses" 
                subtitle="View your course list & performance" 
              />
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
                  onPress={() => router.push('/AppInfo/AboutApp')}
                />
              <View className="h-px bg-gray-100 mx-5" />
              {renderUpdateButton()}
            </View>
          </View>
        </View>
      </ScrollView>
      <PrimaryNav current={'More'} />
    </SafeAreaView>
  );
};

export default MorePage;