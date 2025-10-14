import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DoubtSolver() {
  const router = useRouter();
  const [doubt, setDoubt] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

  const handleSubmit = () => {
    if (doubt.trim() === '') return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSolution(true);
    }, 2000);
  };

  const handleNewDoubt = () => {
    setDoubt('');
    setChapter('');
    setShowSolution(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-6 pb-4">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Doubt Solver
            </Text>
            <Text className="text-sm text-gray-500">
              Get instant solutions to your doubts
            </Text>
          </View>

          {!showSolution ? (
            <>
              {/* Subject Selection */}
              <View className="px-6 pb-4">
                <Text className="text-base font-bold text-gray-900 mb-3">
                  Select Subject
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {subjects.map((sub) => (
                      <TouchableOpacity
                        key={sub}
                        activeOpacity={0.7}
                        className={`px-4 py-2 rounded-xl border ${
                          subject === sub
                            ? 'bg-customBlue border-customBlue'
                            : 'bg-white border-gray-200'
                        }`}
                        onPress={() => setSubject(sub)}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            subject === sub ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {sub}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Chapter Input */}
              <View className="px-6 pb-4">
                <Text className="text-base font-bold text-gray-900 mb-3">
                  Chapter/Topic (Optional)
                </Text>
                <View className="bg-white rounded-xl px-4 py-3 border border-gray-200">
                  <TextInput
                    placeholder="e.g., Quadratic Equations"
                    value={chapter}
                    onChangeText={setChapter}
                    className="text-base text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Doubt Input */}
              <View className="px-6 pb-4">
                <Text className="text-base font-bold text-gray-900 mb-3">
                  Describe Your Doubt
                </Text>
                <View className="bg-white rounded-xl px-4 py-4 border border-gray-200">
                  <TextInput
                    placeholder="Explain your doubt in detail..."
                    value={doubt}
                    onChangeText={setDoubt}
                    className="text-base text-gray-900"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-2">
                  {doubt.length}/1000 characters
                </Text>
              </View>

              {/* Submit Button */}
              <View className="px-6 pb-20">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className={`rounded-xl py-4 items-center ${
                    doubt.trim() ? 'bg-customBlue' : 'bg-gray-200'
                  }`}
                  onPress={handleSubmit}
                  disabled={!doubt.trim() || isSubmitting}
                >
                  <View className="flex-row items-center">
                    {isSubmitting ? (
                      <>
                        <MaterialIcons name="hourglass-empty" size={20} color="#FFFFFF" />
                        <Text className="text-base font-bold text-white ml-2">
                          Solving...
                        </Text>
                      </>
                    ) : (
                      <>
                        <MaterialIcons name="send" size={20} color={doubt.trim() ? '#FFFFFF' : '#9CA3AF'} />
                        <Text className={`text-base font-bold ml-2 ${
                          doubt.trim() ? 'text-white' : 'text-gray-500'
                        }`}>
                          Get Solution
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Solution Section */}
              <View className="px-6 pb-4">
                <View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                      <MaterialIcons name="lightbulb" size={20} color="#3B82F6" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 ml-3">
                      Solution
                    </Text>
                  </View>

                  <View className="bg-gray-50 rounded-lg p-3 mb-3">
                    <Text className="text-sm text-gray-600 mb-2">Your Doubt:</Text>
                    <Text className="text-base text-gray-900">{doubt}</Text>
                  </View>

                  <View className="bg-green-50 rounded-lg p-4">
                    <Text className="text-base font-bold text-gray-900 mb-3">
                      Step-by-Step Solution:
                    </Text>
                    <View className="space-y-3">
                      <View className="flex-row">
                        <Text className="text-sm font-bold text-customBlue mr-2">1.</Text>
                        <Text className="text-sm text-gray-700 flex-1">
                          [Demo Step 1] - Identify the key concepts related to your doubt.
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text className="text-sm font-bold text-customBlue mr-2">2.</Text>
                        <Text className="text-sm text-gray-700 flex-1">
                          [Demo Step 2] - Apply the relevant formulas or theorems.
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text className="text-sm font-bold text-customBlue mr-2">3.</Text>
                        <Text className="text-sm text-gray-700 flex-1">
                          [Demo Step 3] - Solve the problem systematically.
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text className="text-sm font-bold text-customBlue mr-2">4.</Text>
                        <Text className="text-sm text-gray-700 flex-1">
                          [Demo Step 4] - Verify your answer and understand the concept.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Ask Another Doubt Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="bg-white rounded-xl py-4 items-center border border-customBlue"
                  onPress={handleNewDoubt}
                >
                  <View className="flex-row items-center">
                    <MaterialIcons name="add" size={20} color="#3B82F6" />
                    <Text className="text-base font-bold text-customBlue ml-2">
                      Ask Another Doubt
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
