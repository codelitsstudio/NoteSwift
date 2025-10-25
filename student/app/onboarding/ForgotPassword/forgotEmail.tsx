import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useRouter } from 'expo-router';
import { useNavStore } from '@/stores/navigationStore';
import Toast from 'react-native-toast-message';
import { sendPasswordResetOTP } from '../../../api/student/user';

const { width } = Dimensions.get('window');

// Define styles outside component to prevent re-creation
const scrollContainerStyle = {
  flexGrow: 1,
  justifyContent: 'center' as const,
  paddingBottom: 40
};

export default function ForgotEmail() {
  useEffect(() => {
    useNavStore.getState().setTab('RegisterAddress');
  }, []);

  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [isEmailFocused, setIsEmailFocused] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Memoize style calculations
  const titleTextStyle = width < 360 ? 'text-2xl' : 'text-3xl';

  const getEmailValidationMessage = (email: string) => {
    if (!email || email.trim().length === 0) {
      return "Email address is required";
    }
    if (email.length < 5) {
      return "Email address is too short";
    }
    if (!email.includes("@")) {
      return "Email must contain @ symbol";
    }
    if (!email.includes(".")) {
      return "Email must contain a domain (e.g., .com, .org)";
    }
    if (email.startsWith("@") || email.endsWith("@")) {
      return "Email cannot start or end with @";
    }
    if (email.includes("..")) {
      return "Email cannot contain consecutive dots";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email format (e.g., user@example.com)";
    }
    return null;
  };

  const handleSendOTP = async () => {
    // Enhanced email validation
    const emailError = getEmailValidationMessage(email);
    if (emailError) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Invalid Email",
        text2: emailError,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetOTP(email);

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Verification Code Sent!',
        text2: 'Check your email for the verification code',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });

      // Navigate to OTP verification page with email
      setTimeout(() => {
        router.push({
          pathname: '/onboarding/ForgotPassword/forgotOTP',
          params: { email }
        });
      }, 1000);
    } catch (error: any) {
      console.error("Forgot password OTP error:", error);

      let errorTitle = "Failed to Send Code";
      let errorMessage = "An unexpected error occurred";

      if (error.message) {
        if (error.message.includes("Network Error") || error.message.includes("timeout")) {
          errorTitle = "Connection Error";
          errorMessage = "Please check your internet connection and try again";
        } else if (error.message.includes("429")) {
          errorTitle = "Too Many Requests";
          errorMessage = "Please wait a moment before trying again";
        } else if (error.message.toLowerCase().includes("not found") || error.message.toLowerCase().includes("no account")) {
          errorTitle = "Account Not Found";
          errorMessage = "No account found with this email address";
        } else {
          errorMessage = error.message;
        }
      }

      Toast.show({
        type: "error",
        position: "top",
        text1: errorTitle,
        text2: errorMessage,
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 50,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 10}
        >
          <ScrollView
            contentContainerStyle={scrollContainerStyle}
            className="px-6 bg-white"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageHeader source={require('../../../assets/images/illl-4.png')} />

            <View className="flex-grow justify-center">
              <Text
                className={`text-center font-bold text-gray-900 mt-1 ${titleTextStyle}`}
              >
                Forgot Password
              </Text>
              <Text className="text-center text-gray-400 font-semibold text-sm mb-8 mt-2">
                Enter your email to reset your password
              </Text>

              <View className="mb-1 space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
                  <View className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-3 ${isEmailFocused ? 'border-blue-500' : 'border-gray-300'}`}>
                    <MaterialIcons name="email" size={24} color="#3B82F6" />
                    <View className="w-px h-6 bg-gray-300 mx-3" />
                    <TextInput
                      className="flex-1 text-gray-900"
                      placeholder="Enter your email address"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>
              </View>

              <ButtonPrimary
                title={isLoading ? "Sending Code..." : "Send Verification Code"}
                onPress={handleSendOTP}
                disabled={isLoading}
              />

              <View className="flex-row items-center justify-center mt-6">
                <Text className="text-sm text-gray-500 font-semibold">
                  Remember your password?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/onboarding/Login/login')}
                >
                  <Text className="text-sm text-blue-500 font-semibold">
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}