import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface QuestionCardProps {
  question: any; // Can be demo question or real API question
  onPress: () => void;
}

export default function QuestionCard({ question, onPress }: QuestionCardProps) {
  // Handle both demo data structure and real API structure
  const isRealQuestion = question._id !== undefined;
  
  const getStatusColor = () => {
    const status = isRealQuestion ? question.status : question.status;
    switch (status) {
      case 'answered':
        return 'bg-green-50';
      case 'in-progress':
        return 'bg-orange-50';
      case 'pending':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusTextColor = () => {
    const status = isRealQuestion ? question.status : question.status;
    switch (status) {
      case 'answered':
        return 'text-green-600';
      case 'in-progress':
        return 'text-orange-600';
      case 'pending':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSourceIcon = () => {
    if (isRealQuestion) {
      // For real questions, show based on whether it has answers
      return question.answersCount > 0 ? 'school' : 'help-outline';
    } else {
      // For demo questions
      switch (question.source) {
        case 'ai':
          return 'smart-toy';
        case 'community':
          return 'groups';
        case 'support':
          return 'support-agent';
        case 'teacher':
          return 'school';
        default:
          return 'help-outline';
      }
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
            {isRealQuestion ? question.title : question.question}
          </Text>
          {question.questionText && (
            <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
              {question.questionText}
            </Text>
          )}
          {!isRealQuestion && question.description && (
            <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
              {question.description}
            </Text>
          )}
        </View>
        
        <View className={`px-2 py-1 rounded-md ${getStatusColor()}`}>
          <Text className={`text-sm font-medium ${getStatusTextColor()}`}>
            {isRealQuestion 
              ? (question.status === 'answered' ? 'Answered' : question.status === 'in-progress' ? 'In Progress' : 'Pending')
              : (question.status === 'answered' ? 'Answered' : question.status === 'in-progress' ? 'In Progress' : 'Pending')
            }
          </Text>
        </View>
      </View>

      {/* Meta Info */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-blue-50 px-2 py-1 rounded-md">
            <Text className="text-sm font-medium text-customBlue">
              {isRealQuestion ? question.subjectName : question.subject}
            </Text>
          </View>
          {question.courseName && (
            <Text className="text-sm text-gray-500 ml-2" numberOfLines={1}>
              • {question.courseName}
            </Text>
          )}
          {!isRealQuestion && question.chapter && (
            <Text className="text-sm text-gray-500 ml-2" numberOfLines={1}>
              • {question.chapter}
            </Text>
          )}
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <MaterialIcons name={getSourceIcon()} size={16} color="#9CA3AF" />
          <Text className="text-sm text-gray-500 ml-1">
            {isRealQuestion ? getTimeAgo(question.createdAt) : question.askedAt}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          {isRealQuestion && question.answersCount > 0 && (
            <View className="flex-row items-center mr-3">
              <MaterialIcons name="chat" size={16} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-1">{question.answersCount}</Text>
            </View>
          )}
          {!isRealQuestion && (
            <View className="flex-row items-center mr-3">
              <MaterialIcons name="thumb-up" size={16} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-1">{question.upvotes}</Text>
            </View>
          )}
          <MaterialIcons name="chevron-right" size={18} color="#9CA3AF" className="ml-2" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
