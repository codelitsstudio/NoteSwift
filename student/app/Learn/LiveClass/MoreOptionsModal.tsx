import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface MoreOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

type SubSection = 'main' | 'share-screen' | 'notes' | 'participants' | 'whiteboard' | 'poll' | 'settings';

const MoreOptionsModal: React.FC<MoreOptionsModalProps> = ({
  visible,
  onClose,
  isRecording,
  onToggleRecording,
}) => {
  const [currentSection, setCurrentSection] = useState<SubSection>('main');

  // Reaction emojis
  const reactions = [
    { emoji: '✋', label: 'Raise Hand', color: '#FBBF24' },
    { emoji: '👍', label: 'Like', color: '#3B82F6' },
    { emoji: '❤️', label: 'Love', color: '#EF4444' },
    { emoji: '😂', label: 'Laugh', color: '#F59E0B' },
    { emoji: '🤔', label: 'Think', color: '#8B5CF6' },
  ];

  const handleReaction = (reaction: string) => {
    console.log('Sent reaction:', reaction);
  };

  const navigateToSection = (section: SubSection) => {
    setCurrentSection(section);
  };

  const navigateBack = () => {
    setCurrentSection('main');
  };

  const handleClose = () => {
    setCurrentSection('main');
    onClose();
  };

  // Main options
  const mainOptions = [
    {
      id: 'share-screen',
      icon: 'screen-share',
      label: 'Share Screen',
      description: 'Share your screen with the class',
      color: '#60A5FA',
    },
    {
      id: 'notes',
      icon: 'note',
      label: 'Class Notes',
      description: 'View or take notes during the class',
      color: '#6B7280',
    },
    {
      id: 'participants',
      icon: 'people',
      label: 'Participants',
      description: 'View all participants in this class',
      color: '#6B7280',
    },
    {
      id: 'whiteboard',
      icon: 'gesture',
      label: 'Whiteboard',
      description: 'Open collaborative whiteboard',
      color: '#6B7280',
    },
    {
      id: 'poll',
      icon: 'poll',
      label: 'Create Poll',
      description: 'Create a quick poll for the class',
      color: '#6B7280',
    },
    {
      id: 'settings',
      icon: 'settings',
      label: 'Settings',
      description: 'Audio, video, and connection settings',
      color: '#6B7280',
    },
  ];

  // State for subsection settings
  const [shareQuality, setShareQuality] = useState<'auto' | 'high' | 'low'>('auto');
  const [includeAudio, setIncludeAudio] = useState(true);
  
  const [autoSaveNotes, setAutoSaveNotes] = useState(true);
  const [syncNotes, setSyncNotes] = useState(true);
  
  const [showAllParticipants, setShowAllParticipants] = useState(true);
  const [muteOnEntry, setMuteOnEntry] = useState(false);
  
  const [whiteboardEnabled, setWhiteboardEnabled] = useState(false);
  const [allowAnnotations, setAllowAnnotations] = useState(true);
  
  const [anonymousPolls, setAnonymousPolls] = useState(false);
  const [showLiveResults, setShowLiveResults] = useState(true);
  
  const [videoQuality, setVideoQuality] = useState<'720p' | '480p' | '360p'>('720p');
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);

  // Toggle switches component
  const SettingRow = ({ label, value, onValueChange, description }: { 
    label: string; 
    value: boolean; 
    onValueChange: (val: boolean) => void;
    description?: string;
  }) => (
    <View className="py-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-white text-sm font-semibold">{label}</Text>
        <TouchableOpacity
          onPress={() => onValueChange(!value)}
          className={`w-12 h-7 rounded-full ${value ? 'bg-blue-500' : 'bg-zinc-700'}`}
        >
          <View className={`w-5 h-5 rounded-full bg-white mt-1 ${value ? 'ml-6' : 'ml-1'}`} />
        </TouchableOpacity>
      </View>
      {description && (
        <Text className="text-zinc-400 text-xs">{description}</Text>
      )}
    </View>
  );

  const getSubsectionTitle = (section: SubSection) => {
    const option = mainOptions.find(opt => opt.id === section);
    return option?.label || 'Options';
  };

  const renderMainSection = () => (
    <>
      {/* Reactions Section */}
      <View className="px-5 mb-4">
        <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Quick Reactions
        </Text>
        <View className="flex-row justify-between">
          {reactions.map((reaction) => (
            <TouchableOpacity
              key={reaction.label}
              onPress={() => handleReaction(reaction.emoji)}
              onLongPress={() => handleReaction(reaction.emoji)}
              className="items-center"
              activeOpacity={0.7}
            >
              <View 
                className="w-14 h-14 rounded-full items-center justify-center mb-2 border-2 border-zinc-800"
                style={{ backgroundColor: reaction.color + '15' }}
              >
                <Text className="text-3xl">{reaction.emoji}</Text>
              </View>
              <Text className="text-zinc-400 text-xs">{reaction.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recording Button Section */}
      <View className="px-5 mb-4">
        <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Recording
        </Text>
        <TouchableOpacity
          onPress={onToggleRecording}
          className={`flex-row items-center justify-between p-4 rounded-2xl border-2 ${
            isRecording 
              ? 'bg-red-500/10 border-red-500' 
              : 'bg-zinc-900 border-zinc-800'
          }`}
          activeOpacity={0.85}
        >
          <View className="flex-row items-center flex-1">
            <View 
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isRecording ? 'bg-red-500' : 'bg-zinc-800'
              }`}
            >
              <MaterialIcons 
                name={isRecording ? "stop" : "fiber-manual-record"} 
                size={24} 
                color="#FFFFFF" 
              />
            </View>
            <View className="flex-1 ml-3">
              <Text className={`text-base font-bold ${
                isRecording ? 'text-red-500' : 'text-white'
              }`}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
              <Text className="text-zinc-400 text-xs mt-0.5">
                {isRecording 
                  ? 'Recording in progress...' 
                  : 'Save this session for later'
                }
              </Text>
            </View>
          </View>
          {isRecording && (
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
              <Text className="text-red-500 text-xs font-bold">REC</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Options List Section */}
      <View className="px-5">
        <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Tools & Settings
        </Text>
        <View className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          {mainOptions.map((option, index) => (
            <View key={option.id}>
              <TouchableOpacity
                onPress={() => navigateToSection(option.id as SubSection)}
                className="flex-row items-center px-4 py-4 active:bg-zinc-800/50"
                activeOpacity={0.7}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: option.color + '20' }}
                >
                  <MaterialIcons 
                    name={option.icon as any} 
                    size={20} 
                    color={option.color} 
                  />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-white text-sm font-semibold mb-0.5">
                    {option.label}
                  </Text>
                  <Text className="text-zinc-400 text-xs leading-4">
                    {option.description}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#52525B" />
              </TouchableOpacity>
              {index < mainOptions.length - 1 && (
                <View className="h-px bg-zinc-800 mx-4" />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Pro Tip Section */}
      <View className="px-5 mt-3">
        <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
          <View className="flex-row items-start">
            <MaterialIcons name="info" size={20} color="#60A5FA" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-400 text-sm font-semibold mb-1">
                Pro Tip
              </Text>
              <Text className="text-zinc-400 text-xs leading-5">
                Use the raise hand feature to get the teacher&apos;s attention without interrupting. 
                They&apos;ll be notified and can call on you when ready.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Session Info */}
      <View className="px-5 mt-3">
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <Text className="text-white text-sm font-bold mb-3">
            Session Information
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-zinc-400 text-xs">Connection Quality</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-400 text-xs font-semibold">Excellent</Text>
              </View>
            </View>
            <View className="h-px bg-zinc-800" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-zinc-400 text-xs">Video Quality</Text>
              <Text className="text-white text-xs font-semibold">720p HD</Text>
            </View>
            <View className="h-px bg-zinc-800" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-zinc-400 text-xs">Network Usage</Text>
              <Text className="text-white text-xs font-semibold">~2.5 MB/min</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );

  const renderShareScreenSubsection = () => (
    <View className="px-5 pt-4">
      <View className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
        <Text className="text-white text-sm font-bold mb-3">Screen Share Quality</Text>
        <View className="flex-row justify-between mb-3">
          {(['auto', 'high', 'low'] as const).map((quality) => (
            <TouchableOpacity
              key={quality}
              onPress={() => setShareQuality(quality)}
              className={`flex-1 mx-1 py-3 rounded-xl ${
                shareQuality === quality ? 'bg-blue-500' : 'bg-zinc-800'
              }`}
            >
              <Text className={`text-center text-sm font-semibold ${
                shareQuality === quality ? 'text-white' : 'text-zinc-400'
              }`}>
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <SettingRow
          label="Include System Audio"
          value={includeAudio}
          onValueChange={setIncludeAudio}
          description="Share computer sounds with participants"
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          console.log('Start sharing screen');
          handleClose();
        }}
        className="bg-blue-500 py-4 rounded-2xl"
      >
        <Text className="text-white text-center font-bold">Start Sharing</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotesSubsection = () => (
    <View className="px-5 pt-4">
      <View className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
        <Text className="text-white text-sm font-bold mb-3">Notes Settings</Text>
        <SettingRow
          label="Auto-Save Notes"
          value={autoSaveNotes}
          onValueChange={setAutoSaveNotes}
          description="Automatically save notes every minute"
        />
        <View className="h-px bg-zinc-800 my-2" />
        <SettingRow
          label="Sync Across Devices"
          value={syncNotes}
          onValueChange={setSyncNotes}
          description="Keep notes synced on all your devices"
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          console.log('Open notes');
          handleClose();
        }}
        className="bg-zinc-800 py-4 rounded-2xl mb-2"
      >
        <Text className="text-white text-center font-bold">Open Notes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          console.log('Create new note');
          handleClose();
        }}
        className="bg-blue-500 py-4 rounded-2xl"
      >
        <Text className="text-white text-center font-bold">+ New Note</Text>
      </TouchableOpacity>
    </View>
  );

  const renderParticipantsSubsection = () => {
    // Demo participants list
    const participants = [
      { id: '1', name: 'Dr. Sharma', role: 'Teacher', isOnline: true, isMuted: false, isHandRaised: false },
      { id: '2', name: 'You', role: 'Student', isOnline: true, isMuted: false, isHandRaised: false },
      { id: '3', name: 'Rajesh Kumar', role: 'Student', isOnline: true, isMuted: false, isHandRaised: true },
      { id: '4', name: 'Priya Singh', role: 'Student', isOnline: true, isMuted: true, isHandRaised: false },
      { id: '5', name: 'Amit Patel', role: 'Student', isOnline: true, isMuted: false, isHandRaised: false },
      { id: '6', name: 'Sneha Reddy', role: 'Student', isOnline: false, isMuted: true, isHandRaised: false },
      { id: '7', name: 'Vikram Shah', role: 'Student', isOnline: true, isMuted: false, isHandRaised: false },
      { id: '8', name: 'Anjali Gupta', role: 'Student', isOnline: true, isMuted: true, isHandRaised: false },
    ];

    return (
      <View className="px-5 pt-4">
        {/* Stats Summary */}
        <View className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-zinc-400 text-xs">Total Participants</Text>
            <Text className="text-white text-base font-bold">42</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-zinc-400 text-xs">Active Now</Text>
            <Text className="text-green-400 text-base font-bold">38</Text>
          </View>
        </View>

        {/* Participant Controls */}
        <View className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
          <Text className="text-white text-sm font-bold mb-3">Controls</Text>
          <SettingRow
            label="Show All Participants"
            value={showAllParticipants}
            onValueChange={setShowAllParticipants}
            description="Display participant list on screen"
          />
          <View className="h-px bg-zinc-800 my-2" />
          <SettingRow
            label="Mute on Entry"
            value={muteOnEntry}
            onValueChange={setMuteOnEntry}
            description="Auto-mute new participants"
          />
        </View>

        {/* Participants List */}
        <View className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <View className="px-4 py-3 border-b border-zinc-800">
            <Text className="text-white text-sm font-bold">All Participants</Text>
          </View>
          
          {participants.map((participant, index) => (
            <View key={participant.id}>
              <View className="px-4 py-3">
                <View className="flex-row items-center">
                  {/* Avatar */}
                  <View 
                    className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                      participant.role === 'Teacher' 
                        ? 'bg-green-600' 
                        : participant.name === 'You'
                        ? 'bg-blue-600'
                        : 'bg-zinc-700'
                    }`}
                  >
                    <Text className="text-white text-sm font-bold">
                      {participant.name.charAt(0)}
                    </Text>
                  </View>

                  {/* Name and Role */}
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white text-sm font-semibold">
                        {participant.name}
                      </Text>
                      {participant.role === 'Teacher' && (
                        <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded-full">
                          <Text className="text-green-400 text-xs font-semibold">Host</Text>
                        </View>
                      )}
                      {participant.name === 'You' && (
                        <View className="ml-2 bg-blue-500/20 px-2 py-0.5 rounded-full">
                          <Text className="text-blue-400 text-xs font-semibold">You</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-row items-center mt-0.5">
                      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        participant.isOnline ? 'bg-green-500' : 'bg-zinc-600'
                      }`} />
                      <Text className={`text-xs ${
                        participant.isOnline ? 'text-green-400' : 'text-zinc-500'
                      }`}>
                        {participant.isOnline ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                  </View>

                  {/* Status Icons */}
                  <View className="flex-row items-center gap-2">
                    {participant.isHandRaised && (
                      <View className="w-8 h-8 bg-yellow-500/20 rounded-full items-center justify-center">
                        <MaterialIcons name="pan-tool" size={16} color="#FBBF24" />
                      </View>
                    )}
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${
                      participant.isMuted ? 'bg-red-500/20' : 'bg-zinc-800'
                    }`}>
                      <MaterialIcons 
                        name={participant.isMuted ? "mic-off" : "mic"} 
                        size={16} 
                        color={participant.isMuted ? "#EF4444" : "#71717A"} 
                      />
                    </View>
                  </View>
                </View>
              </View>
              {index < participants.length - 1 && (
                <View className="h-px bg-zinc-800 mx-4" />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderWhiteboardSubsection = () => (
    <View className="px-5 pt-4">
      <View className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
        <Text className="text-white text-sm font-bold mb-3">Whiteboard Settings</Text>
        <SettingRow
          label="Enable Whiteboard"
          value={whiteboardEnabled}
          onValueChange={setWhiteboardEnabled}
          description="Allow collaborative drawing"
        />
        <View className="h-px bg-zinc-800 my-2" />
        <SettingRow
          label="Allow Annotations"
          value={allowAnnotations}
          onValueChange={setAllowAnnotations}
          description="Let participants draw on shared screen"
        />
      </View>
      {whiteboardEnabled && (
        <TouchableOpacity
          onPress={() => {
            console.log('Launch whiteboard');
            handleClose();
          }}
          className="bg-blue-500 py-4 rounded-2xl"
        >
          <Text className="text-white text-center font-bold">Launch Whiteboard</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPollSubsection = () => (
    <View className="px-5 pt-4">
      <View className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
        <Text className="text-white text-sm font-bold mb-3">Poll Settings</Text>
        <SettingRow
          label="Anonymous Polls"
          value={anonymousPolls}
          onValueChange={setAnonymousPolls}
          description="Hide participant names in poll results"
        />
        <View className="h-px bg-zinc-800 my-2" />
        <SettingRow
          label="Show Live Results"
          value={showLiveResults}
          onValueChange={setShowLiveResults}
          description="Display results as participants vote"
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          console.log('Create poll');
          handleClose();
        }}
        className="bg-red-500 py-4 rounded-2xl"
      >
        <Text className="text-white text-center font-bold">Create New Poll</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSettingsSubsection = () => (
    <View className="px-5 pt-4">
      <View className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
        <Text className="text-white text-sm font-bold mb-3">Video Quality</Text>
        <View className="flex-row justify-between mb-3">
          {(['720p', '480p', '360p'] as const).map((quality) => (
            <TouchableOpacity
              key={quality}
              onPress={() => setVideoQuality(quality)}
              className={`flex-1 mx-1 py-3 rounded-xl ${
                videoQuality === quality ? 'bg-blue-500' : 'bg-zinc-800'
              }`}
            >
              <Text className={`text-center text-sm font-semibold ${
                videoQuality === quality ? 'text-white' : 'text-zinc-400'
              }`}>
                {quality}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
        <Text className="text-white text-sm font-bold mb-3">Audio Enhancements</Text>
        <SettingRow
          label="Echo Cancellation"
          value={echoCancellation}
          onValueChange={setEchoCancellation}
          description="Reduce echo and feedback"
        />
        <View className="h-px bg-zinc-800 my-2" />
        <SettingRow
          label="Noise Suppression"
          value={noiseSuppression}
          onValueChange={setNoiseSuppression}
          description="Filter background noise"
        />
      </View>
    </View>
  );

  const renderSubsection = () => {
    switch (currentSection) {
      case 'share-screen':
        return renderShareScreenSubsection();
      case 'notes':
        return renderNotesSubsection();
      case 'participants':
        return renderParticipantsSubsection();
      case 'whiteboard':
        return renderWhiteboardSubsection();
      case 'poll':
        return renderPollSubsection();
      case 'settings':
        return renderSettingsSubsection();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/70">
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1}
          onPress={handleClose}
        />
        
        {/* Bottom Sheet Content */}
        <SafeAreaView edges={['bottom']} className="bg-zinc-950 rounded-t-3xl border-t-2 border-zinc-800 shadow-2xl" style={{ maxHeight: '85%' }}>
          <View className="pt-3">
            {/* Handle */}
            <View className="items-center py-2">
              <View className="w-12 h-1.5 bg-zinc-800 rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 pb-4 pt-2 border-b border-zinc-800">
              <View className="flex-row items-center justify-between">
                {currentSection !== 'main' && (
                  <TouchableOpacity
                    onPress={navigateBack}
                    className="w-9 h-9 bg-zinc-900 rounded-full items-center justify-center border border-zinc-800 mr-3"
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold">
                    {currentSection === 'main' ? 'More Options' : getSubsectionTitle(currentSection)}
                  </Text>
                  <Text className="text-zinc-400 text-sm mt-1">
                    {currentSection === 'main' 
                      ? 'Quick actions and tools for your live class'
                      : `Select an option to continue`
                    }
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-9 h-9 bg-zinc-900 rounded-full items-center justify-center border border-zinc-800"
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <ScrollView 
              className="pt-4"
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 500 }}
            >
              {currentSection === 'main' ? renderMainSection() : renderSubsection()}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default MoreOptionsModal;
