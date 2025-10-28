import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

// Demo live classes - Set to empty array to show "no classes" state
const demoClasses: {
  id: string;
  title: string;
  teacher: string;
  subject: string;
  time: string;
  duration: string;
  isLive: boolean;
  participants: number;
}[] = [];

// Export function to check if there are live classes
export const hasLiveClasses = () => demoClasses.length > 0;

const LiveClassCard = ({ 
  item, 
  isLast, 
  onJoinPress 
}: { 
  item: any; 
  isLast?: boolean; 
  onJoinPress: (item: any) => void 
}) => {
  const handlePress = () => {
    if (item.isLive) {
      onJoinPress(item);
    }
  };

  return (
    <View className="mb-1 items-center">
      {/* Class Title & Info - Outside the card */}
      <View className="mb-1.5 w-full">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center">
            <MaterialIcons 
              name={item.isLive ? "fiber-manual-record" : "schedule"} 
              size={14} 
              color={item.isLive ? "#EF4444" : "#9CA3AF"} 
            />
            <Text className={`ml-1 text-xs font-semibold ${item.isLive ? 'text-red-500' : 'text-gray-500'}`}>
              {item.isLive ? 'Live Now' : 'Upcoming'}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">{item.time}</Text>
        </View>
        
        <Text className="text-base font-bold text-gray-900 mb-1">
          {item.title}
        </Text>
        
        <Text className="text-xs text-gray-500">
          {item.teacher} • {item.subject}
        </Text>
      </View>

      {/* Card */}
      <TouchableOpacity
        className="bg-white rounded-2xl pt-4 px-4 pb-4 border border-gray-200 w-full"
        activeOpacity={0.85}
        onPress={handlePress}
        disabled={!item.isLive}
      >
        {/* Duration and participants */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <MaterialIcons name="access-time" size={16} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-1">{item.duration}</Text>
          </View>
          {item.isLive && (
            <View className="flex-row items-center">
              <MaterialIcons name="people" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-1">{item.participants} joined</Text>
            </View>
          )}
        </View>

        {/* Join/Notify button */}
        <View className="mt-2 pt-3 border-t border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-900 text-xs font-medium">
              {item.isLive ? 'Join Live Class' : 'Get Notified'}
            </Text>
            <View className={`${item.isLive ? 'bg-red-500' : 'bg-gray-400'} px-4 py-1.5 rounded-full`}>
              <Text className="text-white text-xs font-semibold">
                {item.isLive ? 'Join Now' : 'Notify Me'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

interface LiveClassesProps {
  onJoinPress?: (item: any) => void;
}

export default function LiveClasses({ onJoinPress }: LiveClassesProps) {
  const classes = demoClasses;

  const handleJoinPress = (item: any) => {
    if (onJoinPress) {
      onJoinPress(item);
    }
  };

  return (
    <View className="mb-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mt-6 mb-6">
          <Text className="text-xl font-bold text-gray-900">Live Today</Text>
        </View>

        {/* Classes list */}
        {classes.length > 0 ? (
          <>
            {classes.map((item, index) => {
              const isLast = index === classes.length - 1;
              return (
                <React.Fragment key={item.id}>
                  <View className="px-3">
                    <LiveClassCard item={item} isLast={isLast} onJoinPress={handleJoinPress} />
                  </View>
                {/* Divider */}
                {!isLast && (
                  <View className="flex-row items-center my-4">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-3 text-xs text-gray-400 font-medium">•</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </>
      ) : (
        <View className="flex-1 justify-center items-center mt-2">
          <Image
            source={require('../../../assets/images/live-class.gif')}
            style={{ width: 190, height: 190}}
            contentFit="contain"
            transition={1000}
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