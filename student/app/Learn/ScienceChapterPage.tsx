import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import PrimaryNav from '../../components/Navigation/PrimaryNav';
import SearchBar from '../../components/InputFields/SearchBar';
import SubjectCard from '../../components/Container/SubjectCard';
import RadialBox from '../../components/RadialBox/RadialBox';
import SubjectProgressCard from '../../components/RadialBox/RadialBox';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const chapters = [
    { subject: 'Chapter-1', syllabus: 'Measurement and Units – Quantifying the World' },
    { subject: 'Chapter-2', syllabus: 'Force and Motion – Laws of Nature' },
    { subject: 'Chapter-3', syllabus: 'Work and Energy – Powering the Universe' },
    { subject: 'Chapter-4', syllabus: 'Heat – Flow of Thermal Energy' },
    { subject: 'Chapter-5', syllabus: 'Light – Reflection and Refraction' },
    { subject: 'Chapter-6', syllabus: 'Sound – Vibrations and Waves' },
    { subject: 'Chapter-7', syllabus: 'Electricity and Magnetism – Invisible Forces' },
    { subject: 'Chapter-8', syllabus: 'Structure of Matter – Atoms and Molecules' },
    { subject: 'Chapter-9', syllabus: 'Chemical Reactions – Bonds and Transformations' },
    { subject: 'Chapter-10', syllabus: 'Environment and Pollution – A Fragile Earth' },
  ];

  const filteredChapters = chapters.filter(item =>
    item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.syllabus.toLowerCase().includes(searchQuery.toLowerCase())
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
     <SubjectProgressCard
        subject="Science"
        year={2082}
        completion={45}
        onPress={() => console.log("Card tapped")}
      />
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

          <View className="flex-row justify-between items-center mt-6 mb-4">
            <Text className="text-[20px] font-bold text-gray-900">Chapter List</Text>
          </View>

          <View className="space-y-4">
            {filteredChapters.map((item, index) => (
              <SubjectCard
                key={index}
                subject={item.subject}
                syllabus={item.syllabus}
                onPress={() => {
                  console.log('Pressed:', item.subject);
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
