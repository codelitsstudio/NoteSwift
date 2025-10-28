import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, ScrollView, Text, TouchableOpacity, StatusBar, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from '../../api/axios';
import { useCourseStore } from '../../stores/courseStore';

interface Package {
  id: string;
  _id?: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  type: 'free' | 'pro' | 'paid';
  isFeatured?: boolean;
  skills?: string[];
  learningPoints?: string[];
  teacherName?: string;
  modules?: {
    name: string;
    description: string;
    duration?: string;
  }[];
  features?: string[];
  program?: string;
  subjects?: {
    name: string;
    description?: string;
    modules?: {
      name: string;
      description: string;
      duration?: string;
    }[];
  }[];
}

export default function ProMarketplace() {
  const router = useRouter();
  const { trialType, courseId, directView } = useLocalSearchParams();
  const [expandedSections, setExpandedSections] = useState<string[]>(['see', 'plus2']);
  const [courses, setCourses] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const { enrolledCourses } = useCourseStore();

  // Check if user has any Pro course enrollments
  const hasProEnrollment = enrolledCourses.some(enrolledCourseId => {
    const course = courses.find(c => (c.id || c._id) === enrolledCourseId);
    return course?.type === 'pro';
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      if (response.data.success) {
        const proCourses = response.data.data.courses
          .filter((course: any) => course.type === 'pro')
          .map((course: any) => ({
            ...course,
            id: course._id,
            name: course.title,
            price: course.price || 0,
            icon: course.icon || 'school',
            type: course.type === 'pro' ? 'pro' : 'paid',
            teacherName: course.offeredBy || 'Expert Faculty',
            skills: course.skills || [],
            learningPoints: course.learningPoints || [],
            features: course.features || [],
            subjects: course.subjects || []
          }));
        setCourses(proCourses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle course selection from AllCourses or direct navigation
  useEffect(() => {
    if (courseId && courses.length > 0 && directView !== 'true') {
      const selectedPackage = courses.find(pkg => pkg.id === courseId);
      if (selectedPackage) {
        router.replace({
          pathname: '/Home/Components/PackageDetails',
          params: { packageData: JSON.stringify(selectedPackage) }
        });
      }
    }
  }, [courseId, courses, directView, router]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  // If directView is true, navigate to PackageDetails immediately
  if (directView === 'true' && courseId) {
    const packageToShow = courses.find(pkg => pkg.id === courseId as string);
    if (packageToShow) {
      router.replace({
        pathname: '/Home/Components/PackageDetails',
        params: { packageData: JSON.stringify(packageToShow) }
      });
      return null; // Prevent rendering
    }
  }

  // Group packages by educational level - exclude already enrolled courses if user has pro
  const packageSections = [
    {
      id: 'see',
      title: 'SEE (Secondary Level)',
      description: 'Grade 10 - Secondary Education Examination',
      packages: courses
        .filter(pkg => !hasProEnrollment || !enrolledCourses.includes(pkg.id || pkg._id || ''))
        .filter(pkg => pkg.program === 'SEE' || pkg.name?.toLowerCase().includes('grade 10') || pkg.name?.toLowerCase().includes('10'))
    },
    {
      id: 'plus2',
      title: '+2 (High School)',
      description: 'Grades 11 & 12 - Higher Secondary Education',
      packages: courses
        .filter(pkg => !hasProEnrollment || !enrolledCourses.includes(pkg.id || pkg._id || ''))
        .filter(pkg => pkg.program === '+2' || pkg.name?.toLowerCase().includes('grade 11') || pkg.name?.toLowerCase().includes('grade 12') || pkg.name?.toLowerCase().includes('11') || pkg.name?.toLowerCase().includes('12'))
    }
  ];

  // Enhance package data with actual data from API
  const enhancePackageData = (pkg: Package) => {
    return pkg;
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom', 'top']}>
          <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
          
      {/* Header */}
   <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-6">
  {/* Back Button */}
  <TouchableOpacity onPress={handleBack}>
    <MaterialIcons name="chevron-left" size={32} color="#374151" />
  </TouchableOpacity>

  {/* Centered Title + Pro */}
  <View className="flex-row items-center space-x-2">
    <Text className="text-lg font-semibold text-gray-900">Premium Packages</Text>
    {hasProEnrollment && (
      <View className="bg-blue-100 ml-2 px-2 py-1 rounded-full">
        <Text className="text-xs text-blue-600 font-bold">PRO</Text>
      </View>
    )}
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
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-600">Loading packages...</Text>
          </View>
        ) : (
          <View>
            {/* Pro Marketplace Description */}
            <View className="px-5 mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-2">Pro Marketplace</Text>
              <Text className="text-gray-600 text-base">
                Check these other premium courses below to expand your learning journey.
              </Text>
            </View>

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
                      const enhancedPkg = enhancePackageData(pkg);
                      const isDisabled = false;
                      
                      return (
                        <TouchableOpacity
                          key={pkg.id}
                          onPress={() => router.push({
                            pathname: '/Home/Components/PackageDetails',
                            params: { packageData: JSON.stringify(enhancedPkg) }
                          })}
                          disabled={isDisabled}
                          className={`border rounded-xl p-4 mb-3 ${
                            isDisabled 
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
                                {pkg.isFeatured && (
                                  <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
                                    <Text className="text-xs text-blue-600 font-semibold">Featured</Text>
                                  </View>
                                )}
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
                                    <Text className="text-sm text-blue-500">(One-time payment)</Text>
                                  </>
                                )}
                              </Text>
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

          {/* Enrolled Pro Courses Section */}
          {hasProEnrollment && (
            <View className="px-5 mt-8 mb-6">
              {/* Section Header */}
              <View className="bg-gray-50 rounded-lg p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <MaterialIcons name="check-circle" size={24} color="#6B7280" />
                  <Text className="text-lg font-bold text-gray-900 ml-2">Your Enrolled Pro Courses</Text>
                </View>
                <Text className="text-gray-600 text-sm">
                  These premium courses are already enrolled by you. Keep up the great learning!
                </Text>
              </View>

              {/* Enrolled Courses List */}
              <View className="ml-4">
                {enrolledCourses
                  .map(enrolledCourseId => courses.find(c => (c.id || c._id) === enrolledCourseId))
                  .filter(course => course && course.type === 'pro')
                  .map(course => (
                    <View key={course!.id} className="border border-gray-300 rounded-xl p-4 mb-3 bg-gray-50">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <MaterialIcons name="school" size={20} color="#6B7280" />
                            <Text className="text-lg font-bold text-gray-900 ml-2">
                              {course!.name}
                            </Text>
                            <View className="ml-2 px-2 py-1 bg-zinc-100 rounded-full">
                              <Text className="text-xs text-zinc-600 font-semibold">ENROLLED</Text>
                            </View>
                          </View>
                          <Text className="text-sm text-gray-600 ml-7">
                            {course!.description}
                          </Text>
                          <View className="flex-row items-center mt-2 ml-7">
                            <Text className="text-sm text-zinc-500">
                              Already enrolled - Access anytime
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}