import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useMemo, useRef } from 'react';
import { cn } from '@/lib/cn';

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
}

export function BottomSheetPicker({
  data,
  label,
  selectedValue,
  onChange,
  placeholder = 'Select',
}: BottomSheetPickerProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  const openSheet = () => { bottomSheetRef.current?.present(); };
  const closeSheet = () => bottomSheetRef.current?.dismiss();

  const selectedLabel = data.find(d => d.value === selectedValue)?.label;

  return (
    <View className="w-full mb-4">

      {label && (
        <Text
          className="mb-1 text-gray-600 font-medium"
          style={{ fontSize: 14 }}
        >
          {label}
        </Text>
      )}


      <TouchableOpacity
        onPress={openSheet}
        activeOpacity={0.8}
        className="w-full rounded-2xl bg-gray-50 border border-gray-300 px-4 py-3 flex-row items-center justify-between"
        style={{ minHeight: 44 }}
      >
        <Text
          className={cn(
            "text-base",
            selectedLabel ? "text-gray-900" : "text-gray-400"
          )}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedLabel ?? placeholder}
        </Text>

        <MaterialIcons
          name="keyboard-arrow-down"
          size={24}
          color="#6B7280"
        />
      </TouchableOpacity>



      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={{ borderRadius: 24, backgroundColor: "#FFFFFF" }}
        handleIndicatorStyle={{ backgroundColor: '#000' }} // optional: change indicator color for contrast
      >

        <BottomSheetFlatList
          data={data}
          keyExtractor={(item) => item.value}
          className="px-4 py-2 z-50 flex-1"
          ListHeaderComponent={() => (
            <Text className="text-lg text-center mb-4 font-semibold text-texts-900">
              Choose an option
            </Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onChange(item.value);
                closeSheet();
              }}
              className={cn(
                "py-4 px-2 rounded-xl hover:bg-gray-200 border-b-2 border-b-gray-300",
                { "border-b-gray-900": selectedValue === item.value }
              )}
            >
              <Text
                className={cn(
                  "text-lg text-gray-600",
                  { "text-gray-900 font-bold": selectedValue === item.value }
                )}
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
