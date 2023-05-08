/* eslint-disable react/prop-types */
/* eslint-disable no-throw-literal */
/* eslint-disable consistent-return */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable quotes */
import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

import * as EmailValidator from "email-validator";

export default class SignUpScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      error: "",
      submitted: false,
    };

    this.onPressButton = this.onPressButton.bind(this);
  }

  onPressButton() {
    this.setState({ submitted: true });
    this.setState({ error: "" });

    if (!(this.state.email && this.state.password)) {
      this.setState({ error: "Must enter email and password" });
      return;
    }

    if (!EmailValidator.validate(this.state.email)) {
      this.setState({ error: "Must enter valid email" });
      return;
    }

    if (!(this.state.firstName && this.state.lastName)) {
      this.setState({ error: "Must enter firstname and lastname" });
      return;
    }

    const PASSWORD_REGEX = new RegExp(
      "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    );
    if (!PASSWORD_REGEX.test(this.state.password)) {
      this.setState({
        error:
          "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
      });
      return;
    }

    console.log(`Button clicked: ${this.state.email} ${this.state.password}`);

    return fetch("http://localhost:3333/api/1.0.0/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: this.state.firstName,
        last_name: this.state.firstName,
        email: this.state.email,
        password: this.state.password,
      }),
    })
      .then((response) => {
        if (response.status === 201) {
          console.log("User created with ID: ", response);
          this.props.navigation.navigate("Signin");
        } else if (response.status === 400) {
          this.setState({ error: "Email Already Exists" });
          throw "failed validation";
        } else {
          this.setState({ error: "something went wrong" });
          throw "something went wrong";
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={{
            uri: "https://www.bootdey.com/image/580x580/20B2AA/20B2AA",
          }}
          style={styles.header}
        >
          <Text style={styles.heading}>Whats That App</Text>
        </ImageBackground>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            onChangeText={(firstName) => this.setState({ firstName })}
            defaultValue={this.state.firstName}
          />

          <>
            {this.state.submitted && !this.state.firstName && (
              <Text style={styles.error}>*First name is required</Text>
            )}
          </>
          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            onChangeText={(lastName) => this.setState({ lastName })}
            defaultValue={this.state.lastName}
          />

          <>
            {this.state.submitted && !this.state.lastName && (
              <Text style={styles.error}>*Last name is required</Text>
            )}
          </>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            onChangeText={(email) => this.setState({ email })}
            defaultValue={this.state.email}
          />

          <>
            {this.state.submitted && !this.state.email && (
              <Text style={styles.error}>*Email is required</Text>
            )}
          </>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            onChangeText={(password) => this.setState({ password })}
            defaultValue={this.state.password}
            secureTextEntry
          />

          <>
            {this.state.submitted && !this.state.password && (
              <Text style={styles.error}>*Password is required</Text>
            )}
          </>

          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordButtonText}>Forgot?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={this.onPressButton}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <>
            {this.state.error && (
              <Text style={styles.error}>{this.state.error}</Text>
            )}
          </>

          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate("Signin")}
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
    color: "red",
    fontWeight: "900",
  },
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 20,
    width: "100%",
    height: 200,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  forgotPasswordButton: {
    width: "100%",
    textAlign: "flex-end",
  },
  forgotPasswordButtonText: {
    color: "#20B2AA",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    padding: 20,
    marginTop: 40,
    width: "90%",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: "100%",
  },
  button: {
    backgroundColor: "#20B2AA",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  createAccountButton: {
    marginTop: 20,
  },
  createAccountButtonText: {
    color: "#20B2AA",
    fontSize: 12,
    fontWeight: "bold",
  },
});
