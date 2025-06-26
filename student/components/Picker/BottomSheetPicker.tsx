import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import BottomSheet,{ BottomSheetFlatList, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface PickerItem {
    label: string;
    value: string;
}

interface BottomSheetPickerProps {
    data: PickerItem[];
    label?: string;
    iconName: string;
    Icon: any;
    selectedValue?: string | null;
    onChange: (value: string) => void;
    placeholder?: string;

}

export function BottomSheetPicker({
    data,
    label,
    iconName,
    Icon,
    selectedValue,
    onChange,
    placeholder = 'Select',
}: BottomSheetPickerProps) {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['40%'], []);
    const openSheet = () => {bottomSheetRef.current?.present();}
    const closeSheet = () => bottomSheetRef.current?.dismiss();
    
    const selectedLabel = data.find(d => d.value === selectedValue)?.label;

    return (
        <View className="w-full">
            {/* Styled like InputText */}
            <TouchableOpacity
                onPress={(openSheet)}
                activeOpacity={0.9}
                className="flex px-6 py-4 flex-row w-full bg-background-700 rounded-3xl items-center"
            >
                <Icon name={iconName} size={24} className="text-texts-800 mr-6" />
                <View className="flex-1 gap-y-[0.125rem]">
                    {label && <Text className="text-xs text-texts-500">{label}</Text>}
                    <Text
                        className={`text-lg ${selectedLabel ? 'text-texts-900' : 'text-texts-400'
                            }`}
                    >
                        {selectedLabel ?? placeholder}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Bottom Sheet Modal */}
            <BottomSheetModal
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                backgroundStyle={{ borderRadius: 24, backgroundColor: "#2A2A2A" }}
                handleIndicatorStyle={{ backgroundColor: '#fff' }}
                
            >
                    <BottomSheetFlatList
                        data={data}
                        keyExtractor={(item) => item.value}
                        className={"px-4 py-2 z-50 flex-1 "}
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
                                className={cn("py-4 px-2 rounded-xl hover:bg-gray-200 border-b-2 border-b-texts-400", {"border-b-texts-900": selectedValue === item.value})}
                            >
                                <Text className={cn("text-lg text-texts-500", {"text-texts-900 font-bold": selectedValue === item.value})}>{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    />
            </BottomSheetModal>
        </View>
    );
}
