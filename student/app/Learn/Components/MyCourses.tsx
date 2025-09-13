import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
// --- TYPESCRIPT TYPES ---
type Instructor = {
  name: string;
  title: string;
  avatar: string;
};

type Completed = {
  id: string;
  title: string;
  description: string;
  completedDate: string;
  grade: number;
  instructor: Instructor;
  icon: string;
};

type OngoingCourse = {
  id: string;
  title: string;
  category: string;
  description: string;
  lecturesLeft: number;
  progress: number;
  image: string;
};


// --- DUMMY DATA ---
const completed: Completed[] = [
  {
    id: '1',
    title: 'UX UI Design Thinking',
    description: 'Dive deep into the world of machine learning with o...',
    completedDate: 'May 10, 2024',
    grade: 98,
    instructor: {
      name: 'Fannie DuBuque',
      title: 'Top Rated Instructor',
      avatar: 'https://i.pravatar.cc/100?u=a042581f4e29026704d',
    },
    icon: 'https://img.icons8.com/plasticine/100/trophy.png',
  },
  {
    id: '2',
    title: 'Full Stack Development',
    description: 'Dive deep into modern web development...',
    completedDate: 'April 22, 2024',
    grade: 95,
    instructor: {
      name: 'Stan Smith',
      title: 'Top Rated Instructor',
      avatar: 'https://i.pravatar.cc/100?u=a042581f4e29026705d',
    },
    icon: 'https://img.icons8.com/plasticine/100/trophy.png',
  },
];

const ongoingCourses: OngoingCourse[] = [
  {
    id: '1',
    title: 'AR/VR (Augmented Reality/Virtual Reality)',
    category: 'Technologies',
    description: 'Placerat vitae commodo amet nulla. Lectus arcu.',
    lecturesLeft: 8,
    progress: 62,
    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=500',
  },
  {
    id: '2',
    title: 'Software Engineering',
    category: 'Programming',
    description: 'Semper enim scelerisque neque nascetur varius.',
    lecturesLeft: 3,
    progress: 96,
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=500',
  },
  {
    id: '3',
    title: 'Game Development',
    category: 'Development',
    description: 'Turpis amet montes sit massa egestas eget.',
    lecturesLeft: 6,
    progress: 80,
    image: 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?q=80&w=500',
  },
];

// --- HELPER COMPONENTS ---

const CompletedCard = ({ item }: { item: Completed }) => (
  // Fixed width to w-92 for consistent sizing
  <TouchableOpacity className="w-92 h-48 rounded-2xl p-4 justify-between bg-white border border-gray-200 mr-4" style={{ width: 310 }}>
    <View>
      <View className="flex-row justify-between items-start">
        <Image source={{ uri: item.icon }} className="w-12 h-12" />
        <Text className="text-gray-700 font-bold">Grades <Text className="text-xl text-black">{item.grade}%</Text></Text>
      </View>
      <Text className="text-lg font-bold text-black mt-0" numberOfLines={1}>{item.title}</Text>
      <Text className="text-xs text-gray-600" numberOfLines={1}>{item.description}</Text>
      <Text className="text-xs text-gray-500 mt-">Completed: {item.completedDate}</Text>
    </View>
    <View className="flex-row items-center">
      <Image source={{ uri: item.instructor.avatar }} className="w-7 h-7 rounded-full" />
      <View className="ml-2">
        <Text className="text-sm font-semibold text-black">{item.instructor.name}</Text>
        <Text className="text-xs text-gray-600">{item.instructor.title}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const OngoingCourseCard = ({ item }: { item: OngoingCourse }) => (
  <TouchableOpacity className="bg-white rounded-2xl p-2 mb-4 border border-gray-200">
    <View className="flex-row">
      <Image source={{ uri: item.image }} className="w-32 h-34 rounded-2xl" />
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-center">
          {/* Category tag stays text */}
          <Text className="text-xs text-customBlue bg-customBlue/10 px-2 py-1 rounded-full font-semibold">
            {item.category}
          </Text>

          {/* Replace "Continue >" with Material icon */}
          <View className="flex-row items-center">
            <Text className="text-xs text-customBlue font-semibold mr-0">
              Continue
            </Text>
            <MaterialIcons name="arrow-forward-ios" size={10} color="#0072d2" />
          </View>
        </View>

        <Text className="text-base font-bold text-black my-1">{item.title}</Text>
        <Text className="text-xs text-gray-500">{item.description}</Text>
        <Text className="text-xs text-gray-400 mt-2">
          {item.lecturesLeft} lectures left
        </Text>

        <View className="flex-row items-center mt-2">
          <View className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
            <View
              className="h-2 bg-customBlue rounded-full"
              style={{ width: `${item.progress}%` }}
            />
          </View>
          <Text className="text-xs font-semibold text-customBlue">
            {item.progress}%
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);


const TabItem = ({ iconName, label, active }: { iconName: keyof typeof Ionicons.glyphMap; label: string; active: boolean }) => {
    // Define colors based on the active state
    const color = active ? '#0072d2' : 'gray'; // Use the hex of your customBlue for the icon
    const textClass = active ? 'text-customBlue' : 'text-gray-500';

    return (
        <TouchableOpacity className="items-center">
            <Ionicons name={iconName} size={24} color={color} />
            <Text className={`text-xs mt-1 ${textClass}`}>{label}</Text>
        </TouchableOpacity>
    );
};

// --- MAIN COMPONENT ---

const MyCourses = () => {
  return (
    <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 5 }}>
      

      

            {/* --- Ongoing Courses --- */}
            <View className="px-0 mt-2">
               <View className="flex-row justify-between items-center mb-6">
                <Text className="text-[1.3rem] font-bold text-gray-900">Ongoing Courses</Text>

              </View>
              {ongoingCourses.map(item => <OngoingCourseCard key={item.id} item={item} />)}
            </View>



                  {/* --- Recent Completed Courses --- */}
            <View className="mt-2">
              <View className="flex-row justify-between items-center mt-4 mb-6">
                <Text className="text-[1.3rem] font-bold text-gray-900">Recent Completed Courses</Text>

              </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 6, paddingRight: 4 }}>
                    {completed.map(item => <CompletedCard key={item.id} item={item} />)}
                </ScrollView>
            </View>



        </ScrollView>
        
 
    </SafeAreaView>
  );
};

export default MyCourses;