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
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ButtonSecondary from '../../../components/Buttons/ButtonSecondary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import { useNavStore } from '@/stores/navigationStore';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function RegisterNumber() {
  useEffect(() => {
    useNavStore.getState().setTab('RegisterAddress');
  }, []);

  const signup_data = useAuthStore(state => state.signup_data);
  const setSignupData = useAuthStore(state => state.setSignupData);
  const clearSignupData = useAuthStore(state => state.clearSignupData);
  const signUp = useAuthStore(state => state.signUp);
  const api_message = useAuthStore(state => state.api_message);
  const router = useRouter();

  const phoneInput = signup_data.phone_number;
  const passwordInput = signup_data.password;

  const isValidPhone = (value: string) => /^\d{10}$/.test(value.trim());

  const handleGoBack = () => {
    router.push('/onboarding/Register/address');
  };

  const handleNext = async () => {
    if (!isValidPhone(phoneInput)) {
      return Alert.alert(
        'Invalid phone number',
        'Phone number must be exactly 10 digits and contain digits only.'
      );
    }

    if (!passwordInput || passwordInput.length < 4) {
      return Alert.alert('Invalid Password', 'Password must be at least 4 characters long.');
    }

    const res = await signUp(signup_data);
    if (!res) {
      return Alert.alert(api_message || 'Registration failed');
    }

    Toast.show({
      type: 'info',
      position: 'top',
      text1: 'Registration successful!',
      text2: 'You have registered successfully.',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });

    clearSignupData();
 router.replace('/onboarding/Login/OnboardingPage');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
            className="px-6 bg-white"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageHeader source={require('../../../assets/images/illl-4.png')} />

            <View className="flex-grow justify-center">
              <Text
                className={`text-center font-bold text-gray-900 mt-1 ${
                  width < 360 ? 'text-2xl' : 'text-3xl'
                }`}
              >
                Register
              </Text>
              <Text className="text-center text-gray-400 font-semibold text-sm mb-8 mt-2">
                Please Enter Your Credentials To Register
              </Text>

              <View className="mb-1 space-y-4">
                <TextInputField
                  label="Phone Number"
                  placeholder="Enter your Phone Number…"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phoneInput}
                  onChangeText={val =>
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
                  onChangeText={val =>
                    setSignupData({
                      ...signup_data,
                      password: val,
                    })
                  }
                />
              </View>

              <ButtonPrimary title="Next" onPress={handleNext} />
       <View className="flex-row items-center justify-center mt-6">
        <Text className="text-sm text-gray-500 font-semibold">
         Need to fix something?{' '}
        </Text>
        <TouchableOpacity
          onPress={() => {
            useNavStore.getState().setTab("Login");
            router.back();
          }}
        >
          <Text className="text-sm text-blue-500 font-semibold">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
