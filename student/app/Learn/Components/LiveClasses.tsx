import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

export default function LiveClasses() {
  const classes = []; // No live classes

  return (
    <View className="mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mt-6 mb-2">
        <Text className="text-[1.3rem] font-bold text-gray-900">Live Today</Text>
      </View>

      {/* Placeholder for no live classes */}
      {classes.length === 0 && (
        <View className="flex-1 justify-center items-center mt-2">
       <Image
  source={require('../../../assets/images/live-class.gif')}
  style={{ width: 190, height: 190}}
  contentFit="contain"   // Ensures proper scaling
  transition={1000}      // Smooth fade-in
/>

          <Text className="text-lg font-semibold text-gray-700">
            No classes are live today
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center px-4">
            Don&apos;t worry! New live classes will appear here as soon as they start.
          </Text>
        </View>
      )}
    </View>
  );
}




// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { useRouter } from 'expo-router';
// import LiveClassCard from '../../../components/Container/LiveClassCard';

// const classes = [
//   {
//     id: 1,
//     title: 'Basic Chemistry',
//     time: '9:00 PM - 10:00 PM',
//     teacher: 'Rabin Pandey',
//     imageUrl:
//       'https://tse1.mm.bing.net/th/id/OIP.r8OzEmyuDyDFPA64HsYQkAAAAA?w=391&h=500&rs=1&pid=ImgDetMain&o=7&rm=3',
//     isLive: true,
//   },
//   {
//     id: 2,
//     title: 'Physics Fundamentals',
//     time: '6:00 PM - 7:00 PM',
//     teacher: 'Anjana Shrestha',
//     imageUrl:
//       'https://m.media-amazon.com/images/I/51Q3eT61ilL._SY445_SX342_.jpg',
//     isLive: false,
//   },
// ];

// export default function LiveClasses() {
//   const router = useRouter();

//   return (
//     <View className="mb-4">
//       {/* Header */}
//       <View className="flex-row justify-between items-center mt-6 mb-4">
//         <Text className="text-[1.3rem] font-bold text-gray-900">Live Today</Text>
//       </View>

//       {/* Class list */}
//       {classes.map((cls) => (
//         <LiveClassCard
//           key={cls.id}
//           title={cls.title}
//           time={cls.time}
//           teacher={cls.teacher}
//           imageUrl={cls.imageUrl}
//           isLive={cls.isLive}
//           onPress={() =>
//             cls.isLive
//               ? router.push(`./Class/${cls.id.toString()}`)
//               : console.log('Notify Me clicked!')
//           }
//         />
//       ))}
//     </View>
//   );
// }