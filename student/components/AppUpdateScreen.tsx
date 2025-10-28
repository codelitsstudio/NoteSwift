// import React from 'react';
// import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';

// export default function UpdateModal() {

//   return (
//       <Modal
//           visible={true}
//           animationType="fade"
//           presentationStyle="overFullScreen"
//           statusBarTranslucent={true}
//         >
//           <View className="flex-1 bg-white justify-between">
//             {/* Background decorative circles */}
//             <View className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-30" style={{ transform: [{ translateX: 100 }, { translateY: -100 }] }} />
//             <View className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full opacity-40" style={{ transform: [{ translateX: -150 }, { translateY: 150 }] }} />
            
//             {/* Content */}
//             <View className="flex-1 justify-center items-start px-8">
//               {/* App Icon */}
//               <View className="mb-4 items-start w-full">
//                 <Image
//                   source={require('../assets/images/logo1.png')}
//                   className="w-40 h-40"
//                 />
//               </View>
    
//               {/* Title */}
//               <Text className="text-3xl font-bold text-gray-900 mb-6 px-4 text-left w-full">
// Update your application to latest version.
//               </Text>
    
//               {/* Subtitle */}
//               <Text className="text-base text-gray-600 leading-6 px-4 mb-2 text-left w-full">
// A newer, improved version of the app is available! Update now from the Play Store to enjoy better performance, new features, and a smoother overall experience.              </Text>
              
              
//               {/* Update Button - moved just below subtitle */}
//               <View className="w-full px-8 mt-8">
//                 <TouchableOpacity
              
//                   className="bg-blue-500 rounded-full py-4 items-center"
//                   activeOpacity={0.8}
//                 >
//                   <Text className="text-white font-semibold text-base">
// Update                  
// </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//   );
// }