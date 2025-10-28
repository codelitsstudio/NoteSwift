import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
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
    }, [clearLoginData])
  );

  useEffect(() => {
    useNavStore.getState().setTab("RegisterAddress");
  }, []);

  const getEmailValidationMessage = (email: string) => {
    if (!email || email.trim().length === 0) {
      return "Email address is required";
    }
    if (email.length < 5) {
      return "Email address is too short";
    }
    if (!email.includes("@")) {
      return "Email must contain @ symbol";
    }
    if (!email.includes(".")) {
      return "Email must contain a domain (e.g., .com, .org)";
    }
    if (email.startsWith("@") || email.endsWith("@")) {
      return "Email cannot start or end with @";
    }
    if (email.includes("..")) {
      return "Email cannot contain consecutive dots";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email format (e.g., user@example.com)";
    }
    return null;
  };

  const getPasswordValidationMessage = (password: string) => {
    if (!password || password.length === 0) {
      return "Password is required";
    }
    if (password.length < 4) {
      return "Password must be at least 4 characters long";
    }
    if (password.length > 50) {
      return "Password is too long (maximum 50 characters)";
    }
    if (password.includes(" ")) {
      return "Password cannot contain spaces";
    }
    return null;
  };

  const handleLogin = async () => {
    // Enhanced email validation
    const emailError = getEmailValidationMessage(loginData.email);
    if (emailError) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Invalid Email",
        text2: emailError,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    // Enhanced password validation
    const passwordError = getPasswordValidationMessage(loginData.password);
    if (passwordError) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Invalid Password",
        text2: passwordError,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    try {
      const res = await login(loginData.email, loginData.password);
      if (!res) {
        // Get specific error message from the API
        let errorTitle = "Login Failed";
        let errorMessage = api_message || "Invalid email or password";

        // Parse common error scenarios for better user experience
        if (api_message) {
          if (api_message.toLowerCase().includes("student not found") || api_message.toLowerCase().includes("user not found") || api_message.toLowerCase().includes("email not found")) {
            errorTitle = "Account Not Found";
            errorMessage = "No account found with this email address. Please check your email or create a new account.";
          } else if (api_message.toLowerCase().includes("invalid password") || api_message.toLowerCase().includes("password incorrect") || api_message.toLowerCase().includes("incorrect password")) {
            errorTitle = "Incorrect Password";
            errorMessage = "The password you entered is incorrect. Please try again or reset your password.";
          } else if (api_message.toLowerCase().includes("account setup incomplete") || api_message.toLowerCase().includes("forgot password")) {
            errorTitle = "Account Setup Required";
            errorMessage = "Your account needs to be set up. Please use 'Forgot Password' to create a password for your account.";
          } else if (api_message.toLowerCase().includes("email or password missing")) {
            errorTitle = "Missing Information";
            errorMessage = "Please enter both email and password to continue.";
          } else if (api_message.toLowerCase().includes("blocked") || api_message.toLowerCase().includes("suspended")) {
            errorTitle = "Account Blocked";
            errorMessage = "Your account has been temporarily blocked. Please contact support.";
          } else if (api_message.toLowerCase().includes("network") || api_message.toLowerCase().includes("connection")) {
            errorTitle = "Connection Error";
            errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
          } else if (api_message.toLowerCase().includes("server") || api_message.toLowerCase().includes("500")) {
            errorTitle = "Server Error";
            errorMessage = "Our servers are experiencing issues. Please try again in a few moments.";
          }
        }

        Toast.show({
          type: "error",
          position: "top",
          text1: errorTitle,
          text2: errorMessage,
          visibilityTime: 5000,
          autoHide: true,
          topOffset: 50,
        });
        return;
      }

      // Only show success toast if login was actually successful
      Toast.show({
        type: "success",
        position: "top",
        text1: "Welcome Back!",
        text2: "Successfully logged into your account",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 50,
      });

      // ✅ Replace the route instead of pushing
      router.replace("/Home/HomePage");
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorTitle = "Login Failed";
      let errorMessage = "An unexpected error occurred";

      if (error.message) {
        if (error.message.includes("Network Error") || error.message.includes("timeout")) {
          errorTitle = "Connection Error";
          errorMessage = "Please check your internet connection and try again";
        } else if (error.message.includes("401")) {
          errorTitle = "Invalid Credentials";
          errorMessage = "Email or password is incorrect";
        } else if (error.message.includes("429")) {
          errorTitle = "Too Many Attempts";
          errorMessage = "Please wait a moment before trying again";
        } else {
          errorMessage = error.message;
        }
      }

      Toast.show({
        type: "error",
        position: "top",
        text1: errorTitle,
        text2: errorMessage,
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 1 : 10}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingBottom: 40,
            }}
            className="px-6 bg-white"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageHeader source={require("../../../assets/images/illl-1.png")} />

            <View className="flex-1 justify-center">
              <Text
                className={`text-center font-bold text-gray-900 mt-2 ${
                  width < 360 ? "text-2xl" : "text-[28px]"
                }`}
              >
                Login
              </Text>
              <Text className="text-sm font-semibold text-gray-500 text-center mt-1 mb-8">
                Please Enter Your Email To Login
              </Text>

              <View className="gap-2.5 mb-2">
                <TextInputField
                  label="Email Address"
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  value={loginData.email}
                  onChangeText={(text) =>
                    setLoginData({ ...loginData, email: text })
                  }
                />

                <TextInputField
                  label="Password"
                  placeholder="Enter your password"
                  secure
                  value={loginData.password}
                  onChangeText={(text) =>
                    setLoginData({ ...loginData, password: text })
                  }
                />
              </View>

              <View className="flex-row justify-end mb-4">
                <TouchableOpacity
                  onPress={() => {
                    router.push("/onboarding/ForgotPassword/forgotEmail");
                  }}
                >
                  <Text className="text-sm text-blue-500 font-semibold">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
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
                      useNavStore.getState().setBackNavigation(false);
                      router.push("/onboarding/Register/registerEmail");
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
