import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type QuestionType = 'mcq' | 'numerical' | 'short' | 'long' | 'theory';

interface GeneratedQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  answer: string;
  explanation: string;
}

export default function QuestionGenerator() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<QuestionType>('mcq');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const questionTypes: { type: QuestionType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { type: 'mcq', label: 'MCQ', icon: 'radio-button-checked' },
    { type: 'numerical', label: 'Numerical', icon: 'calculate' },
    { type: 'short', label: 'Short Answer', icon: 'short-text' },
    { type: 'long', label: 'Long Answer', icon: 'subject' },
    { type: 'theory', label: 'Theory', icon: 'menu-book' },
  ];

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const newQuestion: GeneratedQuestion = {
        id: Date.now().toString(),
        question: `Sample ${selectedType.toUpperCase()} question for ${selectedSubject}`,
        type: selectedType,
        options: selectedType === 'mcq' ? [
          'Option A: First answer',
          'Option B: Second answer',
          'Option C: Third answer',
          'Option D: Fourth answer',
        ] : undefined,
        answer: 'This is the correct answer',
        explanation: 'This is a detailed explanation of why this answer is correct.',
      };
      
      setGeneratedQuestions(prev => [newQuestion, ...prev]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center pb-8 items-center mt-6 px-6">
          <Image
            source={require('../../assets/images/coming-soon.gif')}
            style={{ width: 360, height: 360, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-semibold text-gray-700">
            Question Generator Coming Soon
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center px-4">
            We're working on AI-powered question generation. Check back soon!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
