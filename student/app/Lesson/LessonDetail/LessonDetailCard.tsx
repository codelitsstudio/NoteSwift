// components/LessonDetail/LessonDetailCard.tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import LiveVideo from "./LiveVideo";
import TagPill from "./TagPill";
import TranscriptItem from "./TranscriptItem";


type Transcript = { time: string; text: string };
type LessonData = {
  id?: string;
  title: string;
  description?: string;
  imageUri?: string;        // used as video thumbnail
  tags?: { label: string; type?: "live" | "video" | "notes" | "attachments"; active?: boolean }[];
  transcript?: Transcript[];
};

type Props = {
  lesson: LessonData;
  onPrevious?: () => void;
  onBack?: () => void;
  onNext?: () => void;
};

const LessonDetailCard: React.FC<Props> = ({ lesson, onPrevious, onBack, onNext }) => {
  return (
    <View className="flex-1 bg-gray-100">
      {/* Video thumbnail first */}
      <LiveVideo thumbnailUri={lesson.imageUri} onPressPlay={() => { /* open player */ }} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="px-6 pt-4">
          {/* Title BELOW the video */}
          <Text className="text-xl font-semibold text-gray-900 leading-snug mb-2">
            {lesson.title}
          </Text>

          {!!lesson.description && (
            <Text className="text-sm text-gray-700 mb-4">
              {lesson.description}
            </Text>
          )}

          {/* Horizontal scroll tags (smaller) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 -ml-1">
            {(lesson.tags || []).map((t, idx) => (
              <TagPill key={idx} label={t.label} type={t.type} active={t.active} />
            ))}
          </ScrollView>
        </View>

        {/* Transcript list with dividers, plain text (no boxes) */}
        <View className="mt-2">
          {(lesson.transcript || []).map((item, idx) => (
            <TranscriptItem key={idx} time={item.time} text={item.text} />
          ))}
        </View>
      </ScrollView>


    </View>
  );
};

export default LessonDetailCard;
