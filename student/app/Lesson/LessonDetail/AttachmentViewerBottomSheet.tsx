import React, { useRef, useMemo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import api from '@/api/axios';
import { useRouter } from 'expo-router';

interface AttachmentViewerBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  fileName: string;
  fileUri: string;
}

const AttachmentViewerBottomSheet: React.FC<AttachmentViewerBottomSheetProps> = (props) => {
  const { isVisible, onClose, fileName, fileUri } = props;
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['75%'], []);
  const [downloading, setDownloading] = useState(false);
  const [userHasDownload, setUserHasDownload] = useState(false);
  const router = useRouter();

  // Show/hide bottom sheet only if visible and file is set
  useEffect(() => {
    if (isVisible && fileName && fileUri) {
      bottomSheetRef.current?.present();
      checkUserDownload();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible, fileName, fileUri]);

  // Check if user has download record in backend
  const checkUserDownload = async () => {
    try {
      const res = await api.get('/downloads');
      const found = res.data.some((d: any) => d.fileName === fileName);
      setUserHasDownload(found);
    } catch {
      setUserHasDownload(false);
    }
  };

  // Download PDF to device and save to backend
  const handleDownloadPdf = async () => {
    if (!fileUri) {
      Toast.show({ type: 'error', text1: 'No PDF file to download.' });
      return;
    }
    setDownloading(true);
    try {
      // Download to device
      try {
        await FileSystem.downloadAsync(fileUri, FileSystem.documentDirectory + fileName.replace(/\s+/g, '_'));
      } catch (fsErr) {
        console.error('FileSystem.downloadAsync error:', fsErr);
        Toast.show({ type: 'error', text1: 'Failed to download PDF to device.' });
        setDownloading(false);
        return;
      }
      // Save download record to backend
      try {
        await api.post('/downloads', {
          fileName,
          fileUri,
          size: '1.2 MB', // TODO: dynamic if available
          pages: 12, // TODO: dynamic if available
        });
      } catch (apiErr) {
        console.error('api.post(/downloads) error:', apiErr);
        Toast.show({ type: 'error', text1: 'Failed to save download to backend.' });
        setDownloading(false);
        return;
      }
      await checkUserDownload();
      Toast.show({ type: 'success', text1: 'Download complete!', text2: 'PDF saved for offline use.' });
    } catch (e) {
      console.error('Download PDF unknown error:', e);
      Toast.show({ type: 'error', text1: 'Failed to download or save PDF.' });
    } finally {
      setDownloading(false);
    }
  };

  // Go to Downloads page
  const handleGoToDownloads = () => {
    router.push('/Downloads');
    onClose();
  };

  // Open PDF in browser
  const handleOpenInAppBrowser = async () => {
    if (!fileUri) {
      Alert.alert('No PDF', 'No PDF file to open.');
      return;
    }
    try {
      const result = await WebBrowser.openBrowserAsync(fileUri, {
        showInRecents: true,
        enableBarCollapsing: true,
      });
      // Only close the sheet after browser is dismissed
      if (result.type === 'dismiss' || result.type === 'cancel') {
        onClose();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open PDF.');
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: '#fff' }}
      handleIndicatorStyle={{ backgroundColor: '#E5E7EB' }}
    >
      <BottomSheetView className="flex-1 px-5 pb-3">
        {/* Top: Filename and Close Button */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-bold text-slate-800 max-w-[220px]" numberOfLines={1} ellipsizeMode="tail">{fileName}</Text>
          <TouchableOpacity onPress={onClose} className="p-1.5">
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>


        {/* Subtitle/Description (not in a box) */}
        <Text className="text-base text-slate-700 font-medium mb-3.5">
          Lesson resource file. You can view or download this PDF for offline access.
        </Text>

        {/* File Info Row (Type, Size, Pages) */}
        <View className="flex-row items-center bg-slate-100 rounded-lg py-2 mt-2 px-3 mb-5 gap-x-5">
          <View className="flex-row items-center gap-x-1">
            <MaterialIcons name="description" size={18} color="#2563eb" />
            <Text className="text-[13px] text-blue-600 font-bold mr-2">PDF</Text>
          </View>
          <View className="w-px h-[18px] bg-slate-200 mx-2" />
          <View className="flex-row items-center gap-x-1">
            <MaterialIcons name="storage" size={16} color="#64748b" />
            <Text className="text-[13px] text-slate-500 font-medium">1.2 MB</Text>
          </View>
          <View className="w-px h-[18px] bg-slate-200 mx-2" />
          <View className="flex-row items-center gap-x-1">
            <MaterialIcons name="layers" size={16} color="#64748b" />
            <Text className="text-[13px] text-slate-500 font-medium">12 pages</Text>
          </View>
        </View>

        {/* View Section Title and Subtitle */}
        <Text className="text-gray-700 font-bold text-base mb-1 mt-2">View PDF</Text>
        <Text className="text-slate-500 text-sm mb-3">Open and read this PDF in an in-app browser. You can return to the app after viewing.</Text>
        {/* View Box */}
        <View className="bg-white rounded-lg p-4 mb-6 border border-slate-200 flex-row items-center gap-x-3.5">
          <MaterialIcons name="visibility" size={24} color="#2563eb" style={{ marginRight: 8 }} />
          <View className="flex-1">
            <Text className="text-slate-700 font-medium text-base mb-0.5">Preview</Text>
            <Text className="text-slate-500 text-sm">Tap to view this PDF in your browser.</Text>
          </View>
          <TouchableOpacity
            className="bg-blue-600 rounded-md px-4 py-2"
            onPress={handleOpenInAppBrowser}
            activeOpacity={0.85}
          >
            <MaterialIcons name="open-in-new" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Download Section Title and Subtitle */}
        <Text className="text-gray-700 font-bold text-base mb-0.5 mt-2">Save PDF</Text>
        <Text className="text-slate-500 text-sm mb-3">Save this PDF to your device for offline access.</Text>
        {/* Download Box */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-slate-200 flex-row items-center gap-x-3.5">
          <MaterialIcons name="download" size={24} color="#2563eb" style={{ marginRight: 8 }} />
          <View className="flex-1">
            <Text className="text-slate-700 font-medium text-base mb-0.5">Save to device</Text>
            <Text className="text-slate-500 text-sm">Tap to save this PDF for offline use.</Text>
          </View>
          {userHasDownload ? (
            <TouchableOpacity
              className="bg-blue-600 rounded-md px-4 py-2"
              onPress={handleGoToDownloads}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-base">Go</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={downloading ? "bg-blue-300 rounded-md px-4 py-2 opacity-70" : "bg-blue-600 rounded-md px-4 py-2"}
              onPress={handleDownloadPdf}
              activeOpacity={0.85}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="#fff" size={16} />
              ) : (
                <MaterialIcons name="file-download" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Subtle note at the bottom */}
        <Text className="text-slate-400 text-[11px] text-center mt-2 mb-0.5">
          Uploaded by Instructor • Last updated Sep 2025
        </Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default AttachmentViewerBottomSheet;
