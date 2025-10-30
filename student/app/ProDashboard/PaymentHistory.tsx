// import React from "react";
// import { ScrollView, Text, TouchableOpacity, View } from "react-native";
// import { MaterialIcons } from '@expo/vector-icons';
// import DashboardLayout from "./components/DashboardLayout";

// function PaymentHistory() {

//   const mockPayments = [
//     {
//       id: 'pay001',
//       date: '2024-09-13',
//       amount: 2999,
//       packages: ['Class 10 Package', 'Class 11 Package'],
//       status: 'Paid',
//       method: 'eSewa',
//       transactionId: 'ESW-2024091301'
//     },
//     {
//       id: 'pay002',
//       date: '2024-08-13',
//       amount: 999,
//       packages: ['Class 12 Package'],
//       status: 'Refunded',
//       method: 'Khalti',
//       transactionId: 'KHT-2024081301'
//     },
//     {
//       id: 'pay003',
//       date: '2024-07-13',
//       amount: 1999,
//       packages: ['Class 10 Package'],
//       status: 'Paid',
//       method: 'eSewa',
//       transactionId: 'ESW-2024071301'
//     }
//   ];

//   const getStatusColor = (status: string) => {
//     switch(status) {
//       case 'Paid':
//         return 'bg-blue-100 text-blue-600';
//       case 'Refunded':
//         return 'bg-red-100 text-red-600';
//       case 'Pending':
//         return 'bg-yellow-100 text-yellow-600';
//       default:
//         return 'bg-gray-100 text-gray-600';
//     }
//   };

//   return (
//     <DashboardLayout 
//       title="Payment History" 
//       subtitle="Transaction History"
//       activeSection="history"
//     >
//       <ScrollView className="flex-1 p-6">
//         <Text className="text-xl font-bold text-gray-900 mb-6">Transaction History</Text>
        
//         {/* Summary Cards */}
//         <View className="flex-row mb-6">
//           <View className="flex-1 bg-white rounded-xl p-4 mr-2 border border-gray-200">
//             <MaterialIcons name="payment" size={24} color="#3B82F6" />
//             <Text className="text-2xl font-bold text-gray-900 mt-2">
//               Rs {mockPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)}
//             </Text>
//             <Text className="text-sm text-gray-600">Total Paid</Text>
//           </View>
//           <View className="flex-1 bg-white rounded-xl p-4 ml-2 border border-gray-200">
//             <MaterialIcons name="receipt" size={24} color="#10B981" />
//             <Text className="text-2xl font-bold text-gray-900 mt-2">
//               {mockPayments.length}
//             </Text>
//             <Text className="text-sm text-gray-600">Transactions</Text>
//           </View>
//         </View>

//         {/* Payment List */}
//         <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</Text>
        
//         {mockPayments.map((payment) => (
//           <View key={payment.id} className="bg-white rounded-xl p-6 mb-4 border border-gray-200">
//             <View className="flex-row justify-between items-start mb-4">
//               <View className="flex-1">
//                 <Text className="text-lg font-bold text-gray-900">Rs {payment.amount}</Text>
//                 <Text className="text-sm text-gray-600 mt-1">{payment.date}</Text>
//               </View>
//               <View className={`px-3 py-1 rounded-full ${getStatusColor(payment.status)}`}>
//                 <Text className="text-xs font-semibold">{payment.status.toUpperCase()}</Text>
//               </View>
//             </View>

//             {/* Packages */}
//             <View className="mb-3">
//               <Text className="text-sm text-gray-600 mb-1">Packages:</Text>
//               {payment.packages.map((pkg, index) => (
//                 <Text key={index} className="text-sm text-gray-800">• {pkg}</Text>
//               ))}
//             </View>

//             {/* Payment Details */}
//             <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
//               <View>
//                 <Text className="text-xs text-gray-500">Payment Method</Text>
//                 <Text className="text-sm text-gray-800 font-semibold">{payment.method}</Text>
//               </View>
//               <View>
//                 <Text className="text-xs text-gray-500">Transaction ID</Text>
//                 <Text className="text-sm text-gray-800 font-mono">{payment.transactionId}</Text>
//               </View>
//             </View>

//             {/* Actions */}
//             <View className="flex-row mt-4">
//               <TouchableOpacity className="flex-1 border border-blue-500 py-2 rounded-lg mr-2">
//                 <Text className="text-blue-500 text-center text-sm font-semibold">Download Receipt</Text>
//               </TouchableOpacity>
//               {payment.status === 'Paid' && (
//                 <TouchableOpacity className="flex-1 border border-red-500 py-2 rounded-lg ml-2">
//                   <Text className="text-red-500 text-center text-sm font-semibold">Request Refund</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         ))}

//         {/* Empty State if no payments */}
//         {mockPayments.length === 0 && (
//           <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
//             <MaterialIcons name="receipt-long" size={48} color="#9CA3AF" />
//             <Text className="text-lg font-semibold text-gray-600 mt-4">No Payment History</Text>
//             <Text className="text-sm text-gray-500 mt-2 text-center">
//               Your payment transactions will appear here once you make your first purchase.
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </DashboardLayout>
//   );
// }

// PaymentHistory.displayName = 'PaymentHistory';
// export default PaymentHistory;