// components/Container/KeyboardAvoidingScrollView.tsx

import { cn } from "@/lib/cn";
import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ScrollViewProps,
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
    keyboardVerticalOffset = 100,
    ...rest
}) => {
    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={keyboardVerticalOffset}
                className="flex-1"
            >
                <ScrollView
                    className={cn(className)}
                    keyboardShouldPersistTaps="handled"
                    {...rest}
                >
                    {children}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
