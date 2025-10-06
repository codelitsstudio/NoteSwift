import React, { useRef, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetPicker } from '../../../components/Picker/BottomSheetPicker';
import { MaterialIcons } from '@expo/vector-icons';
import nepalData from '../../../data/nepalLocationData.json';
import Toast from 'react-native-toast-message';

interface EditBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  editType: 'grade' | 'location';
  currentValues: {
    grade?: number;
    province?: string;
    district?: string;
  };
  onSave: (data: any) => void;
  isLoading?: boolean;
}

const EditBottomSheet: React.FC<EditBottomSheetProps> = ({
  isVisible,
  onClose,
  editType,
  currentValues,
  onSave,
  isLoading = false,
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['55%', '80%'], []);

  // Local state for editing
  const [localGrade, setLocalGrade] = useState(currentValues.grade?.toString() || '');
  const [localProvince, setLocalProvince] = useState(currentValues.province || '');
  const [localDistrict, setLocalDistrict] = useState(currentValues.district || '');

  // Generate grades data
  const grades = Array.from({ length: 12 }, (_, i) => ({
    label: `Grade ${i + 1}`,
    value: (i + 1).toString(),
  }));

  // Get districts for selected province
  const districts = localProvince
    ? (nepalData as any).districts[localProvince] || []
    : [];

  const handleProvinceChange = (province: string) => {
    setLocalProvince(province);
    setLocalDistrict(''); // Reset district when province changes
  };

  const handleSave = () => {
    if (editType === 'grade') {
      if (!localGrade) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please select a grade',
        });
        return;
      }
      onSave({ grade: parseInt(localGrade) });
    } else if (editType === 'location') {
      if (!localProvince || !localDistrict) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please select both province and district',
        });
        return;
      }
      onSave({ 
        address: { 
          province: localProvince, 
          district: localDistrict 
        } 
      });
    }
    onClose();
  };

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: '#fff' }}
      handleIndicatorStyle={{ backgroundColor: '#E5E7EB' }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView className="flex-1 px-5 pb-3">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">
            {editType === 'grade' ? 'Edit Grade' : 'Edit Location'}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <View className="flex-row items-start" style={{ gap: 12 }}>
            <View className="bg-blue-100 rounded-full p-2 mt-1">
              <MaterialIcons 
                name={editType === 'grade' ? 'school' : 'location-on'} 
                size={18} 
                color="#3B82F6" 
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900 mb-1">
                {editType === 'grade' ? 'Academic Progress' : 'Location Settings'}
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                {editType === 'grade' 
                  ? 'Choose your current grade to unlock personalized learning paths, get age-appropriate content, and track your academic journey with precision.'
                  : 'Set your location to discover local study groups, get region-specific content, and connect with students in your area for collaborative learning.'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1">
          {editType === 'grade' && (
            <BottomSheetPicker
              data={grades}
              label="Select Grade"
              selectedValue={localGrade}
              onChange={setLocalGrade}
              placeholder="Select your grade"
            />
          )}

          {editType === 'location' && (
            <View className="space-y-4">
              <BottomSheetPicker
                data={nepalData.provinces}
                label="Select Province"
                selectedValue={localProvince}
                onChange={handleProvinceChange}
                placeholder="Select your province"
              />

              <BottomSheetPicker
                data={districts}
                label="Select District"
                selectedValue={localDistrict}
                onChange={setLocalDistrict}
                placeholder={localProvince ? "Select your district" : "Select province first"}
                disabled={!localProvince}
              />
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row mt-4" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-gray-100 rounded-xl py-4 items-center"
            disabled={isLoading}
          >
            <Text className={`font-semibold ${isLoading ? 'text-gray-400' : 'text-gray-700'}`}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            className={`flex-1 rounded-xl py-4 items-center flex-row justify-center ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <MaterialIcons name="hourglass-empty" size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Saving...</Text>
              </>
            ) : (
              <Text className="text-white font-semibold">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default EditBottomSheet;