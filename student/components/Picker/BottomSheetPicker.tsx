import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import BottomSheet, { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface PickerItem {
  label: string;
  value: string;
}

interface BottomSheetPickerProps {
  data: PickerItem[];
  label?: string;
  selectedValue?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const customBlue = '#3B82F6'; // your Tailwind customBlue

export function BottomSheetPicker({
  data,
  label,
  selectedValue,
  onChange,
  placeholder = 'Select',
  disabled,
}: BottomSheetPickerProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: selectedValue || isFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedValue, isFocused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', customBlue], // grey to blue
  });

  const backgroundColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#F9FAFB'], // grey to lighter grey (or white)
  });

  const openSheet = () => {
    if (!disabled) {
      setIsFocused(true);
      bottomSheetRef.current?.present();
    }
  };
  const closeSheet = () => {
    setIsFocused(false);
    bottomSheetRef.current?.dismiss();
  };

  const selectedLabel = data.find(d => d.value === selectedValue)?.label;

  return (
    <View style={{ width: '100%', marginBottom: 8, marginTop: 8 }}>
      {label && (
        <Text
          style={{
            marginBottom: 4,
            fontSize: 14,
            color: '#4B5563',
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={openSheet}
        activeOpacity={0.8}
        style={{ marginBottom: 8 }}
      >
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              borderColor,
              backgroundColor,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 14,
              color: selectedLabel ? '#111827' : '#94A3B8',
              flex: 1,
            }}
          >
            {selectedLabel ?? placeholder}
          </Text>

          <MaterialIcons name="keyboard-arrow-down" size={24} color="#6B7280" />
        </Animated.View>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={{ borderRadius: 24, backgroundColor: '#FFFFFF' }}
        handleIndicatorStyle={{ backgroundColor: '#000' }}
        onDismiss={() => setIsFocused(false)}
      >
        <BottomSheetFlatList
          data={data}
          keyExtractor={item => item.value}
          style={{ paddingHorizontal: 16, paddingVertical: 8, flex: 1 }}
          ListHeaderComponent={() => (
            <Text
              style={{
                fontSize: 18,
                textAlign: 'center',
                marginBottom: 16,
                fontWeight: '600',
                color: '#111827',
              }}
            >
              Choose an option
            </Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onChange(item.value);
                closeSheet();
              }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 12,
                borderBottomWidth: 2,
                borderBottomColor: selectedValue === item.value ? '#111827' : '#D1D5DB',
                borderRadius: 12,
                marginBottom: 4,
                backgroundColor: selectedValue === item.value ? '#E0E7FF' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: selectedValue === item.value ? '#1E40AF' : '#4B5563',
                  fontWeight: selectedValue === item.value ? '700' : '500',
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    // Remove static backgroundColor here to allow animation
  },
});
