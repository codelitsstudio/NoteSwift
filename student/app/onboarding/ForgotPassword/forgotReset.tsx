import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useNavStore } from '@/stores/navigationStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { resetPasswordWithResetOTP } from '../../../api/student/user';

export default function ForgotReset() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const otpCode = params.otp as string;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add focus states for input fields
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  useEffect(() => {
    useNavStore.getState().setTab('Register');
  }, []);

  const getStrengthLevel = (pass: string) => {
    if (pass.length === 0) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/.test(pass)) score++;
    if (/(?=.*[\W_])/.test(pass)) score++;
    return Math.min(score, 3);
  };

  const strengthLevel = getStrengthLevel(password);
  const strengthColors = ['#E5E7EB', '#EF4444', '#F59E0B', '#10B981'];

  const getPasswordValidationMessage = (pass: string, confirmPass: string) => {
    if (!pass || pass.length === 0) {
      return "Password is required";
    }
    if (pass.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (pass.length > 50) {
      return "Password is too long (maximum 50 characters)";
    }
    if (!confirmPass || confirmPass.length === 0) {
      return "Please confirm your password";
    }
    if (pass !== confirmPass) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleResetPassword = async () => {
    // Enhanced password validation
    const passwordError = getPasswordValidationMessage(password, confirmPassword);
    if (passwordError) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Invalid Password",
        text2: passwordError,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    if (strengthLevel < 2) {
      Toast.show({
        type: 'error',
        position: "top",
        text1: 'Weak Password',
        text2: 'Password should contain uppercase, lowercase, and numbers for better security.',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordWithResetOTP(email, otpCode, password);

      Toast.show({
        type: 'success',
        position: "top",
        text1: 'Password Reset Successful!',
        text2: 'Your password has been updated and all other devices have been logged out for security. Please login with your new password.',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });

      // Navigate back to login page
      setTimeout(() => {
        router.replace('/onboarding/Login/login');
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);

      let errorTitle = "Reset Failed";
      let errorMessage = "Failed to reset your password";

      if (error.message) {
        if (error.message.includes("invalid")) {
          errorTitle = "Invalid Request";
          errorMessage = "The reset request is invalid or expired";
        } else if (error.message.includes("expired")) {
          errorTitle = "Request Expired";
          errorMessage = "The password reset request has expired";
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 10}
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
            <ImageHeader source={require('../../../assets/images/illl-6.png')} />

            <View className="flex-1 justify-center items-center w-full">
              {/* Header */}
              <Text className="text-2xl font-bold text-center text-gray-800 mt-0.5">
                Reset Your Password
              </Text>
              <Text className="text-sm text-gray-500 text-center font-semibold mt-1 mb-8">
                Create a new strong password for your account
              </Text>

              {/* Password Input */}
              <View className="mb-4 w-full">
                <Text className="text-sm font-semibold mb-1 text-gray-600">New Password</Text>
                <View className={`flex-row items-center border rounded-2xl px-4 ${isPasswordFocused || password.length > 0 ? 'border-blue-500' : 'border-gray-300'}`}>
                  <TextInput
                    style={{ flex: 1, height: 50, color: '#000' }}
                    placeholder="Enter new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                    <MaterialIcons
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={22}
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                </View>

                {/* Strength bar */}
                <View className="mt-2 w-full">
                  <View style={{ flexDirection: 'row', height: 6, borderRadius: 8, overflow: 'hidden' }}>
                    {[1, 2, 3].map(i => (
                      <View
                        key={i}
                        style={{
                          flex: 1,
                          marginRight: i < 3 ? 6 : 0,
                          backgroundColor: i <= strengthLevel ? strengthColors[strengthLevel] : '#E5E7EB',
                          borderRadius: 6,
                        }}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-6 w-full">
                <Text className="text-sm font-semibold mb-1 text-gray-600">Confirm New Password</Text>
                <View className={`flex-row items-center border rounded-2xl px-4 ${isConfirmFocused || confirmPassword.length > 0 ? 'border-blue-500' : 'border-gray-300'}`}>
                  <TextInput
                    style={{ flex: 1, height: 50, color: '#000' }}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setIsConfirmFocused(true)}
                    onBlur={() => setIsConfirmFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                    <MaterialIcons
                      name={showConfirm ? 'visibility-off' : 'visibility'}
                      size={22}
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reset Button */}
              <ButtonPrimary
                title={isLoading ? 'Resetting...' : 'Reset Password'}
                onPress={handleResetPassword}
                disabled={isLoading}
              />

              {/* Go Back */}
              <View className="flex-row items-center justify-center mt-4">
                <Text className="text-sm text-gray-500 font-semibold">Need to go back? </Text>
                <TouchableOpacity onPress={() => router.back()}>
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