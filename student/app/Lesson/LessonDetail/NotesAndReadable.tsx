import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notesData } from './NotesData';
import HeaderSixth from '../../../components/Headers/HeaderSixth';
import { updateModuleProgress } from '../../../api/lessonProgress';
import { useAuthStore } from '../../../stores/authStore';

export default function NotesStepper() {
  const { useRouter } = require('expo-router');
  const router = useRouter();
  const { module = '1', courseId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const moduleIndex = parseInt(module as string) - 1;

  // Use the new array structure
  const currentModuleData = notesData[moduleIndex] || notesData[0];

  const [currentSection, setCurrentSection] = useState(0);
  const [typedTextMap, setTypedTextMap] = useState<{ [key: string]: string }>({});
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [completedSectionsLoaded, setCompletedSectionsLoaded] = useState(false);

  const section = currentModuleData.sections[currentSection];
  const totalSections = currentModuleData.sections.length;

  // Load completed sections from AsyncStorage
  const loadCompletedSections = async () => {
    try {
      const stored = await AsyncStorage.getItem('completedSections');
      if (stored) {
        setCompletedSections(new Set(JSON.parse(stored)));
      }
      setCompletedSectionsLoaded(true);
    } catch (error) {
      console.error('Error loading completed sections:', error);
      setCompletedSectionsLoaded(true);
    }
  };

  // Save completed section to AsyncStorage and backend
  const saveCompletedSection = async (sectionKey: string, isFinal: boolean = false) => {
    try {
      const newCompleted = new Set(completedSections);
      newCompleted.add(sectionKey);
      setCompletedSections(newCompleted);
      await AsyncStorage.setItem('completedSections', JSON.stringify([...newCompleted]));

      // Calculate progress percentage based on module
      const moduleSections = currentModuleData.sections.length;
      const completedModuleSections = Array.from(newCompleted).filter(key => 
        key.startsWith(`module${moduleIndex + 1}_section`)
      );
      if (courseId && user?.id) {
        console.log('Updating module progress:', { courseId, moduleNumber: moduleIndex + 1, isFinal });
        // Let the backend calculate progress based on completion status
        await updateModuleProgress(courseId as string, moduleIndex + 1, undefined, isFinal ? true : undefined, undefined);
        console.log('Module progress updated successfully');
      }
    } catch (error) {
      console.error('Error saving completed section:', error);
    }
  };

  useEffect(() => {
    loadCompletedSections();
  }, []);

  useEffect(() => {
    // Only proceed if completed sections have been loaded
    if (!completedSectionsLoaded) return;

    const sectionKey = `module${moduleIndex + 1}_section${currentSection}`;
    const isSectionCompleted = completedSections.has(sectionKey);

    // Initialize all text fields
    const initialMap: { [key: string]: string } = {};
    
    // Pre-initialize all possible keys with empty strings
    initialMap['sectionTitle'] = '';
    if (section.content) initialMap[`content-${currentSection}`] = '';
    if ((section as any).highlight) initialMap[`highlight-${currentSection}`] = '';
    
    section.subsections?.forEach((sub: any, idx: number) => {
      if (sub.title) initialMap[`subTitle-${idx}`] = '';
      if (sub.content) initialMap[`subContent-${idx}`] = '';
    });
    
    section.bulletList?.forEach((item: string, idx: number) => {
      initialMap[`bullet-${idx}`] = '';
    });
    
    if ((section as any).numberedList) {
      (section as any).numberedList.forEach((item: string, idx: number) => {
        initialMap[`number-${idx}`] = '';
      });
    }
    
    section.keyPoints?.forEach((item: string, idx: number) => {
      initialMap[`key-${idx}`] = '';
    });
    
    if ((section as any).warning) initialMap['warn'] = '';
    
    if ((section as any).table) {
      (section as any).table.headers.forEach((header: string, idx: number) => {
        initialMap[`tableHeader-${idx}`] = '';
      });
      (section as any).table.rows.forEach((row: string[], rIdx: number) => {
        row.forEach((cell: string, cIdx: number) => {
          initialMap[`tableCell-${rIdx}-${cIdx}`] = '';
        });
      });
    }

    if (isSectionCompleted) {
      // Section already completed - show all content immediately
      const completedMap: { [key: string]: string } = {};
      
      // Fill all text fields with full content
      completedMap['sectionTitle'] = section.title;
      if (section.content) completedMap[`content-${currentSection}`] = section.content;
      if ((section as any).highlight) completedMap[`highlight-${currentSection}`] = (section as any).highlight;
      
      section.subsections?.forEach((sub: any, idx: number) => {
        if (sub.title) completedMap[`subTitle-${idx}`] = sub.title;
        if (sub.content) completedMap[`subContent-${idx}`] = sub.content;
      });
      
      section.bulletList?.forEach((item: string, idx: number) => {
        completedMap[`bullet-${idx}`] = item;
      });
      
      if ((section as any).numberedList) {
        (section as any).numberedList.forEach((item: string, idx: number) => {
          completedMap[`number-${idx}`] = item;
        });
      }
      
      section.keyPoints?.forEach((item: string, idx: number) => {
        completedMap[`key-${idx}`] = item;
      });
      
      if ((section as any).warning) completedMap['warn'] = (section as any).warning;
      
      if ((section as any).table) {
        (section as any).table.headers.forEach((header: string, idx: number) => {
          completedMap[`tableHeader-${idx}`] = header;
        });
        (section as any).table.rows.forEach((row: string[], rIdx: number) => {
          row.forEach((cell: string, cIdx: number) => {
            completedMap[`tableCell-${rIdx}-${cIdx}`] = cell;
          });
        });
      }

      setTypedTextMap(completedMap);
      setTypewriterDone(true);
      setVisibleElements(new Set([
        'highlight-show', 'highlight-complete',
        'table-show', 'table-complete',
        'keypoints-show', 'keypoints-complete',
        'warning-show', 'warning-complete',
        ...Array.from({ length: section.bulletList?.length || 0 }, (_, i) => `bullet-show-${i}`),
        ...Array.from({ length: (section as any).numberedList?.length || 0 }, (_, i) => `number-show-${i}`),
        ...Array.from({ length: section.keyPoints?.length || 0 }, (_, i) => `key-show-${i}`)
      ]));
    } else {
      // New section - start typewriter animation
      setTypedTextMap(initialMap);
      setTypewriterDone(false);
      setVisibleElements(new Set()); // Reset visible elements

      const queue: { key: string; text: string; type: 'text' | 'show' }[] = [];

      // Build the queue in the same order
      queue.push({ key: 'sectionTitle', text: section.title, type: 'text' });
      if (section.content) queue.push({ key: `content-${currentSection}`, text: section.content, type: 'text' });
      if ((section as any).highlight) {
        queue.push({ key: `highlight-show`, text: '', type: 'show' });
        queue.push({ key: `highlight-${currentSection}`, text: (section as any).highlight, type: 'text' });
        queue.push({ key: 'highlight-complete', text: '', type: 'show' });
      }
      
      section.subsections?.forEach((sub: any, idx: number) => {
        if (sub.title) queue.push({ key: `subTitle-${idx}`, text: sub.title, type: 'text' });
        if (sub.content) queue.push({ key: `subContent-${idx}`, text: sub.content, type: 'text' });
      });
      
      section.bulletList?.forEach((item: string, idx: number) => {
        queue.push({ key: `bullet-show-${idx}`, text: '', type: 'show' });
        queue.push({ key: `bullet-${idx}`, text: item, type: 'text' });
      });
      
      if ((section as any).numberedList) {
        (section as any).numberedList.forEach((item: string, idx: number) => {
          queue.push({ key: `number-show-${idx}`, text: '', type: 'show' });
          queue.push({ key: `number-${idx}`, text: item, type: 'text' });
        });
      }
      
      // Process in JSX render order: Tables first, then Key Points, then Warnings
      if ((section as any).table) {
        queue.push({ key: 'table-show', text: '', type: 'show' });
        (section as any).table.headers.forEach((header: string, idx: number) => {
          queue.push({ key: `tableHeader-${idx}`, text: header, type: 'text' });
        });
        (section as any).table.rows.forEach((row: string[], rIdx: number) => {
          row.forEach((cell: string, cIdx: number) => {
            queue.push({ key: `tableCell-${rIdx}-${cIdx}`, text: cell, type: 'text' });
          });
        });
        queue.push({ key: 'table-complete', text: '', type: 'show' });
      }
      
      section.keyPoints?.forEach((item: string, idx: number) => {
        if (idx === 0) queue.push({ key: 'keypoints-show', text: '', type: 'show' });
        queue.push({ key: `key-show-${idx}`, text: '', type: 'show' });
        queue.push({ key: `key-${idx}`, text: item, type: 'text' });
      });
      
      if (section.keyPoints && section.keyPoints.length > 0) {
        queue.push({ key: 'keypoints-complete', text: '', type: 'show' });
      }
      
      if ((section as any).warning) {
        queue.push({ key: 'warning-show', text: '', type: 'show' });
        queue.push({ key: 'warn', text: (section as any).warning, type: 'text' });
        queue.push({ key: 'warning-complete', text: '', type: 'show' });
      }

      // Sequential Typewriter with proper character handling
      const typeNext = (index = 0) => {
        if (index >= queue.length) {
          setTypewriterDone(true);
          // Save completion status when typewriter finishes
          saveCompletedSection(sectionKey);
          return;
        }
        
        const { key, text, type } = queue[index];
        
        if (type === 'show') {
          // Show the container immediately
          setVisibleElements(prev => new Set(prev).add(key));
          // Small delay before starting next text
          let delay = 200;
          if (key.includes('-complete')) {
            delay = 500; // Longer delay after container completes
          }
          setTimeout(() => typeNext(index + 1), delay);
          return;
        }
        
        // Handle text typing
        let charIndex = 0;
        
        const interval = setInterval(() => {
          setTypedTextMap((prev) => ({
            ...prev,
            [key]: text.substring(0, charIndex + 1), // Use substring to get proper text
          }));
          
          charIndex++;
          
          if (charIndex >= text.length) {
            clearInterval(interval);
            // Small delay before starting next text
            setTimeout(() => typeNext(index + 1), 100);
          }
        }, 5); // Slightly slower for better readability
      };

  // Start typing after a small delay
  setTimeout(() => typeNext(), 200);
    }
  }, [currentSection, moduleIndex, completedSections, completedSectionsLoaded]);

  // Render functions with proper fallback handling
  const renderBulletList = (items: string[], prefix = 'bullet') => (
    <View className="mb-3">
      {items.map((item, idx) => (
        <View key={idx} className="flex-row mb-2 items-start">
          <Text className={`mr-1.5 transition-opacity duration-300 ${
            visibleElements.has(`${prefix}-show-${idx}`) ? 'opacity-100 text-blue-500' : 'opacity-0'
          }`}>•</Text>
          <Text className="text-[12px] text-gray-700 leading-[18px]">{typedTextMap[`${prefix}-${idx}`] || ''}</Text>
        </View>
      ))}
    </View>
  );

  const renderNumberedList = (items: string[]) => (
    <View className="mb-3">
      {items.map((item, idx) => (
        <View key={idx} className="flex-row mb-3 items-start">
          <View className={`w-6 h-6 rounded-full justify-center items-center mr-1.5 transition-opacity duration-300 ${
            visibleElements.has(`number-show-${idx}`) ? 'opacity-100 bg-blue-100' : 'opacity-0'
          }`}>
            <Text className="text-blue-700 text-[10px] font-semibold">{idx + 1}</Text>
          </View>
          <Text className="text-[12px] text-gray-700 leading-[18px]">{typedTextMap[`number-${idx}`] || ''}</Text>
        </View>
      ))}
    </View>
  );

  const renderTable = (table: any) => (
    <View className={`mb-4 border border-gray-300 rounded-lg overflow-hidden transition-opacity duration-500 ${
      visibleElements.has('table-show') ? 'opacity-100' : 'opacity-0'
    }`}>
      <View className="flex-row bg-gray-100 border-b border-gray-300">
        {table.headers.map((header: string, idx: number) => (
          <Text key={idx} className="flex-1 text-center p-3 font-semibold text-gray-700 text-[12px]">
            {typedTextMap[`tableHeader-${idx}`] || ''}
          </Text>
        ))}
      </View>
      {table.rows.map((row: string[], rowIdx: number) => (
        <View
          key={rowIdx}
          className={`flex-row border-b border-gray-200 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
          {row.map((cell: string, cellIdx: number) => (
            <Text key={cellIdx} className="flex-1 text-center p-3 text-gray-700 text-[12px]">
              {typedTextMap[`tableCell-${rowIdx}-${cellIdx}`] || ''}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderSixth
        title={`Module ${parseInt(module as string)}: ${currentModuleData.module.split(':')[1]?.trim() || currentModuleData.module}`}
        subtitle="ThatGuy (US) & NoteSwift Research Team"
        onBack={() => {/* Handle back navigation */}}
      />

      {/* Section Title */}
      <View className="p-6 bg-gray-50 mb-4">
        <Text className="text-[12px] text-blue-500 mb-2">
          Section {currentSection + 1} of {totalSections}
        </Text>
        <Text className="text-[16px] font-semibold text-gray-900">
          {typedTextMap['sectionTitle'] || ''}
        </Text>
      </View>

      {/* Content */}
  <ScrollView className="flex-1 px-6 pb-24">
        {/* Main Section Content */}
        {section.content && (
          <Text className="text-[12px] text-gray-700 leading-[18px] mb-4">
            {typedTextMap[`content-${currentSection}`] || ''}
          </Text>
        )}

        {/* Highlights */}
        {(section as any).highlight && (
          <View className={`my-3 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg transition-opacity duration-500 ${
            visibleElements.has('highlight-show') ? 'opacity-100' : 'opacity-0'
          }`}>
            <Text className="text-[12px] text-gray-700 leading-[18px]">
              {typedTextMap[`highlight-${currentSection}`] || ''}
            </Text>
          </View>
        )}

        {/* Subsections */}
        {section.subsections && section.subsections.map((sub: any, idx: number) => (
          <View key={idx} className="mb-4">
            {sub.title && (
              <Text className="text-[14px] font-medium text-gray-900 mb-2">
                {typedTextMap[`subTitle-${idx}`] || ''}
              </Text>
            )}
            {sub.content && (
              <Text className="text-[12px] text-gray-700 leading-[18px] mb-2">
                {typedTextMap[`subContent-${idx}`] || ''}
              </Text>
            )}
          </View>
        ))}

        {/* Bullet List - Show immediately but with typed content */}
        {section.bulletList && renderBulletList(section.bulletList)}

        {/* Numbered List - Show immediately but with typed content */}
        {(section as any).numberedList && renderNumberedList((section as any).numberedList)}

        {/* Tables - Show immediately but with typed content */}
        {(section as any).table && renderTable((section as any).table)}

        {/* Key Points - Show immediately but with typed content */}
        {section.keyPoints && (
          <View className={`my-4 p-4 bg-gray-100 rounded-lg transition-opacity duration-500 ${
            visibleElements.has('keypoints-show') ? 'opacity-100' : 'opacity-0'
          }`}>
            <Text className="font-semibold mb-2 text-[12px]">Key Takeaways</Text>
            {renderBulletList(section.keyPoints, 'key')}
          </View>
        )}

        {/* Warnings - Show immediately but with typed content */}
        {(section as any).warning && (
          <View className={`my-4 p-4 bg-gray-100 border-l-4 border-gray-400 rounded-lg transition-opacity duration-500 ${
            visibleElements.has('warning-show') ? 'opacity-100' : 'opacity-0'
          }`}>
            <Text className="text-[12px] text-gray-700 leading-[18px]">{typedTextMap['warn'] || ''}</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="absolute bottom-6 left-4 right-4 rounded-3xl bg-white border border-gray-200 p-6">
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity
            disabled={currentSection === 0}
            onPress={() => setCurrentSection((prev) => prev - 1)}
            className={`px-4 py-2 rounded-full ${currentSection === 0 ? 'bg-gray-300' : 'bg-blue-500'}`}
          >
            <Text className={`${currentSection === 0 ? 'text-gray-400' : 'text-white'} font-semibold text-[12px]`}>
              Previous
            </Text>
          </TouchableOpacity>

          {currentSection === totalSections - 1 ? (
            <TouchableOpacity
              disabled={!typewriterDone}
              onPress={async () => {
                const sectionKey = `module${moduleIndex + 1}_section${currentSection}`;
                await saveCompletedSection(sectionKey, true);
                // Navigate back to chapter screen
                router.back();
              }}
              className={`px-4 py-2 rounded-full ${!typewriterDone ? 'bg-gray-300' : 'bg-green-500'}`}
            >
              <Text className={`${!typewriterDone ? 'text-gray-400' : 'text-white'} font-semibold text-[12px]`}>
                Complete
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              disabled={!typewriterDone}
              onPress={async () => {
                const sectionKey = `module${moduleIndex + 1}_section${currentSection}`;
                await saveCompletedSection(sectionKey);
                setCurrentSection((prev) => prev + 1);
              }}
              className={`px-4 py-2 rounded-full ${!typewriterDone ? 'bg-gray-300' : 'bg-blue-500'}`}
            >
              <Text className={`${!typewriterDone ? 'text-gray-400' : 'text-white'} font-semibold text-[12px]`}>
                Next
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-center text-[10px] text-gray-500">
          {typewriterDone ? (currentSection === totalSections - 1 ? 'Ready to complete module' : 'Ready for next section') : 'Reading in progress..'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Styles removed; all styling is now handled by Tailwind classes