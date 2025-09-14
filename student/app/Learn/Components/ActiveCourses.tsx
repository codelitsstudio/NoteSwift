import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

type Props = {
  searchQuery: string;
};

export default function ActiveCourses({ searchQuery }: Props) {
  const courses: any[] = []; // empty for now

  if (courses.length === 0) {
    return (
      <View className="flex-1 justify-center items-center mb-4 mt-6">
        <Image
          source={require('../../../assets/images/classes.gif')}
          style={{ width: 160, height: 160, marginBottom: 16 }}
          contentFit="contain"
        />
        <Text className="text-lg font-semibold text-gray-800">
          No Classes Found
        </Text>
        <Text className="text-sm text-gray-500 mt-1 text-center px-4">
          Please check back later for new courses.
        </Text>
      </View>
    );
  }

  return null; // when courses exist, you’ll render them later
}







// import React from 'react';
// import { View, Text } from 'react-native';
// import CourseCard from '../../../components/Container/CoursesCard';
// import { useRouter } from 'expo-router';

// type Course = {
//   id: number;
//   title: string;
//   grade: string;
//   batch: string;
//   image: any;
//   buttonLabel: string;
//   routeName: string;
// };

// type Props = {
//   searchQuery: string;
// };

// const allCourses: Course[] = [
//   {
//     id: 1,
//     title: 'Science Class',
//     grade: 'Niru Nirmala',
//     batch: '9:00pm - 10:00pm',
//     image: require('../../../assets/images/science.png'),
//     buttonLabel: 'Notify me',
//     routeName: '/Learn/ScienceSubjectPage',
//   },
//   {
//     id: 2,
//     title: 'Maths Class',
//     grade: 'Raju Shrestha',
//     batch: '8:00pm - 9:00pm',
//     image: require('../../../assets/images/maths.avif'),
//     buttonLabel: 'Notify me',
//     routeName: '/Learn/MathSubjectPage',
//   },
// ];

// export default function ActiveCourses({ searchQuery }: Props) {
//   const router = useRouter();

//   const filteredCourses = allCourses.filter((course) =>
//     course.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <View className="pb-6 mt-2">
//       {filteredCourses.length === 0 ? (
//         <Text className="text-gray-500 text-center">No classes found.</Text>
//       ) : (
//         <View className="flex-row justify-between flex-wrap gap-3">
//           {filteredCourses.map((course) => (
//             <CourseCard
//               key={course.id}
//               title={course.title}
//               grade={course.grade}
//               batch={course.batch}
//               image={course.image}
//               buttonLabel={course.buttonLabel}
//               onPress={() => {
//                 router.push(`/Learn/ScienceSubjectPage`);
//               }}
//             />
//           ))}
//         </View>
//       )}
//     </View>
//   );
// }
