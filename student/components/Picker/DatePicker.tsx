import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
    label?: string;
    Icon: any;
    iconName: string;
    value?: Date;
    onChange: (date: Date) => void;
    placeholder: string;
}

export function DateInput({ label, Icon, iconName, value, onChange, placeholder }: Props) {
    const [show, setShow] = useState(false);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShow(Platform.OS === "ios"); // iOS stays open until explicitly closed, Android closes on selection
        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    return (
        <View className="flex px-6 py-4 flex-row w-full bg-background-700 rounded-3xl items-center">
            <Icon name={iconName} size={24} className="text-texts-800 mr-6" />
            <View className="flex-1 gap-y-[0.125rem]">
                <Text className="text-xs text-texts-500">{label}</Text>

                <TouchableOpacity onPress={() => setShow(true)}>
                    {value?<Text className="text-lg text-texts-900">{value.toLocaleDateString()}</Text>:<Text className="text-texts-400 text-lg">{placeholder}</Text>}
                </TouchableOpacity>

                {show && (
                    <DateTimePicker
                        value={value || new Date}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                        maximumDate={new Date(2100, 11, 31)} // optional
                    />
                )}
            </View>
        </View>
    );
}
