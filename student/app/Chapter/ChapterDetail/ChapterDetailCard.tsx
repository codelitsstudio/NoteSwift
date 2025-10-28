// components/ChapterDetail/ChapterDetailCard.tsx
import React, { useRef, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import RecordedVideo from "./RecordedVideo";
import AttachmentPage from "./AttachmentPage";
import TagPill from "./TagPill";
import AskQuestionModal from "./AskQuestionModal";
import api from "@/api/axios";
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';


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
  uploadDate?: string;
  hasVideo?: boolean;
  hasNotes?: boolean;
  videos?: { url: string; title: string; duration?: string; uploadedAt?: Date }[]; // Support multiple videos
  videoUrl?: string; // Backward compatibility
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
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0); // Track selected video
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [commentText, setCommentText] = useState('');
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<{ name: string; avatar: string } | null>(null);
  const [showAskModal, setShowAskModal] = useState(false);
  
  // Get videos array, supporting both new format and backward compatibility
  const videos = chapter.videos || (chapter.videoUrl ? [{
    url: chapter.videoUrl,
    title: chapter.videoTitle || 'Video',
    duration: undefined,
    uploadedAt: undefined
  }] : []);
  
  // Determine available content types
  const hasVideo = chapter.hasVideo && videos.length > 0;
  const hasNotes = chapter.hasNotes && chapter.notesUrl;
  const onlyNotes = hasNotes && !hasVideo;
  const hasMultipleVideos = videos.length > 1;
  
  // Set teacher info from props or fetch if not available
  useEffect(() => {
    if (hasVideo) {
      if (chapter.teacher) {
        // Use teacher name from props with default avatar
        setTeacherInfo({
          name: chapter.teacher,
          avatar: 'https://placehold.co/56x56.png'
        });
      } else if (chapter.teacherId) {
        // Fallback: fetch teacher info via API
        const fetchTeacherInfo = async () => {
          try {
            const response = await api.get(`/courses/teacher/${chapter.teacherId}/profile`);
            if (response.data.success) {
              const teacherData = response.data.data.teacher;
              setTeacherInfo({
                name: teacherData.name || chapter.teacher || 'Instructor',
                avatar: teacherData.avatar || teacherData.profilePic || 'https://placehold.co/56x56.png'
              });
            }
          } catch (error) {
            console.error('Error fetching teacher info:', error);
            // Fallback to default teacher info
            setTeacherInfo({
              name: chapter.teacher || 'Instructor',
              avatar: 'https://placehold.co/56x56.png'
            });
          }
        };
        fetchTeacherInfo();
      } else {
        // No teacher info available
        setTeacherInfo({
          name: 'Instructor',
          avatar: 'https://placehold.co/56x56.png'
        });
      }
    }
  }, [hasVideo, chapter.teacher, chapter.teacherId]);

  // Initialize like state from chapter data when available
  useEffect(() => {
    try {
      // Backend may return likes as a number or an array of ids
      const likes = (chapter as any).likes ?? (chapter as any).likeCount ?? 0;
      const likeCountNumeric = Array.isArray(likes) ? likes.length : Number(likes) || 0;
      setLikeCount(likeCountNumeric);
      const likedByUser = Boolean((chapter as any).likedByUser || (chapter as any).liked);
      setLiked(likedByUser);
    } catch {
      // ignore and keep defaults
    }
  }, [chapter]);
  
  // Set default active tab based on available content
  React.useEffect(() => {
    if (hasVideo) {
      setActiveTab('video');
    } else if (hasNotes) {
      setActiveTab('attachments');
    }
  }, [hasVideo, hasNotes]);
  
  // Comments state - will be loaded from API
  const [comments, setComments] = useState<Comment[]>([]);

  // Fetch comments for this chapter
  const fetchComments = async () => {
    try {
      // TODO: Implement API call to fetch comments for this chapter
      // For now, keep empty array
      setComments([]);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, []);

  // Toggle like (call backend)
  const handleToggleLike = async () => {
    // optimistic UI
    setLiked(prev => !prev);
    try {
      const resp = await api.post(`/courses/${courseId}/subject/${encodeURIComponent(subjectName)}/module/${moduleNumber}/like`);
      if (resp?.data?.success && resp.data.data) {
        const likesResp = resp.data.data.likes;
        const likeCountNumeric = Array.isArray(likesResp) ? likesResp.length : Number(likesResp) || 0;
        setLikeCount(likeCountNumeric);
        setLiked(Boolean(resp.data.data.liked));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // rollback optimistic
      setLiked(prev => !prev);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadVideo = async () => {
    if (!hasVideo) {
      Toast.show({ type: 'error', text1: 'No video available for download.' });
      return;
    }
    setIsDownloading(true);
    try {
      const signedResp = await api.get(`/courses/${courseId}/subject/${encodeURIComponent(subjectName)}/module/${moduleNumber}/video?videoIndex=${selectedVideoIndex}`);
      if (!signedResp?.data?.success) {
        throw new Error('Failed to get video URL');
      }
      const { signedUrl, downloadUrl } = signedResp.data.data;
      const safeSubject = subjectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${courseId}_${safeSubject}_module${moduleNumber}_video${selectedVideoIndex}_${Date.now()}.mp4`;
      
      // Use signed URL and open in browser for download (similar to notes/PDFs viewing)
      try {
        await WebBrowser.openBrowserAsync(signedUrl, { showInRecents: true, enableBarCollapsing: true });
      } catch (browserErr) {
        console.error('WebBrowser error:', browserErr);
        Toast.show({ type: 'error', text1: 'Failed to open video download in browser.' });
        setIsDownloading(false);
        return;
      }
      
      // Register download with remote URL (same pattern as PDF)
      try {
        await api.post('/downloads', {
          fileName,
          fileUri: downloadUrl, // Use downloadUrl like PDF uses fileUri
          size: undefined, // Size not available for browser downloads
          pages: undefined // Videos don't have pages
        });
      } catch (apiErr) {
        console.error('api.post(/downloads) error:', apiErr);
        Toast.show({ type: 'error', text1: 'Failed to save download to backend.' });
        setIsDownloading(false);
        return;
      }

      Toast.show({ type: 'success', text1: 'Video download opened in browser!', text2: 'Download will start automatically.' });
    } catch (error) {
      console.error('Download video unknown error:', error);
      Toast.show({ type: 'error', text1: 'Failed to open video download.' });
    } finally {
      setIsDownloading(false);
    }
  };

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
    <>
    <ScrollView className="flex-1 bg-white">
      {/* Video Player - Only show if video is available */}
      {hasVideo && (
        <>
          {/* Video Selection - Only show if multiple videos */}
          {hasMultipleVideos && (
            <View className="bg-white border-b border-gray-200 px-4 py-3">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Select Video</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {videos.map((video, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedVideoIndex(index)}
                    className={`mr-3 px-4 py-2 rounded-full border ${
                      selectedVideoIndex === index
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-sm font-medium ${
                      selectedVideoIndex === index ? 'text-white' : 'text-gray-700'
                    }`}>
                      {video.title}
                    </Text>
                    {video.duration && (
                      <Text className={`text-xs mt-1 ${
                        selectedVideoIndex === index ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {video.duration}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <RecordedVideo
            ref={videoRef}
            courseId={courseId}
            subjectName={subjectName}
            moduleNumber={moduleNumber}
            videoUrl={videos[selectedVideoIndex]?.url}
            videoIndex={selectedVideoIndex}
            thumbnailUri={chapter.imageUri}
            onPressPlay={() => {}}
            onPlayPauseChange={(playing) => {}}
            onTimeUpdate={(ms: number) => {}}
          />
        </>
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
              onError={(error) => {
                console.log('Avatar load error:', error.nativeEvent, 'URL:', teacherInfo.avatar);
              }}
              onLoad={() => {
                console.log('Avatar loaded successfully:', teacherInfo.avatar);
              }}
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
              label={`Like${likeCount > 0 ? ' ' + likeCount : ''}`}
              type="like"
              active={liked}
              onPress={handleToggleLike}
            />

            <TagPill
              label="Ask"
              type="ask"
              onPress={() => setShowAskModal(true)}
            />

            <TagPill
              label="Download"
              type="download"
              onPress={handleDownloadVideo}
              disabled={isDownloading}
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
                type="comment"
                active={activeTab === 'video'}
                onPress={() => setActiveTab('video')}
              />
            )}
          </ScrollView>
        )}

       
        {/* Content based on available content */}
        {onlyNotes ? (
          /* Only notes - show AttachmentPage directly */
          <AttachmentPage courseId={courseId} subjectName={subjectName} moduleNumber={moduleNumber} notesTitle={chapter.notesTitle} notesUrl={chapter.notesUrl} />
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
            <AttachmentPage courseId={courseId} subjectName={subjectName} moduleNumber={moduleNumber} notesTitle={chapter.notesTitle} notesUrl={chapter.notesUrl} />
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

    <AskQuestionModal
      visible={showAskModal}
      onClose={() => setShowAskModal(false)}
      courseId={courseId}
      subjectName={subjectName}
      moduleNumber={moduleNumber}
      chapterTitle={chapter.title}
      teacherName={teacherInfo?.name}
    />
    </>
  );
};

export default ChapterDetailCard;