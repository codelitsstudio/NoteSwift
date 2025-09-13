import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import DashboardLayout from "./components/DashboardLayout";

export default function AddMorePackages() {
  const router = useRouter();
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  const availablePackages = [
    {
      id: 'class12',
      name: 'Class 12 Complete Package',
      price: 999,
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
      lessons: 48,
      description: 'Complete package for Class 12 with all subjects'
    },
    {
      id: 'entrance',
      name: 'Entrance Preparation',
      price: 1499,
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      lessons: 65,
      description: 'Complete preparation for entrance exams'
    },
    {
      id: 'olympiad',
      name: 'Olympiad Training',
      price: 799,
      subjects: ['Mathematics', 'Science'],
      lessons: 32,
      description: 'Advanced training for mathematics and science olympiads'
    },
    {
      id: 'english',
      name: 'Advanced English',
      price: 599,
      subjects: ['Grammar', 'Literature', 'Writing'],
      lessons: 24,
      description: 'Master advanced English skills and literature'
    }
  ];

  const togglePackageSelection = (packageId: string) => {
    setSelectedPackages(prev => {
      if (prev.includes(packageId)) {
        return prev.filter(id => id !== packageId);
      } else {
        return [...prev, packageId];
      }
    });
  };

  const getTotalPrice = () => {
    return selectedPackages.reduce((total, packageId) => {
      const pkg = availablePackages.find(p => p.id === packageId);
      return total + (pkg?.price || 0);
    }, 0);
  };

  const proceedToCheckout = () => {
    if (selectedPackages.length > 0) {
      const selectedData = availablePackages.filter(pkg => selectedPackages.includes(pkg.id));
      router.push({
        pathname: '/ProCheckout',
        params: {
          packages: JSON.stringify(selectedData),
          isUpgrade: 'true'
        }
      } as any);
    }
  };

  return (
    <DashboardLayout 
      title="Add More Packages" 
      subtitle="Expand Your Learning"
      activeSection="marketplace"
    >
      <ScrollView className="flex-1 p-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">Expand Your Learning</Text>
        <Text className="text-gray-600 mb-6">Add more packages to your Pro subscription</Text>
        
        {/* Package Grid */}
        {availablePackages.map((pkg) => {
          const isSelected = selectedPackages.includes(pkg.id);
          return (
            <TouchableOpacity
              key={pkg.id}
              onPress={() => togglePackageSelection(pkg.id)}
              className={`bg-white rounded-xl p-6 mb-4 border-2 ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900">{pkg.name}</Text>
                  <Text className="text-sm text-gray-600 mt-1">{pkg.description}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-2xl font-bold text-blue-600">Rs {pkg.price}</Text>
                  <Text className="text-sm text-gray-500">{pkg.lessons} lessons</Text>
                </View>
              </View>

              {/* Subjects */}
              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-2">Subjects Included:</Text>
                <View className="flex-row flex-wrap">
                  {pkg.subjects.map((subject, index) => (
                    <View key={index} className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
                      <Text className="text-xs text-gray-700">{subject}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Selection Indicator */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MaterialIcons 
                    name={isSelected ? "check-circle" : "radio-button-unchecked"} 
                    size={24} 
                    color={isSelected ? "#3B82F6" : "#9CA3AF"} 
                  />
                  <Text className={`ml-2 font-semibold ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {isSelected ? 'Selected' : 'Select Package'}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
                  <Text className="text-sm text-gray-500 ml-1">{pkg.lessons} lessons</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Bottom Summary */}
        {selectedPackages.length > 0 && (
          <View className="bg-white rounded-xl p-6 border border-gray-200 sticky bottom-0">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">
                {selectedPackages.length} Package{selectedPackages.length > 1 ? 's' : ''} Selected
              </Text>
              <Text className="text-2xl font-bold text-blue-600">Rs {getTotalPrice()}</Text>
            </View>

            <TouchableOpacity
              onPress={proceedToCheckout}
              className="bg-blue-500 py-4 rounded-lg"
            >
              <Text className="text-white text-center text-lg font-semibold">
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {selectedPackages.length === 0 && (
          <View className="bg-white rounded-xl p-8 items-center border border-gray-200 mt-4">
            <MaterialIcons name="shopping-cart" size={48} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-gray-600 mt-4">Select Packages to Continue</Text>
            <Text className="text-sm text-gray-500 mt-2 text-center">
              Choose one or more packages to add to your Pro subscription.
            </Text>
          </View>
        )}
      </ScrollView>
    </DashboardLayout>
  );
}