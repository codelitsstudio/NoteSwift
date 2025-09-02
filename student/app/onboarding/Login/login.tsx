import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import TextInputField from "../../../components/InputFields/TextInputField";
import ButtonPrimary from "../../../components/Buttons/ButtonPrimary";
import ImageHeader from "../../../components/Headers/ImageHeader";
import { useAuthStore } from "../../../stores/authStore";
import { useFocusEffect, useRouter } from "expo-router";
import { useNavStore } from "@/stores/navigationStore";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

export default function Login() {
  const loginData = useAuthStore((state) => state.login_data);
  const setLoginData = useAuthStore((state) => state.setLoginData);
  const clearLoginData = useAuthStore((state) => state.clearLoginData);
  const api_message = useAuthStore((state) => state.api_message);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      return () => {
        clearLoginData();
      };
    }, [])
  );

  useEffect(() => {
    useNavStore.getState().setTab("RegisterAddress");
  }, []);

  const isValidPhone = (value: string) => /^\d{10}$/.test(value.trim());

const handleLogin = async () => {
  if (!isValidPhone(loginData.phone_number)) {
    Alert.alert(
      "Invalid phone number",
      "Phone number must be exactly 10 digits."
    );
    return;
  }

  if (!loginData.password || loginData.password.length < 4) {
    Alert.alert(
      "Invalid Password",
      "Password must be at least 4 characters long."
    );
    return;
  }

  const res = await login(loginData.phone_number, loginData.password);
  if (!res) {
    return Alert.alert(api_message);
  }

  Toast.show({
    type: "success",
    position: "top",
    text1: "Success",
    text2: "Logged in successfully!",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });

  // ✅ Replace the route instead of pushing
  router.replace("/Home/HomePage");
};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 1 : 0}
        >
 <ScrollView
  contentContainerStyle={{
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  }}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
>

            <ImageHeader source={require("../../../assets/images/illl-1.png")} />

            <View className="flex-1 justify-center px-6">
              <Text
                className={`text-center font-bold text-gray-900 mt-2 ${
                  width < 360 ? "text-2xl" : "text-[28px]"
                }`}
              >
                Login
              </Text>
              <Text className="text-sm font-semibold text-gray-500 text-center mt-1 mb-8">
                Please Sign In To Continue
              </Text>

              <View className="gap-2.5 mb-2">
                <TextInputField
                  label="Phone Number"
                  placeholder="Enter your Phone Number…"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={loginData.phone_number}
                  onChangeText={(text) =>
                    setLoginData({ ...loginData, phone_number: text })
                  }
                />

                <TextInputField
                  label="Password"
                  placeholder="Enter your Password…"
                  secure
                  value={loginData.password}
                  onChangeText={(text) =>
                    setLoginData({ ...loginData, password: text })
                  }
                />
              </View>

              <ButtonPrimary title="Login" onPress={handleLogin} />

              <View className="items-center mt-4">
                <TouchableOpacity className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-md mb-3">
                  <Image
                    source={require("../../../assets/images/icon.png")}
                    className="w-24 h-24"
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <View className="flex-row items-center mt-2">
                  <Text className="text-sm text-gray-500 font-semibold">
                    Don&apos;t have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      useNavStore.getState().setTab("Register");
                      router.push("/onboarding/Register/register");
                    }}
                  >
                    <Text className="text-sm text-blue-500 font-semibold">
                      Create
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
