// pages/Home/Components/ActiveCourses.tsx
import React from 'react';
import { View, Text } from 'react-native';
import CourseCard from '../../../components/Container/CoursesCard';

type Course = {
  id: number;
  title: string;
  grade: string;
  batch: string;
  image: any;
  buttonLabel: string;
};

type Props = {
  searchQuery: string;
};

const allCourses: Course[] = [
  {
    id: 1,
    title: 'Nepali-2082',
    grade: 'With',
    batch: 'Slutions',
    image: require('../../../assets/images/notes1.png'),
    buttonLabel: 'View Now',
  },
  {
    id: 2,
    title: 'English-2082',
    grade: 'Without',
    batch: 'Solutions',
    image: require('../../../assets/images/notes1.png'),
    buttonLabel: 'View Now',
  },
    {
    id: 3,
    title: 'Science-2082',
    grade: 'With',
    batch: 'Slutions',
    image: require('../../../assets/images/notes1.png'),
    buttonLabel: 'View Now',
  },
  {
    id: 4,
    title: 'Math-2082',
    grade: 'Without',
    batch: 'Solutions',
    image: require('../../../assets/images/notes1.png'),
    buttonLabel: 'View Now',
  },
];

export default function ActiveCourses({ searchQuery }: Props) {
  const filteredCourses = allCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="pb-0 mt-2">
      {filteredCourses.length === 0 ? (
        <Text className="text-gray-500 text-center">No classes found.</Text>
      ) : (
        <View className="flex-row justify-between flex-wrap gap-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              grade={course.grade}
              batch={course.batch}
              image={course.image}
              buttonLabel={course.buttonLabel}
              onPress={() => console.log(`Pressed course ${course.id}`)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
