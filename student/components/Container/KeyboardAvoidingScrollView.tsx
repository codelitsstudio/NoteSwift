// components/Container/KeyboardAvoidingScrollView.tsx

import { cn } from "@/lib/cn";
import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ScrollViewProps,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


interface Props extends ScrollViewProps {
    children: React.ReactNode;
    className?: string;
    keyboardVerticalOffset?: number;
}

export const KeyboardAvoidingScrollView: React.FC<Props> = ({
    children,
    className,
    keyboardVerticalOffset = 10,
    ...rest
}) => {
    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
                keyboardVerticalOffset={keyboardVerticalOffset}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
                    <ScrollView
                        className={cn(className)}
                        keyboardShouldPersistTaps="handled"
                        {...rest}
                    >
                        {children}
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
