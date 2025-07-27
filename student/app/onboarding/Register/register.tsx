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
  StyleSheet,
  Dimensions,
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

const { width } = Dimensions.get('window');


useEffect(() => {
  useNavStore.getState().setTab("Register"); // ✅ THIS IS THE FIXED WAY
}, []);

export default function Register() {
  const signup_data = useAuthStore(state => state.signup_data);
  const setSignupData = useAuthStore(state => state.setSignupData);
  const router = useRouter();

  const fullName = signup_data.full_name;
  const selectedGrade = signup_data.grade;

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
            <ImageHeader source={require('../../../assets/images/illl-2.png')} />

            <View style={styles.form}>
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>Please Enter Your Credentials To Register</Text>

              <View style={styles.inputGroup}>
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

              <View style={styles.footer}>
                <TouchableOpacity style={styles.logoWrapper}>
                  <Image
                    source={require('../../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/onboarding/Login/login')}>
                    <Text style={styles.registerLink}>Login</Text>
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
    justifyContent: 'center', // same as login.tsx for vertical centering on larger screens
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  form: {
    flexGrow: 1,
    justifyContent: 'center',
  },
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
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 10,
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 6,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    backgroundColor: 'white',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    marginBottom: 12,
  },
  logo: {
    width: 82,
    height: 82,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  registerLink: {
    fontSize: 14,
    color: '#007AFF', // blue color matching login.tsx
    fontWeight: '600',
  },
});
