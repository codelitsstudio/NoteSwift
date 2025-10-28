import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import TabNav, { TabKey } from "../../components/Tabs/TabNav";
import ChapterCard from "../../components/Container/ChapterCard";
import Resources from "../../components/Tabs/Resources";
import Icon from "react-native-vector-icons/MaterialIcons";
import api from "../../api/axios";
import { useAuthStore } from "../../stores/authStore";

type ModuleShape = { id?: string; title: string; subtitle?: string; tags?: any[] };
type DataShape = {
  id?: string;
  _id?: string;
  name?: string; // Add name property
  modules?: ModuleShape[];
  tests?: any[];
  notes?: any[];
  resources?: any[];
  description?: string;
  duration?: string;
};


interface ChapterTabsProps {
  data: DataShape;
  progress: number;
  completedLessons: string[];
  onLessonProgress: (lessonId: string, completed: boolean) => void;
  loading?: boolean;
  courseId?: string;
  moduleProgress?: {[key: number]: number};
  onRefreshProgress?: (moduleNumber?: number) => void;
  courseTeachers?: Array<{
    subjectName: string;
    teacher: {
      id: string;
      name: string;
      email: string;
    } | null;
  }>;
  courseOfferedBy?: string;
}

const ChapterTabs: React.FC<ChapterTabsProps> = ({ data, progress, completedLessons, onLessonProgress, loading, courseId, moduleProgress = {}, onRefreshProgress, courseTeachers, courseOfferedBy }) => {
  const [active, setActive] = useState<TabKey>("Dashboard");
  // Track the most recently started chapter module (or first if none)
  const [currentLesson, setCurrentLesson] = useState<string | null>(completedLessons.length > 0 ? completedLessons[completedLessons.length-1] : (data.modules?.[0]?.id ?? null));
  const router = useRouter();
  
  // Question form state
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  
  const { user } = useAuthStore();

  // Get teacher name using the same logic as SubjectTabs.tsx
  const getSubjectTeacher = (): string => {
    if (courseTeachers) {
      const subjectTeacher = courseTeachers.find(ct => ct.subjectName === data.name);
      if (subjectTeacher?.teacher) {
        return subjectTeacher.teacher.name;
      }
    }
    return courseOfferedBy || 'Subject Teacher';
  };

  // Handle question submission
  const handleSubmitQuestion = async () => {
    if (!questionTitle.trim() || !questionText.trim()) {
      Alert.alert('Error', 'Please fill in both title and question details');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to ask questions');
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      const mongoCourseId = (data._id) ? data._id : courseId;
      const response = await api.post('/student/questions', {
        title: questionTitle.trim(),
        questionText: questionText.trim(),
        courseId: mongoCourseId,
        subjectName: data.name,
        moduleNumber: 1, // Default module number since we're in subject context
        moduleName: data.name,
        topicName: data.name,
        isAnonymous,
        isPublic: true,
        tags: ['student-question']
      });

      console.log('Question submission response:', response);

      // Handle different response formats
      if (response.data?.success || response.status === 200 || response.status === 201) {
        Alert.alert(
          'Question Submitted',
          'Your question has been sent to the teacher. You will receive a notification when they respond.',
          [{ text: 'OK' }]
        );
        // Reset form
        setQuestionTitle('');
        setQuestionText('');
        setIsAnonymous(false);
      } else {
        throw new Error(response.data?.message || 'Failed to submit question');
      }
    } catch (error: any) {
      console.error('Error submitting question:', error);
      console.error('Error response:', error.response);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to submit question. Please try again.'
      );
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  console.log('🎯 ChapterTabs received data:', data);
  console.log('🎯 ChapterTabs modules:', data.modules);
  console.log('🎯 ChapterTabs modules length:', data.modules?.length);

  // Prevent infinite refresh: only call onRefreshProgress once per focus, not on every render
  // Only refresh progress when screen is focused, not on every render or callback change
  useFocusEffect(
    React.useCallback(() => {
      if (typeof onRefreshProgress === 'function') {
        onRefreshProgress();
      }
    }, [onRefreshProgress]) // <-- empty array, ensures this only runs on focus
  );

  const openLesson = (lessonId?: string) => {
    console.log('🎯 openLesson called with:', lessonId, 'data.id:', data.id, 'data.modules:', data.modules?.map(m => m.id));
    if (!lessonId) {
      console.warn("Chapter module missing id — cannot navigate.");
      return;
    }
    setCurrentLesson(lessonId);
    onLessonProgress(lessonId, true);

    // Always use MongoDB ObjectId for courseId
    const mongoCourseId = (data._id) ? data._id : courseId;
    
    // Navigate to chapter detail for all modules (using backend data)
    console.log('🚀 ChapterTabs navigation to [chapterDetail]:', {
      lessonId,
      mongoCourseId,
      subjectId: data.id,
      pathname: "/Chapter/[chapterDetail]"
    });
    router.push({
      pathname: "/Chapter/[chapterDetail]",
      params: { chapterDetail: lessonId, lesson: lessonId, courseId: mongoCourseId, subjectId: data.id },
    });
  };


  return (
    <View className={`flex-1 ${progress === 100 ? 'border-2 border-green-500' : ''}`}>
      <TabNav active={active} onChange={(t) => setActive(t)} />

      {/* Dashboard */}
      {active === "Dashboard" && (
        <ScrollView
          className="flex-1 px-0"
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="flex-1 items-center justify-center bg-[#FAFAFA] py-12">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <>
              {/* Foundations Section */}
              <View className="flex-row items-center px-4 mt-2 mb-2">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-2 text-xs text-gray-500 font-semibold tracking-widest uppercase">Foundations</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>
              {Array.isArray(data.modules) && data.modules.length ? (
                <>
                  {/* Show first module as Foundations */}
                  {data.modules[0] && (
                    <>
                      <ChapterCard
                        key={data.modules[0].id ?? `idx-0`}
                        title={data.modules[0].title}
                        tags={data.modules[0].tags}
                        subtitle={data.modules[0].subtitle}
                        onPress={() => openLesson(data.modules?.[0]?.id)}
                        isActive={currentLesson === data.modules[0].id}
                        hasNotes={(data.modules[0] as any).hasNotes}
                      />
                      {/* Completion percentage above progress bar */}
                      <View className="mx-8 mt-2 mb-1">
                        <Text className="text-sm text-blue-500 font-semibold">{progress}% <Text className="text-gray-500 text-xs font-medium">of this module completed</Text></Text>
                      </View>
                      {/* Progress bar with percentage */}
                      <View className="mx-8 mb-1">
                        <View className="flex-row items-center">
                          <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                            <View className="h-2 bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                          </View>
                          <Text className="text-xs text-blue-500 font-semibold">{progress}%</Text>
                        </View>
                      </View>
                      {/* Show short description and subtitle only for active module */}
                     
                    </>
                  )}

                  {/* Up Next Section */}
                  <View className="flex-row items-center px-4 mt-2 mb-2">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-2 text-xs text-gray-500 font-semibold tracking-widest uppercase">Essentials</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                  </View>
                  {data.modules.slice(1).map((module: ModuleShape, i: number) => {
                    // Only show Notes and Video tags for non-first modules
                    const relevantTags = (module.tags || []).filter((t: any) => t.type === 'notes' || t.type === 'video');
                    // Use the real module number from the API data
                    const moduleNumber = (module as any).moduleNumber || (i + 2);
                    // Use backend-calculated module progress only
                    const moduleProgressValue = moduleProgress && typeof moduleProgress[moduleNumber] === 'number' && !isNaN(moduleProgress[moduleNumber])
                      ? Math.round(moduleProgress[moduleNumber])
                      : 0;
                    return (
                      <React.Fragment key={module.id ?? `idx-${i+1}`}>
                        <ChapterCard
                          title={module.title}
                          tags={relevantTags}
                          subtitle={module.subtitle}
                          onPress={() => openLesson(module.id)}
                          isActive={currentLesson === module.id}
                          hasNotes={(module as any).hasNotes}
                        />
                      {/* Progress bar with real percentage */}
                      <View className="mx-8 mb-1">
                        <View className="flex-row items-center">
                          <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                            <View className="h-2 bg-blue-400 rounded-full" style={{ width: `${moduleProgressValue}%` }} />
                          </View>
                          <Text className="text-xs text-blue-500 font-semibold">{moduleProgressValue}%</Text>
                        </View>
                      </View>
                      {/* Show subtitle only for active module */}
                      {currentLesson === module.id && (module as ModuleShape).subtitle && (
                        <Text className="mx-8 mb-4 text-xs text-gray-500">{(module as ModuleShape).subtitle}</Text>
                      )}
                      </React.Fragment>
                    );
                  })}
                </>
              ) : (
                <View className="px-4 py-6">
                  <Text className="text-gray-500 text-base">No chapters available.</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Tests */}
      {active === "Tests" && (
        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          {(data.tests || []).length ? (
            (data.tests ?? []).map((t: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                className="mb-3 p-5 bg-white rounded-3xl shadow"
                activeOpacity={0.85}
              >
                <Text className="text-base font-medium text-gray-900">{t.title}</Text>
                {t.summary ? <Text className="text-sm text-gray-500 mt-2">{t.summary}</Text> : null}
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center">
              <Text className="text-gray-500 text-base">No tests available yet.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Ask */}
      {active === "Ask" && (
        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          <View className="p-6 mb-2">
            {/* Context Info */}
            <View className="bg-blue-50 rounded-lg p-4 mb-6">
              <Text className="text-sm font-medium text-gray-900 mb-2">Question Context</Text>
              <View className="space-y-1">
                <Text className="text-sm text-gray-800">
                  <Text className="font-medium">Subject:</Text> {data.name}
                </Text>
                <Text className="text-sm text-gray-800">
                  <Text className="font-medium">Instructor:</Text> {getSubjectTeacher()}
                </Text>
              </View>
            </View>

                {/* Title Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Question Title</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-sm"
                    placeholder="Brief title for your question..."
                    value={questionTitle}
                    onChangeText={setQuestionTitle}
                    maxLength={100}
                    multiline={false}
                  />
                  <Text className="text-xs text-gray-500 mt-1">{questionTitle.length}/100 characters</Text>
                </View>

                {/* Question Text Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Question Details</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-sm min-h-[120px]"
                    placeholder="Describe your question in detail. Include what you don't understand, specific examples, or what you've tried..."
                    value={questionText}
                    onChangeText={setQuestionText}
                    multiline={true}
                    textAlignVertical="top"
                    maxLength={1000}
                  />
                  <Text className="text-xs text-gray-500 mt-1">{questionText.length}/1000 characters</Text>
                </View>

                {/* Anonymous Option */}
                <View className="flex-row items-center mb-6">
                  <TouchableOpacity
                    onPress={() => setIsAnonymous(!isAnonymous)}
                    className="flex-row items-center"
                  >
                    <View className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                      isAnonymous ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {isAnonymous && <Icon name="check" size={14} color="white" />}
                    </View>
                    <Text className="text-sm text-gray-700">Ask anonymously</Text>
                  </TouchableOpacity>
                </View>

                {/* Guidelines */}
                <View className="bg-gray-50 rounded-lg p-4 mb-6">
                  <Text className="text-sm font-medium text-gray-900 mb-2">Question Guidelines</Text>
                  <View className="space-y-1">
                    <Text className="text-xs text-gray-600">• Be specific about what you don't understand</Text>
                    <Text className="text-xs text-gray-600">• Include relevant context or examples</Text>
                    <Text className="text-xs text-gray-600">• Teachers typically respond within 24-48 hours</Text>
                    <Text className="text-xs text-gray-600">• Check notifications for responses</Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmitQuestion}
                  disabled={isSubmittingQuestion || !questionTitle.trim() || !questionText.trim()}
                  className={`py-3 rounded-lg items-center ${
                    isSubmittingQuestion || !questionTitle.trim() || !questionText.trim()
                      ? 'bg-gray-300'
                      : 'bg-blue-500'
                  }`}
                >
                  <Text className={`text-base font-semibold ${
                    isSubmittingQuestion || !questionTitle.trim() || !questionText.trim()
                      ? 'text-gray-500'
                      : 'text-white'
                  }`}>
                    {isSubmittingQuestion ? 'Submitting...' : 'Submit Question'}
                  </Text>
                </TouchableOpacity>
              </View>
        </ScrollView>
      )}

      {/* Resources */}
      {active === "Resources" && (
        <Resources modules={data.modules} />
      )}

      {/* Info */}
      {active === "Info" && (
        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          <View className="bg-white p-5 rounded-3xl border border-gray-200">
            <Text className="text-base font-semibold mb-2">About this chapter</Text>
            <Text className="text-sm text-gray-700">{data.description}</Text>
            {data.duration && (
              <View className="flex-row items-center mt-3">
                <Icon name="schedule" size={18} />
                <Text className="ml-3 text-sm text-gray-600">{data.duration}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ChapterTabs;
