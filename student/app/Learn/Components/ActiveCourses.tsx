import React from 'react';
import { View, Text } from 'react-native';
import CourseCard from '../../../components/Container/CoursesCard';
import { useRouter } from 'expo-router';

type Course = {
  id: number;
  title: string;
  grade: string;
  batch: string;
  image: any;
  buttonLabel: string;
  routeName: string;  // Add routeName here
};

type Props = {
  searchQuery: string;
};

const allCourses: Course[] = [
  {
    id: 1,
    title: 'Science Class',
    grade: 'Niru Nirmala',
    batch: '9:00pm - 10:00pm',
    image: require('../../../assets/images/science.png'),
    buttonLabel: 'Join Now',
    routeName: '/Learn/ScienceSubjectPage',
  },
  {
    id: 2,
    title: 'Maths Class',
    grade: 'Raju Shrestha',
    batch: '8:00pm - 9:00pm',
    image: require('../../../assets/images/maths.avif'),
    buttonLabel: 'Join Now',
    routeName: '/Learn/MathSubjectPage',
  },
];

export default function ActiveCourses({ searchQuery }: Props) {
  const router = useRouter();

  const filteredCourses = allCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="pb-6 mt-2">
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
              onPress={() => {
                router.push(course.routeName as any);
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
