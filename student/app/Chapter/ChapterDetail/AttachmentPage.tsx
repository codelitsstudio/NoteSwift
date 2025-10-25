
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AttachmentViewerBottomSheet from "./AttachmentViewerBottomSheet";
import api from "@/api/axios";

interface AttachmentPageProps {
  courseId: string;
  subjectName: string;
  moduleNumber: number;
  notesTitle?: string;
}

const AttachmentPage: React.FC<AttachmentPageProps> = ({ courseId, subjectName, moduleNumber, notesTitle }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{ name: string; uri: string } | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch signed URL for notes on component mount
  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/courses/${courseId}/subject/${subjectName}/module/${moduleNumber}/notes`);
        if (response.data.success && response.data.signedUrl) {
          setSignedUrl(response.data.signedUrl);
        } else {
          throw new Error('Failed to get signed URL');
        }
      } catch (err) {
        console.error('Error fetching notes signed URL:', err);
        setError('Failed to load notes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [courseId, subjectName, moduleNumber]);

  // Use dynamic notes URL or fallback to default
  const pdfUri = signedUrl || "http://noteswift.in/wp-content/uploads/2025/09/Learn-How-To-Actually-Study-Before-Its-Too-Late.pdf";
  const pdfTitle = notesTitle || "Study Fundamentals.Pdf";

  // Dynamic attachments based on provided notes
  const attachments = signedUrl ? [
    {
      name: pdfTitle,
      type: 'PDF',
      size: '1.2 MB',
      note: 'This PDF covers the lesson content provided by your instructor.'
    }
  ] : [];

  const hasAttachments = attachments.length > 0;

  // Handler to open attachment viewer
  function handleOpenAttachment(att: { name: string; type: string; size: string; note?: string }) {
    setViewerFile({ name: att.name, uri: pdfUri });
    setViewerOpen(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 15 }}>
      {/* Only subtitle at the top, smaller text */}
      <Text style={{ fontSize: 11, color: '#6b7280', textAlign: 'left', marginBottom: 18, marginHorizontal: 6, lineHeight: 18 }}>
        Here you can download and view all lesson resources, such as PDFs, slides, and other files provided by your instructor. Tap the view button to open a file.
      </Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 0, paddingHorizontal: 0 }}>
        {loading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 120, marginTop: 32 }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>Loading notes...</Text>
          </View>
        ) : error ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 120, marginTop: 32 }}>
            <Icon name="error-outline" size={40} color="#EF4444" style={{ marginBottom: 10 }} />
            <Text style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 }}>{error}</Text>
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setLoading(true);
                // Re-fetch signed URL
                const fetchSignedUrl = async () => {
                  try {
                    const response = await api.get(`/courses/${courseId}/subject/${subjectName}/module/${moduleNumber}/notes`);
                    if (response.data.success && response.data.signedUrl) {
                      setSignedUrl(response.data.signedUrl);
                    } else {
                      throw new Error('Failed to get signed URL');
                    }
                  } catch (err) {
                    setError('Failed to load notes. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchSignedUrl();
              }}
              style={{ marginTop: 16, backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : hasAttachments ? (
          attachments.map((att, idx) => (
            <View key={att.name}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  marginHorizontal: 6,
                  marginBottom: 4,
                  borderWidth: 1,
                  borderColor: '#f3f4f6',
                }}
              >
                <View style={{ backgroundColor: '#dbeafe', borderRadius: 999, padding: 7, marginRight: 10 }}>
                  <Icon name="attach-file" size={20} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>{att.name}</Text>
                  <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{att.type}, {att.size}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenAttachment(att)}
                  style={{ marginLeft: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#2563eb', borderRadius: 999 }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>More</Text>
                </TouchableOpacity>
              </View>
              {/* Small note below the card, outside */}
              {att.note && (
                <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4, marginBottom: 10, marginLeft: 10, marginRight: 6 }}>{att.note}</Text>
              )}
            </View>
          ))
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 120, marginTop: 32 }}>
            <Icon name="insert-drive-file" size={40} color="#cbd5e1" style={{ marginBottom: 10 }} />
            <Text style={{ color: '#6b7280', fontSize: 13 }}>No attachments available for this lesson.</Text>
          </View>
        )}
      </ScrollView>
      {/* Attachment Viewer BottomSheet (always mounted) */}
      <AttachmentViewerBottomSheet
        isVisible={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileName={viewerFile ? viewerFile.name : ''}
        fileUri={viewerFile ? viewerFile.uri : ''}
      />
    </View>
  );
};

export default AttachmentPage;