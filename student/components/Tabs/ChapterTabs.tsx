import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import TabNav, { TabKey } from "./TabNav";
import LessonCard from "../Container/LessonCard";
import Icon from "react-native-vector-icons/MaterialIcons";

type LessonShape = { id?: string; title: string; subtitle?: string; tags?: any[] };
type DataShape = {
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
}

const ChapterTabs: React.FC<ChapterTabsProps> = ({ data, progress, completedLessons, onLessonProgress, loading }) => {
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
    router.push({
      pathname: "/Lesson/[lesson]",
      params: { lesson: lessonId },
    });
  };


  return (
    <View className="flex-1">
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
                      <Text className="mx-8 text-sm mt-2 text-blue-700 font-semibold mb-1">{progress}%<Text className="mx-8 text-sm mt-2 text-gray-700 font-semibold mb-1"> of this module completed</Text></Text>
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
                    return (
                      <React.Fragment key={lesson.id ?? `idx-${i+1}`}>
                        <LessonCard
                          title={lesson.title}
                          tags={notesTag ? [notesTag] : []}
                          subtitle={currentLesson === lesson.id ? lesson.subtitle : undefined}
                          onPress={() => openLesson(lesson.id)}
                          isActive={currentLesson === lesson.id}
                        />
                      {/* Progress bar with percentage */}
                      <View className="mx-8 mb-1">
                        <View className="flex-row items-center">
                          <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                            <View className="h-2 bg-blue-400 rounded-full" style={{ width: completedLessons.includes(lesson.id ?? '') ? '100%' : '20%' }} />
                          </View>
                          <Text className="text-xs text-blue-500 font-semibold">{completedLessons.includes(lesson.id ?? '') ? '100%' : '20%'}</Text>
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
        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          {(data.resources || []).length ? (
            (data.resources ?? []).map((r: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                className="mb-3 p-5 bg-white rounded-xl shadow"
                activeOpacity={0.85}
              >
                <Text className="text-base font-medium text-gray-900">{r.title}</Text>
                {r.type ? <Text className="text-sm text-gray-500 mt-2">{r.type}</Text> : null}
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-gray-500 text-base">No extra resources yet.</Text>
          )}
        </ScrollView>
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
