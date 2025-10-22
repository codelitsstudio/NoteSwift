// more/components/StatCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAvatarStore } from '../../../stores/avatarStore';
import { useAuthStore } from '../../../stores/authStore';

// Demo enrolled courses data (7 total for testing)
const enrolledCourses = [
  { id: 'course-1', name: 'Grade 10 Learning Package', subjects: 12, status: 'Active' },
  { id: 'course-2', name: 'Grade 12 Learning Package', subjects: 15, status: 'Active' },
  { id: 'course-3', name: 'CTEVT Learning Package', subjects: 8, status: 'Active' },
  { id: 'course-4', name: 'JEE Foundation', subjects: 10, status: 'Active' },
  { id: 'course-5', name: 'NEET Prep', subjects: 9, status: 'Active' },
  { id: 'course-6', name: 'Mathematics Booster', subjects: 6, status: 'Active' },
  { id: 'course-7', name: 'English Fluency', subjects: 5, status: 'Active' }
];

const StatCard = () => {
  const router = useRouter();
  const { avatarEmoji } = useAvatarStore();
  const { user } = useAuthStore();
  // keep the demo list as initial seed, but manage courses in state so we can add new ones
  const [courses, setCourses] = useState(enrolledCourses);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  // pending selection inside modal — tapping a course toggles this but doesn't apply it until confirmed
  const [pendingSelectedId, setPendingSelectedId] = useState<string | null>(courses[0]?.id ?? null);
  const hasEnrolledCourses = courses.length > 0;

  // When user taps a course in the modal, just mark it as pending (tick). Apply only on confirm.
  const handleCourseSelect = (course: typeof enrolledCourses[0]) => {
    setPendingSelectedId(course.id);
  };

  const applyPendingSelection = () => {
    if (!pendingSelectedId) return;
    const course = courses.find((c) => c.id === pendingSelectedId);
    if (course) {
      setSelectedCourse(course);
    }
    setShowDropdown(false);
    // TODO: Trigger refetch of Learn, Ask, Test data based on selected course
  };

  if (!hasEnrolledCourses) {
    return (
      <View className="px-5 mt-6 mb-2">
        <TouchableOpacity
          className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6"
          onPress={() => router.push('/AllCourses/AllCoursesPage')}
        >
          <View className="items-center">
            <MaterialIcons name="school" size={48} color="#9CA3AF" />
            <Text className="text-gray-900 text-lg font-bold mt-3">
              Enroll in Courses to Select
            </Text>
            <Text className="text-gray-500 text-sm mt-1 text-center">
              Browse available courses and start your learning journey
            </Text>
            <View className="bg-blue-600 rounded-full px-4 py-2 mt-4">
              <Text className="text-white text-sm font-semibold">Browse Courses</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="px-5 mt-6 mb-2">
      {/* Course Selector Card */}
      <View className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        {/* blue Header Bar */}
        <View className="bg-blue-500 h-16" />

        {/* Course Info Section */}
        <View className="px-6 pb-6">
          {/* User Avatar - overlapping the blue bar */}
          <View className="-mt-8 mb-4">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center border border-gray-200 overflow-hidden">
              <Image
                source={
                  user?.profileImage
                    ? { uri: user.profileImage }
                    : user?.avatarEmoji && user.avatarEmoji.startsWith('http')
                    ? { uri: user.avatarEmoji }
                    : avatarEmoji && avatarEmoji.startsWith('http')
                    ? { uri: avatarEmoji }
                    : { uri: 'https://api.dicebear.com/9.x/open-peeps/png?seed=default' }
                }
                style={{ width: 72, height: 72, borderRadius: 36 }}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Course Name and Info */}
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-gray-900 text-xl font-bold leading-tight">
                {user?.full_name || selectedCourse.name}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {user?.grade ? `Grade ${user.grade}` : `${selectedCourse.subjects} Subjects`}
              </Text>
            </View>
         
          </View>

          {/* Active Status and Update Button Row */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <MaterialIcons name="check-circle" size={14} color="#2563eb" />
              <Text className="text-blue-600 text-xs font-medium ml-1">
                {selectedCourse.status}
              </Text>
            </View>
            <TouchableOpacity className="flex-row items-center" onPress={() => router.push('/Profile/ProfilePage')}>
              <Text className="text-gray-600 text-xs mr-1">More info</Text>
              <MaterialIcons name="chevron-right" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Switch Course Button */}
          <TouchableOpacity
            className="bg-white rounded-3xl py-3.5 flex-row items-center border border-gray-300"
            onPress={() => {
              setPendingSelectedId(selectedCourse?.id ?? null);
              setShowDropdown(true);
            }}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center ml-3">
              <MaterialIcons name="add" size={18} color="#6B7280" />
            </View>
            <Text className="text-gray-700 text-[0.90rem] font-medium flex-1 ml-3">
              {selectedCourse?.name}
            </Text>
            <MaterialIcons name="chevron-right" size={22} color="#6B7280" className="mr-3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Course Selection Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
  <View className="flex-1 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          />
          <View className="bg-white rounded-t-3xl max-h-[70%] border border-gray-200 w-full absolute left-0 right-0 bottom-0">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
              <Text className="text-gray-900 text-lg font-bold">Select Course</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Course List */}
            <ScrollView className="px-5 py-6">
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  className={`p-4 rounded-xl mb-2 ${
                    pendingSelectedId === course.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                  }`}
                  onPress={() => handleCourseSelect(course)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-bold">
                        {course.name}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        {course.subjects} Subjects • {course.status}
                      </Text>
                    </View>
                    {pendingSelectedId === course.id && (
                      <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer action: tapping this will APPLY the pending ticked course as the selected course */}
            <View className="px-5 py-4 mt-8 border-t bottom-5 border-gray-200">
              <TouchableOpacity
                className="bg-blue-600 rounded-3xl py-5 flex-row items-center justify-center"
                onPress={() => {
                  if (pendingSelectedId) {
                    const course = courses.find((c) => c.id === pendingSelectedId);
                    if (course) setSelectedCourse(course);
                  }
                  setShowDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="check-circle" size={18} color="white" />
                  <Text className="text-white text-base font-semibold ml-2">Apply Selection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StatCard;
