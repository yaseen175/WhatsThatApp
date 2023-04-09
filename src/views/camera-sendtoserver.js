import {
  Camera,
  CameraType,
  onCameraReady,
  CameraPictureOptions,
} from "expo-camera";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CameraSendToServer() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
    console.log("Camera: ", type);
  }

  async function takePhoto() {
    if (camera) {
      const options = {
        quality: 0.5,
        base64: true,
        onPictureSaved: (data) => sendToServer(data),
      };
      const data = await camera.takePictureAsync(options);
    }
  }

  async function sendToServer(data) {
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");
    const userID = await AsyncStorage.getItem("whatsthat_user_id");
    console.log("HERE", data.uri);
    console.log(userID);

    let res = await fetch(data.uri);
    let blob = await res.blob();

    return fetch("http://localhost:3333/api/1.0.0/user/" + userID + "/photo", {
      method: "POST",
      headers: {
        "X-Authorization": sessionToken,
        "content-type": "image/png",
      },
      body: blob,
    })
      .then((responseJson) => {
        console.log(responseJson);
        console.log("Picture added");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  if (!permission || !permission.granted) {
    return <Text>No access to camera</Text>;
  } else {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.text}>Take Photo</Text>
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
