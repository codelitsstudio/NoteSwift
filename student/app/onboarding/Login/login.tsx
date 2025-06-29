import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { KeyboardAvoidingScrollView } from '@/components/Container/KeyboardAvoidingScrollView';

export default function Login() {
    const loginData = useAuthStore(state => state.login_data);
    const setLoginData = useAuthStore(state => state.setLoginData)
    const isLoading = useAuthStore(state => state.is_loading);
    const clearLoginData = useAuthStore(state=>state.clearLoginData);
    const api_message = useAuthStore(state => state.api_message);
    const login = useAuthStore(state => state.login);
    const router = useRouter();
    useFocusEffect(
        useCallback(() => {
            return () => {
                clearLoginData();
            };
        }, [])
    );
    const isValidPhone = (value: string) => /^\d{10}$/.test(value.trim());

    const handleLogin = async () => {
        if (!isValidPhone(loginData.phone_number)) {
            Alert.alert(
                'Invalid phone number',
                'Phone number must be exactly 10 digits and contain digits only.'
            );
            return;
        }

        if (!loginData.password || loginData.password.length < 4) {
            Alert.alert('Invalid Password', 'Password must be at least 4 characters long.');
            return;
        }


        const res = await login(loginData.phone_number, loginData.password);
        if (!res) return Alert.alert(api_message);
        Alert.alert(api_message)
        router.push('./OTP');
    };

    return (

            <KeyboardAvoidingView  keyboardVerticalOffset={80} behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-white rounded-t-3xl">
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                <ImageHeader source={require("../../../assets/images/illl-1.png")} />
                <View className="flex-1 bg-white px-6">
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
                        value={loginData.phone_number}
                        onChangeText={(text) => setLoginData({ ...loginData, phone_number: text })}
                    />

                    <TextInputField
                        label="Password"
                        placeholder="Enter your Password…"
                        secure
                        value={loginData.password}
                        onChangeText={(text) => setLoginData({ ...loginData, password: text })}
                    />

                    {/* Primary Button */}
                    <ButtonPrimary title="Login" onPress={handleLogin} />

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
                            <TouchableOpacity onPress={() => router.push('/onboarding/Register/register')}>
                                <Text className="text-customBlue font-semibold">Create</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
                </ScrollView>
            </KeyboardAvoidingView>

    );
}
