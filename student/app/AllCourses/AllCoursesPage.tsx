import React, { useState, useCallback, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity, Pressable } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import SearchBar from "./components/SearchBar";
import FilterModal from "./components/FilterModal";
import CourseListItem from "./components/CourseListItem";
import axios from '../../api/axios';

interface Course {
  _id: string;
  id: string;
  title: string;
  name?: string;
  price?: number;
  description: string;
  subjects?: {
    name: string;
    description?: string;
    modules?: {
      name: string;
      description: string;
      duration?: string;
    }[];
  }[];
  icon?: string;
  type: 'free' | 'pro' | 'featured';
  program: string;
  duration?: string;
  rating?: number;
  enrolledCount?: number;
  skills?: string[];
  features?: string[];
  learningPoints?: string[];
  offeredBy?: string;
  courseOverview?: string;
  syllabus?: {
    moduleNumber: number;
    title: string;
    description: string;
  }[];
  faq?: {
    question: string;
    answer: string;
  }[];
  isFeatured?: boolean;
  status?: string;
  keyFeatures?: string[];
}

export default function AllCoursesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    program: 'all',
    subject: 'all'
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['see', 'plus2', 'bachelor', 'ctevt']);
  const [viewMode, setViewMode] = useState<'plans' | 'programs'>('programs');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      if (response.data.success) {
        const courses = response.data.data.courses.map((course: any) => ({
          ...course,
          id: course._id,
          name: course.title,
          price: course.price || 0,
          icon: course.icon || 'school'
        }));
        setAllCourses(courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = allCourses.filter(course => {
    const courseName = course.name || course.title;
    const matchesSearch = courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedFilters.type === 'all' || course.type === selectedFilters.type;
    const matchesProgram = selectedFilters.program === 'all' || course.program === selectedFilters.program;
    const matchesSubject = selectedFilters.subject === 'all' ||
      course.subjects?.some(subject => subject.name === selectedFilters.subject);

    return matchesSearch && matchesType && matchesProgram && matchesSubject;
  });

  // Featured courses are pro courses marked as featured
  const featuredCourses = filteredCourses.filter(c => c.isFeatured && c.type === 'pro');
  // Free courses
  const freeCourses = filteredCourses.filter(c => c.type === 'free');
  // Pro courses (including featured ones)
  const proCourses = filteredCourses.filter(c => c.type === 'pro');

  const programSections = [
    {
      id: 'see',
      title: 'SEE (Secondary Level)',
      description: 'Grade 8-10 - Secondary Education Examination',
      courses: filteredCourses.filter(c => c.program === 'SEE'),
      icon: 'school',
      color: 'blue'
    },
    {
      id: 'plus2',
      title: '+2 (High School)',
      description: 'Grade 11-12 - Higher Secondary Education',
      courses: filteredCourses.filter(c => c.program === '+2'),
      icon: 'menu-book',
      color: 'blue'
    },
    {
      id: 'bachelor',
      title: 'Bachelor (Undergraduate)',
      description: 'University level education and professional courses',
      courses: filteredCourses.filter(c => c.program === 'Bachelor'),
      icon: 'auto-stories',
      color: 'blue'
    },
    {
      id: 'ctevt',
      title: 'CTEVT',
      description: 'Council for Technical Education and Vocational Training',
      courses: filteredCourses.filter(c => c.program === 'CTEVT'),
      icon: 'engineering',
      color: 'blue'
    }
  ];

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

  const courseSections = viewMode === 'plans' ? plansSections : programSections;

  const viewModeDescription = viewMode === 'programs' 
    ? 'Browse courses by educational level and program type'
    : 'Discover courses and packages tailored for your learning journey';

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const handleViewModeChange = useCallback((mode: 'plans' | 'programs') => {
    setViewMode(mode);
    if (mode === 'plans') {
      setExpandedSections(['featured', 'pro', 'free']);
    } else {
      setExpandedSections(['see', 'plus2', 'bachelor', 'ctevt']);
    }
  }, []);

  const handleCoursePress = (course: Course) => {
    const courseName = course.name || course.title;
    if (course.isFeatured) {
      // Transform course data to match PackageDetails expected format
      const packageData = {
        id: course.id || course._id,
        title: course.title,
        name: course.title,
        description: course.description,
        type: course.type === 'featured' ? 'pro' : course.type,
        isFeatured: course.isFeatured,
        price: course.price,
        skills: course.skills || [],
        learningPoints: course.learningPoints || [],
        subjects: course.subjects?.map(subject => ({
          subject: subject.name,
          description: subject.description || '',
          modules: subject.modules?.map(module => ({
            name: module.name,
            description: module.description,
            duration: module.duration || ''
          })) || []
        })),
        features: course.features || [],
        teacherName: course.offeredBy,
        keyFeatures: course.keyFeatures || [],
        faq: course.faq || []
      };

      router.push({
        pathname: '/Home/Components/PackageDetails',
        params: { packageData: JSON.stringify(packageData) }
      });
    } else {
      router.push({
        pathname: '/Home/ProMarketplace',
        params: {
          courseId: course.id || course._id,
          courseName: courseName,
          courseType: course.type,
          packageType: course.type === 'free' ? 'free' : 'paid',
          trialType: course.type === 'free' ? 'free' : 'paid',
          directView: 'true'
        }
      });
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FAFAFA'
      }}
      edges={['bottom']}
    >
      {/* Search and Filter */}
      <View style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        backgroundColor: 'white', 
        borderBottomWidth: 1, 
        borderBottomColor: '#E5E7EB' 
      }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search courses..."
        />
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}
        >
          <MaterialIcons name="filter-list" size={20} color="#3B82F6" />
          <Text style={{ color: '#2563EB', fontWeight: '500', marginLeft: 8 }}>Filters</Text>
          {(selectedFilters.type !== 'all' || selectedFilters.program !== 'all' || selectedFilters.subject !== 'all') && (
            <View style={{ 
              marginLeft: 8, 
              width: 8, 
              height: 8, 
              backgroundColor: '#3B82F6', 
              borderRadius: 4 
            }} />
          )}
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, marginTop: 8, backgroundColor: 'white', borderColor: '#E5E7EB' }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 24, padding: 4 }}>
          <TouchableOpacity
            onPress={() => handleViewModeChange('programs')}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 24,
              marginRight: 4,
              backgroundColor: viewMode === 'programs' ? '#3B82F6' : 'transparent'
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontSize: 12,
              fontWeight: '500',
              color: viewMode === 'programs' ? 'white' : '#4B5563'
            }}>
              In terms of Programs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleViewModeChange('plans')}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 24,
              marginLeft: 4,
              backgroundColor: viewMode === 'plans' ? '#3B82F6' : 'transparent'
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontSize: 12,
              fontWeight: '500',
              color: viewMode === 'plans' ? 'white' : '#4B5563'
            }}>
              In terms of Plans
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 14, marginTop: 16, color: '#1F2937', marginBottom: 24 }}>
            {viewModeDescription}
          </Text>

          {courseSections.map((section) => {
            const iconName = expandedSections.includes(section.id) ? 'keyboard-arrow-up' : 'keyboard-arrow-down';
            const courseCountText = `${section.courses.length} courses`;
            const noCoursesText = `No ${section.title.toLowerCase()} available`;
            
            return (
              <View key={section.id} style={{ marginBottom: 16 }}>
                {/* Section Header */}
                <TouchableOpacity
                  onPress={() => toggleSection(section.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>
                          {section.title}
                        </Text>
                      </View>
                      <View style={{ 
                        marginLeft: 8, 
                        paddingHorizontal: 8, 
                        paddingVertical: 4, 
                        backgroundColor: '#E5E7EB', 
                        borderRadius: 9999 
                      }}>
                        <Text style={{ fontSize: 12, color: '#4B5563', fontWeight: '500' }}>
                          {courseCountText}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: '#4B5563', marginTop: 4 }}>
                      {section.description}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <MaterialIcons
                      name={iconName}
                      size={24}
                      color="#374151"
                    />
                  </View>
                </TouchableOpacity>

                {/* Section Content */}
                {expandedSections.includes(section.id) && (
                  <View>
                    {section.courses.length > 0 ? (
                      <View>
                        {section.courses.map((course) => (
                          <CourseListItem 
                            key={course.id} 
                            course={course} 
                            onPress={() => handleCoursePress(course)} 
                          />
                        ))}
                      </View>
                    ) : (
                      <View style={{ 
                        backgroundColor: '#F9FAFB', 
                        borderRadius: 8, 
                        padding: 32, 
                        alignItems: 'center' 
                      }}>
                        <MaterialIcons name="school" size={48} color="#3B82F6" />
                        <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 16 }}>
                          {noCoursesText}
                        </Text>
                        <Text style={{ color: '#9CA3AF', textAlign: 'center', fontSize: 14, marginTop: 4 }}>
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
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
              <MaterialIcons name="search-off" size={64} color="#3B82F6" />
              <Text style={{ color: '#6B7280', fontSize: 16, marginTop: 16 }}>No courses found</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 32 }}>
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