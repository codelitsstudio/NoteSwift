import React, { useState, useCallback } from "react";
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView, Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import PackageDetailView from "./Components/PackageDetailView";

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

export default function ProMarketplace() {
  const router = useRouter();
  const { trialType } = useLocalSearchParams();
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['see', 'plus2']);

  // Available packages in marketplace
  const availablePackages: Package[] = [
    {
      id: "grade10",
      name: "Grade 10 Package",
      price: trialType === 'free' ? 0 : 2499,
      description: trialType === 'free' 
        ? "Try Grade 10 materials free for 7 days" 
        : "Complete study materials and practice tests for Grade 10",
      icon: "menu-book",
      type: trialType === 'free' ? 'free' : 'paid',
      skills: ['Live Learning', 'Interactive Sessions', 'Comprehensive Study', 'Expert Guidance'],
      learningPoints: [
        'Attend live classes with certified instructors',
        'Access high-quality recorded video lectures',
        'Download comprehensive study materials and notes',
        'Take unlimited practice tests and quizzes',
        'Get personalized assignments and feedback'
      ],
      modules: [
        {
          name: 'Live Classes',
          description: 'Weekly live sessions with expert instructors for all subjects',
          duration: trialType === 'free' ? 'Limited access' : '3 hours/week'
        },
        {
          name: 'Recorded Video Library',
          description: 'Access to high-quality recorded lectures',
          duration: trialType === 'free' ? '7-day access' : 'Lifetime access'
        },
        {
          name: 'Study Materials',
          description: 'Downloadable PDFs, notes, and reference materials',
          duration: trialType === 'free' ? 'Sample materials' : 'Unlimited downloads'
        },
        {
          name: 'Practice Tests',
          description: 'Mock tests, quizzes, and practice questions',
          duration: trialType === 'free' ? 'Limited attempts' : 'Unlimited attempts'
        }
      ],
      features: trialType === 'free' 
        ? ['7-day trial access', 'Sample live classes', 'Limited video lectures', 'Basic study materials', 'Few practice tests']
        : ['Live classes with instructors', 'Recorded video lectures', 'Downloadable study materials', 'Digital notes and PDFs', 'Unlimited assignments', 'Practice tests & quizzes', 'Progress tracking', 'Doubt clearing sessions']
    },
    {
      id: "grade11",
      name: "Grade 11 Package", 
      price: trialType === 'free' ? 0 : 2499,
      description: trialType === 'free'
        ? "Try Grade 11 materials free for 7 days"
        : "Comprehensive resources for Grade 11 curriculum",
      icon: "auto-stories",
      type: trialType === 'free' ? 'free' : 'paid',
      skills: ['Advanced Learning', 'Live Instruction', 'Comprehensive Materials', 'Expert Support'],
      learningPoints: [
        'Join interactive live classes with subject experts',
        'Access premium recorded video content',
        'Download advanced study materials and reference books',
        'Complete challenging assignments with expert feedback',
        'Take comprehensive tests and competitive exam practice'
      ],
      modules: [
        {
          name: 'Live Interactive Classes',
          description: 'Daily live sessions with subject specialists and Q&A',
          duration: trialType === 'free' ? 'Limited access' : '4 hours/week'
        },
        {
          name: 'Premium Video Content',
          description: 'Access to recorded lectures by top educators',
          duration: trialType === 'free' ? '7-day access' : 'Lifetime access'
        },
        {
          name: 'Advanced Study Materials',
          description: 'Comprehensive textbooks, reference guides, and study notes',
          duration: trialType === 'free' ? 'Sample materials' : 'Unlimited downloads'
        },
        {
          name: 'Competitive Exam Prep',
          description: 'Special tests and materials for JEE, NEET preparation',
          duration: trialType === 'free' ? 'Sample tests' : 'Full year access'
        }
      ],
      features: trialType === 'free'
        ? ['7-day trial access', 'Sample live classes', 'Limited premium videos', 'Basic study materials', 'Few competitive tests']
        : ['Daily live classes', 'Premium recorded videos', 'Advanced study materials', 'Digital textbooks & guides', 'Challenging assignments', 'Competitive exam tests', 'One-on-one doubt sessions', 'Progress analytics']
    },
    {
      id: "grade12",
      name: "Grade 12 Package",
      price: trialType === 'free' ? 0 : 2499,
      description: trialType === 'free'
        ? "Try Grade 12 board exam preparation free for 7 days"
        : "Board exam preparation and advanced materials for Grade 12",
      icon: "school",
      type: trialType === 'free' ? 'free' : 'paid',
      skills: ['Board Exam Focus', 'Live Coaching', 'Premium Content', 'Career Guidance'],
      learningPoints: [
        'Attend intensive live coaching sessions for board exams',
        'Access premium recorded lectures by top educators',
        'Get comprehensive study materials and previous year papers',
        'Receive personalized assignments and mock tests',
        'Get career guidance and college admission support'
      ],
      modules: [
        {
          name: 'Board Exam Coaching',
          description: 'Intensive live classes focused on board exam patterns',
          duration: trialType === 'free' ? 'Limited access' : '5 hours/week'
        },
        {
          name: 'Premium Video Lectures',
          description: 'Access to recorded content by expert teachers',
          duration: trialType === 'free' ? '7-day access' : 'Lifetime access'
        },
        {
          name: 'Exam Materials',
          description: 'Previous year papers, sample papers, and study guides',
          duration: trialType === 'free' ? 'Sample papers' : 'Unlimited access'
        },
        {
          name: 'Career Counseling',
          description: 'One-on-one sessions for college and career planning',
          duration: trialType === 'free' ? 'Not available' : '2 sessions/month'
        }
      ],
      features: trialType === 'free'
        ? ['7-day trial access', 'Sample coaching sessions', 'Limited video lectures', 'Few previous year papers', 'Basic study guides']
        : ['Intensive live coaching', 'Premium recorded lectures', 'Previous year papers', 'Sample papers & guides', 'Personalized assignments', 'Board exam mock tests', 'Career counseling', 'College admission support']
    },
  ];

  // Group packages by educational level
  const packageSections = [
    {
      id: 'see',
      title: 'SEE (Secondary Level)',
      description: 'Grade 10 - Secondary Education Examination',
      packages: availablePackages.filter(pkg => pkg.id === 'grade10')
    },
    {
      id: 'plus2',
      title: '+2 (High School)',
      description: 'Grades 11 & 12 - Higher Secondary Education',
      packages: availablePackages.filter(pkg => pkg.id === 'grade11' || pkg.id === 'grade12')
    }
  ];

  const handleSelectPackage = useCallback((packageId: string) => {
    setSelectedPackages(prev => {
      if (trialType === 'free') {
        // For trial, only allow one package selection
        return prev.includes(packageId) ? [] : [packageId];
      } else {
        // For paid, allow multiple selections
        return prev.includes(packageId)
          ? prev.filter(id => id !== packageId)
          : [...prev, packageId];
      }
    });
  }, [trialType]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const canProceedToCheckout = selectedPackages.length > 0;

  const handleNext = () => {
    const packages = selectedPackages;
    router.push({
      pathname: '/Home/ProCheckout' as any,
      params: { 
        trialType,
        selectedPackages: JSON.stringify(packages)
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* Package Detail View */}
      {viewingPackage && (
        <PackageDetailView
          package={viewingPackage}
          onBack={() => setViewingPackage(null)}
          onSelect={handleSelectPackage}
          isSelected={selectedPackages.includes(viewingPackage.id)}
        />
      )}

      {/* Main Marketplace View */}
      {!viewingPackage && (
        <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
   <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-6">
  {/* Back Button */}
  <TouchableOpacity onPress={handleBack}>
    <MaterialIcons name="chevron-left" size={32} color="#374151" />
  </TouchableOpacity>

  {/* Centered Title + Pro */}
  <View className="flex-row items-center space-x-2">
    <Text className="text-lg font-semibold text-gray-900">Packages</Text>
    
  </View>

  {/* Placeholder for alignment */}
  <View style={{ width: 24 }} />
</View>


      {/* Step Indicator */}
      <View className="flex-row justify-center items-center mb-6 px-5 mt-4">
        <View className="w-8 h-8 rounded-full items-center justify-center bg-blue-500">
          <Text className="text-sm font-bold text-white">✓</Text>
        </View>
        <View className="w-8 h-0.5 mx-1 bg-blue-500" />
        <View className="w-8 h-8 rounded-full items-center justify-center bg-blue-500">
          <Text className="text-sm font-bold text-white">2</Text>
        </View>
        <View className="w-8 h-0.5 mx-1 bg-gray-300" />
        <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-300">
          <Text className="text-sm font-bold text-gray-600">3</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View>

          <Text className="text-base text-gray-800 mb-4 px-5">
            {trialType === 'free' 
              ? 'Choose one grade package you want to try free for 7 days'
              : 'Select at least one paid package to continue'
            }
          </Text>

          <View className="px-5">
            {packageSections.map((section) => (
              <View key={section.id} className="mb-4">
                {/* Section Header */}
                <TouchableOpacity
                  onPress={() => toggleSection(section.id)}
                  className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4 mb-3"
                >
                  <View className="flex-1">
                    <View className="flex-row items-center flex-wrap">
                      <Text className="text-lg font-bold text-gray-900">
                        {section.id === 'see' ? 'SEE ' : '+2 '}
                      </Text>
                      <Text className="text-base font-semibold text-gray-900">
                        {section.id === 'see' ? '(Secondary Level)' : '(High School)'}
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-600 mt-1">{section.description}</Text>
                  </View>
                  <MaterialIcons 
                    name={expandedSections.includes(section.id) ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color="#374151" 
                  />
                </TouchableOpacity>

                {/* Section Content */}
                {expandedSections.includes(section.id) && (
                  <View className="ml-4">
                    {section.packages.map((pkg) => {
                      const isDisabled = false;
                      const isAutoSelected = false;
                      
                      return (
                        <TouchableOpacity
                          key={pkg.id}
                          onPress={() => !isDisabled && handleSelectPackage(pkg.id)}
                          disabled={isDisabled}
                          className={`border rounded-xl p-4 mb-3 ${
                            selectedPackages.includes(pkg.id) || isAutoSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isDisabled 
                                ? 'border-gray-200 bg-gray-100'
                                : 'border-gray-300 bg-white'
                          }`}
                        >
                          <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                              <View className="flex-row items-center">
                                <Text className={`text-lg font-bold ${
                                  isDisabled ? 'text-gray-400' : 'text-gray-900'
                                }`}>
                                  {pkg.name}
                                </Text>
                                {pkg.type === 'paid' && (
                                  <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
                                    <Text className="text-xs text-blue-600 font-semibold">PRO</Text>
                                  </View>
                                )}
                              </View>
                              <Text className={`text-sm mt-1 ${
                                isDisabled ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {pkg.description}
                              </Text>
                              <Text className="mt-2">
                                {pkg.price === 0 ? (
                                  <>
                                    <Text className="text-lg font-semibold text-gray-900">Rs. 0.00 </Text>
                                    <Text className="text-sm text-gray-500">(Free)</Text>
                                  </>
                                ) : (
                                  <>
                                    <Text className="text-lg font-semibold text-gray-900">Rs. {pkg.price} </Text>
                                    <Text className="text-sm text-gray-500">(One-time payment)</Text>
                                  </>
                                )}
                              </Text>

                              {/* View More Button */}
                              <TouchableOpacity 
                                onPress={() => setViewingPackage(pkg)}
                                className="mt-3 flex-row items-center"
                              >
                                <Text className="text-blue-600 text-sm font-medium">View Details</Text>
                                <MaterialIcons name="arrow-forward" size={16} color="#3B82F6" />
                              </TouchableOpacity>
                            </View>
                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                              selectedPackages.includes(pkg.id) || isAutoSelected
                                ? 'border-blue-500 bg-blue-500'
                                : isDisabled 
                                  ? 'border-gray-200'
                                  : 'border-gray-300'
                            }`}>
                              {(selectedPackages.includes(pkg.id) || isAutoSelected) && (
                                <MaterialIcons name="check" size={16} color="white" />
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <View className="px-5">
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceedToCheckout}
            className={`py-4 rounded-3xl mb-3 ${
              canProceedToCheckout ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <Text className={`text-center text-lg font-bold ${
              canProceedToCheckout ? 'text-white' : 'text-gray-500'
            }`}>
              {trialType === 'free' 
                ? `Start Free Trial (${selectedPackages.length} selected)` 
                : `Next (${selectedPackages.length} selected)`
              }
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBack}
            className="border border-gray-300 mb-4 py-3 rounded-3xl"
          >
            <Text className="text-gray-700 text-center text-lg font-semibold">Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
      )}
    </>
  );
}