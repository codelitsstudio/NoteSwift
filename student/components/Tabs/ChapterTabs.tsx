import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import TabNav, { TabKey } from "./TabNav";
import LessonCard from "../Container/LessonCard";
import Resources from "./Resources";
import Icon from "react-native-vector-icons/MaterialIcons";

type LessonShape = { id?: string; title: string; subtitle?: string; tags?: any[] };
type DataShape = {
  _id?: string;
  lessons?: LessonShape[];
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
}

const ChapterTabs: React.FC<ChapterTabsProps> = ({ data, progress, completedLessons, onLessonProgress, loading, courseId, moduleProgress = {}, onRefreshProgress }) => {
  const [active, setActive] = useState<TabKey>("Dashboard");
  // Track the most recently started lesson (or first if none)
  const [currentLesson, setCurrentLesson] = useState<string | null>(completedLessons.length > 0 ? completedLessons[completedLessons.length-1] : (data.lessons?.[0]?.id ?? null));
  const router = useRouter();

  const openLesson = (lessonId?: string) => {
    if (!lessonId) {
      console.warn("Lesson missing id — cannot navigate.");
      return;
    }
    setCurrentLesson(lessonId);
    onLessonProgress(lessonId, true);

    // Always use MongoDB ObjectId for courseId
    const mongoCourseId = (data._id) ? data._id : courseId;
    // Check if this is an "Up Next" lesson (not the first lesson)
    const lessonIndex = data.lessons?.findIndex(lesson => lesson.id === lessonId) ?? -1;
    if (lessonIndex > 0) {
      // Navigate to NotesAndReadable with the corresponding module number
      // Module 1 is the first lesson, Module 2 is the second lesson, etc.
      const moduleNumber = lessonIndex + 1;
      router.push({
        pathname: "/Lesson/LessonDetail/NotesAndReadable",
        params: { module: moduleNumber.toString(), courseId: mongoCourseId },
      });
    } else {
      // Navigate to regular lesson detail
      router.push({
        pathname: "/Lesson/[lesson]",
        params: { lesson: lessonId, courseId: mongoCourseId },
      });
    }
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
            <View className="flex-1 items-center justify-center bg-white py-12">
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
              {Array.isArray(data.lessons) && data.lessons.length ? (
                <>
                  {/* Show first lesson as Foundations */}
                  {data.lessons[0] && (
                    <>
                      <LessonCard
                        key={data.lessons[0].id ?? `idx-0`}
                        title={data.lessons[0].title}
                        tags={data.lessons[0].tags}
                        subtitle={currentLesson === data.lessons[0].id ? data.lessons[0].subtitle : undefined}
                        onPress={() => openLesson(data.lessons?.[0]?.id)}
                        isActive={currentLesson === data.lessons[0].id}
                      />
                      {/* Completion percentage above progress bar */}
                      <View className="mx-8 mt-2 mb-1">
                        <Text className="text-sm text-blue-700 font-semibold">{progress}% of this module completed</Text>
                      </View>
                      {/* Progress bar with percentage */}
                      <View className="mx-8 mb-1">
                        <View className="flex-row items-center">
                          <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                            <View className="h-2 bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                          </View>
                          <Text className="text-xs text-blue-600 font-semibold">{progress}%</Text>
                        </View>
                      </View>
                      {/* Show short description and subtitle only for active lesson */}
                      {currentLesson === data.lessons[0].id && (
                        <>
                          <View className="mx-8 mt-6 mb-6">
                            <Text className="text-medium font-bold text-gray-800">Mastering Study Techniques</Text>
                            <Text className="text-sm text-gray-500 mt-2">This module covers essential strategies and techniques for effective studying, helping you build strong learning habits for all future lessons.</Text>
                          </View>
                          {(data.lessons[0] as LessonShape).subtitle && (
                            <Text className="mx-8 mb-4 text-xs text-gray-500">{(data.lessons[0] as LessonShape).subtitle}</Text>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Up Next Section */}
                  <View className="flex-row items-center px-4 mt-2 mb-2">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-2 text-xs text-gray-500 font-semibold tracking-widest uppercase">Up Next</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                  </View>
                  {data.lessons.slice(1).map((lesson, i) => {
                    // Only show Notes tag for non-first lessons
                    const notesTag = (lesson.tags || []).find((t: any) => t.type === 'notes');
                    const moduleNumber = i + 2; // Module 2, 3, 4, 5 for lessons 1, 2, 3, 4
                    let lessonProgress = 0;
                    if (
                      moduleProgress &&
                      typeof moduleProgress[moduleNumber] === 'number' &&
                      !isNaN(moduleProgress[moduleNumber])
                    ) {
                      lessonProgress = Math.round(moduleProgress[moduleNumber]);
                    } else {
                      lessonProgress = 0;
                    }
                    return (
                      <React.Fragment key={lesson.id ?? `idx-${i+1}`}>
                        <LessonCard
                          title={lesson.title}
                          tags={notesTag ? [notesTag] : []}
                          subtitle={currentLesson === lesson.id ? lesson.subtitle : undefined}
                          onPress={() => openLesson(lesson.id)}
                          isActive={currentLesson === lesson.id}
                        />
                      {/* Progress bar with real percentage */}
                      <View className="mx-8 mb-1">
                        <View className="flex-row items-center">
                          <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                            <View className="h-2 bg-blue-400 rounded-full" style={{ width: `${lessonProgress}%` }} />
                          </View>
                          <Text className="text-xs text-blue-500 font-semibold">{lessonProgress}%</Text>
                        </View>
                      </View>
                      {/* Show subtitle only for active lesson */}
                      {currentLesson === lesson.id && (lesson as LessonShape).subtitle && (
                        <Text className="mx-8 mb-4 text-xs text-gray-500">{(lesson as LessonShape).subtitle}</Text>
                      )}
                      </React.Fragment>
                    );
                  })}
                </>
              ) : (
                <View className="px-4 py-6">
                  <Text className="text-gray-500 text-base">No lessons available.</Text>
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
                className="mb-3 p-5 bg-white rounded-xl shadow"
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
          {(data.notes || []).length ? (
            (data.notes ?? []).map((n: any, i: number) => (
              <View key={i} className="mb-3 p-5 bg-white rounded-xl shadow">
                <Text className="text-base font-medium text-gray-900">{n.title}</Text>
                {n.snippet ? <Text className="text-sm text-gray-600 mt-2">{n.snippet}</Text> : null}
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-base">Feature not available for this chapter.</Text>
          )}
        </ScrollView>
      )}

      {/* Resources */}
      {active === "Resources" && (
        <Resources />
      )}

      {/* Info */}
      {active === "Info" && (
        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          <View className="bg-white p-5 rounded-xl border border-gray-200">
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
