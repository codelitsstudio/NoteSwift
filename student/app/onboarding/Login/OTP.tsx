import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import OtpInput from '../../../components/InputFields/OtpInputField'; // Adjust path if needed
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import ImageHeader from '../../../components/Headers/ImageHeader'


export default function Login() {
    const [otpCode, setOtpCode] = useState('');
    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    const handleOtpComplete = (code: string) => {
        setOtpCode(code);
    };

    const handleNext = async () => {
        if (otpCode.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP.');
            return;
        }

        try {
            // assuming login expects OTP code here
            await login('', otpCode);
            Alert.alert('Success', 'Logged in successfully!');
            router.push('/'); // navigate to top page after login success
        } catch (error: any) {
            Alert.alert('Login Error', error.message);
        }
    };

    const handleGoBack = () => {
        router.navigate('/onboarding/Login/login');
    };


    return (
        <View className="flex-1 bg-white rounded-t-3xl overflow-hidden">
            <ImageHeader source={require("../../../assets/images/otp-ill.png")} />


            <View className="flex-1 bg-white px-6 pt-4">
                <Text className="text-4xl font-bold text-gray-900 text-center mt-6 mb-2">
                    OTP Verification
                </Text>
                <Text className="text-gray-500 font-bold text-center mt-4 mb-6">
                    We sent you a one time code on this email{'\n'}address
                </Text>
                {/* OTP Input */}
                <View className="items-center mt-6 mb-4">
                    <OtpInput onComplete={handleOtpComplete} />
                </View>
                <View className="flex-row p-3 mt-2">
                    <Text className="text-gray-500font-bold">
                        Didn’t receive the code?{' '}
                    </Text>
                    <TouchableOpacity>
                        <Text className="text-customBlue font-semibold">Resend</Text>
                    </TouchableOpacity>
                </View>

                <ButtonPrimary title="Submit" onPress={handleNext} />


                <ButtonSecondary title="Back" onPress={handleGoBack} />

            </View>
        </View>
    );
}
