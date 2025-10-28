// student/lib/deviceFingerprint.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';

/**
 * Generates a unique device fingerprint for binding users to devices
 * This fingerprint is used to enforce one-device-per-user policy
 */
export const generateDeviceFingerprint = async (): Promise<string> => {
  try {
    // Collect device-specific information
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      appId: Application.applicationId,
      appVersion: Application.nativeApplicationVersion,
      buildVersion: Application.nativeBuildVersion,
      installationTime: Application.getInstallationTimeAsync ?
        (await Application.getInstallationTimeAsync()).getTime() : Date.now(),
      timestamp: Date.now(),
      // Add some entropy to make fingerprint more unique
      randomSeed: Math.random().toString(36).substring(2, 15),
    };

    // Create a deterministic string from device information
    const deviceString = JSON.stringify(deviceInfo);

    // Simple hash function to create fingerprint
    let hash = 0;
    for (let i = 0; i < deviceString.length; i++) {
      const char = deviceString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to positive hex string and ensure consistent length
    const fingerprint = Math.abs(hash).toString(16).padStart(16, '0');

    console.log('🔐 Generated device fingerprint:', fingerprint.substring(0, 8) + '...');

    return fingerprint;
  } catch (error) {
    console.warn('Failed to generate device fingerprint, using fallback:', error);

    // Fallback fingerprint using basic platform info
    const fallbackString = `${Platform.OS}-${Application.applicationId || 'unknown'}-${Date.now()}-${Math.random()}`;
    let hash = 0;
    for (let i = 0; i < fallbackString.length; i++) {
      const char = fallbackString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16).padStart(16, '0');
  }
};

/**
 * Validates if a device fingerprint is properly formatted
 */
export const isValidDeviceFingerprint = (fingerprint: string): boolean => {
  // Should be a 16-character hexadecimal string
  return /^[a-f0-9]{16}$/i.test(fingerprint);
};