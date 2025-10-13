import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Course {
  id: string;
  name?: string;
  title: string;
  price?: number;
  description: string;
  type: 'free' | 'pro' | 'featured';
  duration?: string;
  rating?: number;
  enrolledCount?: number;
  skills?: string[];
}

interface CourseListItemProps {
  course: Course;
  onPress: () => void;
}

export default function CourseListItem({ course, onPress }: CourseListItemProps) {
  const price = course.price ?? 0; // Default to 0 if undefined
  const priceText = price === 0 ? 'Free' : `Rs. ${price}`;
  const paymentText = price === 0 ? 'No payment required' : 'One-time payment';
  
  const enrolledCount = course.enrolledCount ?? 0;
  const enrolledText = enrolledCount > 1000 
    ? `${(enrolledCount / 1000).toFixed(1)}k` 
    : (enrolledCount > 0 ? enrolledCount.toString() : '');
  
  const skillsCount = course.skills?.length ?? 0;
  const skillsText = skillsCount > 2 ? `+${skillsCount - 2}` : '';
  
  const courseTitle = course.name || course.title;
  const rating = course.rating?.toString() ?? '';
  const duration = course.duration ?? '';

  return (
    <View style={{ marginBottom: 12 }}>
      <Pressable
        onPress={onPress}
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          borderColor: '#D1D5DB',
          backgroundColor: 'white'
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            {/* Title and Badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text 
                style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' }}
                numberOfLines={2}
              >
                {courseTitle}
              </Text>
              {course.type === 'pro' && (
                <View style={{ 
                  marginLeft: 8, 
                  paddingHorizontal: 8, 
                  paddingVertical: 4, 
                  backgroundColor: '#DBEAFE', 
                  borderRadius: 9999 
                }}>
                  <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '600' }}>
                    PRO
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text 
              style={{ color: '#4B5563', fontSize: 11, marginBottom: 12 }} 
              numberOfLines={2}
            >
              {course.description}
            </Text>

            {/* Price and Rating */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#2563EB' }}>
                  {priceText}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  {paymentText}
                </Text>
              </View>
              {rating ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="star" size={16} color="#3B82F6" />
                  <Text style={{ color: '#374151', fontSize: 14, marginLeft: 4 }}>
                    {rating}
                  </Text>
                  {enrolledText ? (
                    <Text style={{ color: '#6B7280', fontSize: 12, marginLeft: 8 }}>
                      ({enrolledText})
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Duration and Skills */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {duration ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="schedule" size={14} color="#6B7280" />
                  <Text style={{ color: '#6B7280', fontSize: 12, marginLeft: 4 }}>
                    {duration}
                  </Text>
                </View>
              ) : null}
              
              {skillsCount > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {course.skills!.slice(0, 2).map((skill, index) => (
                    <View 
                      key={index} 
                      style={{ 
                        backgroundColor: '#F3F4F6',
                        borderRadius: 9999,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginRight: 4
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#4B5563' }}>
                        {skill}
                      </Text>
                    </View>
                  ))}
                  {skillsText ? (
                    <View style={{ 
                      backgroundColor: '#F3F4F6',
                      borderRadius: 9999,
                      paddingHorizontal: 8,
                      paddingVertical: 4
                    }}>
                      <Text style={{ fontSize: 12, color: '#4B5563' }}>
                        {skillsText}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}