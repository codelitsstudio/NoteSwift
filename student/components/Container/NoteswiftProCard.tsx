import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useCourseStore } from '../../stores/courseStore';

export default function NoteswiftProCard() {
  const router = useRouter();
  const { enrolledCourses, courses } = useCourseStore();

  // Check if user has any Pro course enrollments
  const hasProEnrollment = enrolledCourses.some(enrolledCourseId => {
    const course = courses.find(c => (c.id || c._id) === enrolledCourseId);
    return course?.type === 'pro';
  });

  // Safe navigation handler with requestAnimationFrame
  const handleNavigation = (path: string) => {
    requestAnimationFrame(() => {
      try {
        router.push(path as any);
      } catch (error) {
        console.log('Navigation failed:', error);
      }
    });
  };

  if (hasProEnrollment) {
    // Calculate available additional courses
    const enrolledProCourseIds = enrolledCourses.filter(enrolledCourseId => {
      const course = courses.find(c => (c.id || c._id) === enrolledCourseId);
      return course?.type === 'pro';
    });
    
    const availableProCourses = courses.filter(course => 
      course.type === 'pro' && !enrolledProCourseIds.includes(course.id || course._id)
    );

    // Pro Unlocked State - Using inline styles
    return (
      <View style={{
        backgroundColor: '#1e40af',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="verified" size={24} color="#ffffff" />
            <Text style={{
              color: '#ffffff',
              fontSize: 20,
              fontWeight: 'bold',
              marginLeft: 8,
            }}>
              Pro Unlocked
            </Text>
          </View>
          <View style={{
            backgroundColor: '#ffffff',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
          }}>
            <Text style={{
              color: '#1e40af',
              fontSize: 12,
              fontWeight: '600',
            }}>
              ACTIVE
            </Text>
          </View>
        </View>
        <Text style={{
          color: '#bfdbfe',
          fontSize: 16,
          marginBottom: 16,
          lineHeight: 24,
        }}>
          Enjoy unlimited access to premium courses, live classes, and exclusive resources.
        </Text>
        {availableProCourses.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              backgroundColor: '#ffffff',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 9999,
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
            }}
            onPress={() => handleNavigation("/Home/ProMarketplace")}
          >
            <MaterialIcons name="explore" size={16} color="#1e40af" />
            <Text style={{
              color: '#1e40af',
              fontWeight: '600',
              fontSize: 14,
              marginLeft: 8,
            }}>
              Explore {availableProCourses.length} More Course{availableProCourses.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 9999,
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
          }}>
            <MaterialIcons name="celebration" size={16} color="#ffffff" />
            <Text style={{
              color: '#ffffff',
              fontWeight: '600',
              marginLeft: 8,
            }}>
              All Courses Unlocked!
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Default Pro Promotion State - Using inline styles
  return (
    <View style={{
      backgroundColor: '#2563eb',
      borderRadius: 24,
      padding: 20,
      marginBottom: 24,
    }}>
      <Text style={{
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
      }}>
        Noteswift Pro
      </Text>
      <Text style={{
        color: '#ffffff',
        fontSize: 16,
        marginBottom: 16,
        lineHeight: 24,
      }}>
        Unlock premium classes, videos, notes and exclusive resources.
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          backgroundColor: '#ffffff',
          paddingHorizontal: 20,
          paddingVertical: 8,
          borderRadius: 9999,
          alignSelf: 'flex-start',
        }}
        onPress={() => handleNavigation("/Home/NoteswiftProDetail")}
      >
        <Text style={{
          color: '#2563eb',
          fontWeight: '600',
        }}>
          Learn More
        </Text>
      </TouchableOpacity>
    </View>
  );
}