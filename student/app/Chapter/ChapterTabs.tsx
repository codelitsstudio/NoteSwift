import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import TabNav, { TabKey } from "../../components/Tabs/TabNav";
import ChapterCard from "../../components/Container/ChapterCard";
import Resources from "../../components/Tabs/Resources";
import Icon from "react-native-vector-icons/MaterialIcons";

type ModuleShape = { id?: string; title: string; subtitle?: string; tags?: any[] };
type DataShape = {
  id?: string;
  _id?: string;
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
}

const ChapterTabs: React.FC<ChapterTabsProps> = ({ data, progress, completedLessons, onLessonProgress, loading, courseId, moduleProgress = {}, onRefreshProgress }) => {
  const [active, setActive] = useState<TabKey>("Dashboard");
  // Track the most recently started chapter module (or first if none)
  const [currentLesson, setCurrentLesson] = useState<string | null>(completedLessons.length > 0 ? completedLessons[completedLessons.length-1] : (data.modules?.[0]?.id ?? null));
  const router = useRouter();

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
    // Check if this is an "Up Next" module (not the first module)
    const moduleIndex = data.modules?.findIndex((module: ModuleShape) => module.id === lessonId) ?? -1;
    if (moduleIndex > 0) {
      // Navigate to NotesAndReadable with the corresponding module number
      const moduleNumber = moduleIndex + 1;
      router.push({
        pathname: "/Chapter/ChapterDetail/NotesAndReadable",
        params: { module: moduleNumber.toString(), courseId: mongoCourseId },
      });
    } else {
      // Navigate to chapter detail
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
                    // Only show Notes tag for non-first modules
                    const notesTag = (module.tags || []).find((t: any) => t.type === 'notes');
                    const moduleNumber = i + 2; // Module 2, 3, 4, 5 for modules 1, 2, 3, 4
                    // Use backend-calculated module progress only
                    const moduleProgressValue = moduleProgress && typeof moduleProgress[moduleNumber] === 'number' && !isNaN(moduleProgress[moduleNumber])
                      ? Math.round(moduleProgress[moduleNumber])
                      : 0;
                    return (
                      <React.Fragment key={module.id ?? `idx-${i+1}`}>
                        <ChapterCard
                          title={module.title}
                          tags={notesTag ? [notesTag] : []}
                          subtitle={module.subtitle}
                          onPress={() => openLesson(module.id)}
                          isActive={currentLesson === module.id}
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
          {(data.notes || []).length ? (
            (data.notes ?? []).map((n: any, i: number) => (
              <View key={i} className="mb-3 p-5 bg-white rounded-3xl shadow">
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
