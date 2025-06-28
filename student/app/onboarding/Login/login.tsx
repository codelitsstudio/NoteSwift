import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';

export default function Login() {
  const phoneInput = useAuthStore(state => state.phoneInput);
  const setPhoneInput = useAuthStore(state => state.setPhoneInput);

  const passwordInput = useAuthStore(state => state.passwordInput);
  const setPasswordInput = useAuthStore(state => state.setPasswordInput);

  const login = useAuthStore(state => state.login);
  const router = useRouter();

  const isValidPhone = (value: string) => /^\d{10}$/.test(value.trim());

  const handleLogin = async () => {
    if (!isValidPhone(phoneInput)) {
      Alert.alert(
        'Invalid phone number',
        'Phone number must be exactly 10 digits and contain digits only.'
      );
      return;
    }

    if (!passwordInput || passwordInput.length < 4) {
      Alert.alert('Invalid Password', 'Password must be at least 4 characters long.');
      return;
    }

    try {
      // await login(phoneInput.trim(), passwordInput);
      // Alert.alert('Success', 'Logged in successfully!');
      router.push('./OTP');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Something went wrong');
    }
  };

  return (
    <View className="flex-1 bg-white rounded-t-3xl overflow-hidden">
      <ImageHeader source={require("../../../assets/images/illl-1.png")} />

      <View className="flex-1 bg-white px-6 pt-4">
        <Text className="text-3xl font-bold text-gray-900 text-center mt-1">
          Login
        </Text>
        <Text className="text-gray-500 font-bold text-center mb-6 mt-5">
          Please Sign In To Continue
        </Text>

        {/* Phone Input */}
        <TextInputField
          label="Phone Number"
          placeholder="Enter your Phone Number…"
          keyboardType="number-pad"
          maxLength={10}
          value={phoneInput}
          onChangeText={setPhoneInput}
        />

        {/* Password Input (Always Visible Now) */}
        <TextInputField
          label="Password"
          placeholder="Enter your Password…"
          secure
          value={passwordInput}
          onChangeText={setPasswordInput}
        />

        {/* Primary Button */}
        <ButtonPrimary title="Login" onPress={handleLogin} />

        {/* Footer */}
        <View className="items-center mt-4">
          <TouchableOpacity className="w-16 h-16 bg-white shadow-lg rounded-full items-center justify-center mb-4">
            <Image
              source={require('../../../assets/images/logo.png')}
              className="w-14 h-14"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View className="flex-row mt-4">
            <Text className="text-gray-500 font-bold">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/onboarding/Register/register')}>
  <Text className="text-customBlue font-semibold">Create</Text>
</TouchableOpacity>

          </View>
        </View>
      </View>
    </View>
  );
}
