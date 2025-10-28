import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useRouter } from 'expo-router';
import { useNavStore } from '@/stores/navigationStore';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// Define styles outside component to prevent re-creation
const scrollContainerStyle = { 
  flexGrow: 1, 
  justifyContent: 'center' as const, 
  paddingBottom: 40 
};

export default function RegisterNumber() {
  useEffect(() => {
    useNavStore.getState().setTab('RegisterNumber');
  }, []);

  // Optimize store subscriptions - only subscribe to what we need
  const signup_data = useAuthStore(state => state.signup_data);
  const setSignupData = useAuthStore(state => state.setSignupData);
  const router = useRouter();

  const phoneInput = signup_data.phone_number || '';

  // Add focus state for phone input
  const [isPhoneFocused, setIsPhoneFocused] = React.useState(false);

  // Memoize style calculations
  const titleTextStyle = width < 360 ? 'text-2xl' : 'text-3xl';

  const getPhoneValidationMessage = (phone: string) => {
    if (!phone || phone.trim().length === 0) {
      return "Phone number is required";
    }
    if (phone.length < 10) {
      return "Phone number is too short";
    }
    if (phone.length > 10) {
      return "Phone number is too long";
    }
    if (!/^[9][78]\d{8}$/.test(phone.trim())) {
      return "Please enter a valid phone number starting with 97 or 98";
    }
    return null;
  };

  const handleNext = async () => {
    // Enhanced phone validation
    const phoneError = getPhoneValidationMessage(phoneInput);
    if (phoneError) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Invalid Phone Number",
        text2: phoneError,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    // Store phone number in signup data
    setSignupData({
      ...signup_data,
      phone_number: phoneInput.trim(),
    });

    // Show success message
    Toast.show({
      type: 'success',
      position: 'top',
      text1: 'Phone Number Saved!',
      text2: 'Phone number stored successfully',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });

    // Navigate to address selection
    setTimeout(() => {
      router.push('/onboarding/Register/address');
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 10}
        >
          <ScrollView
            contentContainerStyle={scrollContainerStyle}
            className="px-6 bg-white"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageHeader source={require('../../../assets/images/illl-4.png')} />

            <View className="flex-grow justify-center">
              <Text
                className={`text-center font-bold text-gray-900 mt-1 ${titleTextStyle}`}
              >
                Register
              </Text>
              <Text className="text-center text-gray-400 font-semibold text-sm mb-8 mt-2">
                Please Enter Your Phone Number
              </Text>

              <View className="mb-1 space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
                  <View className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-3 ${isPhoneFocused ? 'border-blue-500' : 'border-gray-300'}`}>
                    <Text className="text-2xl mr-2">🇳🇵</Text>
                    <Text className="text-gray-900 font-medium mr-2">+977</Text>
                    <View className="w-px h-6 bg-gray-300 mr-3" />
                    <TextInput
                      className="flex-1 text-gray-900"
                      placeholder="Enter your phone number"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phoneInput}
                      onFocus={() => setIsPhoneFocused(true)}
                      onBlur={() => setIsPhoneFocused(false)}
                      onChangeText={(val: string) =>
                        setSignupData({
                          ...signup_data,
                          phone_number: val,
                        })
                      }
                    />
                  </View>
                </View>
              </View>

              <ButtonPrimary 
                title="Save Phone Number" 
                onPress={handleNext}
              />
   
             {/* Go Back */}
                           <View className="flex-row items-center justify-center mt-4">
                             <Text className="text-sm text-gray-500 font-semibold">Need to go back? </Text>
                             <TouchableOpacity onPress={() => router.back()}>
                               <Text className="text-sm text-blue-500 font-semibold">Go Back</Text>
                             </TouchableOpacity>
                           </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}