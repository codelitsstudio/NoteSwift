
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AttachmentViewerBottomSheet from "./AttachmentViewerBottomSheet";

const attachments = [
  {
    name: 'Study Fundamentals.Pdf',
    type: 'PDF',
    size: '1.2 MB',
    note: 'This PDF covers the basics you need for the lesson.'
  },
  // Add more attachments here in the future
];

const AttachmentPage: React.FC = () => {
  const hasAttachments = attachments.length > 0;
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{ name: string; uri: string } | null>(null);

  // Remote PDF URL
  const pdfUri = "https://codelitsstudio.com/documents/comp.pdf";

  // Handler to open attachment viewer
  function handleOpenAttachment(att: { name: string; type: string; size: string; note?: string }) {
    setViewerFile({ name: att.name, uri: pdfUri });
    setViewerOpen(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6', paddingTop: 24 }}>
      {/* Only subtitle at the top, smaller text */}
      <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'left', marginBottom: 18, marginHorizontal: 24, lineHeight: 18 }}>
        Here you can download and view all lesson resources, such as PDFs, slides, and other files provided by your instructor. Tap the view button to open a file.
      </Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 0, paddingHorizontal: 0 }}>
        {hasAttachments ? (
          attachments.map((att, idx) => (
            <View key={att.name}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  marginHorizontal: 16,
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
                <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4, marginBottom: 10, marginLeft: 32, marginRight: 16 }}>{att.note}</Text>
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