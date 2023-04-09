import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from "react-native";

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: "https://www.bootdey.com/image/580x580/20B2AA/20B2AA" }}
        style={styles.header}
      >
        <Text style={styles.heading}>My Awesome App</Text>
      </ImageBackground>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Email" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
        />

        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordButtonText}>Forgot?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createAccountButton}>
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default LoginScreen;
