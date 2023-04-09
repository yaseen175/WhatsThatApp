import React from "react";
import {
  Camera,
  CameraType,
  onCameraReady,
  CameraPictureOptions,
} from "expo-camera";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default class CameraTakePicture extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type: CameraType.back,
      permission: null,
      camera: null,
    };

    this.toggleCameraType = this.toggleCameraType.bind(this);
    this.takePhoto = this.takePhoto.bind(this);
    this.setCamera = this.setCamera.bind(this);
  }

  async componentDidMount() {
    const permission = await Camera.getPermissionsAsync();
    this.setState({ permission });
  }

  setCamera(ref) {
    this.setState({ camera: ref });
  }

  toggleCameraType() {
    this.setState((prevState) => ({
      type:
        prevState.type === CameraType.back ? CameraType.front : CameraType.back,
    }));
    console.log("Camera: ", this.state.type);
  }

  async takePhoto() {
    if (this.state.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.state.camera.takePictureAsync(options);

      console.log(data.uri);
    }
  }

  render() {
    const { permission, type } = this.state;

    if (!permission || !permission.granted) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={styles.container}>
          <Camera
            style={styles.camera}
            type={type}
            onCameraReady={this.setCamera}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={this.toggleCameraType}
              >
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={this.takePhoto}>
                <Text style={styles.text}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
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
