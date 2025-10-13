import React, { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  id: string;
  badge?: string;
  badgeIcon?: string;
  title: string;
  description: string;
  thumbnail?: string;
  showDontShowAgain?: boolean;
  buttonText?: string;
  buttonIcon?: string;
}

interface NotificationSheetProps {
  visible: boolean;
  onClose: () => void;
  notificationData?: NotificationData;
}

const customBlue = '#2563EB';

export function NotificationSheet({
  visible,
  onClose,
  notificationData,
}: NotificationSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [Platform.OS === 'android' ? '85%' : '85%'], []);

  // Track if the modal is currently open to prevent duplicate presentations
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    console.log('NotificationSheet effect - visible:', visible, 'notificationData:', !!notificationData, 'isModalOpen:', isModalOpen);

    if (visible && notificationData && !isModalOpen) {
      console.log('Presenting notification bottom sheet modal');
      setIsModalOpen(true);
      // Use a small delay to ensure proper mounting
      setTimeout(() => {
        bottomSheetRef.current?.present();
      }, 100);
    } else if (!visible && isModalOpen) {
      console.log('Dismissing notification bottom sheet modal');
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, notificationData, isModalOpen]);

  // Reset modal state when component unmounts
  useEffect(() => {
    return () => {
      setIsModalOpen(false);
    };
  }, []);

  const handleClose = useCallback(async (dontShowAgainParam = false) => {
    console.log('handleClose called, dontShowAgain:', dontShowAgainParam || dontShowAgain);
    setIsModalOpen(false);

    // If user chose "Don't show again", store this preference
    if ((dontShowAgainParam || dontShowAgain) && notificationData?.id) {
      try {
        await AsyncStorage.setItem(`notification_dismissed_${notificationData.id}`, 'true');
      } catch (error) {
        console.error('Error storing notification preference:', error);
      }
    }

    bottomSheetRef.current?.dismiss();
    // Use setTimeout to ensure proper state management
    setTimeout(() => {
      onClose();
    }, 100);
  }, [setIsModalOpen, onClose, notificationData?.id, dontShowAgain]);

  // Backdrop component that handles tap to close
  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={() => handleClose(dontShowAgain)}
      />
    ),
    [handleClose, dontShowAgain]
  );

  if (!notificationData) {
    console.log('NotificationSheet: No notification data, returning null');
    return null;
  }

  const handleButtonPress = () => {
    // For now, just close the sheet. In the future, this could trigger different actions
    handleClose(dontShowAgain);
  };

  const handleDontShowAgain = () => {
    setDontShowAgain(!dontShowAgain);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      backgroundStyle={{
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}
      handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
      onDismiss={() => handleClose(dontShowAgain)}
      enablePanDownToClose
      enableDismissOnClose
      enableContentPanningGesture={false}
      enableHandlePanningGesture={true}
      animateOnMount={true}
      // Prevent multiple instances
      index={visible ? 0 : -1}
      // Enable backdrop tap to close
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {notificationData.badge && (
            <View style={styles.badgeContainer}>
              {notificationData.badgeIcon && (
                <MaterialIcons name={notificationData.badgeIcon as any} size={16} color="#FFF" />
              )}
              <Text style={styles.badgeText}>{notificationData.badge}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => handleClose(dontShowAgain)} style={styles.closeButton}>
            <MaterialIcons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Thumbnail */}
        {notificationData.thumbnail && (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: notificationData.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
              onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
              onLoad={() => console.log('Image loaded successfully')}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{notificationData.title}</Text>

          <Text style={styles.description}>{notificationData.description}</Text>

          
 {/* Don't show again checkbox */}
          {notificationData.showDontShowAgain && (
            <TouchableOpacity
              onPress={handleDontShowAgain}
              style={styles.checkboxContainer}
              activeOpacity={0.6}
            >
              <View style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}>
                {dontShowAgain && (
                  <MaterialIcons name="check" size={16} color="#FFF" />
                )}
              </View>
              <Text style={styles.checkboxText}>Don't show this message again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleButtonPress}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            
            <Text style={styles.actionButtonText}>
              Close
            </Text>
          </TouchableOpacity>

         
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600'
  },
  closeButton: { 
    padding: 4 
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500'
  },
  thumbnailContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden'
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 12
  },
  contentContainer: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 20
  },
  actionButton: { 
    backgroundColor: customBlue, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 10, 
    marginBottom: 20, 
    gap: 8 
  },
  actionButtonText: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  linkButtonText: {
    color: customBlue,
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline'
  },
  dontShowAgainContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, 
    gap: 6 
  },
  dontShowAgainText: { 
    fontSize: 14, 
    color: '#6B7280', 
    textDecorationLine: 'underline' 
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#6B7280',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  checkboxChecked: {
    backgroundColor: customBlue,
    borderColor: customBlue
  },
  checkboxText: {
    fontSize: 14,
    color: '#6B7280'
  },
});