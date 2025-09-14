// profile/ProfilePage.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Alert, StatusBar, Platform } from 'react-native';
import ProfileHeader from './components/ProfileHeader';
import ListItem from './components/ListItem';
import ProgressBar from './components/ProgressBar';
import EditBottomSheet from './components/EditBottomSheet';
import TextInputBottomSheet from './components/TextInputBottomSheet';
import { useAuthStore } from '../../stores/authStore';
import { updateUserProfile, UpdateUserData, uploadProfileImage } from '../../api/student/user';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import EmailChangeBottomSheet from './components/EmailChangeBottomSheet';
import PasswordChangeBottomSheet from './components/PasswordChangeBottomSheet';
import NotificationPreferencesBottomSheet from './components/NotificationPreferencesBottomSheet';
import { getNotificationPreferences, updateNotificationPreferences, NotificationPreferences } from '../../api/student/user';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuthStore();
  const router = useRouter();
  const [editMode, setEditMode] = useState({
    all: false,
    grade: false,
    institution: false,
    location: false,
    email: false,
    password: false,
    notifications: false,
  });

  // Bottom sheet states
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showTextInputSheet, setShowTextInputSheet] = useState(false);
  const [showEmailChangeSheet, setShowEmailChangeSheet] = useState(false);
  const [showPasswordChangeSheet, setShowPasswordChangeSheet] = useState(false);
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);
  const [currentEditType, setCurrentEditType] = useState<'grade' | 'location'>('grade');
  const [currentTextEditType, setCurrentTextEditType] = useState<'institution' | 'name'>('institution');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    push_notifications: true,
    email_notifications: true,
    lesson_reminders: true,
    progress_updates: true,
    course_announcements: true,
    study_streak_reminders: true,
    weekly_progress_report: false,
    new_content_alerts: true,
  });

  const handleHeaderEdit = () => {
    // When header edit is clicked, show name editor
    setCurrentTextEditType('name');
    setShowTextInputSheet(true);
  };

  const handleAvatarPress = () => {
    Alert.alert(
      "Update Profile Picture", 
      "Choose a new profile picture. The image should be smaller than 5MB for best results.\n\nNote: Once you upload a custom image, you won't be able to revert to your original avatar.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Choose Photo",
          onPress: handleImagePicker
        }
      ]
    );
  };

  const handleImagePicker = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required', 
        'We need access to your photo library to select a profile picture. Please enable permissions in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('Opening image picker...');

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, // Reduced quality to make file smaller
        base64: true,
      });

      console.log('Image picker result:', result);
      
      if (result.canceled) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Selected asset:', {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
          hasBase64: !!asset.base64
        });

        // Check file size (limit to 5MB)
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        if (asset.fileSize && asset.fileSize > maxSizeInBytes) {
          Alert.alert(
            'File Too Large',
            `The selected image is ${(asset.fileSize / (1024 * 1024)).toFixed(1)}MB. Please select an image smaller than 5MB or try reducing the image quality.`,
            [{ text: 'OK' }]
          );
          return;
        }

        // Check if base64 is available
        if (!asset.base64) {
          Alert.alert(
            'Image Processing Error',
            'Unable to process the selected image. Please try selecting a different image.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Check base64 size (additional safety check)
        const base64Size = (asset.base64.length * 3) / 4; // Rough base64 to bytes conversion
        if (base64Size > maxSizeInBytes) {
          Alert.alert(
            'Image Too Large',
            `The image data is too large (${(base64Size / (1024 * 1024)).toFixed(1)}MB). Please select a smaller image or reduce quality.`,
            [{ text: 'OK' }]
          );
          return;
        }
        
        const imageData = `data:image/jpeg;base64,${asset.base64}`;
        handleImageUpload(imageData);
      } else {
        Alert.alert(
          'Selection Error',
          'No image was selected. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Image Picker Error',
        'Could not open image picker. Please check your device permissions and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEmailUpdated = (newEmail: string) => {
    // Update the user state with new email
    if (user) {
      updateUser({ ...user, email: newEmail });
    }
  };

  const handleImageUpload = async (imageData: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Show loading toast
    Toast.show({
      type: 'info',
      text1: 'Uploading Image...',
      text2: 'Please wait while we save your new profile picture',
      autoHide: false,
    });

    try {
      console.log('Starting image upload...');
      const response = await uploadProfileImage(imageData);
      
      if (!response.error && response.result) {
        // Update local user state with the returned data
        updateUser(response.result.student);
        
        // Hide loading toast
        Toast.hide();
        
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Profile Picture Updated!',
          text2: 'Your new profile picture has been saved',
          visibilityTime: 3000,
        });
        
        console.log('Profile image updated successfully:', response.result.imageUrl);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Profile image upload error:', error);
      
      // Hide loading toast
      Toast.hide();
      
      // Parse different error types
      let errorTitle = 'Upload Failed';
      let errorMessage = 'Could not upload image. Please try again.';
      
      if (error.message) {
        const message = error.message.toLowerCase();
        
        if (message.includes('too large') || message.includes('payload')) {
          errorTitle = 'Image Too Large';
          errorMessage = 'The image file is too large. Please select a smaller image (under 5MB) or reduce the image quality.';
        } else if (message.includes('network') || message.includes('connection')) {
          errorTitle = 'Network Error';
          errorMessage = 'Please check your internet connection and try again.';
        } else if (message.includes('unauthorized') || message.includes('token')) {
          errorTitle = 'Authentication Error';
          errorMessage = 'Please log out and log back in, then try again.';
        } else if (message.includes('cloudinary') || message.includes('cloud')) {
          errorTitle = 'Upload Service Error';
          errorMessage = 'Our image service is temporarily unavailable. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show error toast
      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
        visibilityTime: 6000,
      });

      // Also show alert for critical errors
      if (errorTitle === 'Image Too Large') {
        Alert.alert(
          errorTitle,
          errorMessage + '\n\nTips:\n• Use photo editing apps to reduce size\n• Take photos at lower resolution\n• Choose JPEG format over PNG',
          [{ text: 'Got it' }]
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIndividualEdit = (field: string) => {
    if (field === 'grade') {
      setCurrentEditType('grade');
      setShowEditSheet(true);
    } else if (field === 'location') {
      setCurrentEditType('location');
      setShowEditSheet(true);
    } else if (field === 'institution') {
      setCurrentTextEditType('institution');
      setShowTextInputSheet(true);
    } else if (field === 'email') {
      // Use new email change flow
      setShowEmailChangeSheet(true);
    } else if (field === 'password') {
      // Use new password change flow
      setShowPasswordChangeSheet(true);
    } else if (field === 'notifications') {
      // Load and show notification preferences
      handleNotificationEdit();
    } else if (field === 'name') {
      setCurrentTextEditType('name');
      setShowTextInputSheet(true);
    } else {
      // For other fields - keep old behavior
      setEditMode(prev => ({
        ...prev,
        all: false,
        [field]: !prev[field as keyof typeof prev],
      }));
    }
  };

  const handleNotificationEdit = async () => {
    try {
      setIsUpdating(true);
      const response = await getNotificationPreferences();
      if (response.preferences) {
        setNotificationPreferences(response.preferences);
      }
      setShowNotificationSheet(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Load Preferences',
        text2: error.message,
        visibilityTime: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotificationPreferences = async (preferences: NotificationPreferences) => {
    try {
      await updateNotificationPreferences(preferences);
      setNotificationPreferences(preferences);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update notification preferences');
    }
  };

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

  const handleUpdateProfile = async (updateData: UpdateUserData) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Show loading toast
    Toast.show({
      type: 'info',
      text1: 'Updating Profile...',
      text2: 'Please wait while we save your changes',
      autoHide: false,
    });

    try {
      console.log('Sending update data:', updateData);
      const response = await updateUserProfile(updateData);
      console.log('Update response:', response);
      
      if (!response.error && response.result) {
        // Update local user state with the returned data
        updateUser(response.result.student);
        
        // Hide loading toast
        Toast.hide();
        
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Profile Updated Successfully!',
          text2: 'Your changes have been saved to the database',
          visibilityTime: 3000,
        });
        
        console.log('Profile updated successfully:', response.result.student);
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      // Hide loading toast
      Toast.hide();
      
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message || 'Could not save changes. Please try again.',
        visibilityTime: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const isEditable = (field: string) => {
    return editMode.all || editMode[field as keyof typeof editMode];
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ 
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
    }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <ProfileHeader onEditPress={handleHeaderEdit} onAvatarPress={handleAvatarPress} />
        
        <View className="px-5 pb-8">
          
          {/* Learning & Progress Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Learning & Progress</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <ProgressBar label="Overall Progress" progress={75} />
              <View className="h-px bg-gray-100 mx-4" />
              <ListItem 
                icon="library-books" 
                label="My Enrolled Courses" 
                value="3 active courses" 
              />
              <View className="h-px bg-gray-100 mx-4" />
              <ListItem 
                icon="military-tech" 
                label="Achievements & Badges" 
                value="12 earned, 5 new available" 
              />
            </View>
          </View>

          {/* Academic Information Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Academic Information</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <ListItem 
                icon="school" 
                label="Grade Level" 
                value={user?.grade ? `Grade ${user.grade}` : 'Not specified'} 
                onPress={() => handleIndividualEdit('grade')}
                showEdit={true}
                isEditing={isEditable('grade')}
              />
              <View className="h-px bg-gray-100 mx-5" />
              <ListItem 
                icon="account-balance" 
                label="Institution / School" 
                value={user?.address?.institution || 'Not specified'} 
                onPress={() => handleIndividualEdit('institution')}
                showEdit={true}
                isEditing={isEditable('institution')}
              />
              <View className="h-px bg-gray-100 mx-5" />
              <ListItem 
                icon="location-on" 
                label="Province & District" 
                value={user?.address ? `${user.address.province}, ${user.address.district}` : 'Not specified'} 
                onPress={() => handleIndividualEdit('location')}
                showEdit={true}
                isEditing={isEditable('location')}
              />
            </View>
          </View>

          {/* Tools & Settings Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Tools & Settings</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <ListItem 
                icon="email" 
                label="Email Address" 
                value={user?.email || 'Not specified'} 
                onPress={() => handleIndividualEdit('email')}
                showEdit={true}
                isEditing={isEditable('email')}
              />
              <View className="h-px bg-gray-100 mx-5" />
              <ListItem 
                icon="book" 
                label="My Notes & Bookmarks" 
                value="45 saved items" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <ListItem 
                icon="cloud-download" 
                label="Downloads" 
                value="12 offline lessons" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <ListItem 
                icon="lock" 
                label="Change Password" 
                value="Keep your account secure" 
                onPress={() => handleIndividualEdit('password')}
                showEdit={true}
                isEditing={isEditable('password')}
              />
              <View className="h-px bg-gray-100 mx-5" />
              <ListItem 
                icon="notifications" 
                label="Notification Preferences" 
                value="Manage alerts & reminders" 
                onPress={() => handleIndividualEdit('notifications')}
                showEdit={true}
                isEditing={isEditable('notifications')}
              />
            </View>
          </View>
          
          {/* Support & Feedback Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Support & Feedback</Text>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <ListItem 
                icon="help-outline" 
                label="Help & Support" 
                value="Get assistance & FAQs" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <ListItem 
                icon="share" 
                label="Share this App" 
                value="Invite friends to join" 
              />
              <View className="h-px bg-gray-100 mx-5" />
              <ListItem 
                icon="star-half" 
                label="Rate Us" 
                value="Help us improve" 
              />
            </View>
          </View>
          
          {/* Logout Button */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ListItem 
              icon="logout" 
              label="Log Out" 
              value="Sign out of your account"
              destructive={true}
              onPress={confirmLogout}
            />
          </View>
        </View>
      </ScrollView>

      {/* Edit Bottom Sheets */}
      <EditBottomSheet
        isVisible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        editType={currentEditType}
        currentValues={{
          grade: user?.grade,
          province: user?.address?.province,
          district: user?.address?.district,
        }}
        onSave={handleUpdateProfile}
        isLoading={isUpdating}
      />

      <TextInputBottomSheet
        isVisible={showTextInputSheet}
        onClose={() => setShowTextInputSheet(false)}
        editType={currentTextEditType}
        currentValue={
          currentTextEditType === 'institution' 
            ? user?.address?.institution || ''
            : currentTextEditType === 'name'
            ? user?.full_name || ''
            : ''
        }
        onSave={handleUpdateProfile}
        isLoading={isUpdating}
      />

      <EmailChangeBottomSheet
        isVisible={showEmailChangeSheet}
        onClose={() => setShowEmailChangeSheet(false)}
        currentEmail={user?.email || ''}
        onEmailUpdated={handleEmailUpdated}
      />

      <PasswordChangeBottomSheet
        isVisible={showPasswordChangeSheet}
        onClose={() => setShowPasswordChangeSheet(false)}
        currentEmail={user?.email || ''}
      />

      <NotificationPreferencesBottomSheet
        isVisible={showNotificationSheet}
        onClose={() => setShowNotificationSheet(false)}
        currentPreferences={notificationPreferences}
        onSave={handleSaveNotificationPreferences}
      />
    </SafeAreaView>
  );
};

export default ProfilePage;