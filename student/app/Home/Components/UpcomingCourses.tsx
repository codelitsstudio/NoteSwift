// pages/Home/Components/UpcomingCourses.tsx
import React from 'react';
import { View } from 'react-native';
import CourseCard from '../../../components/Container/CoursesCard';

const courses = [
  {
    id: 1,
    title: 'Science Class',
    grade: 'Niru Nirmala',
    batch: '9:00pm - 10:00pm',
    image: require('../../../assets/images/science.png'),
    buttonLabel: 'Notify',
  },
  {
    id: 2,
    title: 'Maths Class',
    grade: 'Raju Shrestha',
    batch: '8:00pm - 9:00pm',
    image: require('../../../assets/images/maths.avif'),
    buttonLabel: 'Notify',
  },
  {
    id: 3,
    title: 'Science Class',
    grade: 'Niru Nirmala',
    batch: '9:00pm - 10:00pm',
    image: require('../../../assets/images/science.png'),
    buttonLabel: 'Notify',
  },
  {
    id: 4,
    title: 'Maths Class',
    grade: 'Raju Shrestha',
    batch: '8:00pm - 9:00pm',
    image: require('../../../assets/images/maths.avif'),
    buttonLabel: 'Notify',
  },
];

export default function UpcomingCourses() {
  return (
    <View className="pb-6">
<View className="flex-row justify-between flex-wrap gap-3">
         {courses.map((course) => (
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
    </View>
  );
}
