import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonOnboardProps {
  onNext: () => void;
  onBack: () => void;
  onGetStarted: () => void;
  currentSlide: number;
  totalSlides: number;
  isLastSlide: boolean;
  isFirstSlide: boolean;
  loading?: boolean;
}

const ButtonOnboard: React.FC<ButtonOnboardProps> = ({
  onNext,
  onBack,
  onGetStarted,
  currentSlide,
  totalSlides,
  isLastSlide,
  isFirstSlide,
  loading = false
}) => {
  return (
    <View style={styles.container}>
      {!isLastSlide ? (
        <>
          {/* Back Button */}
          <TouchableOpacity
            onPress={onBack}
            disabled={isFirstSlide}
            style={[
              styles.backButton,
              isFirstSlide && styles.disabledButton
            ]}
          >
            <Text style={[
              styles.backButtonText,
              isFirstSlide && styles.disabledButtonText
            ]}>
              Back
            </Text>
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            onPress={onNext}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      ) : (
        /* Get Started Button */
        <TouchableOpacity
          onPress={onGetStarted}
          disabled={loading}
          style={[
            styles.getStartedButton,
            loading && styles.disabledButton
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  gap: 12,
},
backButton: {
  flex: 1,           // take equal space
  marginRight: 6,    // small spacing between buttons
  paddingVertical: 16,
  borderRadius: 28,
  borderWidth: 1.5,
  borderColor: '#D1D5DB',
},
  disabledButton: {
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  nextButton: {
  flex: 1,           // take equal space
  marginLeft: 6,     // small spacing
  paddingVertical: 16,
  borderRadius: 28,
  backgroundColor: '#3B82F6',
},
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  getStartedButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    flex: 1,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
});

export default ButtonOnboard;