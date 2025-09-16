import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/api/axios';
import { useFocusEffect } from 'expo-router';

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

  // Fetch downloads from backend
  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/downloads');
      setDownloads(res.data);
    } catch (e) {
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
    <View className="flex-1 bg-slate-50 pt-8">
      <Text className="text-lg font-bold text-slate-800 mb-4 px-5">My Recent Downloads</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : downloads.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-5">
          <MaterialIcons name="cloud-off" size={48} color="#cbd5e1" />
          <Text className="text-slate-400 mt-3">No downloads yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {downloads.map(dl => (
            <View key={dl._id} className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-4 flex-row items-center gap-x-4">
              <MaterialIcons name="picture-as-pdf" size={32} color="#2563eb" />
              <View className="flex-1">
                <Text className="font-bold text-slate-800 text-base" numberOfLines={1}>{dl.fileName}</Text>
                <Text className="text-slate-500 text-xs mt-0.5">{dl.size || 'Unknown size'} • {dl.pages || '?'} pages</Text>
                <Text className="text-slate-400 text-xs mt-0.5">Downloaded {new Date(dl.downloadedAt).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity
                className="bg-blue-600 rounded-md px-3 py-2"
                onPress={() => {/* TODO: open PDF, support offline if possible */}}
              >
                <MaterialIcons name="open-in-new" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Downloads;
