import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Component } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import DisplayImage from "../src/views/display";

export default class SettingScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      submitted: false,
      userData: "",
    };

    this.Logout = this.Logout.bind(this);
  }

  componentDidMount() {
    this.userData();
  }
  userData = async () => {
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");
    const userID = await AsyncStorage.getItem("whatsthat_user_id");
    console.log(userID);

    return fetch("http://localhost:3333/api/1.0.0/user/" + userID, {
      headers: {
        "X-Authorization": sessionToken,
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          userData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  Logout = async () => {
    console.log("logout");

    return fetch("http://localhost:3333/api/1.0.0/logout", {
      method: "POST",
      headers: {
        "X-Authorization": await AsyncStorage.getItem(
          "whatsthat_session_token"
        ),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          await AsyncStorage.removeItem("whatsthat_session_token");
          await AsyncStorage.removeItem("whatsthat_user_id");
          this.props.navigation.navigate("Signin");
        } else if (response.status === 401) {
          console.log("Unauthorized");
          await AsyncStorage.removeItem("whatsthat_session_token");
          await AsyncStorage.removeItem("whatsthat_user_id");
          this.props.navigation.navigate("Signin");
        } else {
          throw "Something went wrong";
        }
      })
      .catch((error) => {
        this.setState = { error: error };
        this.setState = { submitted: false };
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <DisplayImage />
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Profile")}
          >
            <View>
              <Text style={styles.name}>
                {this.state.userData.first_name} {this.state.userData.last_name}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={this.Logout}>
          <View>
            <Text style={styles.text}>LOGOUT</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  button: {
    backgroundColor: "red",
    height: 50,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 50,
    left: "25%",
    borderRadius: 25,
  },
  text: {
    color: "white",
    fontSize: 18,
  },
});
