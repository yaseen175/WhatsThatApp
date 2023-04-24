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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      error: "",
      submitted: false,
    };

    this._onPressButton = this._onPressButton.bind(this);
  }

  _onPressButton = async () => {
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

    console.log(
      "Button clicked: " + this.state.email + " " + this.state.password
    );
    console.log("Validated and ready to send to the API");

    return fetch("http://localhost:3333/api/1.0.0/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 400) {
          this.setState({
            error: "Invalid email / password supplied",
          });
        } else {
          this.setState({
            error: "something went wrong",
          });
          throw "something went wrong";
        }
      })
      .then(async (responseJson) => {
        try {
          await AsyncStorage.setItem("whatsthat_user_id", responseJson.id);
          await AsyncStorage.setItem(
            "whatsthat_session_token",
            responseJson.token
          );

          this.setState({ submitted: false });

          this.props.navigation.navigate("HomeNav");
        } catch {
          throw "something went wrong";
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  render() {
    const navigation = this.props.navigation;

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
            secureTextEntry={true}
          />

          <>
            {this.state.submitted && !this.state.password && (
              <Text style={styles.error}>*Password is required</Text>
            )}
          </>

          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordButtonText}>Forgot?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={this._onPressButton}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <>
            {this.state.error && (
              <Text style={styles.error}>{this.state.error}</Text>
            )}
          </>

          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate("Signup")}
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
