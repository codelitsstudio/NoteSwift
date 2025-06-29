import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import ButtonSecondary from '../../../components/Buttons/ButtonSecondary';

export default function RegisterNumber() {
    const signup_data = useAuthStore(state => state.signup_data);
    const setSignupData = useAuthStore(state => state.setSignupData);
    const router = useRouter();

    const signUp = useAuthStore((state) => state.signUp);
    const loading = useAuthStore((state) => state.is_loading);
    const api_message = useAuthStore((state) => state.api_message);

    const phoneInput = signup_data.phone_number;
    const passwordInput = signup_data.password;

    const isValidPhone = (value: string) => /^\d{10}$/.test(value.trim());

    const handleGoBack = () => {
        router.push('/onboarding/Register/address');
    };

    const handleNext = async () => {
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

        const res = await signUp(signup_data);

        if (!res) return Alert.alert(api_message)
        router.replace("/onboarding/Register/Success")
        router.push('/onboarding/Register/Success');

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
                    onChangeText={(val) =>
                        setSignupData({
                            ...signup_data,
                            phone_number: val,
                        })
                    }
                />

                <TextInputField
                    label="Password"
                    placeholder="Enter your Password…"
                    secure
                    value={passwordInput}
                    onChangeText={(val) =>
                        setSignupData({
                            ...signup_data,
                            password: val,
                        })
                    }
                />

                <ButtonPrimary title="Next" onPress={handleNext} />
                <ButtonSecondary title="Back" onPress={handleGoBack} />
            </View>
        </View>
    );
}
