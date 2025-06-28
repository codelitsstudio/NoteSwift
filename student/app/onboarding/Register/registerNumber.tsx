import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import ButtonSecondary from '../../../components/Buttons/ButtonSecondary';

export default function Login() {
  const phoneInput = useAuthStore(state => state.phoneInput);
  const setPhoneInput = useAuthStore(state => state.setPhoneInput);

  const passwordInput = useAuthStore(state => state.passwordInput);
  const setPasswordInput = useAuthStore(state => state.setPasswordInput);

  const login = useAuthStore(state => state.login);
  const router = useRouter();

  const isValidPhone = (value: string) => /^\d{10}$/.test(value.trim());
  
  const handleGoBack = () => {
    router.push('/onboarding/Register/address');
  };
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
      <ImageHeader source={require("../../../assets/images/illl-4.png")} />

      <View className="flex-1 bg-white px-6">
        <Text className="text-3xl font-bold text-gray-900 text-center mt-1">
          Register
        </Text>
        <Text className="text-gray-500 font-bold text-center mb-6 mt-5">
         Please Enter Your Credentials To Register
        </Text>

       
        <TextInputField
          label="Phone Number"
          placeholder="Enter your Phone Number…"
          keyboardType="number-pad"
          maxLength={10}
          value={phoneInput}
          onChangeText={setPhoneInput}
        />

    
        <TextInputField
          label="Password"
          placeholder="Enter your Password…"
          secure
          value={passwordInput}
          onChangeText={setPasswordInput}
        />

     
        <ButtonPrimary title="Next" onPress={handleLogin} />
 <ButtonSecondary title="Back" onPress={handleGoBack} />
    
      </View>
    </View>
  );
}
