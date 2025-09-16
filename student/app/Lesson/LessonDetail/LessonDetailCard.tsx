// components/LessonDetail/LessonDetailCard.tsx
import React, { useRef, useState, useEffect } from "react";
import { AppState } from "react-native";
import { View, Text, ScrollView, FlatList } from "react-native";

import LiveVideo from "./LiveVideo";
import TagPill from "./TagPill";
import TranscriptItem from "./TranscriptItem";
import AttachmentPage from "./AttachmentPage";


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
  onVideoCompleted?: () => void;
};

type TabType = 'video' | 'attachments';

const LessonDetailCard: React.FC<Props> = ({ lesson, onPrevious, onBack, onNext, onVideoCompleted }) => {
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const videoRef = useRef(null);

  // Check if video is completed
  useEffect(() => {
    if (videoDuration > 0 && currentTime >= videoDuration - 1 && !videoCompleted) {
      setVideoCompleted(true);
      onVideoCompleted?.();
    }
  }, [currentTime, videoDuration, videoCompleted, onVideoCompleted]);

  // Helper to parse "0:00 – 2:00" to seconds (start)
  const getStartSeconds = (timeRange: string) => {
    const parts = timeRange.split("–");
    return parseTime(parts[0]);
  };
  // Helper to parse "0:00" to seconds
  const parseTime = (str: string) => {
    const [min, sec] = str.trim().split(":").map(Number);
    return (min || 0) * 60 + (sec || 0);
  };

  // FlatList ref for transcript
const transcriptListRef = useRef<FlatList>(null);
const lastHighlightedIdx = useRef(-1);

// Find the currently highlighted transcript index
const highlightedIdx = (lesson.transcript || []).findIndex((item) => {
  const parts = item.time.split("–");
  const startSec = parseTime(parts[0]);
  const endSec = parts[1] ? parseTime(parts[1]) : startSec;
  return currentTime >= startSec && currentTime <= endSec;
});
// Keep a ref to the latest highlighted index for smooth scrolling
const highlightedIdxRef = useRef(highlightedIdx);
highlightedIdxRef.current = highlightedIdx;
const currentTimeRef = useRef(currentTime);
currentTimeRef.current = currentTime;

const scrollOffset = useRef(0);
const lastTimeRef = useRef(0);
const isScrollingRef = useRef(false);
const [isPlaying, setIsPlaying] = useState(false);
const [appActive, setAppActive] = useState(true);

  // Auto-scroll feature removed as requested



  return (
    <View className="flex-1 bg-gray-100">
      {/* Video thumbnail first */}
<LiveVideo
  ref={videoRef}
  thumbnailUri={lesson.imageUri}
  onPressPlay={() => {
    // Only reset scrollOffset if starting from beginning
    if (scrollOffset.current === 0) {
      scrollOffset.current = highlightedIdxRef.current * 54;
    }
  }}
  onPlayPauseChange={(playing) => {
    setIsPlaying(playing);
  }}
  onTimeUpdate={(ms: number) => {
    const seconds = ms / 1000;
    setCurrentTime(seconds);
    currentTimeRef.current = seconds;
  }}
  onDurationUpdate={(ms: number) => {
    const seconds = ms / 1000;
    setVideoDuration(seconds);
  }}
/>


      {/* Fixed Title, Description, TagPill */}
      <View className="px-6 pt-4 bg-gray-100">
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
          {(lesson.tags || [])
            .filter((t) => t.type !== 'notes')
            .map((t, idx) => {
              const type = t.type as 'live' | 'video' | 'attachments' | undefined;
              return (
                <TagPill
                  key={idx}
                  label={t.label}
                  type={type}
                  active={
                    (type === 'video' && activeTab === 'video') ||
                    (type === 'attachments' && activeTab === 'attachments')
                  }
                  onPress={
                    type === 'live'
                      ? undefined
                      : type === 'video'
                        ? () => setActiveTab('video')
                        : type === 'attachments'
                          ? () => setActiveTab('attachments')
                          : undefined
                  }
                  disabled={type === 'live'}
                />
              );
            })}
        </ScrollView>
      </View>

      {/* Only transcript is scrollable or show attachments */}
      {activeTab === 'video' ? (
        <View style={{ maxHeight: 350, flexGrow: 0 }}>
          <FlatList
            ref={transcriptListRef}
            contentContainerStyle={{ paddingBottom: 16, marginTop: 8 }}
            data={lesson.transcript || []}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => {
              const parts = item.time.split("–");
              const startSec = parseTime(parts[0]);
              const endSec = parts[1] ? parseTime(parts[1]) : startSec;
              return (
                <TranscriptItem
                  time={item.time}
                  text={item.text}
                  currentTime={currentTime}
                  startSec={startSec}
                  endSec={endSec}
                />
              );
            }}
            getItemLayout={(_, index) => ({ length: 54, offset: 54 * index, index })}
            initialNumToRender={10}
            windowSize={7}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10
            }}
            scrollEnabled={true}
          />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <AttachmentPage />
        </View>
      )}
    </View>
  );
};

export default LessonDetailCard;