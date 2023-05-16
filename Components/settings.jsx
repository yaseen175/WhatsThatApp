/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
// import DisplayImage from './display';

export default class SettingScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      origfirstname: '',
      origlastname: '',
      origemail: '',
      origpassword: '',
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      userData: '',
      photo: null,
    };

    this.Logout = this.Logout.bind(this);
  }

  componentDidMount() {
    this.checkAndFetchChats();
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
      this.checkAndFetchChats();
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async get_profile_image() {
    const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');
    const userID = await AsyncStorage.getItem('whatsthat_user_id');

    fetch(`http://localhost:3333/api/1.0.0/user/${userID}/photo`, {
      method: 'GET',
      headers: {
        'X-Authorization': sessionToken,
      },
    })
      .then((res) => res.blob())
      .then((resBlob) => {
        const data = URL.createObjectURL(resBlob);

        this.setState({
          photo: data,
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  userData = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem(
        'whatsthat_session_token',
      );
      const userID = await AsyncStorage.getItem('whatsthat_user_id');

      const response = await fetch(
        `http://localhost:3333/api/1.0.0/user/${userID}`,
        {
          headers: {
            'X-Authorization': sessionToken,
          },
        },
      );

      if (response.status === 200) {
        const responseJson = await response.json();
        this.setState({
          userData: responseJson,
          origfirstname: responseJson.first_name,
          origlastname: responseJson.last_name,
          origemail: responseJson.email,
          origpassword: responseJson.password,
          firstname: responseJson.first_name,
          lastname: responseJson.last_name,
          email: responseJson.email,
          password: responseJson.password,
        });
      } else if (response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Unauthorized',
        });
        throw new Error('Unauthorized');
      } else if (response.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Sorry User Not Found',
        });
        throw new Error('Sorry User Not Found');
      } else if (response.status === 500) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'something went wrong',
        });
        throw new Error('something went wrong');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  updateData = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem(
        'whatsthat_session_token',
      );
      const userID = await AsyncStorage.getItem('whatsthat_user_id');

      const {
        firstname,
        origfirstname,
        lastname,
        origlastname,
        email,
        origemail,
        password,
        origpassword,
      } = this.state;

      const toSend = {};
      if (firstname !== origfirstname) {
        toSend.first_name = firstname;
      }
      if (lastname !== origlastname) {
        toSend.last_name = lastname;
      }
      if (email !== origemail) {
        toSend.email = email;
      }
      if (password !== origpassword) {
        toSend.password = password;
      }

      if (!(firstname && lastname)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Enter valid firstname and password',
        });
        return;
      }

      const response = await fetch(
        `http://localhost:3333/api/1.0.0/user/${userID}`,
        {
          method: 'PATCH',
          headers: {
            'X-Authorization': sessionToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(toSend),
        },
      );

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Successfully Updated',
        });
        await this.userData();
      } else if (response.status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Your password is weak, please try again',
        });
        throw new Error('Weak Password');
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
          text2: 'Sorry, Contact Not Found',
        });
        throw new Error('Contact Not Found');
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
    } catch (error) {
      throw new Error(error);
    }
  };

  Logout = async () => {
    const { navigation } = this.props;

    try {
      const sessionToken = await AsyncStorage.getItem(
        'whatsthat_session_token',
      );

      const response = await fetch('http://localhost:3333/api/1.0.0/logout', {
        method: 'POST',
        headers: {
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Successfully Logged Out',
        });
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');

        navigation.navigate('Signin');
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Signin');
      } else {
        throw new Error('Something went wrong');
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  async checkAndFetchChats() {
    await this.userData();
    await this.get_profile_image();
  }

  render() {
    const { navigation } = this.props;
    const {
      email, firstname, lastname, password, userData, photo,
    } = this.state;

    if (!userData) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
            <Image
              source={{
                uri: photo,
              }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 75,
              }}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.name}>
              {userData.first_name}
              {userData.last_name}
            </Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>First Name:</Text>
          <TextInput
            placeholder="Enter First Name"
            onChangeText={(newFirstname) => this.setState({ firstname: newFirstname })}
            value={firstname}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Last Name:</Text>
          <TextInput
            placeholder="Enter Last Name"
            onChangeText={(newLastname) => this.setState({ lastname: newLastname })}
            value={lastname}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Email:</Text>
          <TextInput
            placeholder="Enter Email"
            onChangeText={(newEmail) => this.setState({ email: newEmail })}
            value={email}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Password:</Text>
          <TextInput
            placeholder="Enter Password"
            onChangeText={(newPassword) => this.setState({ password: newPassword })}
            value={password}
          />
        </View>
        <TouchableOpacity style={styles.updatebutton} onPress={this.updateData}>
          <View>
            <Text style={styles.text}>Update Info</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.Logout}>
          <View>
            <Text style={styles.text}>LOGOUT</Text>
          </View>
        </TouchableOpacity>
        <Toast />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  infoValue: {
    marginTop: 5,
  },
  button: {
    backgroundColor: '#20B2AA',
    height: 50,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    left: '25%',
    borderRadius: 25,
  },
  updatebutton: {
    backgroundColor: 'Grey',
    height: 50,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 200,
    left: '25%',
    borderRadius: 25,
  },
  text: {
    color: 'Black',
    fontSize: 18,
  },
});
