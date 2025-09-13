import React, { useEffect } from 'react';
import {
  View,
  Text,
  Alert,
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
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ButtonSecondary from '../../../components/Buttons/ButtonSecondary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import { useNavStore } from '@/stores/navigationStore';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function RegisterNumber() {
  useEffect(() => {
    useNavStore.getState().setTab('RegisterAddress');
  }, []);

  const signup_data = useAuthStore(state => state.signup_data);
  const setSignupData = useAuthStore(state => state.setSignupData);
  const clearSignupData = useAuthStore(state => state.clearSignupData);
  const sendEmailRegistrationOTP = useAuthStore(state => state.sendEmailRegistrationOTP);
  const is_loading = useAuthStore(state => state.is_loading);
  const api_message = useAuthStore(state => state.api_message);
  const router = useRouter();

  // const phoneInput = signup_data.phone_number;
  const emailInput = signup_data.email || '';

  const isValidEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  };

  const handleGoBack = () => {
    router.push('/onboarding/Register/address');
  };

  const handleNext = async () => {
    if (!isValidEmail(emailInput)) {
      return Alert.alert(
        'Invalid email address',
        'Please enter a valid email address.'
      );
    }

    // Send OTP using Resend
    const success = await sendEmailRegistrationOTP(emailInput);
    if (success) {
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
      router.push('/onboarding/Register/emailVerify' as any);
    } else {
      Alert.alert('Error', api_message || 'Failed to send verification email. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
            className="px-6 bg-white"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageHeader source={require('../../../assets/images/illl-4.png')} />

            <View className="flex-grow justify-center">
              <Text
                className={`text-center font-bold text-gray-900 mt-1 ${
                  width < 360 ? 'text-2xl' : 'text-3xl'
                }`}
              >
                Register
              </Text>
              <Text className="text-center text-gray-400 font-semibold text-sm mb-8 mt-2">
                Please Enter Your Email To Register
              </Text>

              <View className="mb-1 space-y-4">
                {/* Commented Phone Number Section - Using Email Registration Instead */}
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

                {/* Email Registration Section */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3">
                    <Text className="text-2xl mr-3">📧</Text>
                    <TextInput
                      className="flex-1 text-gray-900"
                      placeholder="Enter your email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={signup_data.email || ''}
                      onChangeText={(val: string) =>
                        setSignupData({
                          ...signup_data,
                          email: val,
                        })
                      }
                    />
                  </View>
                </View>
              </View>

              <ButtonPrimary 
                title={is_loading ? "Sending Verification Email..." : "Send Verification Email"} 
                onPress={handleNext}
                disabled={is_loading}
              />
       <View className="flex-row items-center justify-center mt-6">
        <Text className="text-sm text-gray-500 font-semibold">
         Need to fix something?{' '}
        </Text>
        <TouchableOpacity
          onPress={() => {
            useNavStore.getState().setTab("Login");
            router.back();
          }}
        >
          <Text className="text-sm text-blue-500 font-semibold">
            Go Back
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
