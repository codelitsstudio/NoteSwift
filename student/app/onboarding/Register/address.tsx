import React, { useEffect } from "react";
import {
  View,
  Text,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import TextInputField from "../../../components/InputFields/TextInputField";
import ButtonPrimary from "../../../components/Buttons/ButtonPrimary";
import ButtonSecondary from "../../../components/Buttons/ButtonSecondary";
import ImageHeader from "../../../components/Headers/ImageHeader";
import { useAuthStore } from "../../../stores/authStore";
import { useRouter } from "expo-router";
import { BottomSheetPicker } from "../../../components/Picker/BottomSheetPicker";
import nepalData from "../../../data/nepalLocationData.json";
import { useNavStore } from "@/stores/navigationStore";

const { width } = Dimensions.get("window");

export default function LocationSelector() {
  useEffect(() => {
    useNavStore.getState().setTab("RegisterAddress");
  }, []);

  const signup_data = useAuthStore((state) => state.signup_data);
  const setSignupData = useAuthStore((state) => state.setSignupData);

  const router = useRouter();

  const selectedProvince = signup_data.address?.province;
  const selectedDistrict = signup_data.address?.district;
  const selectedInstitution = signup_data.address?.institution;

  const districts = selectedProvince
    ? (nepalData as any).districts[selectedProvince] || []
    : [];

  const handleProvinceChange = (province: string) => {
    setSignupData({
      ...signup_data,
      address: {
        province,
        district: undefined,
        institution: "",
      },
    });
  };

  const handleDistrictChange = (district: string) => {
    setSignupData({
      ...signup_data,
      address: {
        ...signup_data.address,
        district,
        institution: "",
      },
    });
  };

  const handleInstitutionChange = (institution: string) => {
    setSignupData({
      ...signup_data,
      address: {
        ...signup_data.address,
        institution,
      },
    });
  };

  const handleGoBack = () => {
    useNavStore.getState().setTab("Register");
    router.back();
  };

  const handleNext = () => {
    if (!selectedProvince) {
      Alert.alert("Select Province", "Please select your province.");
      return;
    }
    if (!selectedDistrict) {
      Alert.alert("Select District", "Please select your district.");
      return;
    }
    if (!selectedInstitution || selectedInstitution.trim() === "") {
      Alert.alert("Enter Institution", "Please enter your institution name.");
      return;
    }

    useNavStore.getState().setTab("RegisterNumber");
    router.push("/onboarding/Register/registerNumber");
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
            className="flex-1 bg-white"
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageHeader source={require("../../../assets/images/illl-3.png")} />

            <View className="flex-1 justify-center px-6">
              <Text
                className={`text-center font-bold text-gray-900 mt-1 ${
                  width < 360 ? "text-xl" : "text-2xl"
                }`}
              >
                Register
              </Text>
              <Text className="text-[13px] font-semibold text-gray-500 text-center mt-1 mb-2">
                Please Enter Your Address
              </Text>

              <View className="space-y-3 mb-3">
                <BottomSheetPicker
                  data={nepalData.provinces}
                  label="Select Province"
                  selectedValue={selectedProvince}
                  onChange={handleProvinceChange}
                  placeholder="Select your province"
                />

                <BottomSheetPicker
                  data={districts}
                  label="Select District"
                  selectedValue={selectedDistrict}
                  onChange={handleDistrictChange}
                  placeholder={
                    selectedProvince ? "Select your district" : "Select province first"
                  }
                  disabled={!selectedProvince}
                />

                <TextInputField
                  label="Institution"
                  placeholder="Enter Your Institution Name…"
                  value={selectedInstitution || ""}
                  onChangeText={handleInstitutionChange}
                />
              </View>

              <ButtonPrimary title="Next" onPress={handleNext} />
        <View className="flex-row items-center justify-center mt-2">
  <Text className="text-sm text-gray-500 font-semibold">
   Need to fix something?{' '}
  </Text>
  <TouchableOpacity
    onPress={() => {
      useNavStore.getState().setTab("Login");
      router.back();
    }}
  >
    <Text className="text-sm text-blue-500 font-semibold">
      Go Back
    </Text>
  </TouchableOpacity>
</View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
