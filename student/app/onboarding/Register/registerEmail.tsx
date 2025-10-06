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
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import { useNavStore } from '@/stores/navigationStore';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// Define styles outside component to prevent re-creation
const scrollContainerStyle = { 
  flexGrow: 1, 
  justifyContent: 'center' as const, 
  paddingBottom: 40 
};

export default function RegisterEmail() {
  useEffect(() => {
    useNavStore.getState().setTab('RegisterAddress');
  }, []);

  // Optimize store subscriptions - only subscribe to what we need
  const signup_data = useAuthStore(state => state.signup_data);
  const setSignupData = useAuthStore(state => state.setSignupData);
  const sendEmailRegistrationOTP = useAuthStore(state => state.sendEmailRegistrationOTP);
  const is_loading = useAuthStore(state => state.is_loading);
  const api_message = useAuthStore(state => state.api_message);
  const router = useRouter();

  const emailInput = signup_data.email || '';

  // Add focus state for email input
  const [isEmailFocused, setIsEmailFocused] = React.useState(false);

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

  const handleNext = async () => {
    // Enhanced email validation
    const emailError = getEmailValidationMessage(emailInput);
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

    try {
      // Send OTP using Resend
      const success = await sendEmailRegistrationOTP(emailInput);
      if (!success) {
        // Get specific error message from the API
        let errorTitle = "Registration Failed";
        let errorMessage = api_message || "Failed to send verification email";

        // Parse common error scenarios for better user experience
        if (api_message) {
          if (api_message.toLowerCase().includes("email address already registered") || api_message.toLowerCase().includes("already exists")) {
            errorTitle = "Email Already Registered";
            errorMessage = "This email is already registered. Please use a different email or try logging in.";
          } else if (api_message.toLowerCase().includes("email address is required")) {
            errorTitle = "Email Required";
            errorMessage = "Please enter your email address to continue.";
          } else if (api_message.toLowerCase().includes("invalid email format")) {
            errorTitle = "Invalid Email Format";
            errorMessage = "Please enter a valid email address (e.g., user@example.com).";
          } else if (api_message.toLowerCase().includes("network") || api_message.toLowerCase().includes("connection")) {
            errorTitle = "Connection Error";
            errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
          } else if (api_message.toLowerCase().includes("server") || api_message.toLowerCase().includes("500")) {
            errorTitle = "Server Error";
            errorMessage = "Our servers are experiencing issues. Please try again in a few moments.";
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
        return;
      }

      // Only show success if email was actually sent
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Verification Email Sent!',
        text2: 'Check your email for verification code',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });

      // Navigate to email verification page
      setTimeout(() => {
        router.push('/onboarding/Register/emailVerify');
      }, 1000);
    } catch (error: any) {
      console.error("Email registration error:", error);
      
      let errorTitle = "Registration Failed";
      let errorMessage = "An unexpected error occurred";

      if (error.message) {
        if (error.message.includes("Network Error") || error.message.includes("timeout")) {
          errorTitle = "Connection Error";
          errorMessage = "Please check your internet connection and try again";
        } else if (error.message.includes("429")) {
          errorTitle = "Too Many Requests";
          errorMessage = "Please wait a moment before trying again";
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
                Register
              </Text>
              <Text className="text-center text-gray-400 font-semibold text-sm mb-8 mt-2">
                Please Enter Your Email To Register
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
                      value={emailInput}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      onChangeText={(val: string) =>
                        setSignupData({
                          ...signup_data,
                          email: val,
                        })
                      }
                    />
                  </View>
                </View>

                {/* Commented Phone Number Section */}
                {/* 
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3">
                    <Text className="text-2xl mr-2">🇳🇵</Text>
                    <Text className="text-gray-900 font-medium mr-2">+977</Text>
                    <View className="w-px h-6 bg-gray-300 mr-3" />
                    <TextInput
                      className="flex-1 text-gray-900"
                      placeholder="Enter your phone number"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phoneInput}
                      onChangeText={(val: string) =>
                        setSignupData({
                          ...signup_data,
                          phone_number: val,
                        })
                      }
                    />
                  </View>
                </View>
                */}
              </View>

              <ButtonPrimary 
                title={is_loading ? "Sending Verification Email..." : "Send Verification Email"} 
                onPress={handleNext}
                disabled={is_loading}
              />
   
       <View className="flex-row items-center justify-center mt-6">
                  <Text className="text-sm text-gray-500 font-semibold">
                     Already have an account?{' '}
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
