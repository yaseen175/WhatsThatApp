import { Camera, CameraType } from "expo-camera";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
    console.log("Camera: ", type);
  }

  if (!permission || !permission.granted) {
    return <Text>No access to camera</Text>;
  } else {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} type={type}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    alignSelf: "flex-end",
    padding: 5,
    margin: 5,
    backgroundColor: "steelblue",
  },
  button: {
    width: "100%",
    height: "100%",
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ddd",
  },
});
