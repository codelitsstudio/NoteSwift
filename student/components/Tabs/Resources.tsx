import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AttachmentViewerBottomSheet from "../../app/Chapter/ChapterDetail/AttachmentViewerBottomSheet";

const resources = [
  {
    name: 'Module-1.pdf',
    type: 'PDF',
    size: '2.1 MB',
    note: 'Comprehensive guide to effective study techniques and learning strategies.',
    uri: 'http://noteswift.in/wp-content/uploads/2025/09/Learn-How-To-Actually-Study-Before-Its-Too-Late.pdf'
  },
  {
    name: 'Module-2.pdf',
    type: 'PDF',
    size: '1.8 MB',
    note: 'Essential strategies for exam preparation and optimal performance under pressure.',
    uri: 'http://noteswift.in/wp-content/uploads/2025/09/Mastering-Exam-Preparation-and-Performance.pdf'
  },
  {
    name: 'Module-3.pdf',
    type: 'PDF',
    size: '1.9 MB',
    note: 'Time management techniques and productivity frameworks for academic success.',
    uri: 'http://noteswift.in/wp-content/uploads/2025/09/Mastering-Time-Work-Smarter-Not-Harder.pdf'
  },
  {
    name: 'Module-4.pdf',
    type: 'PDF',
    size: '2.0 MB',
    note: 'Advanced memory techniques and knowledge retention strategies.',
    uri: 'http://noteswift.in/wp-content/uploads/2025/09/Mastering-Memory-Techniques-for-Knowledge-Retention.pdf'
  },
  {
    name: 'Module-5.pdf',
    type: 'PDF',
    size: '1.7 MB',
    note: 'Building focus, motivation, and habits for consistent academic progress.',
    uri: 'http://noteswift.in/wp-content/uploads/2025/09/Mastering-Focus-Motivation-and-Sustained-Learning.pdf'
  },
];

const Resources: React.FC<{ modules?: any[] }> = ({ modules = [] }) => {
  // If modules are provided, use them to generate resources
  const moduleResources = modules
    .filter(module => module.hasNotes && module.notesUrl)
    .map(module => ({
      name: module.notesTitle || `${module.moduleName} Notes`,
      type: 'PDF',
      size: 'N/A', // Size not available from backend
      note: module.description || 'Module notes and study materials',
      uri: module.notesUrl
    }));

  // Use module resources if available, otherwise fall back to default resources
  const resourcesToShow = moduleResources.length > 0 ? moduleResources : resources;
  const hasResources = resourcesToShow.length > 0;
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{ name: string; uri: string } | null>(null);

  // Handler to open attachment viewer
  function handleOpenResource(resource: { name: string; type: string; size: string; note?: string; uri: string }) {
    setViewerFile({ name: resource.name, uri: resource.uri });
    setViewerOpen(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 24 }}>
      {/* Subtitle at the top */}
      <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'left', marginBottom: 18, marginHorizontal: 24, lineHeight: 18 }}>
       Grab complete study guides in PDF format for offline reading. Each one covers key topics for academic success.
      </Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 0, paddingHorizontal: 0 }}>
        {hasResources ? (
          resourcesToShow.map((resource, idx) => (
            <View key={resource.name}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  marginHorizontal: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#f3f4f6',
                }}
              >
                <View style={{ backgroundColor: '#dbeafe', borderRadius: 999, padding: 7, marginRight: 10 }}>
                  <Icon name="picture-as-pdf" size={20} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }} numberOfLines={2}>{resource.name}</Text>
                  <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{resource.type}, {resource.size}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenResource(resource)}
                  style={{ marginLeft: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#2563eb', borderRadius: 999 }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 120, marginTop: 32 }}>
            <Icon name="insert-drive-file" size={40} color="#cbd5e1" style={{ marginBottom: 10 }} />
            <Text style={{ color: '#6b7280', fontSize: 13 }}>No resources available.</Text>
          </View>
        )}
      </ScrollView>

      {/* Attachment Viewer BottomSheet */}
      <AttachmentViewerBottomSheet
        isVisible={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileName={viewerFile ? viewerFile.name : ''}
        fileUri={viewerFile ? viewerFile.uri : ''}
      />
    </View>
  );
};

export default Resources;