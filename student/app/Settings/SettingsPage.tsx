import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';

// --- Helper Types ---
type ListItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description?: string;
  type: 'navigate' | 'toggle' | 'select';
  onPress?: () => void;
  isToggled?: boolean;
  onToggle?: (value: boolean) => void;
  isSelected?: boolean;
  isDestructive?: boolean;
};

// --- Helper Components (defined within the same file) ---

const SettingsHeader = ({ onClose }: { onClose: () => void }) => (
  <View className="flex-row items-center bg-white justify-between p-4">
    <TouchableOpacity onPress={onClose} className="p-1">
      <MaterialIcons name="close" size={32} className="text-customBlue" />
    </TouchableOpacity>
    <Text className="text-xl font-bold text-black">Settings</Text>
    <View className="w-8" />
  </View>
);

const SettingsSection = ({ title }: { title: string }) => (
  <View className="px-4 pt-6 pb-2">
    <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</Text>
  </View>
);

const SettingsListItem = (props: ListItemProps) => {
  const { icon, label, description, type, onPress, isToggled, onToggle, isSelected, isDestructive } = props;
  const iconColor = isDestructive ? 'text-customRed' : 'text-customBlue';
  const labelColor = isDestructive ? 'text-customRed' : 'text-black';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white p-4"
      activeOpacity={0.7}
      disabled={type === 'toggle'}
    >
      <MaterialIcons name={icon} size={24} className={iconColor} />
      <View className="ml-4 flex-1">
        <Text className={`text-base font-medium ${labelColor}`}>{label}</Text>
        {description && <Text className="text-sm text-gray-500 mt-1">{description}</Text>}
      </View>
      {type === 'navigate' && <MaterialIcons name="chevron-right" size={24} className="text-gray-300" />}
      {type === 'select' && isSelected && <MaterialIcons name="check" size={24} className="text-customBlue" />}
      {type === 'toggle' && (
        <Switch
          value={isToggled}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isToggled ? '#0072d2' : '#f4f3f4'}
        />
      )}
    </TouchableOpacity>
  );
};

const Divider = () => <View className="h-px bg-gray-200 ml-16" />;


// --- Main Page Component ---

const SettingsPage = () => {

    const router = useRouter(); // Add this
    const { logout } = useAuthStore();

  // State for interactive elements
  const [appearance, setAppearance] = useState('light');
  const [wifiOnly, setWifiOnly] = useState(true);
  const [courseNotifications, setCourseNotifications] = useState(true);
  const [learningReminders, setLearningReminders] = useState(false);

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            logout();
            Toast.show({
              type: 'error',
              position: 'top',
              text1: 'Logged out',
              text2: 'You have successfully logged out of your account.',
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 50,
            });
            router.replace('/');
          }
        }
      ],
      { cancelable: true }
    );
  };

  const handleSwitchAccount = () => {
    Alert.alert(
      "Switch Account",
      "Are you sure you want to switch to a different account? You'll be logged out and taken to the login screen.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Switch Account", 
          style: "default",
          onPress: () => {
            logout();
            Toast.show({
              type: 'info',
              position: 'top',
              text1: 'Switching Account',
              text2: 'Please log in with a different account.',
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 50,
            });
            router.replace('/onboarding/Login/login');
          }
        }
      ],
      { cancelable: true }
    );
  };

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

  return (
  <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <View className="flex-1 bg-[#FAFAFA]">
        <SettingsHeader onClose={() => router.back()} />
        <ScrollView>
          <SettingsSection title="Appearance" />
          <View className="rounded-xl overflow-hidden mx-4">
       
      
            <SettingsListItem
              icon="wb-sunny"
              label="Light Mode"
              type="select"
              isSelected={appearance === 'light'}
              onPress={() => setAppearance('light')}
            />
            <Divider />
            
          </View>

          <SettingsSection title="Course Content" />
          <View className="rounded-xl overflow-hidden mx-4">
            <SettingsListItem icon="file-download" label="Downloads" type="navigate" onPress={() => router.push('/QuickAccess/Downloads')} />
            <Divider />
            <SettingsListItem
              icon="wifi"
              label="Download on Wi-Fi Only"
              type="toggle"
              isToggled={wifiOnly}
              onToggle={setWifiOnly}
            />
          </View>

          <SettingsSection title="Push Notifications" />
          <View className="rounded-xl overflow-hidden mx-4">
            <SettingsListItem
              icon="school"
              label="Course Reminders"
              type="toggle"
              isToggled={courseNotifications}
              onToggle={setCourseNotifications}
            />
            <Divider />
            <SettingsListItem
              icon="timer"
              label="Learning Reminders"
              type="toggle"
              isToggled={learningReminders}
              onToggle={setLearningReminders}
            />
          </View>

          <SettingsSection title="Support" />
          <View className="rounded-xl overflow-hidden mx-4">
            <SettingsListItem icon="help-outline" label="Learner Help Center" type="navigate" onPress={handleContactUs} />
            <Divider />
            <SettingsListItem icon="feedback" label="Report an Issue" type="navigate" onPress={() => router.push('./ReportIssue')} />
          </View>
          
          <SettingsSection title="Legal" />
          <View className="rounded-xl overflow-hidden mx-4">
            <SettingsListItem icon="privacy-tip" label="About App" type="navigate" onPress={() => router.push('/AppInfo/AboutApp')} />
          </View>

          <SettingsSection title="Account" />
          <View className="rounded-xl overflow-hidden mx-4">
                 <SettingsListItem
              icon="switch-account"
              label="Switch Account"
              type="navigate"
              onPress={handleSwitchAccount}
            />
            <Divider />
       <SettingsListItem
              icon="logout"
              label="Log Out"
              type="navigate"
              onPress={confirmLogout}
              isDestructive={true}
              description="Sign out of your account"
            />
          </View>

          <Text className="text-center text-gray-400 text-xs my-4">Version {Constants.expoConfig?.version || '1.0.0'}</Text>
          <Text className="text-center text-gray-400 text-xs mb-8">Developed by CodeLits Studio®</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SettingsPage;