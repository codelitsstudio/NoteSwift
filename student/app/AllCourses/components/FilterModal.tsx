import React, { useState, useRef, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    type: string;
    program: string;
    subject: string;
  };
  onApplyFilters: (filters: {
    type: string;
    program: string;
    subject: string;
  }) => void;
}

export default function FilterModal({ visible, onClose, filters, onApplyFilters }: FilterModalProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const [tempFilters, setTempFilters] = useState(filters);
  const [lastAction, setLastAction] = useState<'reset' | null>(null);

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'free', label: 'Free Courses' },
    { value: 'pro', label: 'Pro Packages' }
  ];

  const programOptions = [
    { value: 'all', label: 'All Programs' },
    { value: 'SEE', label: 'SEE (Grade 8-10)' },
    { value: '+2', label: '+2 (Grade 11-12)' },
    { value: 'Bachelor', label: 'Bachelor' },
    { value: 'CTEVT', label: 'CTEVT' }
  ];

  const subjectOptions = [
    { value: 'all', label: 'All Subjects' },
    { value: 'general', label: 'General' },
    { value: 'math', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' }
  ];

  // Handle bottom sheet visibility and sync tempFilters with props
  useEffect(() => {
    if (visible && bottomSheetRef.current) {
      bottomSheetRef.current.present();
      setTempFilters(filters); // Always sync with current filters when opening
      setLastAction(null);
    } else if (!visible && bottomSheetRef.current) {
      bottomSheetRef.current.dismiss();
    }
  }, [visible, filters]);

  // Sync tempFilters when filters prop changes
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleClose = () => {
    setTempFilters(filters); // Reset to original values
    setLastAction(null);
    onClose();
  };

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = { type: 'all', program: 'all', subject: 'all' };
    setTempFilters(resetFilters);
    setLastAction('reset');
    // Apply reset immediately like in the previous version
    onApplyFilters(resetFilters);
    onClose();
  };

  const handleQuickFreeOnly = () => {
    const freeOnlyFilters = { type: 'free', program: 'all', subject: 'all' };
    setTempFilters(freeOnlyFilters);
    setLastAction(null);
    // Apply free-only filter immediately
    onApplyFilters(freeOnlyFilters);
    onClose();
  };

  const filterCategories = [
    {
      title: 'Course Type',
      description: 'Filter by course pricing and access type',
      options: typeOptions,
      selectedValue: tempFilters.type,
      onSelect: (value: string) => {
        setTempFilters(prev => ({ ...prev, type: value }));
        setLastAction(null);
      }
    },
    {
      title: 'Program Level',
      description: 'Select your current education level',
      options: programOptions,
      selectedValue: tempFilters.program,
      onSelect: (value: string) => {
        setTempFilters(prev => ({ ...prev, program: value }));
        setLastAction(null);
      }
    },
    {
      title: 'Subject',
      description: 'Choose your area of interest',
      options: subjectOptions,
      selectedValue: tempFilters.subject,
      onSelect: (value: string) => {
        setTempFilters(prev => ({ ...prev, subject: value }));
        setLastAction(null);
      }
    }
  ];

  const renderFilterCategory = (category: typeof filterCategories[0]) => (
    <View key={category.title} className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-1 px-5">
        {category.title}
      </Text>
      <Text className="text-sm text-gray-600 mb-3 px-5">
        {category.description}
      </Text>
      <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-5 overflow-hidden">
        {category.options.map((option, index) => (
          <View key={option.value}>
            <TouchableOpacity
              onPress={() => category.onSelect(option.value)}
              className="flex-row items-center justify-between py-4 px-5"
            >
              <View className="flex-row items-center flex-1">
                <View className={`rounded-full p-2 mr-3 ${
                  category.selectedValue === option.value ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <MaterialIcons 
                    name={
                      category.title === 'Course Type' ? 'school' :
                      category.title === 'Program Level' ? 'school' : 'subject'
                    } 
                    size={20} 
                    color={category.selectedValue === option.value ? '#3B82F6' : '#6B7280'} 
                  />
                </View>
                <Text className={`text-base font-medium ${
                  category.selectedValue === option.value ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {option.label}
                </Text>
              </View>
              {category.selectedValue === option.value && (
                <MaterialIcons name="check-circle" size={20} color="#3B82F6" />
              )}
            </TouchableOpacity>
            {index < category.options.length - 1 && (
              <View className="h-px bg-gray-100 mx-5" />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleClose}
      backgroundStyle={{ backgroundColor: '#fff' }}
      handleIndicatorStyle={{ backgroundColor: '#E5E7EB' }}
      enablePanDownToClose={true}
      enableContentPanningGesture={false}
      enableHandlePanningGesture={false}
      enableOverDrag={false}
      animateOnMount={true}
    >
      {/* Sticky Header */}
      <View
        style={{
          zIndex: 10,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
        className="flex-row justify-between items-center px-5 py-4"
      >
        <Text className="text-xl font-bold text-gray-900">Filter Courses</Text>
        <TouchableOpacity onPress={handleClose} className="p-2">
          <MaterialIcons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 210, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Description */}
        <View className="mb-6 mx-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 mt-4">
          <View className="flex-row items-start" style={{ gap: 12 }}>
            <View className="bg-blue-100 rounded-full p-2 mt-1">
              <MaterialIcons name="filter-list" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900 mb-1">
                Find Your Perfect Course
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                Use these filters to narrow down courses that match your learning goals and preferences.
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Categories */}
        {filterCategories.map(renderFilterCategory)}

        {/* Quick Actions */}
        <View className="mx-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleReset}
              className={`flex-1 ${lastAction === 'reset' 
                ? 'bg-blue-500 border-blue-500' 
                : 'bg-gray-50 border-gray-200'} border rounded-3xl p-4`}
            >
              <Text className={`text-center font-semibold ${lastAction === 'reset' 
                ? 'text-white' 
                : 'text-gray-700'}`}>
                Reset All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleQuickFreeOnly}
              className="flex-1 bg-gray-50 border-gray-200 border rounded-3xl p-4"
            >
              <Text className="text-center font-semibold text-gray-700">
                Free Only
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Apply Button */}
        <View className="px-5">
          <TouchableOpacity
            onPress={handleApply}
            className="bg-blue-600 rounded-3xl py-4 mb-3"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Apply Filters
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-500 text-center mb-4">
            Results will update instantly based on your selected criteria
          </Text>
          
          <TouchableOpacity
            onPress={handleClose}
            className="bg-gray-100 rounded-3xl py-3"
          >
            <Text className="text-center text-gray-700 font-medium">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}