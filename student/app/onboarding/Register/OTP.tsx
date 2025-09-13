// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Keyboard,
//   TouchableWithoutFeedback,
//   Animated,
//   Easing,
//   StatusBar,
//   TextInput,
// } from 'react-native';
// import { Svg, Path } from 'react-native-svg';
// import { useRouter } from 'expo-router';
// import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
// import ImageHeader from '@/components/Headers/ImageHeader';
// import { useAuthStore } from '@/stores/authStore';
// import { useNavStore } from '@/stores/navigationStore';
// import Toast from 'react-native-toast-message';
// import ButtonSecondary from '@/components/Buttons/ButtonSecondary';

// export default function OtpPage() {
//   const router = useRouter();
//   const signup_data = useAuthStore(state => state.signup_data);
//   const verifyOtp = useAuthStore(state => state.verifyOtp);
//   const api_message = useAuthStore(state => state.api_message);
//   const is_loading = useAuthStore(state => state.is_loading);

//   const [otp, setOtp] = useState(['', '', '', '']);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const inputs = useRef<(TextInput | null)[]>([]);
//   const cursorAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     useNavStore.getState().setTab('Register');
//   }, []);

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(cursorAnim, {
//           toValue: 1,
//           duration: 500,
//           easing: Easing.linear,
//           useNativeDriver: true,
//         }),
//         Animated.timing(cursorAnim, {
//           toValue: 0,
//           duration: 500,
//           easing: Easing.linear,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   const formatPhoneNumber = (phone: string) =>
//     phone.length === 10 ? `+977-${phone}` : `+977-${phone}`;

//   const handleChange = (text: string, index: number) => {
//     if (/^[0-9]$/.test(text) || text === '') {
//       const newOtp = [...otp];
//       newOtp[index] = text;
//       setOtp(newOtp);
//       if (text !== '' && index < 3) {
//         inputs.current[index + 1]?.focus();
//         setActiveIndex(index + 1);
//       }
//     }
//   };

//   const handleKeyPress = (e: any, index: number) => {
//     if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
//       inputs.current[index - 1]?.focus();
//       setActiveIndex(index - 1);
//     }
//   };

//   const handleFocus = (index: number) => setActiveIndex(index);

//   const handleConfirm = async () => {
//     const code = otp.join('');
//     if (code.length !== 4) {
//       return Toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: 'Please fill all the fields',
//       });
//     }

//     if (!/^\d{4}$/.test(code)) {
//       return Toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: 'Invalid verification code',
//       });
//     }

//     // Verify OTP with backend
//     const isVerified = await verifyOtp(code);
    
//     if (isVerified) {
//       Toast.show({
//         type: 'success',
//         position: 'top',
//         text1: 'OTP Verified Successfully!',
//         text2: 'Please set your password.',
//         visibilityTime: 2000,
//         autoHide: true,
//         topOffset: 50,
//       });

//       // Navigate to password page
//       setTimeout(() => {
//         router.push('/onboarding/Register/PasswordPage');
//       }, 1000);
//     } else {
//       Toast.show({
//         type: 'error',
//         text1: 'Invalid OTP',
//         text2: api_message || 'Please enter the correct verification code',
//         visibilityTime: 3000,
//         autoHide: true,
//         topOffset: 50,
//       });
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <KeyboardAvoidingView
//           className="flex-1 bg-white"
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
//         >
//           <ScrollView
//             contentContainerStyle={{
//               flexGrow: 1,
//               justifyContent: 'center',
//               paddingHorizontal: 24,
//               paddingBottom: 40,
//               backgroundColor: 'white',
//             }}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Image Header */}
//             <ImageHeader source={require('../../../assets/images/otp-ill.png')} />

//             <View className="flex-1 justify-center items-center">
//               <Text className="text-2xl font-bold text-center text-gray-800 mt-0.5">
//                 Verification Code
//               </Text>
//               <Text className="text-sm text-gray-500 text-center font-semibold mt-1 mb-8">
//                 We have sent the verification code to your number{' '}
//                 <Text className="text-customBlue font-semibold">
//                   {formatPhoneNumber(signup_data.phone_number)}
//                 </Text>
//               </Text>

//               {/* OTP Inputs */}
//               <View className="flex-row justify-between w-full mb-4 px-1">
//                 {otp.map((digit, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     activeOpacity={1}
//                     onPress={() => inputs.current[index]?.focus()}
//                     className="w-16 h-16 border rounded-2xl items-center justify-center border-gray-300"
//                   >
//                     <Text className="text-3xl font-bold text-customBlue">{digit}</Text>
//                     {activeIndex === index && !digit && (
//                       <Animated.View
//                         style={{
//                           position: 'absolute',
//                           width: 2,
//                           height: '60%',
//                           backgroundColor: '#3B82F6',
//                           opacity: cursorAnim,
//                         }}
//                       />
//                     )}
//                     <TextInput
//                       ref={ref => { inputs.current[index] = ref; }}
//                       style={{ position: 'absolute', opacity: 0 }}
//                       keyboardType="number-pad"
//                       maxLength={1}
//                       autoFocus={index === 0}
//                       textContentType="oneTimeCode"
//                       autoComplete="sms-otp"
//                       onFocus={() => handleFocus(index)}
//                       onChangeText={text => handleChange(text, index)}
//                       onKeyPress={e => handleKeyPress(e, index)}
//                     />
//                   </TouchableOpacity>
//                 ))}
//               </View>

    

//               {/* Confirm Button */}
//               <ButtonPrimary
//                 title={is_loading ? 'Verifying...' : 'Confirm'}
//                 onPress={handleConfirm}
//                 disabled={is_loading}
//               />
// <ButtonSecondary title="Resend Code" onPress={() => {}} />
//               {/* Back to login */}
//               <View className="flex-row items-center justify-center mt-2">
//                 <Text className="text-sm text-gray-500 font-semibold">
//                   Need to change the number?{' '}
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => {
//                     useNavStore.getState().setTab('Login');
//                     router.back();
//                   }}
//                 >
//                   <Text className="text-sm text-blue-500 font-semibold">Go Back</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </TouchableWithoutFeedback>
//     </SafeAreaView>
//   );
// }
