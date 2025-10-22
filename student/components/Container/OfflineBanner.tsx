// student/components/Container/OfflineBanner.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface OfflineBannerProps {
  isOffline: boolean;
  connectionType?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ 
  isOffline, 
  connectionType = 'unknown' 
}) => {
  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <MaterialIcons name="wifi-off" size={20} color="#ffffff" />
      <Text style={styles.text}>
        No Internet Connection
      </Text>
      <Text style={styles.subtext}>
        Please check your network settings
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#dc2626', // Red color for offline
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 4,
  },
  subtext: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
    marginLeft: 4,
  },
});
