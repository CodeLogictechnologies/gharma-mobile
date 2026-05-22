// import { Camera, MapView, MarkerView } from "@maplibre/maplibre-react-native";
// import * as Location from "expo-location";
// import React, { useEffect, useState } from "react";
// import { StyleSheet, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const map = () => {
//   const [location, setLocation] =
//     useState<Location.LocationObjectCoords | null>(null);

//   useEffect(() => {
//     getUserLocation();
//   }, []);

//   const getUserLocation = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();

//     if (status !== "granted") {
//       return;
//     }

//     const currentLocation = await Location.getCurrentPositionAsync({
//       accuracy: Location.Accuracy.High,
//     });

//     setLocation(currentLocation.coords);
//   };

//   if (!location)
//     return (
//       <>
//         <SafeAreaView style={styles.container}>
//           <Text>No Location Avilable</Text>
//         </SafeAreaView>
//       </>
//     );
//   return (
//     <SafeAreaView style={styles.container}>
//       <MapView
//         style={styles.map}
//         mapStyle="https://tiles.openfreemap.org/styles/liberty"
//       >
//         <Camera
//           // centerCoordinate={[85.324, 27.7172]}
//           centerCoordinate={[location?.longitude, location.latitude]}
//           zoomLevel={12}
//           pitch={10}
//           heading={0}
//           animationMode="flyTo"
//           animationDuration={1500}
//         />

//         {location && (
//           <MarkerView coordinate={[location?.longitude, location.latitude]}>
//             <View style={styles.userMarker}>
//               <View style={styles.userDot} />
//             </View>
//           </MarkerView>
//         )}
//       </MapView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   title: {
//     padding: 10,
//     fontSize: 16,
//     fontWeight: "600",
//   },

//   userMarker: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: "rgba(0,122,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   userDot: {
//     width: 15,
//     height: 15,
//     borderRadius: 7.5,
//     backgroundColor: "#007AFF",
//     borderWidth: 2,
//     borderColor: "white",
//   },
// });

// export default map;

import { View } from "react-native";

export default function MapScreen() {
  return <View />;
}
