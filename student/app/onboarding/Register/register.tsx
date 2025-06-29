import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import { BottomSheetPicker } from '../../../components/Picker/BottomSheetPicker';

export default function Register() {
    const signup_data = useAuthStore(state => state.signup_data);
    const setSignupData = useAuthStore(state => state.setSignupData);

    const router = useRouter();

    const fullName = signup_data.full_name;
    const selectedGrade = signup_data.grade;

    const grades = Array.from({ length: 12 }, (_, i) => ({
        label: `Grade ${i + 1}`,
        value: i + 1,
    }));

    const isValidName = (name: string) => name.trim().length > 0;

    const handleRegister = async () => {
        if (!isValidName(fullName)) {
            Alert.alert('Invalid Name', 'Please enter your full name.');
            return;
        }

        if (!selectedGrade) {
            Alert.alert('Select Grade', 'Please select your grade.');
            return;
        }

        try {
            router.push('./address');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong');
        }
    };

    return (
        <View className="flex-1 bg-white rounded-t-3xl overflow-hidden">
            <ImageHeader source={require('../../../assets/images/illl-2.png')} />

            <View className="flex-1 bg-white px-6 pt-2">
                <Text className="text-3xl font-bold text-gray-900 text-center mt-0">
                    Register
                </Text>
                <Text className="text-gray-500 font-bold text-center mb-6 mt-5">
                    Please Enter Your Credentials To Register
                </Text>

                {/* Full Name Input */}
                <TextInputField
                    label="Full Name"
                    placeholder="Enter your full name…"
                    value={fullName}
                    onChangeText={(val) =>
                        setSignupData({
                            ...signup_data,
                            full_name: val,
                        })
                    }
                />

                {/* Grade Picker */}
                <BottomSheetPicker
                    data={grades.map(x => ({ label: x.label, value: x.value + "" }))}
                    label="Select Grade"
                    selectedValue={selectedGrade===0?null:(selectedGrade + "")}
                    onChange={(val) =>
                        setSignupData({
                            ...signup_data,
                            grade: +val,
                        })
                    }
                    placeholder="Select your grade"
                />

                {/* Primary Button */}
                <ButtonPrimary title="Next" onPress={handleRegister}/>

                {/* Footer */}
                <View className="items-center mt-4">
                    <TouchableOpacity className="w-16 h-16 bg-white shadow-lg rounded-full items-center justify-center mb-4">
                        <Image
                            source={require('../../../assets/images/logo.png')}
                            className="w-24 h-24"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    <View className="flex-row mt-4">
                        <Text className="text-gray-500 font-bold">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/onboarding/Login/login')}>
                            <Text className="text-customBlue font-semibold">Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
