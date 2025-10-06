import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ImageHeader from '@/components/Headers/ImageHeader';
import { useAuthStore } from '@/stores/authStore';
import Toast from 'react-native-toast-message';

export default function ReportIssuePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [reportText, setReportText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        aspect: [4, 3],
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
        aspect: [4, 3],
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
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 40,
            backgroundColor: 'white',
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Header */}
          <ImageHeader source={require('../../../assets/images/otp-ill.png')} />

          <View className="flex-1 justify-center">
            <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
              Report an Issue
            </Text>

            <View className="bg-gray-50 rounded-2xl p-6 mb-8">
              <Text className="text-base text-gray-700 leading-6 mb-4">
                Help us improve NoteSwift by reporting any bugs, issues, or suggestions you encounter while using the app.
              </Text>

              <Text className="text-base text-gray-700 leading-6 mb-4">
                Your feedback is valuable to us! Please provide as much detail as possible about the issue, including:
              </Text>

              <View className="ml-4">
                <Text className="text-sm text-gray-600 mb-2">• What were you trying to do?</Text>
                <Text className="text-sm text-gray-600 mb-2">• What happened instead?</Text>
                <Text className="text-sm text-gray-600 mb-2">• Steps to reproduce the issue</Text>
                <Text className="text-sm text-gray-600 mb-2">• Screenshots (if applicable)</Text>
              </View>

              <Text className="text-sm text-gray-500 mt-4 italic">
                All reports are sent securely and reviewed by our development team.
              </Text>
            </View>

            <ButtonPrimary
              title="Continue"
              onPress={handleNext}
            />

            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-4 p-3"
            >
              <Text className="text-center text-gray-500 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 40,
            backgroundColor: 'white',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button */}
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity
              onPress={() => setCurrentStep(1)}
              className="flex-row items-center"
            >
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
              <Text className="ml-2 text-gray-700 font-medium">Back</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">Report Issue</Text>
            <View className="w-16" />
          </View>

          <View className="flex-1">
            {/* Report Text Input */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-3">
                Describe the issue in detail
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base min-h-[150px] text-gray-800"
                placeholder="Please provide detailed information about the issue you're experiencing..."
                value={reportText}
                onChangeText={setReportText}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                maxLength={2000}
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
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={removeImage}
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                  >
                    <MaterialIcons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                  <View className="items-center">
                    <MaterialIcons name="image" size={48} color="#9CA3AF" />
                    <Text className="text-gray-500 text-center mt-2 mb-4">
                      No image selected
                    </Text>

                    <View className="flex-row space-x-3">
                      <TouchableOpacity
                        onPress={pickImage}
                        className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
                      >
                        <MaterialIcons name="photo-library" size={20} color="#3B82F6" />
                        <Text className="ml-2 text-blue-600 font-medium">Gallery</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={takePhoto}
                        className="flex-row items-center bg-green-50 px-4 py-2 rounded-lg"
                      >
                        <MaterialIcons name="camera-alt" size={20} color="#10B981" />
                        <Text className="ml-2 text-green-600 font-medium">Camera</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Send Report Button */}
            <ButtonPrimary
              title={isLoading ? 'Sending...' : 'Send Report'}
              onPress={handleSendReport}
              disabled={isLoading}
            />

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-4 p-3"
            >
              <Text className="text-center text-gray-500 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}