// import React from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import { MaterialIcons } from '@expo/vector-icons';
// import { useRouter } from "expo-router";

// interface DashboardHeaderProps {
//   title: string;
//   onMenuPress: () => void;
//   isHome?: boolean;
// }

// export default function DashboardHeader({ title, onMenuPress, isHome = false }: DashboardHeaderProps) {
//   const router = useRouter();

//   return (
//     <View className="bg-white border-b border-gray-200 px-4 py-4">
//       <View className="flex-row items-center justify-between">
//         <TouchableOpacity
//           onPress={onMenuPress}
//           className="p-2"
//         >
//           <MaterialIcons name="menu" size={24} color="#374151" />
//         </TouchableOpacity>
        
//         <View className="flex-row items-center">
//           {isHome ? (
//             <>
//               <Text className="text-lg font-bold text-gray-900 mr-2">NoteSwift</Text>
//               <View className="bg-blue-500 px-2 py-1 rounded">
//                 <Text className="text-white text-xs font-bold">PRO</Text>
//               </View>
//             </>
//           ) : (
//             <Text className="text-lg font-bold text-gray-900">{title}</Text>
//           )}
//         </View>
        
//         <TouchableOpacity
//           onPress={() => router.push('/Home/HomePage' as any)}
//           className="p-2"
//         >
//           <MaterialIcons name="home" size={24} color="#374151" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }