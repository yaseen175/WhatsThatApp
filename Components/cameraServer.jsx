/* eslint-disable no-use-before-define */
import {
  Camera,
  CameraType,
} from 'expo-camera';
import { useState, React } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  StyleSheet, Text, TouchableOpacity, View, ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CameraSendToServer() {
  const navigation = useNavigation();
  const [type, setType] = useState(CameraType.back);
  const [permission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [photoUri, setPhotoUri] = useState('');

  function toggleCameraType() {
    setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  function cancelPreview() {
    setIsPreview(false);
  }

  async function goBack() {
    navigation.goBack();
  }

  async function sendToServer(data) {
    const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');
    const userID = await AsyncStorage.getItem('whatsthat_user_id');

    const res = await fetch(data.uri);
    const blob = await res.blob();

    return fetch(`http://localhost:3333/api/1.0.0/user/${userID}/photo`, {
      method: 'POST',
      headers: {
        'X-Authorization': sessionToken,
        'content-type': 'image/png',
      },
      body: blob,
    })
      .then((response) => {
        if (response.status === 200) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Successfully Updated',
          });
        } else if (response.status === 400) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Bad Request',
          });
          throw new Error('Bad Request');
        } else if (response.status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Unauthorized',
          });
          throw new Error('Unauthorized');
        } else if (response.status === 403) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Forbidden',
          });
          throw new Error('Forbidden');
        } else if (response.status === 404) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Sorry, Picture Not Found',
          });
          throw new Error('Picture Not Found');
        } else if (response.status === 500) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Server Error',
          });
          throw new Error('Server Error');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Something went wrong',
          });
          throw new Error('Something went wrong');
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async function takePhoto() {
    if (camera) {
      const options = {
        quality: 0.5,
        base64: true,
        onPictureSaved: (data) => sendToServer(data),
      };
      const data = await camera.takePictureAsync(options);
      setPhotoUri(data.uri);
      setIsPreview(true);
      await sendToServer(data);
    }
  }

  if (!permission || !permission.granted) {
    return (
      <View>
        <Text>No access to camera</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {isPreview ? (
        <ImageBackground source={{ uri: photoUri }} style={{ flex: 1 }}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => cancelPreview()}>
              <Text style={styles.text}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
            <Text style={styles.text}>Back</Text>
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => toggleCameraType()}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => takePhoto()}>
              <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
            <Text style={styles.text}>Back</Text>
          </TouchableOpacity>
          <Toast />
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    padding: 5,
    margin: 5,
    backgroundColor: '#20B2AA',
  },
  button: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ddd',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
    backgroundColor: '#20B2AA',
  },
});
