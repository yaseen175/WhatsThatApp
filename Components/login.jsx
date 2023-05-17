/* eslint-disable react/prop-types */
/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      error: '',
      submitted: false,
    };

    this.onPressButton = this.onPressButton.bind(this);
  }

  // navigate user to home screen if logged in
  async componentDidMount() {
    try {
      const { navigation } = this.props;

      const userId = await AsyncStorage.getItem('whatsthat_user_id');
      const sessionToken = await AsyncStorage.getItem(
        'whatsthat_session_token',
      );

      if (userId && sessionToken) {
        // After refreshing, if user logged in, navigate them to home screen.
        navigation.navigate('HomeNav');
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  // Handles the login functionality.
  onPressButton = async () => {
    const { email, password } = this.state;
    const { navigation } = this.props;

    this.setState({ submitted: true, error: '' });

    if (!(email && password)) {
      this.setState({ error: 'Must enter email and password' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.status === 200) {
        const responseJson = await response.json();
        await AsyncStorage.setItem('whatsthat_user_id', responseJson.id);
        await AsyncStorage.setItem('whatsthat_session_token', responseJson.token);

        this.setState({ submitted: false });

        navigation.navigate('HomeNav');
      } else if (response.status === 400) {
        this.setState({
          error: 'Invalid email / password supplied',
        });
      } else {
        this.setState({
          error: 'Something went wrong',
        });
        throw new Error('Something went wrong');
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  render() {
    const { navigation } = this.props;
    const {
      email, password, submitted, error,
    } = this.state;

    return (
      <View style={styles.container}>
        <ImageBackground
          source={{
            uri: 'https://www.bootdey.com/image/580x580/20B2AA/20B2AA',
          }}
          style={styles.header}
        >
          <Text style={styles.heading}>Whats That App</Text>
        </ImageBackground>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            onChangeText={(newEmail) => this.setState({ email: newEmail })}
            defaultValue={email}
          />

          {submitted && !email && (
          <Text style={styles.error}>*Email is required</Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Enter password"
            onChangeText={(newPassword) => this.setState({ password: newPassword })}
            defaultValue={password}
            secureTextEntry
          />

          {submitted && !password && (
          <Text style={styles.error}>*Password is required</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={this.onPressButton}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* outputs the error, whatever is in the errors state. */}
          {error && (
          <Text style={styles.error}>{error}</Text>
          )}

          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  error: {
    color: 'red',
    fontWeight: '900',
  },
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    width: '100%',
    height: 200,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    padding: 20,
    marginTop: 40,
    width: '90%',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  button: {
    backgroundColor: '#20B2AA',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createAccountButton: {
    marginTop: 20,
  },
  createAccountButtonText: {
    color: '#20B2AA',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
