import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import TextInputField from '../../../components/InputFields/TextInputField';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ImageHeader from '../../../components/Headers/ImageHeader';
import { useAuthStore } from '../../../stores/authStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useNavStore } from '@/stores/navigationStore';

import { useSearchParams } from 'expo-router/build/hooks';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function Login() {
  const loginData = useAuthStore(state => state.login_data);
  const setLoginData = useAuthStore(state => state.setLoginData);
  const clearLoginData = useAuthStore(state => state.clearLoginData);
  const api_message = useAuthStore(state => state.api_message);
  const login = useAuthStore(state => state.login);
  const router = useRouter();
const params = useSearchParams();

  useFocusEffect(
    useCallback(() => {
      return () => {
        clearLoginData();
      };
    }, [])
  );
  
 useEffect(() => {
  useNavStore.getState().setTab("RegisterAddress"); 
}, []);

  useEffect(() => {
    if (params.get('registered') === 'true') {
      Toast.show({
        type: 'info',
        text1: 'Registration successful!',
        text2: 'You have registered successfully.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });

      // Clear the query param immediately after showing toast
      router.replace('/onboarding/Login/login');
    }
  }, [params, router]);


  const isValidPhone = (value: string) => /^\d{10}$/.test(value.trim());

const handleLogin = async () => {
  if (!isValidPhone(loginData.phone_number)) {
    Alert.alert('Invalid phone number', 'Phone number must be exactly 10 digits.');
    return;
  }

  if (!loginData.password || loginData.password.length < 4) {
    Alert.alert('Invalid Password', 'Password must be at least 4 characters long.');
    return;
  }

  const res = await login(loginData.phone_number, loginData.password);
  if (!res) {
    return Alert.alert(api_message);
  }

  // 1️⃣ Show the success toast
  Toast.show({
    type: 'success',
    position: 'top',
    text1: 'Success',
    text2: 'Logged in successfully!',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });

  // 2️⃣ Then navigate to HomePage
  router.push('/Home/HomePage');
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
            <ImageHeader source={require('../../../assets/images/illl-1.png')} />

            <View style={styles.form}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>Please Sign In To Continue</Text>

              <View style={styles.inputGroup}>
                <TextInputField
                  label="Phone Number"
                  placeholder="Enter your Phone Number…"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={loginData.phone_number}
                  onChangeText={text => setLoginData({ ...loginData, phone_number: text })}
                />

                <TextInputField
                  label="Password"
                  placeholder="Enter your Password…"
                  secure
                  value={loginData.password}
                  onChangeText={text => setLoginData({ ...loginData, password: text })}
                />
              </View>

              <ButtonPrimary title="Login" onPress={handleLogin} />

              <View style={styles.footer}>
                <TouchableOpacity style={styles.logoWrapper}>
                  <Image
                    source={require('../../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity
  onPress={() => {
    useNavStore.getState().setTab("Register");
    router.push('/onboarding/Register/register');
  }}
>
  <Text style={styles.registerLink}>Create</Text>
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
    justifyContent: 'center', // Helps center on larger screens
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
    gap: 16,
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
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
    color: '#007AFF',
    fontWeight: '600',
  },
});
