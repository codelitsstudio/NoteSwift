import React, { useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ButtonSecondary from '../../../components/Buttons/ButtonSecondary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import { BottomSheetPicker } from '../../../components/Picker/BottomSheetPicker';
import nepalData from '../../../data/nepalLocationData.json';
import { useNavStore } from '@/stores/navigationStore';

const { width } = Dimensions.get('window');


useEffect(() => {
  useNavStore.getState().setTab("RegisterAddress"); // ✅ THIS IS THE FIXED WAY
}, []);
export default function LocationSelector() {
  const signup_data = useAuthStore(state => state.signup_data);
  const setSignupData = useAuthStore(state => state.setSignupData);

  const router = useRouter();

  const selectedProvince = signup_data.address?.province;
  const selectedDistrict = signup_data.address?.district;
  const selectedInstitution = signup_data.address?.institution;

  const districts = selectedProvince ? (nepalData as any).districts[selectedProvince] || [] : [];

  const handleProvinceChange = (province: string) => {
    setSignupData({
      ...signup_data,
      address: {
        province,
        district: undefined,
        institution: '',
      },
    });
  };

  const handleDistrictChange = (district: string) => {
    setSignupData({
      ...signup_data,
      address: {
        ...signup_data.address,
        district,
        institution: '',
      },
    });
  };

  const handleInstitutionChange = (institution: string) => {
    setSignupData({
      ...signup_data,
      address: {
        ...signup_data.address,
        institution,
      },
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
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageHeader source={require('../../../assets/images/illl-3.png')} />

            <View style={styles.form}>
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>Please Enter Your Address</Text>

              <BottomSheetPicker
                data={nepalData.provinces}
                label="Select Province"
                selectedValue={selectedProvince}
                onChange={handleProvinceChange}
                placeholder="Select your province"
              />

              <BottomSheetPicker
                data={districts}
                label="Select District"
                selectedValue={selectedDistrict}
                onChange={handleDistrictChange}
                placeholder={selectedProvince ? 'Select your district' : 'Select province first'}
                disabled={!selectedProvince}
              />

              <TextInputField
                label="Institution"
                placeholder="Enter Your Institution Name…"
                value={selectedInstitution || ''}
                onChangeText={handleInstitutionChange}
              />

              <ButtonPrimary title="Next" onPress={handleNext} />
              <ButtonSecondary title="Back" onPress={handleGoBack} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center', // same vertical centering as other screens
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  form: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inputGroup: {
    gap: 16,
    marginBottom: 2,
  },
  title: {
    fontSize: width < 360 ? 24 : 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 1,
  },
});

