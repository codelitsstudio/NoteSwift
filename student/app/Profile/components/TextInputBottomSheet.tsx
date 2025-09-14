import React, { useRef, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

interface TextInputBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  editType: 'institution' | 'email' | 'name';
  currentValue: string;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

const TextInputBottomSheet: React.FC<TextInputBottomSheetProps> = ({
  isVisible,
  onClose,
  editType,
  currentValue,
  onSave,
  isLoading = false,
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['45%', '70%'], []);

  // Local state for editing
  const [localValue, setLocalValue] = useState(currentValue || '');

  const getTitle = () => {
    switch (editType) {
      case 'institution':
        return 'Edit Institution';
      case 'email':
        return 'Edit Email';
      case 'name':
        return 'Edit Name';
      default:
        return 'Edit';
    }
  };

  const getLabel = () => {
    switch (editType) {
      case 'institution':
        return 'Institution Name';
      case 'email':
        return 'Email Address';
      case 'name':
        return 'Full Name';
      default:
        return 'Value';
    }
  };

  const getPlaceholder = () => {
    switch (editType) {
      case 'institution':
        return 'Enter your institution name';
      case 'email':
        return 'Enter your email address';
      case 'name':
        return 'Enter your full name';
      default:
        return 'Enter value';
    }
  };

  const validateInput = (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return `${getLabel()} is required`;
    }

    switch (editType) {
      case 'institution':
        if (value.trim().length < 2) {
          return 'Institution name must be at least 2 characters long';
        }
        if (value.trim().length > 100) {
          return 'Institution name is too long (maximum 100 characters)';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'name':
        if (value.trim().length < 2) {
          return 'Name must be at least 2 characters long';
        }
        if (value.trim().length > 50) {
          return 'Name is too long (maximum 50 characters)';
        }
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          return 'Name can only contain letters and spaces';
        }
        break;
    }

    return null;
  };

  const handleSave = () => {
    const validationError = validateInput(localValue);
    if (validationError) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: validationError,
      });
      return;
    }

    if (editType === 'institution') {
      onSave({ 
        address: { 
          institution: localValue.trim() 
        } 
      });
    } else if (editType === 'email') {
      onSave({ 
        email: localValue.trim() 
      });
    } else if (editType === 'name') {
      onSave({ 
        full_name: localValue.trim() 
      });
    }
    
    onClose();
  };

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
      setLocalValue(currentValue || '');
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible, currentValue]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: '#fff' }}
      handleIndicatorStyle={{ backgroundColor: '#E5E7EB' }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView className="flex-1 px-5 pb-3">
        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={20}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              {getTitle()}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
            <View className="flex-row items-start" style={{ gap: 12 }}>
              <View className="bg-blue-100 rounded-full p-2 mt-1">
                <MaterialIcons 
                  name={
                    editType === 'institution' ? 'school' : 
                    editType === 'email' ? 'email' : 'person'
                  } 
                  size={18} 
                  color="#3B82F6" 
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900 mb-1">
                  {editType === 'institution' && 'Institution Profile'}
                  {editType === 'email' && 'Communication Hub'}
                  {editType === 'name' && 'Identity & Recognition'}
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  {editType === 'institution' && 'Update your school or university to access institution-specific resources, connect with classmates, and get tailored academic content for your educational environment.'}
                  {editType === 'email' && 'Keep your email current to receive important notifications, course updates, achievement badges, and stay connected with your learning community.'}
                  {editType === 'name' && 'Personalize how you appear to teachers and fellow students. Your name is your identity in group projects, discussions, and collaborative learning activities.'}
                </Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                {getLabel()}
              </Text>
              <BottomSheetTextInput
                value={localValue}
                onChangeText={setLocalValue}
                placeholder={getPlaceholder()}
                keyboardType={editType === 'email' ? 'email-address' : 'default'}
                autoCapitalize={editType === 'email' ? 'none' : 'words'}
                autoCorrect={false}
                style={{
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: '#1F2937',
                }}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row mt-4" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 rounded-xl py-4 items-center"
              disabled={isLoading}
            >
              <Text className={`font-semibold ${isLoading ? 'text-gray-400' : 'text-gray-700'}`}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className={`flex-1 rounded-xl py-4 items-center flex-row justify-center ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <MaterialIcons name="hourglass-empty" size={16} color="white" />
                  <Text className="text-white font-semibold ml-2">Saving...</Text>
                </>
              ) : (
                <Text className="text-white font-semibold">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default TextInputBottomSheet;