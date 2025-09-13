import React from "react";
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import FloatingEnrollButton from "../../../components/Buttons/FloatingEnrollButton";

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  type: 'free' | 'paid';
  skills?: string[];
  learningPoints?: string[];
  modules?: {
    name: string;
    description: string;
    duration?: string;
  }[];
  features?: string[];
}

interface PackageDetailViewProps {
  package: Package;
  onBack: () => void;
  onSelect: (packageId: string) => void;
  isSelected: boolean;
}

export default function PackageDetailView({ 
  package: pkg, 
  onBack, 
  onSelect, 
  isSelected 
}: PackageDetailViewProps) {
  const router = useRouter();

  // Function to get appropriate icon for each service feature
  const getServiceIcon = (moduleName: string): keyof typeof MaterialIcons.glyphMap => {
    const name = moduleName.toLowerCase();
    
    if (name.includes('live') || name.includes('class')) return 'live-tv';
    if (name.includes('video') || name.includes('recorded') || name.includes('lecture')) return 'play-circle-filled';
    if (name.includes('material') || name.includes('study') || name.includes('download')) return 'library-books';
    if (name.includes('test') || name.includes('exam') || name.includes('practice') || name.includes('mock')) return 'quiz';
    if (name.includes('assignment') || name.includes('homework')) return 'assignment';
    if (name.includes('career') || name.includes('counseling') || name.includes('guidance')) return 'psychology';
    if (name.includes('platform') || name.includes('tour') || name.includes('introduction')) return 'explore';
    if (name.includes('competitive') || name.includes('entrance')) return 'school';
    if (name.includes('board') || name.includes('strategy')) return 'account-balance';
    if (name.includes('advanced') || name.includes('premium')) return 'star';
    
    return 'play-circle-filled'; // default icon
  };

  const FeatureItem = ({ 
    icon, 
    title, 
    subtitle, 
    className 
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    subtitle: string;
    className?: string;
  }) => (
    <View className={`flex-row items-start space-x-3 mb-4 ${className}`}>
      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mt-1">
        <MaterialIcons name={icon} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 mb-1">{title}</Text>
        <Text className="text-gray-600 text-sm leading-5">{subtitle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={onBack} className="p-2">
          <MaterialIcons name="chevron-left" size={32} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Package Details</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-6 py-6 bg-gradient-to-br from-blue-50 to-indigo-100">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
              <MaterialIcons name={pkg.icon as any} size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              {pkg.name}
            </Text>
            <Text className="text-gray-600 text-center text-base leading-6">
              {pkg.description}
            </Text>
            <View className="mt-4 bg-blue-500 px-4 py-2 rounded-full">
              <Text className="text-white font-bold text-lg">
                {pkg.type === 'free' ? 'FREE' : `₹${pkg.price}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Skills Section */}
        {pkg.skills && pkg.skills.length > 0 && (
          <View className="px-6 py-2">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Package Highlights
            </Text>
            <View className="flex-row flex-wrap">
              {pkg.skills.map((skill, index) => (
                <View 
                  key={index} 
                  className="bg-blue-100 px-3 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-blue-700 text-sm font-medium">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Learning Points Section */}
        {pkg.learningPoints && pkg.learningPoints.length > 0 && (
          <View className="px-6 py-6 bg-gray-50">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              What's Included
            </Text>
            {pkg.learningPoints.map((point, index) => (
              <View key={index} className="flex-row items-start mb-3">
                <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                  <MaterialIcons name="check" size={16} color="white" />
                </View>
                <Text className="flex-1 text-gray-700 text-base leading-6">{point}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Modules Section */}
        {pkg.modules && pkg.modules.length > 0 && (
          <View className="px-6 py-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Service Features
            </Text>
            {pkg.modules.map((module, index) => (
              <FeatureItem
                key={index}
                icon={getServiceIcon(module.name)}
                title={module.name}
                subtitle={`${module.description}${module.duration ? ` • ${module.duration}` : ''}`}
        className="mb-4 flex-row  gap-3"
              />
            ))}
          </View>
        )}

        {/* Features Section */}
        {pkg.features && pkg.features.length > 0 && (
          <View className="px-6 py-6 bg-gray-50">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              All Package Features
            </Text>
            <View className="flex-row flex-wrap">
              {pkg.features.map((feature, index) => (
                <View key={index} className="flex-row items-center mb-3 w-full">
                  <MaterialIcons name="verified" size={20} color="#10B981" />
                  <Text className="ml-2 text-gray-700 text-sm flex-1">{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="h-16" />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.floatingButtonContainer} pointerEvents="box-none">
        <View className="px-0" style={{ width: '100%' }}>
          <FloatingEnrollButton
            title={isSelected ? "Selected Package" : `Select ${pkg.name}`}
            subtitle={isSelected ? `Package Selected ✓` : "Add to your subscription"}
            bottom={32}
            onPress={() => onSelect(pkg.id)}
            isSelected={isSelected}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    zIndex: 50,
    elevation: 50,
  },
});