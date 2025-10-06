// student/components/Container/OfflineScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';

const { width, height } = Dimensions.get('window');

interface OfflineScreenProps {
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export const OfflineScreen: React.FC<OfflineScreenProps> = ({ 
  onRetry, 
  showRetryButton = true 
}) => {
  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry logic - check network status
      try {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          // Network is back, the parent component should handle this
          console.log('Network is back online');
        }
      } catch (error) {
        console.error('Error checking network status:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Offline Icon */}
        <View style={styles.iconContainer}>
          <MaterialIcons name="wifi-off" size={80} color="#9CA3AF" />
        </View>

        {/* Main Message */}
        <Text style={styles.title}>You're Offline</Text>
        <Text style={styles.subtitle}>
          It looks like you're not connected to the internet.
        </Text>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>To get back online:</Text>
          <View style={styles.instructionItem}>
            <MaterialIcons name="wifi" size={16} color="#6B7280" />
            <Text style={styles.instructionText}>Check your Wi-Fi connection</Text>
          </View>
          <View style={styles.instructionItem}>
            <MaterialIcons name="signal-cellular-4-bar" size={16} color="#6B7280" />
            <Text style={styles.instructionText}>Verify mobile data is enabled</Text>
          </View>
          <View style={styles.instructionItem}>
            <MaterialIcons name="router" size={16} color="#6B7280" />
            <Text style={styles.instructionText}>Try moving to a better location</Text>
          </View>
        </View>

        {/* Retry Button */}
        {showRetryButton && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <MaterialIcons name="refresh" size={20} color="#ffffff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}

        {/* Offline Features Info */}
        <View style={styles.offlineFeaturesContainer}>
          <Text style={styles.offlineFeaturesTitle}>Available Offline:</Text>
          <Text style={styles.offlineFeaturesText}>
            • Downloaded courses and lessons{'\n'}
            • Previously viewed content{'\n'}
            • Saved bookmarks and notes
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: width * 0.9,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  instructionsContainer: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 32,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineFeaturesContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  offlineFeaturesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  offlineFeaturesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
