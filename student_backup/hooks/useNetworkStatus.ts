// student/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  connectionType: string;
  isWifiEnabled: boolean;
  details: any;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'unknown',
    isWifiEnabled: false,
    details: null,
  });

  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable ?? false;
      const connectionType = state.type || 'unknown';
      const isWifiEnabled = state.type === 'wifi';

      const newNetworkStatus: NetworkStatus = {
        isConnected,
        isInternetReachable,
        connectionType,
        isWifiEnabled,
        details: state.details,
      };

      // Show toast when going offline
      if (!isConnected || !isInternetReachable) {
        if (!showOfflineToast) {
          setShowOfflineToast(true);
          Toast.show({
            type: 'error',
            position: 'top',
            text1: '🚫 You are offline',
            text2: 'Please check your internet connection',
            visibilityTime: 5000,
            autoHide: false, // Keep showing until reconnected
            topOffset: 50,
          });
        }
      } else {
        // Show reconnection toast
        if (showOfflineToast) {
          setShowOfflineToast(false);
          Toast.hide();
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Back online',
            text2: 'Internet connection restored',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
          });
        }
      }

      setNetworkStatus(newNetworkStatus);
    });

    return () => unsubscribe();
  }, [showOfflineToast]);

  return networkStatus;
};
