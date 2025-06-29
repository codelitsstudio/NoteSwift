import React from 'react';
import { View, Text, Alert } from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ButtonSecondary from '../../../components/Buttons/ButtonSecondary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import { BottomSheetPicker } from '../../../components/Picker/BottomSheetPicker';
import nepalData from '../../../data/nepalLocationData.json';

export default function LocationSelector() {
    const signup_data = useAuthStore(state => state.signup_data);
    const setSignupData = useAuthStore(state => state.setSignupData);

    const router = useRouter();

    const selectedProvince = signup_data.address.province;
    const selectedDistrict = signup_data.address.district;
    const selectedInstitution = signup_data.address.institution;

    const districts = selectedProvince ? (nepalData as any).districts[selectedProvince] || [] : [];

    const handleProvinceChange = (province: string) => {
        setSignupData({
            ...signup_data,
            address: {
                province,
                district: undefined,
                institution: ''
            }
        });
    };

    const handleDistrictChange = (district: string) => {
        setSignupData({
            ...signup_data,
            address: {
                ...signup_data.address,
                district,
                institution: ''
            }
        });
    };

    const handleInstitutionChange = (institution: string) => {
        setSignupData({
            ...signup_data,
            address: {
                ...signup_data.address,
                institution
            }
        });
    };

    const handleGoBack = () => {
        router.push('/onboarding/Register/register');
    };

    const handleNext = () => {
        if (!selectedProvince) {
            Alert.alert('Select Province', 'Please select your province.');
            return;
        }
        if (!selectedDistrict) {
            Alert.alert('Select District', 'Please select your district.');
            return;
        }
        if (!selectedInstitution || selectedInstitution.trim() === '') {
            Alert.alert('Enter Institution', 'Please enter your institution name.');
            return;
        }

        router.push('/onboarding/Register/registerNumber');
    };

    return (
        <View className="flex-1 bg-white rounded-t-3xl overflow-hidden">
            <ImageHeader source={require('../../../assets/images/illl-3.png')} />

            <View className="flex-1 bg-white px-6 pt-0">
                <Text className="text-3xl font-bold text-gray-900 text-center mt-0">Register</Text>
                <Text className="text-gray-500 font-bold text-center mb-6 mt-5">
                    Please Enter Your Address
                </Text>

                {/* Province Picker */}
                <BottomSheetPicker
                    data={nepalData.provinces}
                    label="Select Province"
                    selectedValue={selectedProvince}
                    onChange={handleProvinceChange}
                    placeholder="Select your province"
                />

                {/* District Picker */}
                <BottomSheetPicker
                    data={districts}
                    label="Select District"
                    selectedValue={selectedDistrict}
                    onChange={handleDistrictChange}
                    placeholder={selectedProvince ? 'Select your district' : 'Select province first'}
                    disabled={!selectedProvince}
                />

                {/* Institution Input */}
                <TextInputField
                    label="Institution"
                    placeholder="Enter Your Institution Name…"
                    value={selectedInstitution || ''}
                    onChangeText={handleInstitutionChange}
                />

                <ButtonPrimary title="Next" onPress={handleNext} />
                <ButtonSecondary title="Back" onPress={handleGoBack} />
            </View>
        </View>
    );
}
