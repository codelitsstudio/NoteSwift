import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import TabNav, { TabKey } from "./TabNav";
import LessonCard from "../Container/LessonCard";
import Icon from "react-native-vector-icons/MaterialIcons";

type DataShape = {
  lessons?: Array<{ id?: string; title: string; tags?: any[] }>;
  tests?: any[];
  notes?: any[];
  resources?: any[];
  description?: string;
  duration?: string;
};

const ChapterTabs: React.FC<{ data: DataShape }> = ({ data }) => {
  const [active, setActive] = useState<TabKey>("Dashboard");
  const router = useRouter();

  const openLesson = (lessonId?: string) => {
  if (!lessonId) {
    console.warn("Lesson missing id — cannot navigate.");
    return;
  }

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
          {Array.isArray(data.lessons) && data.lessons.length ? (
            data.lessons.map((lesson, i) => (
              <LessonCard
                key={lesson.id ?? `idx-${i}`}
                title={lesson.title}
                tags={lesson.tags}
                onPress={() => openLesson(lesson.id)} // ✅ navigation fixed
              />
            ))
          ) : (
            <View className="px-4 py-6">
              <Text className="text-gray-500 text-base">No lessons available.</Text>
            </View>
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

      {/* Notes */}
      {active === "Notes" && (
        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          {(data.notes || []).length ? (
            (data.notes ?? []).map((n: any, i: number) => (
              <View key={i} className="mb-3 p-5 bg-white rounded-xl shadow">
                <Text className="text-base font-medium text-gray-900">{n.title}</Text>
                {n.snippet ? <Text className="text-sm text-gray-600 mt-2">{n.snippet}</Text> : null}
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-base">No notes added for this chapter.</Text>
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
          <View className="bg-white p-5 rounded-xl shadow">
            <Text className="text-base font-semibold mb-2">About this chapter</Text>
            <Text className="text-base text-gray-700">{data.description}</Text>
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
