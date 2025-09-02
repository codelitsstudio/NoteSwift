import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import { BottomSheetPicker } from '../../../components/Picker/BottomSheetPicker';
import { useNavStore } from '@/stores/navigationStore';

export default function Register() {
  const signup_data = useAuthStore(state => state.signup_data);
  const setSignupData = useAuthStore(state => state.setSignupData);
  const router = useRouter();

  const fullName = signup_data.full_name;
  const selectedGrade = signup_data.grade;

  useEffect(() => {
    useNavStore.getState().setTab("Register");
  }, []);

  const grades = Array.from({ length: 12 }, (_, i) => ({
    label: `Grade ${i + 1}`,
    value: (i + 1).toString(),
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
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingBottom: 40,
              backgroundColor: 'white'
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageHeader source={require('../../../assets/images/illl-2.png')} />

            <View className="flex-1 justify-center">
              <Text className="text-2xl font-bold text-center text-gray-800 mt-0.5">
                Register
              </Text>
              <Text className="text-sm text-gray-500 text-center font-semibold mt-1 mb-8">
                Please Enter Your Credentials To Register
              </Text>

              <View className="gap-2.5 mb-1">
                <TextInputField
                  label="Full Name"
                  placeholder="Enter your full name…"
                  value={fullName}
                  onChangeText={val => setSignupData({ ...signup_data, full_name: val })}
                />

                <BottomSheetPicker
                  data={grades}
                  label="Select Grade"
                  selectedValue={selectedGrade ? selectedGrade.toString() : null}
                  onChange={val => setSignupData({ ...signup_data, grade: Number(val) })}
                  placeholder="Select your grade"
                />
              </View>

              <ButtonPrimary title="Next" onPress={handleRegister} />

              <View className="items-center mt-1.5">
                <TouchableOpacity className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg mb-3">
                  <Image
                    source={require('../../../assets/images/icon.png')}
                    className="w-24 h-24"
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <View className="flex-row items-center mt-2">
                  <Text className="text-sm text-gray-500 font-semibold">
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      useNavStore.getState().setTab("Login");
                      router.back();
                    }}
                  >
                    <Text className="text-sm text-blue-500 font-semibold">
                      Back to Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}