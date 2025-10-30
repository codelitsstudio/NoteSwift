// import React from "react";
// import { ScrollView, Text, TouchableOpacity, View } from "react-native";
// import { MaterialIcons } from '@expo/vector-icons';
// import { useRouter } from "expo-router";
// import DashboardLayout from "./components/DashboardLayout";

// function MyPackages() {
//   const router = useRouter();

//   const mockPackages = [
//     {
//       id: 'class10',
//       name: 'Class 10 Package',
//       status: 'Active',
//       startDate: '2024-09-13',
//       endDate: '2025-09-13',
//       lessons: 45,
//       completedLessons: 12
//     },
//     {
//       id: 'class11',
//       name: 'Class 11 Package',
//       status: 'Active',
//       startDate: '2024-09-13',
//       endDate: '2025-09-13',
//       lessons: 52,
//       completedLessons: 8
//     }
//   ];

//   const navigateToSection = (sectionId: string) => {
//     switch(sectionId) {
//       case 'home':
//         router.push('/ProDashboard/DashboardHome' as any);
//         break;
//       case 'history':
//         router.push('/ProDashboard/PaymentHistory' as any);
//         break;
//       case 'marketplace':
//         router.push('/ProDashboard/AddMorePackages' as any);
//         break;
//       case 'settings':
//         router.push('/ProDashboard/AccountSettings' as any);
//         break;
//     }
//   };

//   return (
//     <DashboardLayout 
//       title="My Packages" 
//       subtitle="Manage Your Packages"
//       activeSection="packages"
//     >
//       <ScrollView className="flex-1 p-6">
//         <Text className="text-xl font-bold text-gray-900 mb-6">Your Subscribed Packages</Text>
        
//         {mockPackages.map((pkg) => (
//           <View key={pkg.id} className="bg-white rounded-xl p-6 mb-4 border border-gray-200">
//             <View className="flex-row justify-between items-start mb-4">
//               <View className="flex-1">
//                 <Text className="text-xl font-bold text-gray-900">{pkg.name}</Text>
//                 <Text className="text-sm text-gray-600 mt-1">
//                   {pkg.startDate} - {pkg.endDate}
//                 </Text>
//               </View>
//               <View className="px-3 py-1 bg-blue-100 rounded-full">
//                 <Text className="text-xs text-blue-600 font-semibold">{pkg.status.toUpperCase()}</Text>
//               </View>
//             </View>

//             {/* Progress */}
//             <View className="mb-4">
//               <View className="flex-row justify-between items-center mb-2">
//                 <Text className="text-sm text-gray-700">Progress</Text>
//                 <Text className="text-sm text-blue-600 font-semibold">
//                   {pkg.completedLessons}/{pkg.lessons} lessons
//                 </Text>
//               </View>
//               <View className="w-full h-2 bg-gray-200 rounded-full">
//                 <View 
//                   className="h-2 bg-blue-500 rounded-full"
//                   style={{ width: `${(pkg.completedLessons / pkg.lessons) * 100}%` }}
//                 />
//               </View>
//             </View>

//             {/* Action Buttons */}
//             <View className="flex-row">
//               <TouchableOpacity className="flex-1 bg-blue-500 py-3 rounded-lg mr-2">
//                 <Text className="text-white text-center font-semibold">Continue Learning</Text>
//               </TouchableOpacity>
//               <TouchableOpacity className="flex-1 border border-blue-500 py-3 rounded-lg ml-2">
//                 <Text className="text-blue-500 text-center font-semibold">View Details</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))}

//         {/* Add More Button */}
//         <TouchableOpacity
//           onPress={() => navigateToSection('marketplace')}
//           className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center"
//         >
//           <MaterialIcons name="add-circle-outline" size={48} color="#9CA3AF" />
//           <Text className="text-lg font-semibold text-gray-600 mt-2">Add More Packages</Text>
//           <Text className="text-sm text-gray-500 mt-1">Expand your learning with more courses</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </DashboardLayout>
//   );
// }

// MyPackages.displayName = 'MyPackages';
// export default MyPackages;