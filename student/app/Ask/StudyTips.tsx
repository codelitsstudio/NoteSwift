import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface StudyTip {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tips: string[];
}

const studyTips: StudyTip[] = [
  {
    id: '1',
    category: 'Time Management',
    title: 'Pomodoro Technique',
    description: 'Study in focused 25-minute intervals with short breaks',
    icon: 'access-time',
    tips: [
      'Set a timer for 25 minutes of focused study',
      'Take a 5-minute break after each session',
      'After 4 sessions, take a longer 15-30 minute break',
      'Use breaks to stretch, hydrate, or relax your eyes',
      'Track your completed pomodoros to measure productivity',
    ],
  },
  {
    id: '2',
    category: 'Memory',
    title: 'Active Recall',
    description: 'Test yourself frequently instead of passive re-reading',
    icon: 'psychology',
    tips: [
      'Close your notes and try to recall information from memory',
      'Create flashcards for key concepts and definitions',
      'Explain topics to someone else or out loud to yourself',
      'Use practice tests and past papers regularly',
      'Space out your review sessions over multiple days',
    ],
  },
  {
    id: '3',
    category: 'Focus',
    title: 'Distraction-Free Environment',
    description: 'Create an optimal space for deep concentration',
    icon: 'visibility-off',
    tips: [
      'Turn off phone notifications or use focus mode',
      'Use website blockers to limit social media during study',
      'Keep your study area clean and organized',
      'Use noise-cancelling headphones or white noise',
      'Study in a dedicated space, not where you sleep',
    ],
  },
  {
    id: '4',
    category: 'Exam Prep',
    title: 'Strategic Revision',
    description: 'Plan your revision systematically for better results',
    icon: 'event-note',
    tips: [
      'Start revision at least 2-3 weeks before exams',
      'Create a revision timetable covering all subjects',
      'Prioritize weak topics but don\'t neglect strong ones',
      'Practice past papers under timed conditions',
      'Get 7-8 hours of sleep, especially before exams',
    ],
  },
  {
    id: '5',
    category: 'Note-Taking',
    title: 'Cornell Method',
    description: 'Structured system for organizing and reviewing notes',
    icon: 'edit-note',
    tips: [
      'Divide your page into three sections: notes, cues, summary',
      'Write main notes during class or reading',
      'Add keywords and questions in the cue column',
      'Summarize the page in your own words at the bottom',
      'Review notes within 24 hours for better retention',
    ],
  },
  {
    id: '6',
    category: 'Understanding',
    title: 'Feynman Technique',
    description: 'Learn by teaching and simplifying complex concepts',
    icon: 'school',
    tips: [
      'Choose a concept you want to understand deeply',
      'Explain it in simple terms as if teaching a child',
      'Identify gaps in your understanding when you struggle',
      'Go back to your materials to fill those gaps',
      'Simplify your explanation and use analogies',
    ],
  },
];

export default function StudyTips() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const categories = ['All', 'Time Management', 'Memory', 'Focus', 'Exam Prep', 'Note-Taking', 'Understanding'];

  const filteredTips =
    selectedCategory === 'All'
      ? studyTips
      : studyTips.filter((tip) => tip.category === selectedCategory);

  const toggleTip = (id: string) => {
    setExpandedTip(expandedTip === id ? null : id);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Study Tips & Techniques
          </Text>
          <Text className="text-base text-gray-500">
            Proven strategies to boost your learning
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 pb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.7}
              className={`px-4 py-2 rounded-xl border ${
                selectedCategory === cat
                  ? 'bg-customBlue border-customBlue'
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                className={`text-base font-medium ${
                  selectedCategory === cat ? 'text-white' : 'text-gray-700'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Study Tips List */}
        <View className="px-6 pb-20">
          {filteredTips.map((tip) => (
            <View key={tip.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleTip(tip.id)}
                className="flex-row items-start"
              >
                <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                  <MaterialIcons name={tip.icon} size={24} color="#3B82F6" />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900 mb-1">
                        {tip.title}
                      </Text>
                      <Text className="text-base text-gray-500 mb-2">
                        {tip.description}
                      </Text>
                      <View className="bg-blue-50 px-2 py-1 rounded-md self-start">
                        <Text className="text-sm font-medium text-customBlue">
                          {tip.category}
                        </Text>
                      </View>
                    </View>
                    <MaterialIcons
                      name={expandedTip === tip.id ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={24}
                      color="#6B7280"
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Expanded Tips */}
              {expandedTip === tip.id && (
                <View className="mt-4 pt-4 border-t border-gray-100">
                  <Text className="text-base font-bold text-gray-900 mb-3">
                    How to Apply:
                  </Text>
                  {tip.tips.map((item, index) => (
                    <View key={index} className="flex-row mb-3">
                      <View className="w-6 h-6 bg-customBlue rounded-full items-center justify-center mr-3 mt-0.5">
                        <Text className="text-sm font-bold text-white">
                          {index + 1}
                        </Text>
                      </View>
                      <Text className="flex-1 text-base text-gray-700 leading-6">
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
