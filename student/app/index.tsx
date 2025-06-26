import { FilledButton, OutlinedButton } from "@/components/Buttons/Buttons";
import { BottomSheetPicker } from "@/components/Picker/BottomSheetPicker";
import { Redirect, Stack, useNavigation, useRouter } from "expo-router";
import { Image, Text, TouchableHighlight, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from '@expo/vector-icons/Feather';
export default function Main(){
    const router = useRouter();
    return(
        <SafeAreaView className="flex-1 bg-white">
            <TouchableOpacity onPress={()=>router.push("/onboarding/login")}>
                <Text>Go to Login</Text>
                <FilledButton>Login</FilledButton>
                <OutlinedButton>Login</OutlinedButton>
            </TouchableOpacity>
        </SafeAreaView>
    )
}