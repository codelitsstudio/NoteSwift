// app/QuickAccess/Downloads.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import NetInfo from '@react-native-community/netinfo';
import api from '@/api/axios';
import { useFocusEffect, useRouter } from 'expo-router';

interface Download {
  _id: string;
  fileName: string;
  fileUri: string;
  size?: string;
  pages?: number;
  downloadedAt: string;
}

const Downloads: React.FC = () => {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch downloads from backend
  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/downloads');
      setDownloads(res.data);
    } catch {
      setDownloads([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDownloads();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-1 bg-slate-50">
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 18, paddingBottom: 18, paddingHorizontal: 18, backgroundColor: '#fff'}}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#222" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, color: '#222', flex: 1, textAlign: 'center', marginRight: 32 }} className="font-bold">Downloads</Text>
        </View>
        {/* Recent Downloads */}
        <Text className="text-lg font-bold text-slate-800 mb-4 px-5 mt-2">Recent</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : downloads.length === 0 ? (
          <View className="absolute inset-0 justify-center items-center">
            <MaterialIcons name="cloud-off" size={48} color="#555" />
            <Text className="text-[#555] mt-3">No downloads yet.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
            {downloads.map(dl => {
              // Determine if this is a video download
              const isVideo = dl.fileName.toLowerCase().includes('video') || 
                            dl.fileName.toLowerCase().includes('.mp4') || 
                            dl.fileName.toLowerCase().includes('.mov') || 
                            dl.fileName.toLowerCase().includes('.avi') ||
                            dl.fileUri.includes('video');
              
              return (
              <View key={dl._id} className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-4 mx-4 flex-row items-center gap-x-4">
                <MaterialIcons 
                  name={isVideo ? "videocam" : "picture-as-pdf"} 
                  size={32} 
                  color="#2563eb" 
                />
                <View className="flex-1">
                  <Text className="font-bold text-slate-800 text-base" numberOfLines={1}>{dl.fileName}</Text>
                  <Text className="text-slate-500 text-xs mt-0.5">
                    {dl.size || 'Unknown size'} • {isVideo ? 'Video' : `${dl.pages || '?'} pages`}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">Downloaded {new Date(dl.downloadedAt).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity
                  className="bg-blue-600 rounded-3xl px-4 py-1.5"
                  onPress={async () => {
                    let localUri = null;
                    try {
                      localUri = await AsyncStorage.getItem(`pdf_${dl.fileName}`);
                      if (!localUri) {
                        localUri = await AsyncStorage.getItem(`video_${dl.fileName}`);
                      }
                    } catch {}
                    let uriToOpen = dl.fileUri;
                    try {
                      const netState = await NetInfo.fetch();
                      if (!netState.isConnected || !netState.isInternetReachable) {
                        // Offline: use local file if available
                        if (localUri) {
                          uriToOpen = localUri;
                        } else {
                          alert('Offline: No local file available for offline viewing.');
                          return;
                        }
                      }
                      await WebBrowser.openBrowserAsync(uriToOpen, {
                        showInRecents: true,
                        enableBarCollapsing: true,
                      });
                    } catch {}
                  }}
                >
                  <MaterialIcons name="open-in-new" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Downloads;