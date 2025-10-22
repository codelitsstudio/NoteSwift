import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

interface OTPInputProps {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChangeText, length = 4 }) => {
  const inputRefs = useRef<(TextInput | null | undefined)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleChangeText = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    // Create new OTP array
    const newOTP = value.split('');
    while (newOTP.length < length) {
      newOTP.push('');
    }
    
    if (numericText.length > 0) {
      newOTP[index] = numericText[numericText.length - 1]; // Take last entered digit
      
      // Auto-focus next input
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      newOTP[index] = '';
    }
    
    onChangeText(newOTP.join(''));
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Auto-select the existing digit if any
    if (value[index]) {
      setTimeout(() => {
        inputRefs.current[index]?.setSelection(1, 1);
      }, 50);
    }
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const handleBoxPress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  return (
    <View className="flex-row justify-center space-x-4 mb-4">
      {Array.from({ length }, (_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleBoxPress(index)}
          className={`w-14 h-14 mx-2 rounded-lg border-2 items-center justify-center ${
            focusedIndex === index 
              ? 'border-customBlue bg-white' 
              : value[index] 
                ? 'border-customBlue bg-white' 
                : 'border-gray-300 bg-white'
          }`}
        >
          <BottomSheetTextInput
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={value[index] || ''}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            keyboardType="number-pad"
            maxLength={1}
            style={{
              width: '100%',
              height: '100%',
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1F2937',
              backgroundColor: 'transparent',
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default OTPInput;