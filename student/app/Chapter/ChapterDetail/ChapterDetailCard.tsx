// components/ChapterDetail/ChapterDetailCard.tsx
import React, { useRef, useState, useEffect } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity, TextInput, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import RecordedVideo from "./RecordedVideo";
import AttachmentPage from "./AttachmentPage";
import TagPill from "./TagPill";
import api from "@/api/axios";


type Comment = {
  id: string;
  user: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
};

type ChapterData = {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUri?: string;        // used as video thumbnail
  tags?: { type: "video" | "notes" | "live"; label: string; count?: number }[];
  teacher?: string;
  teacherAvatar?: string;
  uploadDate?: string;
  hasVideo?: boolean;
  hasNotes?: boolean;
  videoUrl?: string;
  notesUrl?: string;
  notesTitle?: string;
  videoTitle?: string;
  teacherId?: string;
};

type Props = {
  chapter: ChapterData;
  courseId: string;
  subjectName: string;
  moduleNumber: number;
  onPrevious?: () => void;
  onBack?: () => void;
  onNext?: () => void;
};

type TabType = 'video' | 'attachments';

const ChapterDetailCard: React.FC<Props> = ({ chapter, courseId, subjectName, moduleNumber, onPrevious, onBack, onNext }) => {
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; avatar: string } | null>(null);
  
  // Determine available content types
  const hasVideo = chapter.hasVideo && chapter.videoUrl;
  const hasNotes = chapter.hasNotes && chapter.notesUrl;
  const onlyNotes = hasNotes && !hasVideo;
  const onlyVideo = hasVideo && !hasNotes;
  const bothContent = hasVideo && hasNotes;
  
  // Fetch teacher info for video modules
  useEffect(() => {
    const fetchTeacherInfo = async () => {
      if (hasVideo && chapter.teacherId) {
        try {
          const response = await api.get(`/courses/teacher/${chapter.teacherId}/profile`);
          if (response.data.success) {
            const teacherData = response.data.data.teacher;
            setTeacherInfo({
              name: teacherData.name,
              avatar: teacherData.avatar
            });
          }
        } catch (error) {
          console.error('Error fetching teacher info:', error);
          // Fallback to default teacher info
          setTeacherInfo({
            name: 'Prof. Rajesh Sharma',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
          });
        }
      }
    };
    
    if (hasVideo && chapter.teacherId) {
      fetchTeacherInfo();
    }
  }, [hasVideo, chapter.teacherId]);
  
  // Set default active tab based on available content
  React.useEffect(() => {
    if (hasVideo) {
      setActiveTab('video');
    } else if (hasNotes) {
      setActiveTab('attachments');
    }
  }, [hasVideo, hasNotes]);
  
  // Demo comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: 'Rahul Kumar',
      avatar: 'RK',
      time: '2 days ago',
      text: 'Great explanation! This really helped me understand the concept better.',
      likes: 12
    },
    {
      id: '2',
      user: 'Priya Sharma',
      avatar: 'PS',
      time: '1 day ago',
      text: 'Could you please explain the last part again? I didn\'t quite get it.',
      likes: 5
    },
    {
      id: '3',
      user: 'Amit Patel',
      avatar: 'AP',
      time: '3 hours ago',
      text: 'Excellent teaching! Looking forward to more lessons like this.',
      likes: 8
    }
  ]);

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        user: 'You',
        avatar: 'Y',
        time: 'Just now',
        text: commentText.trim(),
        likes: 0
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };



  return (
    <ScrollView className="flex-1 bg-white">
      {/* Video Player - Only show if video is available */}
      {hasVideo && (
        <RecordedVideo
          ref={videoRef}
          courseId={courseId}
          subjectName={subjectName}
          moduleNumber={moduleNumber}
          thumbnailUri={chapter.imageUri}
          onPressPlay={() => {}}
          onPlayPauseChange={(playing) => {}}
          onTimeUpdate={(ms: number) => {}}
        />
      )}

      {/* Content Container */}
      <View className="px-4 pt-4">
        {/* Title - Expandable */}
        <TouchableOpacity
          onPress={() => setDescriptionExpanded(!descriptionExpanded)}
          activeOpacity={0.7}
          className="mb-3"
        >
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 text-xl font-semibold text-gray-900 leading-snug mr-2">
              {chapter.title}
            </Text>
            <MaterialIcons
              name={descriptionExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color="#6B7280"
              style={{ marginTop: 2 }}
            />
          </View>

          {/* Expanded Description */}
          {descriptionExpanded && chapter.description && (
            <Text className="text-sm text-gray-700 mt-3 leading-5">
              {chapter.description}
            </Text>
          )}
        </TouchableOpacity>

        {/* Date - Only show for video content */}
        {hasVideo && (
          <Text className="text-sm text-gray-500 mb-3">
            {chapter.uploadDate || 'Jan 15, 2025'}
          </Text>
        )}

        {/* Teacher Info - Only show for video content */}
        {hasVideo && teacherInfo && (
          <View className="flex-row items-center mt-2 mb-4">
            <Image
              source={{ 
                uri: teacherInfo.avatar
              }}
              className="w-14 h-14 rounded-full mr-3"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {teacherInfo.name}
              </Text>
              <Text className="text-sm text-gray-500">Instructor</Text>
            </View>
          </View>
        )}

        {/* Action Tag Pills - Only show for video content */}
        {hasVideo && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 mt-2">
            <TagPill
              label="Like"
              type="like"
              active={liked}
              onPress={() => setLiked(!liked)}
            />

            <TagPill
              label="Ask"
              type="ask"
              onPress={() => {}}
            />

            <TagPill
              label="Download"
              type="download"
              onPress={() => {}}
            />

            {/* Comments pill - only shows when in attachments tab and has content */}
            {(activeTab === 'attachments' || activeTab === 'video') && (hasVideo || hasNotes) && (
              <TagPill
                label="Comments"
                type="comment"
                onPress={() => setActiveTab(activeTab === 'video' ? 'attachments' : 'video')}
              />
            )}

            {/* Attachments tab - only show if notes are available */}
            {hasNotes && (
              <TagPill
                label="Attachments"
                type="attachments"
                active={activeTab === 'attachments'}
                onPress={() => setActiveTab('attachments')}
              />
            )}

            {/* Video tab - only show if video is available */}
            {hasVideo && (
              <TagPill
                label="Video"
                type="video"
                active={activeTab === 'video'}
                onPress={() => setActiveTab('video')}
              />
            )}
          </ScrollView>
        )}

       
        {/* Content based on available content */}
        {onlyNotes ? (
          /* Only notes - show AttachmentPage directly */
          <AttachmentPage courseId={courseId} subjectName={subjectName} moduleNumber={moduleNumber} notesTitle={chapter.notesTitle} />
        ) : hasVideo ? (
          /* Video content (with or without notes) */
          activeTab === 'video' ? (
            <View className="mb-6">
              {/* Comments Header - Clickable to expand/collapse */}
              <TouchableOpacity
                onPress={() => setCommentsExpanded(!commentsExpanded)}
                activeOpacity={0.7}
                className="bg-gray-50 rounded-lg p-4 mb-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-base font-bold text-gray-900 mr-2">
                      Comments
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {comments.length}
                    </Text>
                  </View>
                  <MaterialIcons
                    name={commentsExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color="#6B7280"
                  />
                </View>

                {/* Preview first comment when collapsed */}
                {!commentsExpanded && comments.length > 0 && (
                  <View className="mt-3 flex-row">
                    <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-2">
                      <Text className="text-white text-xs font-bold">{comments[0].avatar}</Text>
                    </View>
                    <Text className="flex-1 text-sm text-gray-600" numberOfLines={2}>
                      <Text className="font-semibold">{comments[0].user}</Text> {comments[0].text}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Expanded Comments Section */}
              {commentsExpanded && (
                <View>
                  {/* Add Comment Input */}
                  <View className="flex-row items-center mb-6">
                    <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center mr-3">
                      <Text className="text-white text-sm font-bold">Y</Text>
                    </View>
                    <View className="flex-1 flex-row items-center bg-gray-50 rounded-full px-4 border border-gray-200" style={{ minHeight: 36 }}>
                      <TextInput
                        className="flex-1 text-sm text-gray-900"
                        placeholder="Add a comment..."
                        placeholderTextColor="#9CA3AF"
                        value={commentText}
                        onChangeText={setCommentText}
                        style={{ paddingVertical: 6 }}
                      />
                      {commentText.trim() && (
                        <TouchableOpacity onPress={handleAddComment} className="ml-2">
                          <MaterialIcons name="send" size={18} color="#3B82F6" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Comments List */}
                  {comments.map((comment) => (
                    <View key={comment.id} className="mb-5">
                      <View className="flex-row">
                        <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                          <Text className="text-white text-xs font-bold">{comment.avatar}</Text>
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Text className="text-sm font-semibold text-gray-900 mr-2">
                              {comment.user}
                            </Text>
                            <Text className="text-xs text-gray-500">{comment.time}</Text>
                          </View>
                          <Text className="text-sm text-gray-700 leading-5 mb-2">
                            {comment.text}
                          </Text>
                          <View className="flex-row items-center">
                            <TouchableOpacity className="flex-row items-center mr-4" activeOpacity={0.7}>
                              <MaterialIcons name="thumb-up-off-alt" size={14} color="#6B7280" />
                              <Text className="ml-1 text-xs text-gray-600">{comment.likes}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.7}>
                              <Text className="text-xs font-medium text-gray-600">Reply</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : activeTab === 'attachments' && hasNotes ? (
            <AttachmentPage courseId={courseId} subjectName={subjectName} moduleNumber={moduleNumber} notesTitle={chapter.notesTitle} />
          ) : (
            /* No content available */
            <View className="mb-6 items-center justify-center py-12">
              <MaterialIcons name="info-outline" size={40} color="#cbd5e1" />
              <Text className="text-gray-500 text-base mt-4">No content available for this module</Text>
            </View>
          )
        ) : (
          /* No content available */
          <View className="mb-6 items-center justify-center py-12">
            <MaterialIcons name="info-outline" size={40} color="#cbd5e1" />
            <Text className="text-gray-500 text-base mt-4">No content available for this module</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ChapterDetailCard;