import React, { useState, useCallback } from "react";
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView, Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import SearchBar from "./components/SearchBar";
import FilterModal from "./components/FilterModal";

interface Course {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  type: 'free' | 'pro';
  grade?: string;
  subject?: string;
  duration?: string;
  rating?: number;
  enrolledCount?: number;
  skills?: string[];
  features?: string[];
  isFeatured?: boolean;
}

export default function AllCoursesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all', // all, free, pro
    grade: 'all', // all, grade10, grade11, grade12
    subject: 'all' // all, math, science, english, etc.
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['see', 'plus2', 'bachelor', 'ctevt']);
  const [viewMode, setViewMode] = useState<'plans' | 'programs'>('programs');

  // All available courses
  const allCourses: Course[] = [
    // Free Courses
    {
      id: "free-study-basics",
      name: "Learn How To Actually Study",
      price: 0,
      description: "Master effective study habits and time management techniques",
      icon: "school",
      type: "free",
      grade: "all",
      subject: "general",
      duration: "40 mins+",
      rating: 4.8,
      enrolledCount: 12500,
      skills: ['Study Habits', 'Time Management', 'Focus', 'Memory'],
      features: ['Mobile Friendly', 'Self-paced', 'Beginner Friendly'],
      isFeatured: true
    },
    // Pro Packages
    {
      id: "grade10",
      name: "Grade 10 Complete Package",
      price: 2499,
      description: "Comprehensive study materials and live classes for Grade 10",
      icon: "menu-book",
      type: "pro",
      grade: "grade10",
      subject: "all",
      duration: "Full Year",
      rating: 4.9,
      enrolledCount: 3200,
      skills: ['Live Learning', 'Interactive Sessions', 'Expert Guidance'],
      features: ['Live Classes', 'Recorded Videos', 'Study Materials', 'Practice Tests', 'Doubt Clearing']
    },
    {
      id: "grade11",
      name: "Grade 11 Advanced Package",
      price: 2499,
      description: "Advanced materials and competitive exam preparation for Grade 11",
      icon: "auto-stories",
      type: "pro",
      grade: "grade11",
      subject: "all",
      duration: "Full Year",
      rating: 4.9,
      enrolledCount: 2800,
      skills: ['Advanced Learning', 'Competitive Prep', 'Career Guidance'],
      features: ['Daily Live Classes', 'Premium Videos', 'Advanced Materials', 'Mock Tests', 'One-on-one Sessions']
    },
    {
      id: "grade12",
      name: "Grade 12 Board Prep Package",
      price: 2499,
      description: "Board exam focused coaching and college admission support",
      icon: "school",
      type: "pro",
      grade: "grade12",
      subject: "all",
      duration: "Full Year",
      rating: 4.9,
      enrolledCount: 3500,
      skills: ['Board Exam Focus', 'Live Coaching', 'Career Guidance'],
      features: ['Intensive Coaching', 'Previous Papers', 'Mock Tests', 'Career Counseling', 'College Support']
    }
  ];

  // Filter courses based on search and filters
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedFilters.type === 'all' || course.type === selectedFilters.type;
    const matchesGrade = selectedFilters.grade === 'all' || course.grade === selectedFilters.grade;
    const matchesSubject = selectedFilters.subject === 'all' || course.subject === selectedFilters.subject;

    return matchesSearch && matchesType && matchesGrade && matchesSubject;
  });

  // Group courses by category
  const featuredCourses = filteredCourses.filter(c => c.isFeatured);
  const freeCourses = filteredCourses.filter(c => c.type === 'free');
  const proCourses = filteredCourses.filter(c => c.type === 'pro');

  // Program sections for educational levels
  const programSections = [
    {
      id: 'see',
      title: 'SEE (Secondary Level)',
      description: 'Grade 8-10 - Secondary Education Examination',
      courses: filteredCourses.filter(c => c.grade === 'grade8-10' || c.grade === 'grade10'),
      icon: 'school',
      color: 'blue'
    },
    {
      id: 'plus2',
      title: '+2 (High School)',
      description: 'Grade 11-12 - Higher Secondary Education',
      courses: filteredCourses.filter(c => c.grade === 'grade11' || c.grade === 'grade12'),
      icon: 'menu-book',
      color: 'blue'
    },
    {
      id: 'bachelor',
      title: 'Bachelor (Undergraduate)',
      description: 'University level education and professional courses',
      courses: [], // Empty for now, can be populated later
      icon: 'auto-stories',
      color: 'blue'
    },
    {
      id: 'ctevt',
      title: 'CTEVT',
      description: 'Council for Technical Education and Vocational Training',
      courses: [], // Empty for now, can be populated later
      icon: 'engineering',
      color: 'blue'
    }
  ];

  // Course sections for expandable layout (Plans view)
  const plansSections = [
    {
      id: 'featured',
      title: 'Featured',
      description: 'Popular and highly-rated courses',
      courses: featuredCourses,
      icon: 'star-outline',
      color: 'blue'
    },
    {
      id: 'pro',
      title: 'Pro',
      description: 'Premium learning experience with live classes',
      courses: proCourses,
      icon: 'workspace-premium',
      color: 'blue'
    },
    {
      id: 'free',
      title: 'Free',
      description: 'Learn at your own pace with our free content',
      courses: freeCourses,
      icon: 'school',
      color: 'blue'
    }
  ];

  // Use appropriate sections based on view mode
  const courseSections = viewMode === 'plans' ? plansSections : programSections;

  const viewModeDescription = viewMode === 'programs' 
    ? 'Browse courses by educational level and program type'
    : 'Discover courses and packages tailored for your learning journey';

  // View mode toggle classes
  const programsClass = `flex-1 py-2 px-4 rounded-3xl mr-1 ${viewMode === 'programs' ? 'bg-blue-500' : 'bg-transparent'}`;
  const plansClass = `flex-1 py-2 px-4 rounded-3xl ml-1 ${viewMode === 'plans' ? 'bg-blue-500' : 'bg-transparent'}`;
  const programsTextClass = `text-center text-sm font-medium ${viewMode === 'programs' ? 'text-white' : 'text-gray-600'}`;
  const plansTextClass = `text-center text-sm font-medium ${viewMode === 'plans' ? 'text-white' : 'text-gray-600'}`;

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const handleViewModeChange = useCallback((mode: 'plans' | 'programs') => {
    setViewMode(mode);
    // Reset expanded sections based on the new view mode
    if (mode === 'plans') {
      setExpandedSections(['featured', 'pro', 'free']);
    } else {
      setExpandedSections(['see', 'plus2', 'bachelor', 'ctevt']);
    }
  }, []);

  const handleCoursePress = (course: Course) => {
    if (course.isFeatured) {
      router.push('/Home/Components/FirstCourseDescription');
    } else {
      // Navigate to ProMarketplace with course details to show PackageDetailView directly
      router.push({
        pathname: '/Home/ProMarketplace',
        params: {
          courseId: course.id,
          courseName: course.name,
          courseType: course.type,
          packageType: course.type === 'free' ? 'free' : 'paid',
          trialType: course.type === 'free' ? 'free' : 'paid', // Add trialType for ProMarketplace
          directView: 'true' // Flag to show PackageDetailView directly
        }
      });
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FAFAFA]"
      // No paddingTop, content will be at the very top
    >
      {/* Search and Filter */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search courses..."
        />
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="flex-row items-center mt-3"
        >
          <MaterialIcons name="filter-list" size={20} color="#3B82F6" />
          <Text className="text-blue-600 font-medium ml-2">Filters</Text>
          {(selectedFilters.type !== 'all' || selectedFilters.grade !== 'all' || selectedFilters.subject !== 'all') && (
            <View className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View className="px-4 py-3 mt-2 bg-white border-gray-200">
        <View className="flex-row bg-gray-100 rounded-3xl p-1">
          <TouchableOpacity
            onPress={() => handleViewModeChange('programs')}
            className={programsClass}
          >
            <Text className={programsTextClass}>
              In terms of Programs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleViewModeChange('plans')}
            className={plansClass}
          >
            <Text className={plansTextClass}>
              In terms of Plans
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          <Text className="text-base mt-4 text-gray-800 mb-6">
            {viewModeDescription}
          </Text>

          {courseSections.map((section) => {
            const iconName = expandedSections.includes(section.id) ? 'keyboard-arrow-up' : 'keyboard-arrow-down';
            const courseCountText = `${section.courses.length} courses`;
            const noCoursesText = `No ${section.title.toLowerCase()} available`;
            
            return (
              <View key={section.id} className="mb-4">
                {/* Section Header */}
                <TouchableOpacity
                  onPress={() => toggleSection(section.id)}
                  className="flex-row items-center justify-between bg-gray-100 rounded-lg p-4 mb-3"
                >
                  <View className="flex-1">
                    <View className="flex-row items-center flex-wrap">
                      <Text className="text-lg font-bold text-gray-900">
                        {section.title}
                      </Text>
                      <View className="ml-2 px-2 py-1 bg-gray-200 rounded-full">
                        <Text className="text-xs text-gray-600 font-medium">
                          {courseCountText}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600 mt-1">
                      {section.description}
                    </Text>
                  </View>
                  <MaterialIcons
                    name={iconName}
                    size={24}
                    color="#374151"
                  />
                </TouchableOpacity>

                {/* Section Content */}
                {expandedSections.includes(section.id) && (
                  <View className="ml-4">
                    {section.courses.length > 0 ? (
                      section.courses.map((course) => {
                        const pressableClass = 'border rounded-xl p-4 mb-3 border-gray-300 bg-white';
                        const priceText = course.price === 0 ? 'Free' : `Rs. ${course.price}`;
                        const paymentText = course.price === 0 ? 'No payment required' : 'One-time payment';
                        const enrolledText = course.enrolledCount && course.enrolledCount > 1000 
                          ? `${(course.enrolledCount / 1000).toFixed(1)}k` 
                          : (course.enrolledCount ? course.enrolledCount.toString() : '');
                        const skillsText = course.skills && course.skills.length > 2 ? `+${course.skills.length - 2}` : '';
                        
                        return (
                          <Pressable
                            key={course.id}
                            onPress={() => handleCoursePress(course)}
                            className={pressableClass}
                          >
                            <View className="flex-row justify-between items-center">
                              <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-2">
                                  <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">
                                    {course.name}
                                  </Text>
                                  <View className="flex-row">
                                    {course.type === 'pro' && (
                                      <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
                                        <Text className="text-xs text-blue-700 font-semibold">PRO</Text>
                                      </View>
                                    )}
                                  </View>
                                </View>

                                <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                                  {course.description}
                                </Text>

                                {/* Price and Rating */}
                                <View className="flex-row items-center justify-between mb-3">
                                  <View>
                                    <Text className="text-lg font-semibold text-blue-600">
                                      {priceText}
                                    </Text>
                                    <Text className="text-xs text-gray-500">
                                      {paymentText}
                                    </Text>
                                  </View>
                                  {course.rating && (
                                    <View className="flex-row items-center">
                                      <MaterialIcons name="star" size={16} color="#3B82F6" />
                                      <Text className="text-gray-700 text-sm ml-1">
                                        {course.rating}
                                      </Text>
                                      {enrolledText && (
                                        <Text className="text-gray-500 text-xs ml-2">
                                          ({enrolledText})
                                        </Text>
                                      )}
                                    </View>
                                  )}
                                </View>

                                {/* Duration and Skills */}
                                <View className="flex-row items-center justify-between">
                                  {course.duration && (
                                    <View className="flex-row items-center">
                                      <MaterialIcons name="schedule" size={14} color="#6B7280" />
                                      <Text className="text-gray-500 text-xs ml-1">
                                        {course.duration}
                                      </Text>
                                    </View>
                                  )}
                                  {course.skills && course.skills.length > 0 && (
                                    <View className="flex-row flex-wrap">
                                      {course.skills.slice(0, 2).map((skill, index) => (
                                        <View key={index} className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                                          <Text className="text-xs text-gray-600">
                                            {skill}
                                          </Text>
                                        </View>
                                      ))}
                                      {skillsText && (
                                        <View className="bg-gray-100 rounded-full px-2 py-1">
                                          <Text className="text-xs text-gray-600">
                                            {skillsText}
                                          </Text>
                                        </View>
                                      )}
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                          </Pressable>
                        );
                      })
                    ) : (
                      <View className="bg-gray-50 rounded-lg p-8 items-center">
                        <MaterialIcons name="school" size={48} color="#3B82F6" />
                        <Text className="text-gray-500 text-center mt-4">
                          {noCoursesText}
                        </Text>
                        <Text className="text-gray-400 text-center text-sm mt-1">
                          Try adjusting your search or filters
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {/* No Results */}
          {filteredCourses.length === 0 && (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="search-off" size={64} color="#3B82F6" />
              <Text className="text-gray-500 text-lg mt-4">No courses found</Text>
              <Text className="text-gray-400 text-center mt-2 px-8">
                Try adjusting your search or filters to find more courses.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={selectedFilters}
        onApplyFilters={setSelectedFilters}
      />
    </SafeAreaView>
  );
}