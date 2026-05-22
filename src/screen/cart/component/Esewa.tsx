// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Text,
//   TouchableOpacity,
// } from "react-native";
// import EsewaIcon from "~/assets/images/icon/EsewaIcon";

// // Types only — no runtime import from expo-modules-core
// import type { EsewaPaymentResult } from "~/modules/src/Esewa.types";

// const Esewa = () => {
//   const [initialized, setInitialized] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [available, setAvailable] = useState(false);
//   const [module, setModule] = useState<any>(null);

//   useEffect(() => {
//     let mounted = true;

//     // Dynamically import the module AFTER app has fully initialized
//     const loadModule = async () => {
//       try {
//         // Use dynamic import to defer loading
//         const { default: EsewaModule } = await import("~/modules/src/EsewaModule");

//         if (!mounted) return;

//         // Check if module is available
//         if (EsewaModule.isAvailable) {
//           setModule(EsewaModule);
//           setAvailable(true);

//           const result = await EsewaModule.init(
//             "JB0BBQ4aD0UqIThFJwAKBgAXEUkEGQUBBAwdOgABHD4DChwUAB0R",
//             "BhwIWQQADhIYSxILExMcAgFXFhcOBwAKBgAXEQ==",
//             __DEV__ ? "test" : "production",
//           );
//           console.log(result);
//           setInitialized(true);
//         } else {
//           setAvailable(false);
//         }
//       } catch (error) {
//         console.error("Esewa module load failed", error);
//         setAvailable(false);
//       }
//     };

//     // Defer module loading to next tick to ensure RN bridge is ready
//     setTimeout(loadModule, 100);

//     return () => { mounted = false; };
//   }, []);

//   const handlePayment = async () => {
//     if (!module || !initialized) {
//       Alert.alert("Not Initialized", "Please wait for eSewa to initialise");
//       return;
//     }

//     setLoading(true);
//     try {
//       const paymentResult: EsewaPaymentResult = await module.makePayment(
//         "100",
//         "Test Product",
//         "prod123",
//         "https://your-callback-url.com",
//       );

//       console.log("Payment success", paymentResult);
//       Alert.alert(
//         "Payment Successful",
//         `Transaction ID: ${paymentResult.data?.transactionId}`,
//       );
//     } catch (error: any) {
//       console.log("Payment failed", error);
//       Alert.alert(
//         "Payment Failed",
//         error.code || error.message || "Unknown error",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!available) {
//     return (
//       <TouchableOpacity
//         disabled={true}
//         className="flex-1 flex-row items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-3 opacity-50"
//       >
//         <Text className="text-x font-semibold text-gray-400">ESEWA</Text>
//       </TouchableOpacity>
//     );
//   }

//   return (
//     <TouchableOpacity
//       onPress={handlePayment}
//       disabled={loading || !initialized}
//       className="flex-1 flex-row items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-3"
//     >
//       {!initialized ? (
//         <ActivityIndicator size="small" color="#000" />
//       ) : (
//         <EsewaIcon />
//       )}
//       <Text className="text-x font-semibold text-gray-700">ESEWA</Text>
//     </TouchableOpacity>
//   );
// };

// export default Esewa;
import React from "react";
import { Text, View } from "react-native";

const Esewa = () => {
  return (
    <View>
      <Text>Esewa</Text>
    </View>
  );
};

export default Esewa;
