import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
        {/* Configuration Section */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Question Generator
          </Text>
          <Text className="text-sm text-gray-500">
            Generate practice questions with AI
          </Text>
        </View>

        {/* Subject Selection */}
        <View className="px-6 pb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Select Subject
          </Text>
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
                    className={`text-sm font-medium ${
                      selectedSubject === subject ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Question Type Selection */}
        <View className="px-6 pb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Question Type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {questionTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-3 rounded-xl border ${
                  selectedType === item.type
                    ? 'bg-customBlue border-customBlue'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => setSelectedType(item.type)}
              >
                <MaterialIcons
                  name={item.icon}
                  size={18}
                  color={selectedType === item.type ? '#FFFFFF' : '#6B7280'}
                />
                <Text
                  className={`text-sm font-medium ml-2 ${
                    selectedType === item.type ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <View className="px-6 pb-4">
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-customBlue rounded-xl py-4 items-center"
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            <View className="flex-row items-center">
              {isGenerating ? (
                <>
                  <MaterialIcons name="hourglass-empty" size={20} color="#FFFFFF" />
                  <Text className="text-base font-bold text-white ml-2">
                    Generating...
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
                  <Text className="text-base font-bold text-white ml-2">
                    Generate Question
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <View className="px-6 pb-20">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Generated Questions
            </Text>
            
            {generatedQuestions.map((q, index) => (
              <View key={q.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="bg-blue-50 px-2 py-1 rounded-md">
                    <Text className="text-xs font-medium text-customBlue">
                      Question {index + 1}
                    </Text>
                  </View>
                  <View className="bg-gray-100 px-2 py-1 rounded-md">
                    <Text className="text-xs font-medium text-gray-600">
                      {q.type.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text className="text-base font-bold text-gray-900 mb-3">
                  {q.question}
                </Text>

                {q.options && (
                  <View className="space-y-2 mb-3">
                    {q.options.map((option, idx) => (
                      <View key={idx} className="bg-gray-50 rounded-lg p-3">
                        <Text className="text-sm text-gray-700">{option}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View className="bg-green-50 rounded-lg p-3 mb-2">
                  <Text className="text-xs font-medium text-green-700 mb-1">Answer:</Text>
                  <Text className="text-sm text-gray-900">{q.answer}</Text>
                </View>

                <View className="bg-blue-50 rounded-lg p-3">
                  <Text className="text-xs font-medium text-customBlue mb-1">Explanation:</Text>
                  <Text className="text-sm text-gray-700">{q.explanation}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
