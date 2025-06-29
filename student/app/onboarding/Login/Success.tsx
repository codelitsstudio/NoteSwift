// screens/OTP.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import ImageHeader from '../../../components/Headers/ImageHeader';

export default function OTP() {
  const [otpCode, setOtpCode] = useState('');
  const login = useAuthStore(s => s.login);
  const router = useRouter();
  
  const handleContinue = async () => {
    try {
      // await login(phone.trim(), password); {commented out for now}
      // Alert.alert('Success', 'Logged in successfully!');
      // navigate to otp page after login success
      router.push('/Home/HomePage');
    } catch (error: any) {
      Alert.alert('Onboarding Error', error.message);
    }
  };

  const handleGoBack = () => {
   router.navigate('/onboarding/Login/login'); // you have to change it as you copy this file in different pages
  };

  return (
    <View className="flex-1 bg-white rounded-t-3xl overflow-hidden">
  <View style={{ marginTop: 100 }}>
  <ImageHeader source={require("../../../assets/images/success.png")} 
   style={{ width: 320, height: 320, resizeMode: "contain" }}/>
</View>


      <Text className="text-4xl font-bold text-gray-900 text-center mt-1 mb-2">
      Success
      </Text>

      <View className="flex-1 bg-white px-6 pt-4">
        <Text className="text-gray-500 font-medium text-center mt-4 mb-6">
Your Phone Number has been verified. You{'\n'} have successfully logged in.        </Text>

        <ButtonPrimary title="Continue" onPress={handleContinue} />

       
        <ButtonSecondary title="Back" onPress={handleGoBack} />
      </View>
    </View>
  );
}
