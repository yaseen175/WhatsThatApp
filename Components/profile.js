import React, { Component } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import DisplayImage from "../src/views/display";

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      origfirstname: "",
      origlastname: "",
      origemail: "",
      origpassword: "",
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      isLoading: true,
      userData: "",
    };
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
          origfirstname: responseJson.first_name,
          origlastname: responseJson.last_name,
          origemail: responseJson.email,
          origpassword: responseJson.password,
          firstname: responseJson.first_name,
          lastname: responseJson.last_name,
          email: responseJson.email,
          password: responseJson.password,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  updateData = async () => {
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");
    const userID = await AsyncStorage.getItem("whatsthat_user_id");
    console.log(userID);

    let toSend = {};
    if (this.state.firstname != this.state.origfirstname) {
      toSend["first_name"] = this.state.firstname;
    }
    if (this.state.lastname != this.state.origlastname) {
      toSend["last_name"] = this.state.lastname;
    }
    if (this.state.email != this.state.origemail) {
      toSend["email"] = this.state.email;
    }
    if (this.state.password != this.state.origpassword) {
      toSend["password"] = this.state.password;
    }

    console.log(JSON.stringify(toSend));

    return fetch("http://localhost:3333/api/1.0.0/user/" + userID, {
      method: "PATCH",
      headers: {
        "X-Authorization": sessionToken,
        "content-type": "application/json",
      },
      body: JSON.stringify(toSend),
    })
      .then((responseJson) => {
        console.log(responseJson);
        console.log("Profile Updated");
        this.userData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Camera")}
          >
            <DisplayImage style={styles.avatar} />
            {/* <Image
              source={{
                uri: "https://www.bootdey.com/img/Content/avatar/avatar6.png",
              }}
              style={styles.avatar}
            /> */}
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>First Name:</Text>
          <TextInput
            placeholder="Enter First Name"
            onChangeText={(firstname) => this.setState({ firstname })}
            value={this.state.firstname}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Last Name:</Text>
          <TextInput
            placeholder="Enter Last Name"
            onChangeText={(lastname) => this.setState({ lastname })}
            value={this.state.lastname}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Email:</Text>
          <TextInput
            placeholder="Enter Email"
            onChangeText={(email) => this.setState({ email })}
            value={this.state.email}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Password:</Text>
          <TextInput
            placeholder="Enter Password"
            onChangeText={(password) => this.setState({ password })}
            value={this.state.password}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>San Francisco, CA</Text>
        </View>
        <TouchableOpacity style={styles.updatebutton} onPress={this.updateData}>
          <View>
            <Text style={styles.text}>Update Info</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.props.navigation.navigate("Setting")}
        >
          <View>
            <Text style={styles.text}>GO BACK</Text>
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
  infoContainer: {
    marginTop: 20,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  infoValue: {
    marginTop: 5,
  },
  button: {
    backgroundColor: "blue",
    height: 50,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 50,
    left: "25%",
    borderRadius: 25,
  },
  updatebutton: {
    backgroundColor: "green",
    height: 50,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 200,
    left: "25%",
    borderRadius: 25,
  },
  text: {
    color: "white",
    fontSize: 18,
  },
});
