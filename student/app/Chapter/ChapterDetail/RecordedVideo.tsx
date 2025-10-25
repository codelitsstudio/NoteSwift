// components/ChapterDetail/RecordedVideo.tsx
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from "react";
import { View, TouchableOpacity, Text, LayoutChangeEvent, Animated, Easing, ActivityIndicator, StyleSheet, Platform, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { Video, ResizeMode, Audio, VideoFullscreenUpdate } from "expo-av";
import Icon from "react-native-vector-icons/MaterialIcons";
import { updateModuleProgress } from "../../../api/lessonProgress";
import * as ScreenOrientation from 'expo-screen-orientation';
import api from "@/api/axios";

type LiveVideoProps = {
  courseId: string;
  subjectName: string;
  moduleNumber: number;
  thumbnailUri?: string;
  onPressPlay?: () => void;
  onTimeUpdate?: (ms: number) => void;
  onPlayPauseChange?: (isPlaying: boolean) => void;
  onDurationUpdate?: (ms: number) => void;
  onVideoCompletionStatusChange?: (completed: boolean) => void;
  videoCompleted?: boolean;
};

const BLUE = "#3b82f6";

const LiveVideo = forwardRef<any, LiveVideoProps>(
  ({ courseId, subjectName, moduleNumber, thumbnailUri, onPressPlay, onTimeUpdate, onPlayPauseChange, onDurationUpdate, onVideoCompletionStatusChange, videoCompleted: initialVideoCompleted = false }, ref) => {
    const videoRef = useRef<Video | null>(null);
    const [videoState, setVideoState] = useState({
      status: {} as any,
      isLoading: true,
      showControls: true,
      isSliding: false,
      localPosition: 0,
      sliderWidth: 0,
    });
    const videoStateRef = useRef(videoState);

    // Keep ref in sync with state
    useEffect(() => {
      videoStateRef.current = videoState;
    }, [videoState]);
    const [videoCompleted, setVideoCompleted] = useState(initialVideoCompleted);

    // State for signed URL
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [urlLoading, setUrlLoading] = useState(true);
    const [urlError, setUrlError] = useState<string | null>(null);

    // Fetch signed URL on component mount
    useEffect(() => {
      const fetchSignedUrl = async () => {
        try {
          setUrlLoading(true);
          setUrlError(null);
          const response = await api.get(`/courses/${courseId}/subject/${subjectName}/module/${moduleNumber}/video`);
          if (response.data.success && response.data.signedUrl) {
            setSignedUrl(response.data.signedUrl);
          } else {
            throw new Error('Failed to get signed URL');
          }
        } catch (err) {
          console.error('Error fetching video signed URL:', err);
          setUrlError('Failed to load video. Please try again.');
        } finally {
          setUrlLoading(false);
        }
      };

      fetchSignedUrl();
    }, [courseId, subjectName, moduleNumber]);

    // Track if we've already marked video as completed
    const hasMarkedCompletedRef = useRef(false);

    // Listen for video completion
    useEffect(() => {
      if (videoState.status?.didJustFinish && !videoCompleted && courseId && !hasMarkedCompletedRef.current) {
        setVideoCompleted(true);
        hasMarkedCompletedRef.current = true;
        // Call backend to mark VIDEO as completed (separate from notes completion)
        updateModuleProgress(courseId, moduleNumber, true);
        // Notify parent that video has been completed
        if (onVideoCompletionStatusChange) {
          onVideoCompletionStatusChange(true);
        }
      }
    }, [videoState.status?.didJustFinish, videoCompleted, courseId, moduleNumber, onVideoCompletionStatusChange]);
 
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
          } catch {
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

    const timeUpdateRef = useRef(onTimeUpdate);
    timeUpdateRef.current = onTimeUpdate;
    const lastTimeUpdateRef = useRef(0);

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
      } else {
        videoRef.current?.playAsync();
      }
      showControlsTemporarily();
    }, [videoState.status?.isPlaying, showControlsTemporarily]);

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

    const { playedPercent, thumbLeft } = useMemo(() => {
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
        playedPercent: percent,
        thumbLeft: left,
      };
    }, [videoState.isSliding, videoState.localPosition, videoState.status?.positionMillis, videoState.status?.durationMillis, videoState.sliderWidth, thumbSize]);

    // **FIXED**: Fullscreen handler - Use native fullscreen for both platforms
    const handleFullscreen = useCallback(async () => {
        try {
            if (Platform.OS === "web") {
                Alert.alert("Not supported", "Fullscreen is not supported on web.");
                return;
            }
            
            // Use Expo's native fullscreen for both iOS and Android
            if (videoRef.current) {
                await videoRef.current.presentFullscreenPlayer();
            }
        } catch (e) {
            Alert.alert("Fullscreen error", String(e));
        }
    }, []);




    const handleVideoPress = useCallback(() => {
      if (!videoState.isLoading) {
        const newShowControls = !videoState.showControls;
        setVideoState(prev => ({ ...prev, showControls: newShowControls }));
        fadeControls(newShowControls);
      }
    }, [videoState.isLoading, videoState.showControls, fadeControls]);

    const prevIsPlayingRef = useRef<boolean | undefined>(undefined);
    const prevDurationRef = useRef<number | undefined>(undefined);

    const handlePlaybackStatusUpdate = useCallback((s: any) => {
      statusRef.current = s;
      setUpdateCounter(prev => prev + 1);
    }, []);

    useEffect(() => {
      const s = statusRef.current;
      if (s) {
        setVideoState(prev => {
          const newState: Partial<typeof videoState> = {
            status: s,
            isLoading: !s.isLoaded,
          };
          if (s.isLoaded && !prev.isSliding) {
            newState.localPosition = s.positionMillis || 0;
          }
          return { ...prev, ...newState };
        });

        if (typeof onPlayPauseChange === 'function' && s.isLoaded && typeof s.isPlaying === 'boolean') {
          if (prevIsPlayingRef.current !== s.isPlaying) {
            onPlayPauseChange(s.isPlaying);
            prevIsPlayingRef.current = s.isPlaying;
          }
        }

        if (s.isLoaded && s.durationMillis && typeof onDurationUpdate === 'function') {
          if (prevDurationRef.current !== s.durationMillis) {
            onDurationUpdate(s.durationMillis);
            prevDurationRef.current = s.durationMillis;
          }
        }

        if (s.isLoaded && s.positionMillis != null && typeof timeUpdateRef.current === 'function') {
          const now = Date.now();
          if (now - lastTimeUpdateRef.current > 1000) {
            timeUpdateRef.current(s.positionMillis);
            lastTimeUpdateRef.current = now;
          }
        }
      }
    }, [updateCounter, onPlayPauseChange, onDurationUpdate]);

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

    const controlsVisible = videoState.showControls && !videoState.isLoading && !urlLoading && !urlError;

    const timeDisplay = useMemo(() => 
      `${formatTime(videoState.isSliding ? videoState.localPosition : videoState.status?.positionMillis)} / ${formatTime(videoState.status?.durationMillis)}`,
      [formatTime, videoState.isSliding, videoState.localPosition, videoState.status?.positionMillis, videoState.status?.durationMillis]
    );

    return (
      <>
        <View style={styles.container}>
          {/* This container holds the inline player */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleVideoPress}
            style={styles.videoWrapper}
          >
            {(videoState.isLoading || urlLoading) && (
              <View style={styles.skeleton}>
                <ActivityIndicator size="large" color={BLUE} />
                {urlLoading && <Text style={{ color: BLUE, marginTop: 8 }}>Loading video...</Text>}
              </View>
            )}
            {urlError && !urlLoading && (
              <View style={styles.skeleton}>
                <Icon name="error-outline" size={48} color="#EF4444" />
                <Text style={{ color: '#EF4444', marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
                  {urlError}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setUrlError(null);
                    setUrlLoading(true);
                    // Re-fetch signed URL
                    const fetchSignedUrl = async () => {
                      try {
                        const response = await api.get(`/courses/${courseId}/subject/${subjectName}/module/${moduleNumber}/video`);
                        if (response.data.success && response.data.signedUrl) {
                          setSignedUrl(response.data.signedUrl);
                        } else {
                          throw new Error('Failed to get signed URL');
                        }
                      } catch (err) {
                        setUrlError('Failed to load video. Please try again.');
                      } finally {
                        setUrlLoading(false);
                      }
                    };
                    fetchSignedUrl();
                  }}
                  style={{ marginTop: 16, backgroundColor: BLUE, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            {signedUrl && !urlLoading && !urlError && (
              <Video
                ref={videoRef}
                source={{ uri: signedUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode={ResizeMode.COVER}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                onFullscreenUpdate={(event) => {
                  if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_PRESENT) {
                    // Entered fullscreen, lock to landscape
                    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                  } else if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
                    // Exited fullscreen, lock to portrait
                    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                  }
                }}
                shouldPlay={false}
                usePoster={!!thumbnailUri}
                posterSource={thumbnailUri ? { uri: thumbnailUri } : undefined}
                progressUpdateIntervalMillis={500}
              />
            )}
          </TouchableOpacity>

          {/* Inline Controls - Only show when video is loaded and no errors */}
          {signedUrl && !videoState.isLoading && !urlLoading && !urlError && (
            <>
              {/* Center Play/Pause */}
              <Animated.View
                pointerEvents={controlsVisible ? "auto" : "none"}
                style={[styles.centerControls, { opacity: controlsOpacity }]}
              >
                <TouchableOpacity
                  onPress={togglePlayPause}
                  style={styles.playPauseButton}
                  activeOpacity={0.85}
                >
                  <Icon
                    name={videoState.status?.isPlaying ? "pause" : "play-arrow"}
                    size={40}
                    color={BLUE}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Always visible progress bar */}
              <View style={styles.thinProgressBarContainer}>
                <View style={styles.thinProgressBarBackground} />
                <View style={[styles.thinProgressBarFill, { width: `${playedPercent * 100}%` }]} />
              </View>

              {/* Interactive Controls */}
              <Animated.View
                pointerEvents={controlsVisible ? "auto" : "none"}
                style={[styles.bottomControlsContainer, { opacity: controlsOpacity }]}
              >
                <View style={styles.timestampContainer}>
                  <Text style={styles.timestampText}>{timeDisplay}</Text>
                </View>
                <View style={styles.sliderContainer} onLayout={onSliderLayout}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={videoState.status?.durationMillis || 1}
                    value={videoState.isSliding ? videoState.localPosition : videoState.status?.positionMillis || 0}
                    minimumTrackTintColor="transparent"
                    maximumTrackTintColor="transparent"
                    thumbTintColor="transparent"
                    onValueChange={handleSliderValueChange}
                    onSlidingStart={handleSlidingStart}
                    onSlidingComplete={handleSlidingComplete}
                  />
                  {(controlsVisible || videoState.isSliding) && videoState.sliderWidth > 0 && (
                    <View style={[styles.sliderThumb, { left: thumbLeft, bottom: -(thumbSize / 2 - thinLineHeight / 2) }]} pointerEvents="none" />
                  )}
                </View>
                <View style={styles.fullscreenButtonContainer}>
                  <TouchableOpacity onPress={handleFullscreen}>
                    <Icon name="fullscreen" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </>
          )}
        </View>
      </>
    );
});

// **NOTE**: I've converted your inline styles and Tailwind classes to a StyleSheet for better performance and readability.
const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FAFAFA',
        position: 'relative',
    },
    videoWrapper: {
        width: "100%",
        aspectRatio: 16 / 9,
    },
    skeleton: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FAFAFA',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    centerControls: {
        position: "absolute",
        top: '50%',
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        transform: [{ translateY: -28 }],
        zIndex: 20,
    },
    playPauseButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        alignItems: "center",
    },
    thinProgressBarContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 3,
        zIndex: 25,
    },
    thinProgressBarBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    thinProgressBarFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: BLUE,
    },
    bottomControlsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 56,
        zIndex: 30,
    },
    timestampContainer: {
        position: 'absolute',
        left: 8,
        bottom: 14,
        zIndex: 35,
    },
    timestampText: {
        color: 'white',
        fontSize: 12,
    },
    sliderContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 40,
        justifyContent: 'center',
    },
    slider: {
        width: '100%',
        height: 30,
    },
    sliderThumb: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: BLUE,
        zIndex: 40,
    },
    fullscreenButtonContainer: {
        position: 'absolute',
        right: 8,
        bottom: 14,
        zIndex: 35,
    },
});

LiveVideo.displayName = 'LiveVideo';

export default LiveVideo;