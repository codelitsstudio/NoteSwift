import React, { useState, useRef } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import ButtonPrimary from '../../../components/Buttons/ButtonPrimary';
import ButtonSecondary from '../../../components/Buttons/ButtonSecondary';
import Toast from 'react-native-toast-message';
import OTPInput from './OTPInput';
import { 
  sendCurrentEmailVerification, 
  verifyCurrentEmail, 
  sendNewEmailVerification, 
  verifyNewEmailAndUpdate 
} from '../../../api/student/user';

interface EmailChangeBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  currentEmail: string;
  onEmailUpdated: (newEmail: string) => void;
}

type EmailChangeStep = 
  | 'send-current-verification'
  | 'verify-current' 
  | 'enter-new-email'
  | 'verify-new-email';

const EmailChangeBottomSheet: React.FC<EmailChangeBottomSheetProps> = ({
  isVisible,
  onClose,
  currentEmail,
  onEmailUpdated,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [step, setStep] = useState<EmailChangeStep>('send-current-verification');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOtpCode, setCurrentOtpCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOtpCode, setNewOtpCode] = useState('');

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const resetState = () => {
    setStep('send-current-verification');
    setCurrentOtpCode('');
    setNewEmail('');
    setNewOtpCode('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSendCurrentVerification = async () => {
    setIsLoading(true);
    try {
      const response = await sendCurrentEmailVerification();
      Toast.show({
        type: 'success',
        text1: 'Verification Code Sent',
        text2: `Check your email at ${currentEmail}`,
        visibilityTime: 4000,
      });
      setStep('verify-current');
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

  const handleVerifyCurrentEmail = async () => {
    if (!currentOtpCode.trim() || currentOtpCode.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyCurrentEmail(currentOtpCode);
      Toast.show({
        type: 'success',
        text1: 'Current Email Verified',
        text2: 'You can now enter a new email address',
        visibilityTime: 3000,
      });
      setStep('enter-new-email');
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

  const handleSendNewVerification = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      Alert.alert('Error', 'New email must be different from current email');
      return;
    }

    setIsLoading(true);
    try {
      await sendNewEmailVerification(newEmail);
      Toast.show({
        type: 'success',
        text1: 'Verification Code Sent',
        text2: `Check your email at ${newEmail}`,
        visibilityTime: 4000,
      });
      setStep('verify-new-email');
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

  const handleVerifyNewEmailAndUpdate = async () => {
    if (!newOtpCode.trim() || newOtpCode.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyNewEmailAndUpdate(newEmail, newOtpCode);
      Toast.show({
        type: 'success',
        text1: 'Email Updated Successfully!',
        text2: `Your email has been changed to ${newEmail}`,
        visibilityTime: 4000,
      });
      onEmailUpdated(newEmail);
      handleClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message,
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'send-current-verification':
        return (
          <View style={{ minHeight: 250 }}>
            <Text className="text-sm text-gray-600 mb-4">
              To change your email address, we first need to verify that you own the current email address:{' '}
              <Text className="text-customBlue font-medium">{currentEmail}</Text>
            </Text>
            <ButtonPrimary
              title="Send Verification Code"
              onPress={handleSendCurrentVerification}
              disabled={isLoading}
            />
            <TouchableOpacity
              onPress={handleClose}
              className="mt-3 p-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        );

      case 'verify-current':
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
              value={currentOtpCode}
              onChangeText={setCurrentOtpCode}
              length={4}
            />
            <ButtonPrimary
              title="Verify Code"
              onPress={handleVerifyCurrentEmail}
              disabled={isLoading}
            />
            <TouchableOpacity
              onPress={handleSendCurrentVerification}
              disabled={isLoading}
              className="mt-3 p-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-medium">Resend Code</Text>
            </TouchableOpacity>
          </View>
        );

      case 'enter-new-email':
        return (
          <View style={{ minHeight: 280 }}>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Enter New Email Address
            </Text>
            <Text className="text-sm text-gray-600 mb-3">
              Enter the new email address you want to use for your account
            </Text>
            <BottomSheetTextInput
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                marginBottom: 12,
              }}
              placeholder="Enter new email address"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ButtonPrimary
              title="Send Verification Code"
              onPress={handleSendNewVerification}
              disabled={isLoading}
            />
            <TouchableOpacity
              onPress={() => setStep('verify-current')}
              className="mt-3 p-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-medium">Back</Text>
            </TouchableOpacity>
          </View>
        );

      case 'verify-new-email':
        return (
          <View style={{ minHeight: 320 }}>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Verify New Email
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Enter the 4-digit code sent to{' '}
              <Text className="text-customBlue font-medium">{newEmail}</Text>
            </Text>
            <OTPInput
              value={newOtpCode}
              onChangeText={setNewOtpCode}
              length={4}
            />
            <ButtonPrimary
              title="Update Email Address"
              onPress={handleVerifyNewEmailAndUpdate}
              disabled={isLoading}
            />
            <TouchableOpacity
              onPress={handleSendNewVerification}
              disabled={isLoading}
              className="mt-3 p-3 bg-gray-100 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-medium">Resend Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('enter-new-email')}
              className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <Text className="text-center text-gray-600 font-medium">Back</Text>
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
      snapPoints={['25%', '60%']}
      onClose={handleClose}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="extend"
    >
      <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">
            Change Email Address
          </Text>
          <TouchableOpacity onPress={handleClose} className="p-2">
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <View className="flex-row items-start" style={{ gap: 12 }}>
            <View className="bg-blue-100 rounded-full p-2 mt-1">
              <MaterialIcons name="email" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900 mb-1">
                Secure Email Update
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                Change your email address with our secure 2-step verification process. We'll verify both your current and new email addresses to ensure account security and prevent unauthorized changes.
              </Text>
            </View>
          </View>
        </View>
        
        {renderStepContent()}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default EmailChangeBottomSheet;