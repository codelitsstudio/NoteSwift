
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from '@expo/vector-icons';

const PRIVACY_URL = 'https://noteswift.com.np/privacy-policy/';
const TERMS_URL = 'https://noteswift.com.np/terms/';

const AboutApp = () => {
  const router = useRouter();

  const openWeb = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}> 
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 18, paddingBottom: 18, paddingHorizontal: 18, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#222" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, color: '#222', flex: 1, textAlign: 'center', marginRight: 32 }} className="font-bold">About</Text>
        </View>

        {/* List Items */}
        <View style={{ minHeight: '100%', flex: 1 }}>
          {/* Privacy Policy */}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#f8fafc' }} activeOpacity={0.7} onPress={() => openWeb(PRIVACY_URL)}>
            <Text style={{ color: '#222', fontSize: 14, flex: 1 }}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={22} color="#888" />
          </TouchableOpacity>

          {/* Terms of Use */}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, backgroundColor: '#f8fafc' }} activeOpacity={0.7} onPress={() => openWeb(TERMS_URL)}>
            <Text style={{ color: '#222', fontSize: 14, flex: 1 }}>Terms of Use</Text>
            <MaterialIcons name="chevron-right" size={22} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AboutApp;
