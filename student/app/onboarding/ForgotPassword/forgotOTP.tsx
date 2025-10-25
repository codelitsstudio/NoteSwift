import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  StatusBar,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ButtonSecondary from '../../../components/Buttons/ButtonSecondary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useNavStore } from '@/stores/navigationStore';
import Toast from 'react-native-toast-message';
import { verifyPasswordResetOTP } from '../../../api/student/user';

export default function ForgotOTP() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const cursorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    useNavStore.getState().setTab('Register');
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [cursorAnim]);

  const handleChange = (text: string, index: number) => {
    if (/^[0-9]$/.test(text) || text === '') {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text !== '' && index < 3) {
        inputs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handleFocus = (index: number) => setActiveIndex(index);

  const handleConfirm = async () => {
    const code = otp.join('');
    if (code.length !== 4) {
      return Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all the fields',
      });
    }

    if (!/^\d{4}$/.test(code)) {
      return Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid verification code',
      });
    }

    setIsLoading(true);
    try {
      await verifyPasswordResetOTP(email, code);

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Code Verified!',
        text2: 'Please set your new password.',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 50,
      });

      // Navigate to password reset page with email
      setTimeout(() => {
        router.push({
          pathname: '/onboarding/ForgotPassword/forgotReset',
          params: { email, otp: code }
        });
      }, 1000);
    } catch (error: any) {
      console.error("Forgot password OTP verification error:", error);

      let errorTitle = "Invalid Code";
      let errorMessage = "Please enter the correct verification code";

      if (error.message) {
        if (error.message.includes("expired")) {
          errorTitle = "Code Expired";
          errorMessage = "The verification code has expired. Please request a new one.";
        } else if (error.message.includes("invalid")) {
          errorTitle = "Invalid Code";
          errorMessage = "The verification code is incorrect. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }

      Toast.show({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // Note: We need to implement resend functionality
      // For now, we'll just show a message
      Toast.show({
        type: 'info',
        text1: 'Resend Feature',
        text2: 'Please go back and request a new code',
        visibilityTime: 3000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to resend code',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingBottom: 40,
              backgroundColor: 'white',
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Image Header */}
            <ImageHeader source={require('../../../assets/images/otp-ill.png')} />

            <View className="flex-1 justify-center items-center">
              <Text className="text-2xl font-bold text-center text-gray-800 mt-0.5">
                Verification Code
              </Text>
              <Text className="text-sm text-gray-500 text-center font-semibold mt-1 mb-8">
                We have sent the verification code to your email
              </Text>

              {/* OTP Inputs */}
              <View className="flex-row justify-between w-full mb-4 px-1">
                {otp.map((digit, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={1}
                    onPress={() => inputs.current[index]?.focus()}
                    className="w-16 h-16 border rounded-2xl items-center justify-center border-gray-300"
                  >
                    <Text className="text-3xl font-bold text-customBlue">{digit}</Text>
                    {activeIndex === index && !digit && (
                      <Animated.View
                        style={{
                          position: 'absolute',
                          width: 2,
                          height: '60%',
                          backgroundColor: '#3B82F6',
                          opacity: cursorAnim,
                        }}
                      />
                    )}
                    <TextInput
                      ref={(el) => { inputs.current[index] = el; }}
                      style={{ position: 'absolute', opacity: 0 }}
                      keyboardType="number-pad"
                      maxLength={1}
                      autoFocus={index === 0}
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                      onFocus={() => handleFocus(index)}
                      onChangeText={text => handleChange(text, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Confirm Button */}
              <ButtonPrimary
                title={isLoading ? 'Verifying...' : 'Confirm'}
                onPress={handleConfirm}
                disabled={isLoading}
              />
              <ButtonSecondary title="Resend Code" onPress={handleResendCode} />

              {/* Back to email input */}
              <View className="flex-row items-center justify-center mt-2">
                <Text className="text-sm text-gray-500 font-semibold">
                  Need to change the email?{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    useNavStore.getState().setBackNavigation(true);
                    router.back();
                  }}
                >
                  <Text className="text-sm text-blue-500 font-semibold">Go Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}