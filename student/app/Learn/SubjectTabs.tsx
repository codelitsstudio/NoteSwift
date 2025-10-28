import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Subject } from '../../utils/courseData';

interface SubjectTabsProps {
  packageData: {
    _id?: string;
    title: string;
    description: string;
    subjects: Subject[];
  };
  courseKey?: string;
  enrollment?: {
    progress: number;
    moduleProgress?: Array<{
      moduleNumber: number;
      videoCompleted: boolean;
      notesCompleted: boolean;
      progress: number;
    }>;
  };
  courseOfferedBy?: string;
  courseTeachers?: Array<{
    subjectName: string;
    teacher: {
      id: string;
      name: string;
      email: string;
    } | null;
  }>;
}

export default function SubjectTabs({ packageData, courseKey = 'course-1', enrollment, courseOfferedBy, courseTeachers }: SubjectTabsProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState<'all' | 'science' | 'language' | 'other'>('all');

  // Filter subjects based on search and category
  const filteredSubjects = packageData.subjects.filter((subject) => {
    const matchesSearch = searchQuery.trim() === '' || 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'science') {
      matchesFilter = ['Physics', 'Chemistry', 'Biology', 'Science'].some(name => 
        subject.name.toLowerCase().includes(name.toLowerCase())
      );
    } else if (selectedFilter === 'language') {
      matchesFilter = ['English', 'Language'].some(name => 
        subject.name.toLowerCase().includes(name.toLowerCase())
      );
    } else if (selectedFilter === 'other') {
      matchesFilter = !['Physics', 'Chemistry', 'Biology', 'Science', 'English', 'Language'].some(name => 
        subject.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    return matchesSearch && matchesFilter;
  });

  const SubjectCard = ({ subject, index }: { subject: Subject; index: number }) => {
    // Calculate real progress from enrollment data
    const getSubjectProgress = (subject: Subject): number => {
      if (!enrollment?.moduleProgress || !subject.modules) {
        return 0; // No progress data available
      }
      
      // For now, use overall course progress as subject progress
      // TODO: Implement subject-specific progress calculation when module-to-subject mapping is available
      return enrollment.progress || 0;
    };

    const progress = getSubjectProgress(subject);

    // Use real teacher name from courseTeachers or fallback to courseOfferedBy
    const getSubjectTeacher = (subject: Subject): string => {
      if (courseTeachers) {
        const subjectTeacher = courseTeachers.find(ct => ct.subjectName === subject.name);
        if (subjectTeacher?.teacher) {
          return subjectTeacher.teacher.name;
        }
      }
      return courseOfferedBy || 'Course Instructor';
    };

    const tutorName = getSubjectTeacher(subject);

    return (
      <View className="mx-1 my-2">
        <TouchableOpacity
          className="p-5 bg-white border border-gray-200 rounded-3xl"
          activeOpacity={0.85}
          onPress={() => {
            // Navigate to the subject's chapter view
            console.log('🚀 SubjectTabs navigation:', {
              subjectId: subject.id,
              subjectName: subject.name,
              courseKey: courseKey,
            });
            router.push({
              pathname: '/Subject/[subject]',
              params: { subject: encodeURIComponent(subject.id), courseKey: courseKey }
            });
          }}
        >
          <View className="flex-row items-center">
            <View className="flex-1">
            
  {/* Tutor name */}
            <Text className="text-xs italic text-customBlue font-semibold mb-1">
              {tutorName}
            </Text>

              {/* Subject title */}
              <Text className="text-base font-semibold text-gray-900 mb-1">
                {subject.name}
              </Text>

              {/* Description */}
              <Text className="text-xs text-gray-500 mb-3">
                {subject.description}
              </Text>

              {/* Tags/Stats */}
              <View className="flex-row flex-wrap">
                <View className="flex-row items-center mr-3 mb-1 px-2 py-1 bg-gray-50 border rounded-full border-gray-200">
                  <MaterialIcons name="auto-stories" size={13} color="#2563eb" />
                  <Text className="ml-1 text-xs font-medium text-gray-700">
                    {subject.totalLessons} Lessons
                  </Text>
                </View>
                <View className="flex-row items-center mr-3 mb-1 px-2 py-1 bg-gray-50 border rounded-full border-gray-200">
                  <MaterialIcons name="schedule" size={13} color="#2563eb" />
                  <Text className="ml-1 text-xs font-medium text-gray-700">
                    ~1 Year
                  </Text>
                </View>
              </View>
            </View>

            {/* Chevron Icon */}
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        {/* Progress text and bar - Outside the card */}
        <View className="px-2 mt-2">
         
          <View className="flex-row items-center">
            <View className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2">
              <View className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
            </View>
            <Text className="text-xs text-blue-500 font-semibold">{progress}%</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
     

      {/* Filter Buttons */}
      <View className="flex-row mt-2 pb-3 gap-2">
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
                </React.Fragment>
              );
            })}

            {/* Essential Subjects Section (if more than 3 subjects) */}
            {filteredSubjects.length > 3 && (
              <>
                <View className="flex-row items-center px-4 mt-2 mb-2">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="mx-2 text-xs text-gray-500 font-semibold tracking-widest uppercase">
                    Essential Subjects
                  </Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                {filteredSubjects.slice(Math.ceil(filteredSubjects.length / 2)).map((subject, index) => {
                  const globalIndex = packageData.subjects.findIndex(s => s.id === subject.id);
                  return (
                    <React.Fragment key={subject.id}>
                      <SubjectCard subject={subject} index={globalIndex} />
                      
                     
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
}
