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
  const selectedProvince = useAuthStore(state => state.selectedProvince);
  const setSelectedProvince = useAuthStore(state => state.setSelectedProvince);

  const selectedDistrict = useAuthStore(state => state.selectedDistrict);
  const setSelectedDistrict = useAuthStore(state => state.setSelectedDistrict);

  const selectedInstitution = useAuthStore(state => state.selectedInstitution);
  const setSelectedInstitution = useAuthStore(state => state.setSelectedInstitution);

  const router = useRouter();

  const districts = selectedProvince ? nepalData.districts[selectedProvince] || [] : [];

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
          onChange={value => {
            setSelectedProvince(value);
            setSelectedDistrict(null);
            setSelectedInstitution('');
          }}
          placeholder="Select your province"
        />

        {/* District Picker */}
        <BottomSheetPicker
          data={districts}
          label="Select District"
          selectedValue={selectedDistrict}
          onChange={value => {
            setSelectedDistrict(value);
            setSelectedInstitution('');
          }}
          placeholder={selectedProvince ? 'Select your district' : 'Select province first'}
          disabled={!selectedProvince}
        />

  <TextInputField
  label="Institution"
  placeholder="Enter Your Institution Name…"
  value={selectedInstitution || ''}
  onChangeText={setSelectedInstitution}
/>


        <ButtonPrimary title="Next" onPress={handleNext} />
        <ButtonSecondary title="Back" onPress={handleGoBack} />
      </View>
    </View>
  );
}
