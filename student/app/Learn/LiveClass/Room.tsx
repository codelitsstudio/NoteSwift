import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MoreOptionsModal from './MoreOptionsModal';

type ChatMessage = {
  id: string;
  user: string;
  message: string;
  time: string;
};

export default function LiveClassRoom() {
  const router = useRouter();
  const { id, title, teacher, subject, audioEnabled: initialAudio } = useLocalSearchParams();
  
  const [audioEnabled, setAudioEnabled] = useState(initialAudio === 'true');
  const [showChat, setShowChat] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Teacher', message: 'Welcome to the class!', time: '9:00 PM' },
    { id: '2', user: 'Student 1', message: 'Thank you!', time: '9:01 PM' },
    { id: '3', user: 'Student 2', message: 'Can you explain the previous topic?', time: '9:02 PM' },
  ]);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    console.log(isRecording ? 'Stop recording' : 'Start recording');
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        user: 'You',
        message: chatMessage.trim(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setChatMessage('');
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleLeave = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 py-3 bg-zinc-950 border-b border-zinc-800">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse" />
                <Text className="text-red-500 text-xs font-bold tracking-wider">LIVE</Text>
                <View className="mx-2 w-1 h-1 bg-zinc-600 rounded-full" />
                <MaterialIcons name="access-time" size={12} color="#71717A" />
                <Text className="text-zinc-400 text-xs ml-1">45:32</Text>
              </View>
              <Text className="text-white text-base font-bold" numberOfLines={1}>
                {title}
              </Text>
              <View className="flex-row items-center mt-1">
                <MaterialIcons name="person" size={12} color="#71717A" />
                <Text className="text-zinc-400 text-xs ml-1">
                  {teacher}
                </Text>
                <View className="mx-2 w-1 h-1 bg-zinc-600 rounded-full" />
                <Text className="text-zinc-400 text-xs">{subject}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleLeave}
              className="bg-red-500 px-5 py-2.5 rounded-full ml-3 shadow-lg"
              activeOpacity={0.85}
            >
              <View className="flex-row items-center">
                <MaterialIcons name="call-end" size={16} color="#FFFFFF" />
                <Text className="text-white text-xs font-bold ml-1.5">Leave</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1">
          {/* Video Section */}
          <View className="flex-1 relative">
            {/* Main Video (Teacher) - Enhanced */}
            <View className="flex-1 bg-black items-center justify-center">
              <View className="items-center">
                <View className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full items-center justify-center mb-4 shadow-2xl">
                  <Text className="text-white text-4xl font-bold">
                    {teacher?.toString().charAt(0) || 'T'}
                  </Text>
                </View>
                <Text className="text-white text-xl font-bold mb-2">{teacher}</Text>
                <View className="flex-row items-center bg-zinc-900/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-zinc-800">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-zinc-300 text-sm font-medium">Teaching</Text>
                </View>
              </View>
            </View>

            {/* Self Video (Small) - Enhanced */}
            <View className="absolute top-4 right-4 w-32 h-40 bg-zinc-950 rounded-2xl border-2 border-zinc-800 items-center justify-center shadow-2xl overflow-hidden">
              <View className="flex-1 items-center justify-center bg-zinc-950 w-full">
                <View className="items-center">
                  <View className="w-12 h-12 bg-zinc-800 rounded-full items-center justify-center mb-2">
                    <MaterialIcons name="videocam-off" size={24} color="#71717A" />
                  </View>
                  <Text className="text-zinc-400 text-xs">Camera Off</Text>
                </View>
              </View>
            </View>

            {/* Participant count - Enhanced */}
            <View className="absolute top-4 left-4 bg-zinc-950/95 backdrop-blur-sm px-4 py-2 rounded-full flex-row items-center border border-zinc-800 shadow-lg">
              <MaterialIcons name="people" size={16} color="#60A5FA" />
              <Text className="text-white text-sm font-bold ml-1.5">42</Text>
              <Text className="text-zinc-400 text-xs ml-1">online</Text>
            </View>
          </View>

          {/* Chat Sidebar (Conditional) - Enhanced */}
          {showChat && (
            <View className="absolute right-0 top-0 bottom-0 w-80 bg-zinc-950 border-l-2 border-zinc-800 shadow-2xl">
              {/* Chat Header - Enhanced */}
              <View className="px-4 py-4 border-b border-zinc-800 flex-row items-center justify-between bg-zinc-950">
                <View className="flex-row items-center">
                  <MaterialIcons name="chat-bubble" size={20} color="#60A5FA" />
                  <Text className="text-white text-base font-bold ml-2">Live Chat</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowChat(false)}
                  className="w-8 h-8 bg-zinc-900 rounded-full items-center justify-center border border-zinc-800"
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="close" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Messages - Enhanced */}
              <ScrollView 
                ref={scrollViewRef}
                className="flex-1 px-4 py-3"
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {messages.map((msg) => (
                  <View key={msg.id} className="mb-4">
                    <View className="flex-row items-center mb-1.5">
                      <View className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${
                        msg.user === 'You' ? 'bg-blue-600' : 
                        msg.user === 'Teacher' ? 'bg-green-600' : 
                        'bg-zinc-700'
                      }`}>
                        <Text className="text-white text-xs font-bold">
                          {msg.user.charAt(0)}
                        </Text>
                      </View>
                      <Text className={`text-sm font-bold ${
                        msg.user === 'You' ? 'text-blue-400' : 
                        msg.user === 'Teacher' ? 'text-green-400' : 
                        'text-zinc-300'
                      }`}>
                        {msg.user}
                      </Text>
                      <Text className="text-zinc-500 text-xs ml-auto">{msg.time}</Text>
                    </View>
                    <View className="ml-8 bg-zinc-900 px-3 py-2 rounded-2xl rounded-tl-sm border border-zinc-800">
                      <Text className="text-zinc-200 text-sm leading-5">{msg.message}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Message Input - Enhanced */}
              <View className="px-4 py-3 border-t border-zinc-800 bg-zinc-950">
                <View className="flex-row items-center">
                  <TextInput
                    className="flex-1 bg-zinc-900 text-white px-4 py-2.5 rounded-full text-sm border border-zinc-800"
                    placeholder="Type a message..."
                    placeholderTextColor="#71717A"
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    onSubmitEditing={handleSendMessage}
                  />
                  <TouchableOpacity
                    onPress={handleSendMessage}
                    className="ml-2 bg-blue-600 w-10 h-10 rounded-full items-center justify-center shadow-lg"
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="send" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Controls - Enhanced with Safe Area */}
        <SafeAreaView edges={['bottom']} className="bg-zinc-950 border-t border-zinc-800">
          <View className="px-6 py-4">
            <View className="flex-row items-center justify-around">
              {/* Microphone */}
              <View className="items-center">
                <TouchableOpacity
                  onPress={() => setAudioEnabled(!audioEnabled)}
                  className={`w-16 h-16 rounded-full items-center justify-center shadow-lg ${
                    audioEnabled ? 'bg-zinc-900 border border-zinc-800' : 'bg-red-500'
                  }`}
                  activeOpacity={0.85}
                >
                  <MaterialIcons 
                    name={audioEnabled ? "mic" : "mic-off"} 
                    size={28} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
                <Text className="text-zinc-400 text-xs mt-1.5 font-medium">
                  {audioEnabled ? 'Mute' : 'Unmute'}
                </Text>
              </View>

              {/* Raise Hand */}
              <View className="items-center">
                <TouchableOpacity
                  onPress={() => setHandRaised(!handRaised)}
                  className={`w-16 h-16 rounded-full items-center justify-center shadow-lg ${
                    handRaised ? 'bg-yellow-500' : 'bg-zinc-900 border border-zinc-800'
                  }`}
                  activeOpacity={0.85}
                >
                  <MaterialIcons 
                    name="pan-tool" 
                    size={28} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
                <Text className="text-zinc-400 text-xs mt-1.5 font-medium">
                  {handRaised ? 'Lower Hand' : 'Raise Hand'}
                </Text>
              </View>

              {/* Chat Toggle */}
              <View className="items-center">
                <TouchableOpacity
                  onPress={() => setShowChat(!showChat)}
                  className={`w-16 h-16 rounded-full items-center justify-center shadow-lg ${
                    showChat ? 'bg-blue-600' : 'bg-zinc-900 border border-zinc-800'
                  }`}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="chat" size={28} color="#FFFFFF" />
                  {messages.length > 0 && !showChat && (
                    <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center border-2 border-zinc-950">
                      <Text className="text-white text-xs font-bold">{messages.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Text className="text-zinc-400 text-xs mt-1.5 font-medium">
                  {showChat ? 'Hide Chat' : 'Chat'}
                </Text>
              </View>

              {/* More Options */}
              <View className="items-center">
                <TouchableOpacity
                  onPress={() => setShowMoreOptions(true)}
                  className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full items-center justify-center shadow-lg"
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="more-horiz" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-zinc-400 text-xs mt-1.5 font-medium">More</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/* More Options Modal */}
        <MoreOptionsModal
          visible={showMoreOptions}
          onClose={() => setShowMoreOptions(false)}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
