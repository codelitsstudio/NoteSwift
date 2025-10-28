import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center pb-8 items-center mt-6 px-6">
          <Image
            source={require('../../assets/images/coming-soon.gif')}
            style={{ width: 360, height: 360, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-semibold text-gray-700">
            Doubt Solver Coming Soon
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center px-4">
            We're building an instant doubt solver. Check back shortly for live support.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
