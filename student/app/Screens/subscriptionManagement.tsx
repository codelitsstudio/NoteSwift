// // app/Screens/subscriptionManagement.tsx
// import React from "react";
// import { View, Text, ScrollView, Pressable } from "react-native";
// import { useRouter } from "expo-router";
// import { Card } from "react-native-paper";
// import { MaterialIcons } from "@expo/vector-icons";

// function SubscriptionManagement() {
//   const router = useRouter();

//   const subscriptions = [
//     { name: "Noteswift Pro", price: "$19.00", daysLeft: "3 days left" },
//     { name: "Noteswift Plus +", price: "$24.00", daysLeft: "2 days left" },
//     { name: "Pro", price: "$24.00", daysLeft: "14 days left" },
//     { name: "Plus +", price: "$36.00", daysLeft: "11 days left" },
//   ];

//   return (
//     <ScrollView className="flex-1 bg-white px-4 pt-2">
//       {/* Header */}
//       <View className="flex-row justify-between items-center mb-6">
//         <View>
//           <Text className="text-2xl font-bold">Hi,</Text>
//           <Text className="text-3xl font-semibold text-gray-500 -mt-2">
//             Mike
//           </Text>
//         </View>
//         <View className="relative">
//           <MaterialIcons name="notifications-none" size={28} color="black" />
//           <View className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
//         </View>
//       </View>

//       {/* Virtual Card */}
//       <Card
//         style={{
//           backgroundColor: "#1a1a1a",
//           borderRadius: 20,
//           elevation: 0,
//           shadowOpacity: 0,
//         }}
//         className="mb-8"
//       >
//         <Card.Content>
//           <View className="flex-row justify-between items-center">
//             <Text className="text-white font-bold text-lg">ADRBank</Text>
//             <MaterialIcons name="refresh" size={22} color="white" />
//           </View>

//           <Text className="text-white text-3xl font-bold mt-6">$1340.50</Text>

//           <View className="mt-8">
//             <Text className="text-white font-semibold">Hillary Nevelin</Text>
//             <Text className="text-gray-300 tracking-widest">
//               8763 2736 9873 0329
//             </Text>
//             <View className="flex-row justify-between mt-2 items-center">
//               <Text className="text-gray-400">10/28</Text>
//               <View className="flex-row">
//                 <MaterialIcons name="lens" size={20} color="#eb001b" />
//                 <MaterialIcons
//                   name="lens"
//                   size={20}
//                   color="#f79e1b"
//                   style={{ marginLeft: -8 }}
//                 />
//               </View>
//             </View>
//           </View>
//         </Card.Content>
//       </Card>

//       {/* Upcoming Section */}
//       <View className="mb-8">
//         <View className="flex-row mt-4 justify-between items-center mb-2">
//           <Text className="text-lg font-bold">UPCOMING</Text>
//           <View className="px-2 py-1 rounded bg-green-100">
//             <Text className="text-green-700 font-medium">2</Text>
//           </View>
//         </View>

//         {subscriptions.slice(0, 2).map((s, i) => (
//           <Pressable
//             key={i}
//             className="flex-row justify-between py-3 border-b border-gray-200"
//             onPress={() =>
//               router.push({
//                 pathname: "/Screens/subscriptionDetail/[subscription]",
//                 params: { subscription: s.name },
//               })
//             }
//           >
//             <View>
//               <Text className="text-base font-medium">{s.name}</Text>
//               <Text className="text-gray-500 text-sm">{s.daysLeft}</Text>
//             </View>
//             <Text className="text-base font-semibold">{s.price}</Text>
//           </Pressable>
//         ))}
//       </View>

//       {/* Subscriptions Section */}
//       <View>
//         <View className="flex-row justify-between items-center mb-2">
//           <Text className="text-lg font-bold">SUBSCRIPTIONS</Text>
//           <View className="px-2 py-1 rounded bg-green-100">
//             <Text className="text-green-700 font-medium">4</Text>
//           </View>
//         </View>

//         {subscriptions.slice(2).map((s, i) => (
//           <View key={i} className="bg-gray-100 rounded-xl p-4 mb-3">
//             <Pressable
//               onPress={() =>
//                 router.push({
//                   pathname: "/Screens/subscriptionDetail/[subscription]",
//                   params: { subscription: s.name },
//                 })
//               }
//             >
//               <View className="flex-row justify-between">
//                 <Text className="text-base font-semibold">{s.name}</Text>
//                 <Text className="text-base font-semibold">{s.price}</Text>
//               </View>
//               <Text className="text-gray-500 text-sm mt-1">
//                 Due in {s.daysLeft} · Monthly
//               </Text>
//             </Pressable>

//             {/* Renew Button only for Subscriptions */}
//             <Pressable
//               onPress={() => router.push("/Screens/renewSubscription")}
//               className="mt-3 px-3 py-1 bg-blue-600 rounded-lg self-start"
//             >
//               <Text className="text-white text-xs font-medium">Renew</Text>
//             </Pressable>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// SubscriptionManagement.displayName = 'SubscriptionManagement';
// export default SubscriptionManagement;
