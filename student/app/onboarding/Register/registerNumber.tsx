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
import { useNavStore } from '@/stores/navigationStore';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function RegisterNumber() {
  // 1️⃣ Set the active tab
  useEffect(() => {
    useNavStore.getState().setTab('RegisterAddress');
  }, []);

  const signup_data = useAuthStore(state => state.signup_data);
  const setSignupData = useAuthStore(state => state.setSignupData);
  const clearSignupData = useAuthStore(state => state.clearSignupData); // ⬅️ clear action
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

    // 1️⃣ Show registration-success toast
    Toast.show({
      type: 'info',
      position: 'top',
      text1: 'Registration successful!',
      text2: 'You have registered successfully.',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });

    // 2️⃣ Clear the form data
    clearSignupData();

    // 3️⃣ Then navigate to Login
    router.replace('/onboarding/Login/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: 'white' }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
        >
          <ScrollView
            contentContainerStyle={[styles.inner, { backgroundColor: 'white', paddingBottom: 40 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageHeader source={require('../../../assets/images/illl-4.png')} />

            <View style={styles.form}>
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>Please Enter Your Credentials To Register</Text>

              <View style={styles.inputGroup}>
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
              <ButtonSecondary title="Back" onPress={handleGoBack} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: 'white' },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  form: { flexGrow: 1, justifyContent: 'center' },
  inputGroup: { gap: 16, marginBottom: 4 },
  title: {
    fontSize: width < 360 ? 24 : 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
});
