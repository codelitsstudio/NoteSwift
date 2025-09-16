import React, { useMemo, memo } from "react";
import { View, Text } from "react-native";

type Props = {
  time: string; // e.g. "0:00 – 2:00"
  text: string;
  currentTime: number;
  startSec: number;
  endSec: number;
};

// Pre-computed constants to avoid recreation
const BASE_COLOR = { r: 34, g: 34, b: 34 }; // #222
const HIGHLIGHT_COLOR = { r: 37, g: 99, b: 235 }; // #2563eb
const COLOR_DIFF = {
  r: HIGHLIGHT_COLOR.r - BASE_COLOR.r,
  g: HIGHLIGHT_COLOR.g - BASE_COLOR.g,
  b: HIGHLIGHT_COLOR.b - BASE_COLOR.b,
};
const BASE_OPACITY = 0.5;
const OPACITY_RANGE = 0.5;

// Memoized color interpolation function
const interpolateColor = (progress: number) => {
  const r = Math.round(BASE_COLOR.r + COLOR_DIFF.r * progress);
  const g = Math.round(BASE_COLOR.g + COLOR_DIFF.g * progress);
  const b = Math.round(BASE_COLOR.b + COLOR_DIFF.b * progress);
  const opacity = BASE_OPACITY + OPACITY_RANGE * progress;
  
  return {
    color: `rgb(${r}, ${g}, ${b})`,
    opacity,
  };
};

const TranscriptItem: React.FC<Props> = ({ time, text, currentTime, startSec, endSec }) => {

  // Calculate highlight progress (0 to 1) - optimized with early returns
  const progress = useMemo(() => {
    if (currentTime >= endSec) return 1;
    if (currentTime <= startSec) return 0;
    const duration = endSec - startSec;
    return duration > 0 ? (currentTime - startSec) / duration : 0;
  }, [currentTime, startSec, endSec]);

  // Split time string at the en dash (–)
  const timeParts = useMemo(() => {
    const parts = time.split("–");
    if (parts.length === 2) {
      return [parts[0].trim(), "–", parts[1].trim()];
    }
    return [time];
  }, [time]);

  // Optimized word processing with reduced calculations
  const { words, totalChars } = useMemo(() => {
    const wordArray = text.split(" ");
    return {
      words: wordArray,
      totalChars: text.length,
    };
  }, [text]);

  // Compute highlighted words with optimized algorithm
  const highlightedWords = useMemo(() => {
    // Early return if no progress
    if (progress === 0) {
      const baseStyle = interpolateColor(0);
      return words.map((word, idx) => ({
        word: idx < words.length - 1 ? word + " " : word,
        ...baseStyle,
      }));
    }

    // Early return if fully highlighted
    if (progress === 1) {
      const fullStyle = interpolateColor(1);
      return words.map((word, idx) => ({
        word: idx < words.length - 1 ? word + " " : word,
        ...fullStyle,
      }));
    }

    // Calculate highlight position once
    const highlightChars = Math.floor(totalChars * progress);
    
    let charsCount = 0;
    return words.map((word, idx) => {
      const wordWithSpace = idx < words.length - 1 ? word + " " : word;
      const wordLength = wordWithSpace.length;
      const wordStartChar = charsCount;
      const wordEndChar = charsCount + wordLength;
      charsCount += wordLength;
      
      // Optimized word progress calculation
      let wordProgress: number;
      if (highlightChars >= wordEndChar) {
        wordProgress = 1; // Fully highlighted
      } else if (highlightChars <= wordStartChar) {
        wordProgress = 0; // Not highlighted
      } else {
        wordProgress = (highlightChars - wordStartChar) / wordLength; // Partially highlighted
      }
      
      return {
        word: wordWithSpace,
        ...interpolateColor(wordProgress),
      };
    });
  }, [words, totalChars, progress]);

  // Memoized styles to prevent recreation
  const containerStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'flex-start' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  }), []);

  const timeContainerStyle = useMemo(() => ({
    width: 96, // w-24 = 6rem = 96px
    paddingRight: 8,
  }), []);

  const timeTextStyle = useMemo(() => ({
    fontSize: 12,
    marginTop: 6, // mt-1.5 = 0.375rem ≈ 6px
    color: '#6b7280', // text-gray-500
  }), []);

  const textContainerStyle = useMemo(() => ({
    flex: 1,
    paddingRight: 8,
  }), []);

  const textStyle = useMemo(() => ({
    fontSize: 12,
    lineHeight: 22,
  }), []);

  return (
    <View style={containerStyle}>
      {/* Time column */}
      <View style={timeContainerStyle}>
        <Text style={timeTextStyle}>
          {timeParts.length === 3 ? (
            <>
              {timeParts[0]}{' '}
              <Text style={{ color: '#2563eb' }}>{timeParts[1]}</Text>{' '}
              {timeParts[2]}
            </>
          ) : (
            time
          )}
        </Text>
      </View>

      {/* Text with smooth word-by-word highlighting */}
      <View style={textContainerStyle}>
        <Text style={textStyle}>
          {highlightedWords.map((item, index) => (
            <Text
              key={index}
              style={{
                color: item.color,
                opacity: item.opacity,
              }}
            >
              {item.word}
            </Text>
          ))}
        </Text>
      </View>
    </View>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default memo(TranscriptItem, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.time === nextProps.time &&
    prevProps.text === nextProps.text &&
    prevProps.startSec === nextProps.startSec &&
    prevProps.endSec === nextProps.endSec &&
    // Only re-render if currentTime crosses significant thresholds
    Math.floor((prevProps.currentTime - prevProps.startSec) / (prevProps.endSec - prevProps.startSec) * 20) === 
    Math.floor((nextProps.currentTime - nextProps.startSec) / (nextProps.endSec - nextProps.startSec) * 20)
  );
});