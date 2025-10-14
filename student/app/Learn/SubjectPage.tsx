import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { gradePackages, Subject } from '../../utils/subjectData';
import HeaderFifth from '../../components/Headers/HeaderFifth';

export default function SubjectPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const packageId = params.packageId as string;
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState<'all' | 'science' | 'language' | 'other'>('all');

  const packageData = gradePackages[packageId];

  if (!packageData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Package not found.</Text>
      </View>
    );
  }

  // Filter subjects based on search and category
  const filteredSubjects = packageData.subjects.filter((subject) => {
    const matchesSearch = searchQuery.trim() === '' || 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'science') {
      matchesFilter = ['Physics', 'Chemistry', 'Biology', 'Science'].includes(subject.name);
    } else if (selectedFilter === 'language') {
      matchesFilter = ['English'].includes(subject.name);
    } else if (selectedFilter === 'other') {
      matchesFilter = ['Mathematics', 'Computer Science', 'Social Studies'].includes(subject.name);
    }
    
    return matchesSearch && matchesFilter;
  });

  const SubjectCard = ({ subject, index }: { subject: Subject; index: number }) => {
    // Calculate demo progress based on subject (just for UI demo)
    const progress = subject.id.includes('physics') ? 45 : 
                    subject.id.includes('chemistry') ? 30 : 
                    subject.id.includes('mathematics') || subject.id.includes('math') ? 60 : 
                    subject.id.includes('biology') ? 25 : 
                    subject.id.includes('science') ? 55 : 
                    subject.id.includes('english') ? 40 : 
                    subject.id.includes('cs') || subject.id.includes('computer') ? 35 : 
                    subject.id.includes('social') ? 50 : 20;

    // Demo tutor names
    const tutors = [
      'Prof. Sharma',
      'Dr. Patel',
      'Prof. Kumar',
      'Dr. Singh',
      'Prof. Gupta',
    ];
    const tutorName = tutors[index % tutors.length];

    return (
      <TouchableOpacity
        className="mx-4 my-2 p-5 bg-white border border-gray-200 rounded-3xl"
        activeOpacity={0.85}
        onPress={() => {
          // Navigate to first chapter of this subject
          if (subject.chapters && subject.chapters.length > 0) {
            router.push({
              pathname: '/Learn/[chapter]',
              params: { chapter: subject.chapters[0] }
            });
          }
        }}
      >
        <View>
          {/* Tutor name */}
          <Text className="text-xs text-customBlue font-semibold mb-1">
            {tutorName}
          </Text>

          {/* Subject title */}
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {subject.name}
          </Text>

          {/* Description */}
          <Text className="text-xs text-gray-500 mb-2">
            {subject.description}
          </Text>

          {/* Tags/Stats */}
          <View className="flex-row flex-wrap mb-3">
            <View className="flex-row items-center mr-3 mb-1 mt-2 px-2 py-1 bg-gray-50 border rounded-full border-gray-200">
              <MaterialIcons name="auto-stories" size={13} color="#2563eb" />
              <Text className="ml-1 text-xs font-medium text-gray-700">
                {subject.totalLessons} Lessons
              </Text>
            </View>
            <View className="flex-row items-center mr-3 mb-1 mt-2 px-2 py-1 bg-gray-50 border rounded-full border-gray-200">
              <MaterialIcons name="schedule" size={13} color="#2563eb" />
              <Text className="ml-1 text-xs font-medium text-gray-700">
                {subject.estimatedHours}+ Hours
              </Text>
            </View>
            <View className="flex-row items-center mr-3 mb-1 mt-2 px-2 py-1 bg-gray-50 border rounded-full border-gray-200">
              <MaterialIcons name="menu-book" size={13} color="#2563eb" />
              <Text className="ml-1 text-xs font-medium text-gray-700">
                {subject.chapters.length} Chapters
              </Text>
            </View>
          </View>

          {/* Progress text and bar */}
          <Text className="text-sm text-blue-500 font-semibold mb-1">
            {progress}% <Text className="text-gray-500 text-sm font-medium">completed</Text>
          </Text>
          <View className="flex-row items-center">
            <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
              <View className="h-2 bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
            </View>
            <Text className="text-xs text-blue-500 font-semibold">{progress}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <HeaderFifth 
        title={packageData.title} 
        subtitle={packageData.description} 
        onBack={() => router.back()} 
      />

      {/* Info Box */}
      <View className="px-4 py-3">
        <Text className="text-sm text-gray-700">
          Choose a subject to start learning. Each subject contains multiple chapters with comprehensive lessons.
        </Text>
        <View className="flex-row items-center mt-4 mb-2">
          <Text className="ml-1 text-sm text-gray-600">
           Total <Text className="font-semibold text-blue-600">{packageData.subjects.length} subjects</Text> • Active
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-3">
        <View className="bg-gray-50 rounded-3xl flex-row items-center px-4 py-3 border border-gray-200">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <Text
            className="flex-1 ml-3 text-sm text-gray-600"
            onPress={() => {
              // In a real app, this would be a TextInput
              // For now, just a placeholder
            }}
          >
            {searchQuery || 'Search subjects...'}
          </Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View className="flex-row px-4 pb-3 gap-2">
        <TouchableOpacity
          activeOpacity={0.7}
          className={`px-3 py-1.5 rounded-full border ${
            selectedFilter === 'all' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
          }`}
          onPress={() => setSelectedFilter('all')}
        >
          <Text className={`text-sm font-medium ${
            selectedFilter === 'all' ? 'text-white' : 'text-gray-700'
          }`}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className={`px-3 py-1.5 rounded-full border ${
            selectedFilter === 'science' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
          }`}
          onPress={() => setSelectedFilter('science')}
        >
          <Text className={`text-sm font-medium ${
            selectedFilter === 'science' ? 'text-white' : 'text-gray-700'
          }`}>
            Science
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className={`px-3 py-1.5 rounded-full border ${
            selectedFilter === 'language' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
          }`}
          onPress={() => setSelectedFilter('language')}
        >
          <Text className={`text-sm font-medium ${
            selectedFilter === 'language' ? 'text-white' : 'text-gray-700'
          }`}>
            Language
          </Text>
        </TouchableOpacity>
         <TouchableOpacity
          activeOpacity={0.7}
          className={`px-3 py-1.5 rounded-full border ${
            selectedFilter === 'science' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
          }`}
          onPress={() => setSelectedFilter('science')}
        >
          <Text className={`text-sm font-medium ${
            selectedFilter === 'science' ? 'text-white' : 'text-gray-700'
          }`}>
            Physics
          </Text>
        </TouchableOpacity>
         <TouchableOpacity
          activeOpacity={0.7}
          className={`px-3 py-1.5 rounded-full border ${
            selectedFilter === 'science' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
          }`}
          onPress={() => setSelectedFilter('science')}
        >
          <Text className={`text-sm font-medium ${
            selectedFilter === 'science' ? 'text-white' : 'text-gray-700'
          }`}>
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className={`px-3 py-1.5 rounded-full border ${
            selectedFilter === 'other' ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
          }`}
          onPress={() => setSelectedFilter('other')}
        >
          <Text className={`text-sm font-medium ${
            selectedFilter === 'other' ? 'text-white' : 'text-gray-700'
          }`}>
            Other
          </Text>
        </TouchableOpacity>
      </View>

      {/* Subjects List */}
      <ScrollView 
        className="flex-1 px-0 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filteredSubjects.length === 0 ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
            <Text className="text-base font-semibold text-gray-900 mt-4">
              No subjects found
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filter
            </Text>
          </View>
        ) : (
          <>
            {/* Core Subjects Section */}
            <View className="flex-row items-center px-4 mt-2 mb-2">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-2 text-xs text-gray-500 font-semibold tracking-widest uppercase">
                Core Subjects
              </Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {filteredSubjects.slice(0, Math.ceil(filteredSubjects.length / 2)).map((subject, index) => {
              const globalIndex = packageData.subjects.findIndex(s => s.id === subject.id);
              return (
                <React.Fragment key={subject.id}>
                  <SubjectCard subject={subject} index={globalIndex} />
                  
                  {/* Add informational text after first subject (Physics/Science) */}
                  {index === 0 && (subject.name === 'Physics' || subject.name === 'Science') && (
                    <View className="mx-8 my-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <Text className="text-sm font-bold text-gray-800 mb-2">
                        Why {subject.name}?
                      </Text>
                      <Text className="text-sm text-gray-700">
                        Understanding {subject.name.toLowerCase()} helps you grasp the fundamental laws of nature and develop critical thinking skills essential for scientific reasoning.
                      </Text>
                    </View>
                  )}

                  {/* Add informational text after Mathematics */}
                  {subject.name === 'Mathematics' && (
                    <View className="mx-8 my-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <Text className="text-sm font-bold text-gray-800 mb-2">
                        Master Problem Solving
                      </Text>
                      <Text className="text-sm text-gray-700">
                        Mathematics is the language of science and technology. Build strong analytical skills that apply to every field of study and career.
                      </Text>
                    </View>
                  )}
                </React.Fragment>
              );
            })}

            {/* Additional Subjects Section (if more than 3 subjects) */}
            {filteredSubjects.length > 3 && (
              <>
                <View className="flex-row items-center px-4 mt-2 mb-2">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="mx-2 text-xs text-gray-500 font-semibold tracking-widest uppercase">
                    Additional Subjects
                  </Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                {filteredSubjects.slice(Math.ceil(filteredSubjects.length / 2)).map((subject, index) => {
                  const globalIndex = packageData.subjects.findIndex(s => s.id === subject.id);
                  return (
                    <React.Fragment key={subject.id}>
                      <SubjectCard subject={subject} index={globalIndex} />
                      
                      {/* Add informational text after English */}
                      {subject.name === 'English' && (
                        <View className="mx-8 my-4 p-4 bg-pink-50 border border-pink-100 rounded-xl">
                          <Text className="text-sm font-bold text-gray-800 mb-2">
                            📚 Communication Excellence
                          </Text>
                          <Text className="text-sm text-gray-700">
                            Strong English skills open doors globally. Master reading, writing, and critical analysis for academic and professional success.
                          </Text>
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
