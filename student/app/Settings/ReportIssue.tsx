import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import Toast from 'react-native-toast-message';

function ReportIssuePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [reportText, setReportText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to select image',
      });
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to take photo',
      });
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleSendReport = async () => {
    if (!reportText.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a report description',
      });
      return;
    }

    if (reportText.trim().length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Report must be at least 10 characters long',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Import the sendReport function
      const { sendReport } = await import('@/api/student/auth');

      // For now, we'll send the report text. Image upload would require backend changes
      // to handle multipart/form-data. This is a placeholder for future implementation.
      const response = await sendReport(reportText.trim(), user?.email);

      if (response) {
        Toast.show({
          type: 'success',
          text1: 'Report Sent',
          text2: 'Thank you for your feedback. We will review your report.',
          visibilityTime: 3000,
          autoHide: true,
        });

        // Clear the form and go back
        setReportText('');
        setSelectedImage(null);
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Report error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Send Report',
        text2: error.message || 'Please try again later',
        visibilityTime: 3000,
        autoHide: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 1) {
    return (
      <SafeAreaViewContext
        className="flex-1 bg-white"
        edges={['top', 'left', 'right']} // ignore bottom
        style={{ paddingBottom: 0 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 60, // adjust as needed
          }}
        >
          {/* Header */}
          <View className="flex-row items-center py-4 relative">
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute p-4 z-10 flex-row items-center"
            >
              <MaterialIcons name="chevron-left" size={32} color="#2563EB" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-800 flex-1 text-center">
              Report Technical Issues
            </Text>
          </View>
        </View>

        <View className="flex-1 bg-[#FAFAFA]">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingBottom: 40,
              backgroundColor: '#FAFAFA',
            }}
            showsVerticalScrollIndicator={false}
          >

          {/* Info Box */}
          <View className="bg-blue-50 rounded-2xl p-6 mt-4 mb-4">
            <View className="flex-row items-start">
              <MaterialIcons name="info-outline" size={24} color="#2563EB" style={{ marginTop: 2, marginRight: 12 }} />
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800 mb-2">
                  Help us improve NoteSwift
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  Your feedback helps us identify and fix issues quickly. Please provide detailed information about any technical problems you&apos;re experiencing with the app.
                </Text>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800 mb-4">
              Would you like to include additional details?
            </Text>

            <Text className="text-base text-gray-600 leading-6 mb-4">
              Basic information about your account and device will be automatically included to help us understand and resolve the issue faster.
            </Text>

            <Text className="text-base text-gray-600 leading-6 mb-4">
              You can help us provide better assistance by including additional context about your learning progress, course enrollment details, and recent app activity. This information helps us identify patterns and provide more targeted solutions to improve your NoteSwift experience.
            </Text>

            <Text className="text-base text-gray-600 leading-6 mb-8">
              On the next screen, you will be able to describe the issue in detail and attach screenshots if needed.
            </Text>

            {/* Action Buttons */}
            <View className="p-5 bg-white border-t border-gray-200 mt-6">
              <Pressable
                onPress={handleNext}
                android_ripple={{ color: "#2563eb" }}
                className="bg-blue-600 py-4 rounded-3xl items-center mb-4"
              >
                <Text className="text-white text-lg font-semibold">
                  Include details and continue
                </Text>
              </Pressable>

              <Pressable
                onPress={handleNext}
                android_ripple={{ color: "#2563eb" }}
                className="bg-gray-100 py-3 rounded-3xl items-center"
              >
                <Text className="text-gray-700 text-base font-medium">
                  Continue with basic information
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        </View>
      </SafeAreaViewContext>
    );
  }

  return (
    <SafeAreaViewContext
      className="flex-1 bg-white"
      edges={['top', 'left', 'right']} // ignore bottom
      style={{ paddingBottom: 0 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60, // adjust as needed
        }}
      >
        {/* Header */}
        <View className="flex-row items-center py-4 relative">
          <TouchableOpacity
            onPress={() => setCurrentStep(1)}
            className="absolute p-4 z-10 flex-row items-center"
          >
            <MaterialIcons name="chevron-left" size={32} color="#2563EB" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-800 flex-1 text-center">
            Report Technical Issues
          </Text>
        </View>
      </View>

      <View className="flex-1 bg-[#FAFAFA]">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingBottom: 40,
              backgroundColor: '#FAFAFA',
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Description */}
            <View className="mb-6">
              <Text className="text-base text-gray-600 leading-6 mt-2 mb-2">
                Please provide as much detail as possible about the issue you&apos;re experiencing.
              </Text>
            </View>

            {/* Report Text Input */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-3">
                Describe the issue in detail
              </Text>
              <TextInput
                className={`border rounded-xl p-4 text-base min-h-[150px] text-gray-800 ${isInputFocused ? 'border-blue-500' : 'border-gray-300'}`}
                placeholder="Please provide detailed information about the issue you're experiencing..."
                value={reportText}
                onChangeText={setReportText}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                maxLength={2000}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
              <Text className="text-xs text-gray-400 mt-2 text-right">
                {reportText.length}/2000
              </Text>
            </View>

            {/* Image Attachment Section */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-3">
                Attach Screenshot (Optional)
              </Text>

              {selectedImage ? (
                <View className="relative">
                  <Image
                    source={{ uri: selectedImage }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="contain"
                  />
                  <Pressable
                    onPress={removeImage}
                    android_ripple={{ color: "#dc2626" }}
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                  >
                    <MaterialIcons name="close" size={20} color="white" />
                  </Pressable>
                </View>
              ) : (
                <View className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                  <View className="items-center">
                    <MaterialIcons name="image" size={48} color="#9CA3AF" />
                    <Text className="text-gray-500 text-center mt-2 mb-4">
                      No image selected
                    </Text>

                    <View className="flex-row space-x-3">
                      <Pressable
                        onPress={pickImage}
                        android_ripple={{ color: "#2563eb" }}
                        className="flex-row items-center bg-blue-50 px-4 py-2 mr-2 rounded-lg"
                      >
                        <MaterialIcons name="photo-library" size={20} color="#3B82F6" />
                        <Text className="ml-2 text-blue-600 font-medium">Gallery</Text>
                      </Pressable>

                      <Pressable
                        onPress={takePhoto}
                        android_ripple={{ color: "#2563eb" }}
                        className="flex-row items-center bg-gray-100 px-4 py-2 rounded-lg"
                      >
                        <MaterialIcons name="camera-alt" size={20} color="#6B7280" />
                        <Text className="ml-2 text-gray-700 font-medium">Camera</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Send Report Button */}
            <Pressable
              onPress={handleSendReport}
              disabled={isLoading}
              android_ripple={{ color: "#2563eb" }}
              className="bg-blue-600 py-4 rounded-3xl items-center mb-4"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Send Report
                </Text>
              )}
            </Pressable>

            {/* Cancel Button */}
            <Pressable
              onPress={() => router.back()}
              android_ripple={{ color: "#2563eb" }}
              className="bg-gray-100 py-3 rounded-3xl items-center"
            >
              <Text className="text-gray-700 text-base font-medium">
                Cancel
              </Text>
            </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>
    </SafeAreaViewContext>
  );
}

ReportIssuePage.displayName = 'ReportIssuePage';
export default ReportIssuePage;