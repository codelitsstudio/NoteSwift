// components/LessonDetail/LiveVideo.tsx
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from "react";
import { View, TouchableOpacity, Text, LayoutChangeEvent, Animated, Easing, ActivityIndicator, StyleSheet, Platform, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { Video, ResizeMode, Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { updateModuleProgress } from "../../../api/lessonProgress";

type LiveVideoProps = {
  videoUri?: string;
  thumbnailUri?: string;
  onPressPlay?: () => void;
  onTimeUpdate?: (ms: number) => void;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  onDurationUpdate?: (ms: number) => void;
};

const BLUE = "#3b82f6";

const LiveVideo = forwardRef<any, LiveVideoProps>(
  ({ videoUri = "https://codelitsstudio.com/videos/how-to-study-for-noteswift.mp4", thumbnailUri, onPressPlay, onTimeUpdate, onPlayPauseChange, onDurationUpdate }, ref) => {
    const videoRef = useRef<Video | null>(null);
    const [videoState, setVideoState] = useState({
      status: {} as any,
      isLoading: true,
      showControls: true,
      isSliding: false,
      isFullscreen: false,
      localPosition: 0,
      sliderWidth: 0,
    });
    const [videoCompleted, setVideoCompleted] = useState(false);
    const [videoAlreadyCompleted, setVideoAlreadyCompleted] = useState(false);
    const params = useLocalSearchParams();
    const courseId = params.courseId ? String(params.courseId) : "";
    const moduleNumber = params.module ? parseInt(String(params.module)) : 1;

    useEffect(() => {
      // On mount, check backend for video completion
      if (courseId && moduleNumber) {
        const { getModuleProgress } = require("../../../api/lessonProgress");
        getModuleProgress(courseId, moduleNumber).then((res: any) => {
          if (res.success && res.data && res.data.moduleProgress?.videoCompleted) {
            setVideoAlreadyCompleted(true);
            setVideoCompleted(true);
          }
        });
      }
    }, [courseId, moduleNumber]);

    // Listen for video completion
    useEffect(() => {
      if (videoState.status?.didJustFinish && !videoCompleted && courseId) {
        setVideoCompleted(true);
        // Call backend to mark video as completed and set progress to 50%
  updateModuleProgress(courseId, moduleNumber, true);
        // Optionally, trigger UI update (e.g., via callback or event)
        // You may want to call a prop like onProgressUpdate(50) here
      }
    }, [videoState.status?.didJustFinish, videoCompleted, courseId, moduleNumber]);

    // If video is completed, allow navigation to notes (handled by parent navigation logic)
  
  const [controlsOpacity] = useState(new Animated.Value(1));
  const prevIsLoadingRef = useRef(videoState.isLoading);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const statusRef = useRef<any>({});
  const [updateCounter, setUpdateCounter] = useState(0);

  // Memoized constants
  const { thumbSize, thinLineHeight } = useMemo(() => ({
    thumbSize: 10,
    thinLineHeight: 3,
  }), []);


  // Ensure audio plays in silent mode on iOS only
  useEffect(() => {
    if (Platform.OS === "ios") {
      (async () => {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
          });
        } catch (e) {
          // Optionally log error
        }
      })();
    }
  }, []);

  // Auto-play when loading finishes (optimized)
  useEffect(() => {
    if (prevIsLoadingRef.current && !videoState.isLoading && videoRef.current) {
      videoRef.current.playAsync?.();
    }
    prevIsLoadingRef.current = videoState.isLoading;
  }, [videoState.isLoading]);

  // Expose current time to parent
  useImperativeHandle(ref, () => ({
    getCurrentTime: () => videoState.status?.positionMillis || 0,
  }), [videoState.status?.positionMillis]);

  // Optimized time update callback
  const timeUpdateRef = useRef(onTimeUpdate);
  timeUpdateRef.current = onTimeUpdate;

  useEffect(() => {
    if (timeUpdateRef.current && videoState.status?.positionMillis != null) {
      timeUpdateRef.current(videoState.status.positionMillis);
    }
  }, [videoState.status?.positionMillis]);

  // Memoized fade controls function
  const fadeControls = useCallback((visible: boolean) => {
    Animated.timing(controlsOpacity, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [controlsOpacity]);

  // Optimized show controls with cleanup
  const showControlsTemporarily = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setVideoState(prev => ({ ...prev, showControls: true }));
    fadeControls(true);
    
    controlsTimeoutRef.current = setTimeout(() => {
      setVideoState(prev => ({ ...prev, showControls: false }));
      fadeControls(false);
    }, 2500);
  }, [fadeControls]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    if (videoState.status?.isPlaying) {
      videoRef.current?.pauseAsync();
      if (typeof onPlayPauseChange === 'function') onPlayPauseChange(false);
    } else {
      videoRef.current?.playAsync();
      if (typeof onPlayPauseChange === 'function') onPlayPauseChange(true);
    }
    showControlsTemporarily();
  }, [videoState.status?.isPlaying, showControlsTemporarily, onPlayPauseChange]);

  // Memoized time formatter
  const formatTime = useCallback((millis: number | undefined) => {
    if (!millis) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  const onSliderLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setVideoState(prev => ({ ...prev, sliderWidth: width }));
  }, []);

  // Memoized calculations
  const { effectivePosition, playedPercent, thumbLeft } = useMemo(() => {
    const position = videoState.isSliding ? videoState.localPosition : videoState.status?.positionMillis || 0;
    const percent = videoState.status?.durationMillis && videoState.status.durationMillis > 0
      ? position / videoState.status.durationMillis
      : 0;
    
    const left = videoState.sliderWidth && videoState.status?.durationMillis
      ? Math.max(
          0,
          Math.min(
            videoState.sliderWidth - thumbSize,
            percent * (videoState.sliderWidth - thumbSize)
          )
        )
      : 0;

    return {
      effectivePosition: position,
      playedPercent: percent,
      thumbLeft: left,
    };
  }, [videoState.isSliding, videoState.localPosition, videoState.status?.positionMillis, videoState.status?.durationMillis, videoState.sliderWidth, thumbSize]);

  const seekBy = useCallback(async (ms: number) => {
    const target = Math.max(
      0,
      Math.min(videoState.status?.durationMillis || 0, (videoState.status?.positionMillis || 0) + ms)
    );
    await videoRef.current?.setPositionAsync(target);
    setVideoState(prev => ({ ...prev, localPosition: target }));
  }, [videoState.status?.durationMillis, videoState.status?.positionMillis]);

  // Fullscreen handlers
  const handleFullscreen = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        Alert.alert("Not supported", "Fullscreen is not supported on web.");
        return;
      }
      if (videoState.isFullscreen) {
        await videoRef.current?.dismissFullscreenPlayer();
        setVideoState(prev => ({ ...prev, isFullscreen: false }));
      } else {
        await videoRef.current?.presentFullscreenPlayer();
        setVideoState(prev => ({ ...prev, isFullscreen: true }));
      }
    } catch (e) {
      Alert.alert("Fullscreen error", String(e));
    }
  }, [videoState.isFullscreen]);

  const handleCast = useCallback(() => {
    Alert.alert("Cast Device", "Casting is not implemented in this demo.");
  }, []);

  const handleSettings = useCallback(() => {
    Alert.alert("Settings", "Settings dialog is not implemented in this demo.");
  }, []);

  // Optimized video tap handler
  const handleVideoPress = useCallback(() => {
    if (!videoState.isLoading) {
      const newShowControls = !videoState.showControls;
      setVideoState(prev => ({ ...prev, showControls: newShowControls }));
      fadeControls(newShowControls);
    }
  }, [videoState.isLoading, videoState.showControls, fadeControls]);

  // Optimized playback status update
  const handlePlaybackStatusUpdate = useCallback((s: any) => {
    statusRef.current = s;
    setUpdateCounter(prev => prev + 1);
  }, []);

  // Update state based on status ref
  useEffect(() => {
    const s = statusRef.current;
    if (s) {
      setVideoState(prev => {
        const newState = {
          ...prev,
          status: s,
          isLoading: !s.isLoaded,
        };
        if (s.isLoaded && !prev.isSliding) {
          newState.localPosition = s.positionMillis || 0;
        }
        return newState;
      });

      // Notify parent if play/pause state changes
      if (typeof onPlayPauseChange === 'function' && s.isLoaded && typeof s.isPlaying === 'boolean') {
        onPlayPauseChange(s.isPlaying);
      }

      // Notify parent of duration when available
      if (s.isLoaded && s.durationMillis && typeof onDurationUpdate === 'function') {
        onDurationUpdate(s.durationMillis);
      }
    }
  }, [updateCounter, onPlayPauseChange, onDurationUpdate]);

  // Memoized slider handlers
  const handleSliderValueChange = useCallback((val: number) => {
    setVideoState(prev => ({ ...prev, localPosition: val }));
  }, []);

  const handleSlidingStart = useCallback(() => {
    setVideoState(prev => ({ ...prev, isSliding: true }));
  }, []);

  const handleSlidingComplete = useCallback(async (val: number) => {
    await videoRef.current?.setPositionAsync(val);
    setVideoState(prev => ({ 
      ...prev, 
      localPosition: val, 
      isSliding: false 
    }));
  }, []);

  const controlsVisible = videoState.showControls && !videoState.isLoading;

  // Memoized time display
  const timeDisplay = useMemo(() => 
    `${formatTime(videoState.localPosition || videoState.status?.positionMillis)} / ${formatTime(videoState.status?.durationMillis)}`,
    [formatTime, videoState.localPosition, videoState.status?.positionMillis, videoState.status?.durationMillis]
  );

  return (
    <View className="w-full bg-black relative">
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleVideoPress}
        style={{ width: "100%", aspectRatio: 16 / 9 }}
      >
        {/* Skeleton loader while video loads */}
        {videoState.isLoading && (
          <View style={styles.skeleton}>
            <ActivityIndicator size="large" color={BLUE} />
          </View>
        )}
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={[StyleSheet.absoluteFill, { width: "100%", aspectRatio: 16 / 9 }]}
          resizeMode={ResizeMode.COVER}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          shouldPlay={false}
          usePoster={!!thumbnailUri}
          posterSource={thumbnailUri ? { uri: thumbnailUri } : undefined}
          progressUpdateIntervalMillis={500}
        />
      </TouchableOpacity>

      {/* Controls only when not loading */}
      {!videoState.isLoading && <>
        {/* TOP RIGHT icons */}
        <Animated.View
          pointerEvents={controlsVisible ? "auto" : "none"}
          style={{
            opacity: controlsOpacity,
            position: "absolute",
            top: 12,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 8,
            zIndex: 30,
          }}
        >
          <View style={{ width: 1 }} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity style={{ marginLeft: 8, padding: 6 }} onPress={handleCast}>
              <Icon name="cast" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 8, padding: 6 }}>
              <Icon name="closed-caption" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 8, padding: 6 }} onPress={handleSettings}>
              <Icon name="settings" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* CENTER controls */}
        <Animated.View
          pointerEvents={controlsVisible ? "auto" : "none"}
          style={{
            opacity: controlsOpacity,
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            zIndex: 30,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            transform: [{ translateY: -32 }],
          }}
        >
          <TouchableOpacity
            onPress={togglePlayPause}
            style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center" }}
            activeOpacity={0.85}
          >
            <Icon
              name={videoState.status?.isPlaying ? "pause" : "play-arrow"}
              size={40}
              color={BLUE}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* ALWAYS VISIBLE THIN LINE */}
        <View className="absolute left-0 right-0 bottom-0 h-[3px] z-25">
          <View className="absolute inset-0 bg-white/20" />
          <View className="absolute left-0 top-0 bottom-0" style={{ width: `${Math.max(0, Math.min(1, playedPercent)) * 100}%`, backgroundColor: BLUE }} />
        </View>

        {/* INTERACTIVE SLIDER */}
        <Animated.View
          pointerEvents={controlsVisible ? "auto" : "none"}
          style={{
            opacity: controlsOpacity,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 56,
            zIndex: 35,
          }}
        >
          {/* Time */}
          <View style={{ position: "absolute", left: 8, bottom: 14, zIndex: 40 }}>
            <Text style={{ color: "white", fontSize: 12, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              {timeDisplay}
            </Text>
          </View>
          {/* Slider */}
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 40, justifyContent: "center" }} onLayout={onSliderLayout}>
            <Slider
              style={{ width: "100%", height: 30 }}
              minimumValue={0}
              maximumValue={videoState.status?.durationMillis || 0}
              value={videoState.localPosition || videoState.status?.positionMillis || 0}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="transparent"
              onValueChange={handleSliderValueChange}
              onSlidingStart={handleSlidingStart}
              onSlidingComplete={handleSlidingComplete}
            />
            {(controlsVisible || videoState.isSliding) && videoState.sliderWidth > 0 && (
              <View style={{
                position: "absolute",
                left: thumbLeft,
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                backgroundColor: BLUE,
                bottom: -(thumbSize / 2 - thinLineHeight / 2),
                zIndex: 40,
              }} pointerEvents="none" />
            )}
          </View>
          {/* Fullscreen */}
          <View style={{ position: "absolute", right: 8, bottom: 14, zIndex: 40 }}>
            <TouchableOpacity onPress={handleFullscreen}>
              <Icon name="fullscreen" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </>}
    </View>
  );
});

const styles = StyleSheet.create({
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 8,
  },
});

export default LiveVideo;