import React, { useRef, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useCourseStore } from '../../stores/courseStore';
import { useNotificationStore } from '../../stores/notificationStore';

interface CourseNotificationSheetProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const customBlue = '#2563EB'; // more professional tone of blue

export function CourseNotificationSheet({
  visible,
  onClose,
}: CourseNotificationSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['65%'], []);
  
  const {
    featuredCourse,
    isEnrolled,
    enrollInCourse,
    markPopupShown,
    is_loading
  } = useCourseStore();

  const { addNotification } = useNotificationStore();

  // Track if the modal is currently open to prevent duplicate presentations
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useEffect(() => {
    console.log('CourseNotificationSheet effect - visible:', visible, 'featuredCourse:', !!featuredCourse, 'isModalOpen:', isModalOpen);
    
    if (visible && featuredCourse && !isModalOpen) {
      const courseId = featuredCourse.id || featuredCourse._id;
      if (!isEnrolled(courseId)) {
        console.log('Presenting bottom sheet modal');
        setIsModalOpen(true);
        // Use a small delay to ensure proper mounting
        setTimeout(() => {
          bottomSheetRef.current?.present();
        }, 100);
      }
    } else if (!visible && isModalOpen) {
      console.log('Dismissing bottom sheet modal');
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, featuredCourse, isModalOpen]);

  // Reset modal state when component unmounts
  useEffect(() => {
    return () => {
      setIsModalOpen(false);
    };
  }, []);

  if (!featuredCourse) {
    console.log('CourseNotificationSheet: No featured course, returning null');
    return null;
  }

  const courseId = featuredCourse.id || featuredCourse._id;
  const alreadyEnrolled = isEnrolled(courseId);

  // Debug logging
  console.log('Featured Course Thumbnail:', featuredCourse.thumbnail);
  console.log('Thumbnail starts with http:', featuredCourse.thumbnail.startsWith('http'));
  console.log('Thumbnail equals course-1-thumbnail.jpg:', featuredCourse.thumbnail === 'course-1-thumbnail.jpg');

  const handleEnroll = async () => {
    if (alreadyEnrolled || !featuredCourse) return;
    
    try {
      const success = await enrollInCourse(courseId);
      
      if (success) {
        // Add notification for successful enrollment
        addNotification({
          title: 'Course Enrollment Successful!',
          message: `You've successfully enrolled in "${featuredCourse.title}". Start learning now!`,
          type: 'enrollment',
          courseId: courseId,
          courseName: featuredCourse.title,
        });

        Toast.show({
          type: 'success',
          position: 'top',
          text1: `Enrolled in ${featuredCourse.title}`,
          text2: 'You can now access the course content.',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 50,
        });
        handleClose();
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Enrollment failed',
          text2: 'Please try again later.',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 50,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Something went wrong',
        text2: 'Please try again later.',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };
  
  const handleClose = () => {
    console.log('handleClose called');
    setIsModalOpen(false);
    markPopupShown();
    bottomSheetRef.current?.dismiss();
    // Use setTimeout to ensure proper state management
    setTimeout(() => {
      onClose();
    }, 100);
  };

  const handleDismiss = () => {
    console.log('handleDismiss called');
    setIsModalOpen(false);
    markPopupShown();
    // Use setTimeout to ensure proper state management
    setTimeout(() => {
      onClose();
    }, 100);
  };

  // Backdrop component that handles tap to close
  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={handleClose}
      />
    ),
    [handleClose]
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      backgroundStyle={{
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}
      handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
      onDismiss={handleDismiss}
      enablePanDownToClose
      enableDismissOnClose
      enableContentPanningGesture={false}
      enableHandlePanningGesture={true}
      animateOnMount={true}
      // Prevent multiple instances
      index={visible ? 0 : -1}
      // Enable backdrop tap to close
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeContainer}>
            <MaterialIcons name="school" size={16} color="#FFF" />
            <Text style={styles.badgeText}>Featured Course</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image 
            source={
              featuredCourse.thumbnail.startsWith('http') 
                ? { uri: featuredCourse.thumbnail }
                : featuredCourse.thumbnail === 'course-1-thumbnail.jpg'
                  ? require('../../assets/images/course-1-thumbnail.jpg')
                  : featuredCourse.thumbnail.endsWith('.jpg') || featuredCourse.thumbnail.endsWith('.png')
                    ? require('../../assets/images/course-1-thumbnail.jpg') // fallback to our local image
                    : { uri: featuredCourse.thumbnail }
            } 
            style={styles.thumbnail} 
            resizeMode="cover"
            onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
            onLoad={() => console.log('Image loaded successfully')}
          />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{featuredCourse.title}</Text>
          
          <View style={styles.teacherContainer}>
            <MaterialIcons name="person" size={16} color="#6B7280" />
            <Text style={styles.teacherName}>By {featuredCourse.teacherName}</Text>
          </View>
          
          <Text style={styles.description}>{featuredCourse.description}</Text>

          {featuredCourse.originalPrice && (
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>${featuredCourse.originalPrice}</Text>
              <Text style={styles.freePrice}>Free Now</Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={handleEnroll} 
            style={[
              styles.enrollButton,
              (alreadyEnrolled || is_loading) && styles.enrollButtonDisabled
            ]} 
            activeOpacity={0.8}
            disabled={alreadyEnrolled || is_loading}
          >
            <MaterialIcons 
              name={alreadyEnrolled ? "check-circle" : "play-circle-filled"} 
              size={22} 
              color="#FFF" 
            />
            <Text style={styles.enrollButtonText}>
              {is_loading 
                ? "Enrolling..." 
                : alreadyEnrolled 
                  ? "Already Enrolled" 
                  : "Enroll for Free"
              }
            </Text>
          </TouchableOpacity>

          {/* Footer Info */}
          <View style={styles.footerInfo}>
            <View style={styles.infoItem}>
              <MaterialIcons name="access-time" size={16} color="#6B7280" />
              <Text style={styles.infoText}>Limited time offer</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="verified" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>Growth guranteed</Text>
            </View>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  badgeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#3B82F6', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 16, 
    gap: 6 
  },
  badgeText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  closeButton: { 
    padding: 4 
  },
  thumbnailContainer: { 
    position: 'relative', 
    marginBottom: 16, 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  thumbnail: { 
    width: '100%', 
    height: 180, 
    borderRadius: 12 
  },
  discountBadge: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    backgroundColor: '#DC2626', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  discountText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  contentContainer: { 
    flex: 1 
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 8 
  },
  teacherContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8, 
    gap: 6 
  },
  teacherName: { 
    fontSize: 14, 
    color: '#6B7280', 
    fontWeight: '500' 
  },
  description: { 
    fontSize: 14, 
    color: '#374151', 
    lineHeight: 20, 
    marginBottom: 16 
  },
  priceContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    gap: 8 
  },
  originalPrice: { 
    fontSize: 14, 
    color: '#9CA3AF', 
    textDecorationLine: 'line-through' 
  },
  freePrice: { 
    fontSize: 14, 
    color: '#3B82F6', 
    fontWeight: '700' 
  },
  enrollButton: { 
    backgroundColor: customBlue, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 10, 
    marginBottom: 16, 
    gap: 8 
  },
  enrollButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  enrollButtonText: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  footerInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingTop: 14, 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB' 
  },
  infoItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  infoText: { 
    fontSize: 12, 
    color: '#6B7280' 
  },
});
