// components/LessonDetail/LiveVideo.tsx
import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, LayoutChangeEvent } from "react-native";
import Slider from "@react-native-community/slider";
import { Video, ResizeMode } from "expo-av";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  videoUri?: string;
  thumbnailUri?: string;
  onPressPlay?: () => void;
};

const BLUE = "#3b82f6";

const LiveVideo: React.FC<Props> = ({
  videoUri = "https://codelitsstudio.com/videos/webdev.mp4",
}) => {
  const videoRef = useRef<Video | null>(null);
  const [status, setStatus] = useState<any>({});
  const [showControls, setShowControls] = useState(true);

  const [sliderWidth, setSliderWidth] = useState(0);
  const [localPosition, setLocalPosition] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const thumbSize = 10;
  const thinLineHeight = 3;

  const togglePlayPause = () => {
    if (status?.isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
  };

  const formatTime = (millis: number | undefined) => {
    if (!millis) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const onSliderLayout = (e: LayoutChangeEvent) => {
    setSliderWidth(e.nativeEvent.layout.width);
  };

  const effectivePosition = isSliding ? localPosition : status?.positionMillis || 0;
  const playedPercent =
    status?.durationMillis && status.durationMillis > 0
      ? effectivePosition / status.durationMillis
      : 0;

  const thumbLeft =
    sliderWidth && status?.durationMillis
      ? Math.max(
          0,
          Math.min(
            sliderWidth - thumbSize,
            playedPercent * (sliderWidth - thumbSize)
          )
        )
      : 0;

  const seekBy = async (ms: number) => {
    const target = Math.max(
      0,
      Math.min(status?.durationMillis || 0, (status?.positionMillis || 0) + ms)
    );
    await videoRef.current?.setPositionAsync(target);
    setLocalPosition(target);
  };

  return (
    <View className="w-full bg-black relative">
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowControls((prev) => !prev)}
      >
      <Video
  ref={videoRef}
  source={{ uri: videoUri }}
  style={{ width: "100%", aspectRatio: 16 / 9 }} // keep inline or StyleSheet
  resizeMode={ResizeMode.COVER}
  onPlaybackStatusUpdate={(s) => {
    setStatus(() => s);
    if (s.isLoaded && !isSliding) setLocalPosition(s.positionMillis || 0);
  }}
/>

      </TouchableOpacity>

      {/* TOP RIGHT icons */}
      {showControls && (
        <View className="absolute top-1.5 left-0 right-0 flex-row justify-between items-center px-2 z-30">
          <View className="w-px" />
          <View className="flex-row items-center">
            <TouchableOpacity className="ml-2 p-1.5">
              <Icon name="cast" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="ml-2 p-1.5">
              <Icon name="closed-caption" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="ml-2 p-1.5">
              <Icon name="settings" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* CENTER controls */}
{showControls && (
  <View className="absolute left-0 right-0 top-1/2 z-30 flex-row justify-around items-center -translate-y-1/2 px-32">
    <TouchableOpacity
      onPress={() => seekBy(-10000)}
      className="w-9 h-9 rounded-full bg-black/45 justify-center items-center"
    >
      <Icon name="replay-10" size={28} color="white" />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={togglePlayPause}
      className="w-14 h-14 rounded-full bg-black/55 justify-center items-center"
      activeOpacity={0.85}
    >
      <Icon
        name={status?.isPlaying ? "pause" : "play-arrow"}
        size={40}
        color={BLUE}
      />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => seekBy(10000)}
      className="w-9 h-9 rounded-full bg-black/45 justify-center items-center"
    >
      <Icon name="forward-10" size={28} color="white" />
    </TouchableOpacity>
  </View>
)}


      {/* ALWAYS VISIBLE THIN LINE */}
      <View className="absolute left-0 right-0 bottom-0 h-[3px] z-25">
        <View className="absolute inset-0 bg-white/20" />
        <View className="absolute left-0 top-0 bottom-0" style={{ width: `${Math.max(0, Math.min(1, playedPercent)) * 100}%`, backgroundColor: BLUE }} />
      </View>

      {/* INTERACTIVE SLIDER */}
      <View className="absolute left-0 right-0 bottom-0 h-14 z-35">
        {showControls && (
          <>
            {/* Time */}
            <View className="absolute left-2 bottom-3.5 z-40">
              <Text className="text-white text-xs px-1.5 py-0.5 rounded">
                {formatTime(localPosition || status?.positionMillis)} / {formatTime(status?.durationMillis)}
              </Text>
            </View>

            {/* Slider */}
            <View className="absolute left-0 right-0 bottom-0 h-10 justify-center" onLayout={onSliderLayout}>
              <Slider
                style={{ width: "100%", height: 30 }}
                minimumValue={0}
                maximumValue={status?.durationMillis || 0}
                value={localPosition || status?.positionMillis || 0}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor="transparent"
                onValueChange={(val: number) => setLocalPosition(val)}
                onSlidingStart={() => setIsSliding(true)}
                onSlidingComplete={async (val: number) => {
                  await videoRef.current?.setPositionAsync(val);
                  setLocalPosition(val);
                  setIsSliding(false);
                }}
              />
              {(showControls || isSliding) && sliderWidth > 0 && (
                <View className="absolute z-40" style={{
                  left: thumbLeft,
                  width: thumbSize,
                  height: thumbSize,
                  borderRadius: thumbSize / 2,
                  backgroundColor: BLUE,
                  bottom: -(thumbSize / 2 - thinLineHeight / 2),
                }} pointerEvents="none" />
              )}
            </View>

            {/* Fullscreen */}
            <View className="absolute right-2 bottom-3.5 z-40">
              <TouchableOpacity>
                <Icon name="fullscreen" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default LiveVideo;
