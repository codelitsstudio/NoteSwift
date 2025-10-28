// import { useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter } from 'expo-router';

export default function Community() {
  // const router = useRouter();
  // const [searchQuery, setSearchQuery] = useState('');
  // const [selectedSubject, setSelectedSubject] = useState('All');

  // const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];

  // const demoCommunityPosts = [
  //   {
  //     id: '1',
  //     userName: 'Alice Johnson',
  //     timestamp: '2 hours ago',
  //     question: 'How do I solve quadratic equations?',
  //     subject: 'Mathematics',
  //     replies: 3,
  //     upvotes: 12,
  //     hasAnswer: true,
  //   },
  //   {
  //     id: '2',
  //     userName: 'Bob Smith',
  //     timestamp: '5 hours ago',
  //     question: 'What is the difference between speed and velocity?',
  //     subject: 'Physics',
  //     replies: 1,
  //     upvotes: 8,
  //     hasAnswer: false,
  //   },
  //   {
  //     id: '3',
  //     userName: 'Carol Davis',
  //     timestamp: '1 day ago',
  //     question: 'How does photosynthesis work?',
  //     subject: 'Biology',
  //     replies: 5,
  //     upvotes: 15,
  //     hasAnswer: true,
  //   },
  // ];

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Coming Soon */}
        <View className="flex-1 justify-center pb-8 items-center mt-6 px-6">
          <Image
            source={require('../../assets/images/coming-soon.gif')}
            style={{ width: 360, height: 360, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-semibold text-gray-700">
Coming Soon          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center px-4">
            We&apos;re working on AI-powered question generation. Check back soon!
          </Text>
        </View>

{/* 
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Community
          </Text>
          <Text className="text-sm text-gray-500">
            Ask questions & help your peers
          </Text>
        </View> */}

{/* \        <View className="px-6 pb-4">
          <View className="flex-row items-center bg-white rounded-3xl px-4 py-3 border border-gray-100">
            <MaterialIcons name="search" size={22} color="#9CA3AF" />
            <TextInput
              placeholder="Search questions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View className="px-6 pb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  activeOpacity={0.7}
                  className={`px-4 py-2 rounded-xl border ${
                    selectedSubject === subject
                      ? 'bg-customBlue border-customBlue'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => setSelectedSubject(subject)}
                >
                  <Text
                    className={`text-base font-semibold ${
                      selectedSubject === subject ? 'text-white' : 'text-black'
                    }`}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="px-6 pb-4">
          <View className="bg-white rounded-2xl p-4 border border-gray-100">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Active Users</Text>
                <Text className="text-2xl font-bold text-gray-900">1,234</Text>
              </View>
              <View className="w-px h-10 bg-gray-200" />
              <View className="flex-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">Questions</Text>
                <Text className="text-2xl font-bold text-customBlue">5,678</Text>
              </View>
              <View className="w-px h-10 bg-gray-200" />
              <View className="flex-1 items-end">
                <Text className="text-sm text-gray-500 mb-1">Answers</Text>
                <Text className="text-2xl font-bold text-green-600">12,345</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 pb-4">
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-customBlue rounded-xl py-4 items-center"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="add" size={22} color="#FFFFFF" />
              <Text className="text-base font-bold text-white ml-2">
                Ask a Question
              </Text>
            </View>
          </TouchableOpacity>
        </View> */}

        
      </ScrollView>
    </SafeAreaView>
  );
}
