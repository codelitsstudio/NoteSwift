import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader'
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';

export default function Login() {
  const [phone, setPhone] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [phoneChecked, setPhoneChecked] = React.useState<boolean>(false);

  const login = useAuthStore((state) => state.login);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

 const router = useRouter();

  /** 10 digits  */
  const isValidPhone = (value: string) => /^\d{10}$/.test(value);

  const handleCheckPhone = () => {
    if (!isValidPhone(phone.trim())) {
      Alert.alert(
        'Invalid phone number',
        'Phone number must be exactly 10 digits and contain digits only.'
      );
      return;
    }
    setPhoneChecked(true);
  };

  const handleLogin = async () => {
    try {
      // await login(phone.trim(), password); {commented out for now}
      // Alert.alert('Success', 'Logged in successfully!');
      // navigate to otp page after login success
      router.push('./OTP');
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
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

        {/* phone input */}
        <TextInputField
          label="Phone Number"
          placeholder="Enter your Phone Number…"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
        />

        {/* password input appears only after phone passes validation */}
        {phoneChecked && (
          <TextInputField
            label="Password"
            placeholder="Enter your Password…"
            secure
            value={password}
            onChangeText={setPassword}
          />
        )}

        {/* Primary button */}
        <ButtonPrimary
          title={phoneChecked ? (isLoggedIn ? 'Logged In' : 'Next') : 'Check'}
          onPress={phoneChecked ? handleLogin : handleCheckPhone}
        />

        {/* Footer */}
        <View className="items-center mt-4">
          <TouchableOpacity className="w-16 h-16 bg-white shadow-lg rounded-full items-center justify-center mb-4">
            <Image
              source={require('../../../assets/images/logo.png')}
              className="w-18 h-18"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View className="flex-row mt-4">
            <Text className="text-gray-500 font-bold">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity>
              <Text className="text-customBlue font-semibold">Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}