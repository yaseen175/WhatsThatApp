/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';

import * as EmailValidator from 'email-validator';

export default class SignUpScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      error: '',
      submitted: false,
    };

    this.onPressButton = this.onPressButton.bind(this);
  }

  // Checks validation, sends user information to api and gets response.
  onPressButton() {
    const {
      email, password, firstName, lastName,
    } = this.state;
    const { navigation } = this.props;

    this.setState({ submitted: true, error: '' });

    if (!(email && password)) {
      this.setState({ error: 'Must enter email and password' });
      return;
    }

    if (!EmailValidator.validate(email)) {
      this.setState({ error: 'Must enter valid email' });
      return;
    }

    if (!(firstName && lastName)) {
      this.setState({ error: 'Must enter firstname and lastname' });
      return;
    }

    const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!PASSWORD_REGEX.test(password)) {
      this.setState({
        error:
          "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
      });
      return;
    }

    fetch('http://localhost:3333/api/1.0.0/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
    })
      .then((response) => {
        if (response.status === 201) {
          navigation.navigate('Signin');
        } else if (response.status === 400) {
          this.setState({ error: 'Email Already Exists' });
          throw new Error('failed validation');
        } else {
          this.setState({ error: 'Something went wrong' });
          throw new Error('something went wrong'); // Throwing an Error object instead of string
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  render() {
    const {
      email, password, firstName, lastName, submitted, error,
    } = this.state;
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <ImageBackground
          source={{
            uri: 'https://www.bootdey.com/image/580x580/20B2AA/20B2AA',
          }}
          style={styles.header}
        >
          <View>
            <Text style={styles.heading}>Whats That App</Text>
          </View>
        </ImageBackground>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            onChangeText={(newFirstName) => this.setState({ firstName: newFirstName })}
            defaultValue={firstName}
          />

          {submitted && !firstName && (
          <Text style={styles.error}>*First name is required</Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            onChangeText={(newLastName) => this.setState({ lastName: newLastName })}
            defaultValue={lastName}
          />

          {submitted && !lastName && (
          <Text style={styles.error}>*Last name is required</Text>
          )}

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
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          {error && (
          <Text style={styles.error}>{error}</Text>
          )}

          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate('Signin')}
          >
            <Text style={styles.createAccountButtonText}>
              Already Have An Account?
            </Text>
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
