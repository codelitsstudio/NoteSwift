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
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ImageHeader from '@/components/Headers/ImageHeader';
import { useAuthStore } from '@/stores/authStore';
import { useNavStore } from '@/stores/navigationStore';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function PasswordPage() {
  const router = useRouter();
  const signup_data = useAuthStore(state => state.signup_data);
  const signUp = useAuthStore(state => state.signUp);
  const clearSignupData = useAuthStore(state => state.clearSignupData);
  const api_message = useAuthStore(state => state.api_message);
  const is_loading = useAuthStore(state => state.is_loading);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleConfirm = async () => {
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

    // Save password to signup data and show success toast
    const dataWithPassword = { ...signup_data, password };
    useAuthStore.getState().setSignupData(dataWithPassword);
    
    Toast.show({
      type: 'success',
      position: "top",
      text1: 'Password Saved!',
      text2: 'Your password has been saved securely.',
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 50,
    });

    // Navigate to onboarding page for final registration step
    setTimeout(() => {
      router.replace('/onboarding/Login/OnboardingPage');
    }, 1500);
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
            <ImageHeader source={require('../../../assets/images/illl-6.png')} />

            <View className="flex-1 justify-center items-center w-full">
              {/* Header */}
              <Text className="text-2xl font-bold text-center text-gray-800 mt-0.5">
                Set Your Password
              </Text>
              <Text className="text-sm text-gray-500 text-center font-semibold mt-1 mb-8">
                Create a strong password for your account
              </Text>

              {/* Password Input */}
              <View className="mb-4 w-full">
                <Text className="text-sm font-semibold mb-1 text-gray-600">Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-2xl px-4">
                  <TextInput
                    style={{ flex: 1, height: 50, color: '#000' }}
                    placeholder="Enter password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
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
                <Text className="text-sm font-semibold mb-1 text-gray-600">Confirm Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-2xl px-4">
                  <TextInput
                    style={{ flex: 1, height: 50, color: '#000' }}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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

              {/* Confirm Button */}
              <ButtonPrimary
                title={is_loading ? 'Registering...' : 'Confirm'}
                onPress={handleConfirm}
                disabled={is_loading}
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
