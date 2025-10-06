import React, { useState, useRef } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import Toast from 'react-native-toast-message';
import OTPInput from './OTPInput';
import { 
  verifyCurrentPassword,
  changePasswordWithCurrent,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPasswordWithOTP
} from '../../../api/student/user';

interface PasswordChangeBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  currentEmail: string;
}

type PasswordChangeStep = 
  | 'current-password'
  | 'new-password'
  | 'forgot-password-verify'
  | 'forgot-password-reset';

const PasswordChangeBottomSheet: React.FC<PasswordChangeBottomSheetProps> = ({
  isVisible,
  onClose,
  currentEmail,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [step, setStep] = useState<PasswordChangeStep>('current-password');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const resetState = () => {
    setStep('current-password');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotPasswordOtp('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Password strength calculation
  const getStrengthLevel = (pass: string) => {
    if (pass.length === 0) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/.test(pass)) score++;
    if (/(?=.*[\W_])/.test(pass)) score++;
    return Math.min(score, 3);
  };

  const strengthLevel = getStrengthLevel(newPassword);
  const strengthColors = ['#E5E7EB', '#EF4444', '#F59E0B', '#10B981'];

  const getPasswordValidationMessage = (pass: string, confirmPass: string) => {
    if (!pass || pass.length === 0) {
      return "Password is required";
    }
    if (pass.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (pass.length > 50) {
      return "Password is too long (maximum 50 characters)";
    }
    if (!confirmPass || confirmPass.length === 0) {
      return "Please confirm your password";
    }
    if (pass !== confirmPass) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    setIsLoading(true);
    try {
      await verifyCurrentPassword(currentPassword);
      
      Toast.show({
        type: 'success',
        text1: 'Password Verified',
        text2: 'You can now set a new password',
        visibilityTime: 3000,
      });
      setStep('new-password');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message,
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    try {
      await sendForgotPasswordOTP();
      
      Toast.show({
        type: 'success',
        text1: 'Verification Code Sent',
        text2: `Check your email at ${currentEmail}`,
        visibilityTime: 4000,
      });
      setStep('forgot-password-verify');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Send Code',
        text2: error.message,
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyForgotPasswordOtp = async () => {
    if (!forgotPasswordOtp.trim() || forgotPasswordOtp.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyForgotPasswordOTP(forgotPasswordOtp);
      
      Toast.show({
        type: 'success',
        text1: 'Code Verified',
        text2: 'You can now set a new password',
        visibilityTime: 3000,
      });
      setStep('forgot-password-reset');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message,
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const passwordError = getPasswordValidationMessage(newPassword, confirmPassword);
    if (passwordError) {
      Alert.alert('Invalid Password', passwordError);
      return;
    }

    if (strengthLevel < 2) {
      Alert.alert(
        'Weak Password',
        'Password should contain uppercase, lowercase, and numbers for better security.'
      );
      return;
    }

    setIsLoading(true);
    try {
      if (step === 'new-password') {
        await changePasswordWithCurrent(currentPassword, newPassword);
      } else {
        await resetPasswordWithOTP(forgotPasswordOtp, newPassword);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Password Changed Successfully!',
        text2: 'Your password has been updated',
        visibilityTime: 4000,
      });
      handleClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Change Password',
        text2: error.message,
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'current-password':
        return (
          <View style={{ minHeight: 300 }}>
            <Text className="text-sm text-gray-600 mb-4">
              Enter your current password to change it to a new one
            </Text>
            
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Current Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 bg-gray-50">
                <BottomSheetTextInput
                  style={{ flex: 1, height: 50, color: '#000' }}
                  placeholder="Enter current password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(v => !v)}>
                  <MaterialIcons
                    name={showCurrentPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color="#3B82F6"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <ButtonPrimary
              title="Verify Password"
              onPress={handleVerifyCurrentPassword}
              disabled={isLoading}
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              className="mt-4"
            >
              <Text className="text-center text-customBlue font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              className="mt-3 p-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        );

      case 'forgot-password-verify':
        return (
          <View style={{ minHeight: 280 }}>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Enter Verification Code
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Enter the 4-digit code sent to{' '}
              <Text className="text-customBlue font-medium">{currentEmail}</Text>
            </Text>
            <OTPInput
              value={forgotPasswordOtp}
              onChangeText={setForgotPasswordOtp}
              length={4}
            />
            <ButtonPrimary
              title="Verify Code"
              onPress={handleVerifyForgotPasswordOtp}
              disabled={isLoading}
            />
            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={isLoading}
              className="mt-3 p-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-medium">Resend Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('current-password')}
              className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <Text className="text-center text-gray-600 font-medium">Back</Text>
            </TouchableOpacity>
          </View>
        );

      case 'new-password':
      case 'forgot-password-reset':
        return (
          <View style={{ minHeight: 400 }}>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Set New Password
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Create a strong password for your account
            </Text>

            {/* New Password Input */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                New Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 bg-gray-50">
                <BottomSheetTextInput
                  style={{ flex: 1, height: 50, color: '#000' }}
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(v => !v)}>
                  <MaterialIcons
                    name={showNewPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color="#3B82F6"
                  />
                </TouchableOpacity>
              </View>

              {/* Strength bar */}
              <View className="mt-2">
                <View style={{ flexDirection: 'row', height: 6, borderRadius: 8, overflow: 'hidden' }}>
                  {[1, 2, 3].map(i => (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        marginRight: i < 3 ? 6 : 0,
                        backgroundColor: i <= strengthLevel ? strengthColors[strengthLevel] : '#E5E7EB',
                        borderRadius: 6,
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Confirm Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 bg-gray-50">
                <BottomSheetTextInput
                  style={{ flex: 1, height: 50, color: '#000' }}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)}>
                  <MaterialIcons
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color="#3B82F6"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <ButtonPrimary
              title="Change Password"
              onPress={handleChangePassword}
              disabled={isLoading}
            />

            <TouchableOpacity
              onPress={() => setStep(step === 'new-password' ? 'current-password' : 'forgot-password-verify')}
              className="mt-3 p-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-medium">Back</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={['45%', '70%']}
      onClose={handleClose}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="extend"
    >
      <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">
            Change Password
          </Text>
          <TouchableOpacity onPress={handleClose} className="p-2">
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <View className="flex-row items-start" style={{ gap: 12 }}>
            <View className="bg-blue-100 rounded-full p-2 mt-1">
              <MaterialIcons name="lock" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900 mb-1">
                Secure Password Update
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                Change your password to keep your account secure. We&apos;ll verify your identity before allowing any changes to ensure your account protection.
              </Text>
            </View>
          </View>
        </View>
        
        {renderStepContent()}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default PasswordChangeBottomSheet;