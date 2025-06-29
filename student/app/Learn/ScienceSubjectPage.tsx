import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

import PrimaryNav from '../../components/Navigation/PrimaryNav';
import SearchBar from '../../components/InputFields/SearchBar';
import SubjectCard from '../../components/Container/SubjectCard';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const subjects = [
    { subject: 'Mathematics', syllabus: 'Syllabus - 2082' },
    { subject: 'Science', syllabus: 'Syllabus - 2082' },
    { subject: 'English', syllabus: 'Syllabus - 2082' },
    { subject: 'Computer', syllabus: 'Syllabus - 2082' },
    { subject: 'Nepali', syllabus: 'Syllabus - 2082' },
    { subject: 'Social Studies', syllabus: 'Syllabus - 2082' },
    { subject: 'Health, Population & Environment', syllabus: 'Syllabus - 2082' },
    { subject: 'Economics', syllabus: 'Syllabus - 2082' },
    { subject: 'Business Studies', syllabus: 'Syllabus - 2082' },
    { subject: 'Accountancy', syllabus: 'Syllabus - 2082' },
  ];

  const subjectRoutes: { [key: string]: string } = {
    Mathematics: 'MathChapterPage',
    Science: 'ScienceChapterPage',
    English: 'EnglishChapterPage',
    Computer: 'ComputerChapterPage',
    Nepali: 'NepaliChapterPage',
    'Social Studies': 'SocialChapterPage',
    'Health, Population & Environment': 'HealthChapterPage',
    Economics: 'EconomicsChapterPage',
    'Business Studies': 'BusinessChapterPage',
    Accountancy: 'AccountancyChapterPage',
  };

  const filteredSubjects = subjects.filter(item =>
    item.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-6 flex-1 bg-[#FAFAFA]">
          <Text className="text-4xl font-bold mb-6 text-gray-900">
            Syllabus
            <Text className="text-customBlue font-semibold"> - 2082</Text>
          </Text>

          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

          <View className="flex-row justify-between items-center mt-6 mb-4">
            <Text className="text-[20px] font-bold text-gray-900">Subjects List</Text>
          </View>

          <View className="space-y-4">
            {filteredSubjects.map((item, index) => (
              <SubjectCard
                key={index}
                subject={item.subject}
                syllabus={item.syllabus}
                onPress={() => {
                  const page = subjectRoutes[item.subject];
                  if (page) {
                    router.push(`/Learn/${page}` as any);
                  } else {
                    console.warn('No route defined for:', item.subject);
                  }
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <PrimaryNav current="Learn" />
    </KeyboardAvoidingView>
  );
}
