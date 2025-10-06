// more/MorePage.tsx
import React, { useState, useCallback } from 'react';
import { SafeAreaView, ScrollView, View, Text, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useAppUpdate } from '../hooks/useAppUpdate';
import StatCard from './components/StatCard';
import MenuListItem from './components/MenuListItem';
import AppStatus from './components/AppStatus';
import PrimaryNav from '@/components/Navigation/PrimaryNav';
import Skeleton from '../../components/Container/Skeleton';
import { useFocusEffect } from '@react-navigation/native';

// MorePage Skeleton Component
const MorePageSkeleton: React.FC = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-12">
      {/* StatCards Title */}
      <Skeleton width={100} height={24} borderRadius={4} style={{ marginLeft: 20, marginTop: 24, marginBottom: 16 }} />

      {/* StatCard Skeleton */}
      <Skeleton width="100%" height={120} borderRadius={12} style={{ marginHorizontal: 20, marginBottom: 16 }} />

      {/* AppStatus Skeleton */}
      <Skeleton width="100%" height={80} borderRadius={12} style={{ marginHorizontal: 20, marginBottom: 16 }} />

      <View className="px-5 pb-8">
        {/* App Tools Section */}
        <View className="mb-6 mt-4">
          <Skeleton width={100} height={24} borderRadius={4} style={{ marginBottom: 16 }} />
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[1, 2].map((i) => (
              <View key={i}>
                <View className="flex-row items-center px-5 py-4">
                  <Skeleton width={24} height={24} borderRadius={12} style={{ marginRight: 16 }} />
                  <View className="flex-1">
                    <Skeleton width="60%" height={20} borderRadius={4} style={{ marginBottom: 4 }} />
                    <Skeleton width="40%" height={16} borderRadius={4} />
                  </View>
                </View>
                {i < 2 && <View className="h-px bg-gray-100 mx-5" />}
              </View>
            ))}
          </View>
        </View>

        {/* Study Tools Section */}
        <View className="mb-6">
          <Skeleton width={120} height={24} borderRadius={4} style={{ marginBottom: 16 }} />
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <View key={i}>
                <View className="flex-row items-center px-5 py-4">
                  <Skeleton width={24} height={24} borderRadius={12} style={{ marginRight: 16 }} />
                  <View className="flex-1">
                    <Skeleton width="60%" height={20} borderRadius={4} style={{ marginBottom: 4 }} />
                    <Skeleton width="40%" height={16} borderRadius={4} />
                  </View>
                </View>
                {i < 3 && <View className="h-px bg-gray-100 mx-5" />}
              </View>
            ))}
          </View>
        </View>

        {/* Support & Information Section */}
        <View className="mb-6">
          <Skeleton width={180} height={24} borderRadius={4} style={{ marginBottom: 16 }} />
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <View key={i}>
                <View className="flex-row items-center px-5 py-4">
                  <Skeleton width={24} height={24} borderRadius={12} style={{ marginRight: 16 }} />
                  <View className="flex-1">
                    <Skeleton width="60%" height={20} borderRadius={4} style={{ marginBottom: 4 }} />
                    <Skeleton width="40%" height={16} borderRadius={4} />
                  </View>
                </View>
                {i < 3 && <View className="h-px bg-gray-100 mx-5" />}
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const MorePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleContactUs = () => {
    const phoneNumber = '9779767464242'; // WhatsApp business number without +
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
    
    Linking.canOpenURL(whatsappUrl).then(supported => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        // Fallback to web WhatsApp if app is not installed
        const webWhatsappUrl = `https://wa.me/${phoneNumber}`;
        Linking.openURL(webWhatsappUrl);
      }
    }).catch(err => {
      Alert.alert('Error', 'Could not open WhatsApp. Please make sure WhatsApp is installed on your device.');
    });
  };

  // Set loading state immediately when page is focused
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      // Brief loading for consistency
      setIsLoading(false);
    }, [])
  );

  // App update logic
  const {
    status,
    latestVersion,
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
      {isLoading ? (
        <MorePageSkeleton />
      ) : (
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
                <View className="h-px bg-gray-100 mx-5" />
                <MenuListItem 
                  icon="bug-report" 
                  title="Report Technical Issue" 
                  subtitle="Report bugs and technical problems" 
                  onPress={() => router.push('/Settings/ReportIssue')}
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
                  onPress={() => router.push('/Learn/LearnPage')}
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
                  onPress={handleContactUs}
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
      )}
      <PrimaryNav current={'More'} />
    </SafeAreaView>
  );
};

export default MorePage;