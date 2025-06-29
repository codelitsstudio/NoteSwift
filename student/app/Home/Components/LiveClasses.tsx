// components/Container/LiveClasses.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import LiveClassCard from '../../../components/Container/LiveClassCard';

const classes = [
  {
    id: 1,
    title: 'Basic Chemistry',
    time: '9:00 PM - 10:00 PM',
    teacher: 'Rabin Pandey',
    imageUrl:
      'https://tse1.mm.bing.net/th/id/OIP.r8OzEmyuDyDFPA64HsYQkAAAAA?w=391&h=500&rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    id: 2,
    title: 'Physics Fundamentals',
    time: '6:00 PM - 7:00 PM',
    teacher: 'Anjana Shrestha',
    imageUrl:
      'https://m.media-amazon.com/images/I/51Q3eT61ilL._SY445_SX342_.jpg',
  },
];

export default function LiveClasses() {
  const router = useRouter();

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-gray-900">Live Classes</Text>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text className="text-base text-blue-500 font-medium">View More</Text>
        </TouchableOpacity>
      </View>

      {classes.map((cls) => (
        <LiveClassCard
          key={cls.id}
          title={cls.title}
          time={cls.time}
          teacher={cls.teacher}
          imageUrl={cls.imageUrl}
          onPress={() => router.push(`./Class/${cls.id.toString()}`)}
        />
      ))}
    </View>
  );
}
