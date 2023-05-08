import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import DisplayImage from "../src/views/display";
import Toast from "react-native-toast-message";

export default class SettingScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      submitted: false,
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

    this.Logout = this.Logout.bind(this);
  }

  componentDidMount() {
    this.userData();
  }

  componentDidMount() {
    this.userData();
  }

  userData = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem(
        "whatsthat_session_token"
      );
      const userID = await AsyncStorage.getItem("whatsthat_user_id");
      console.log(userID);

      const response = await fetch(
        `http://localhost:3333/api/1.0.0/user/${userID}`,
        {
          headers: {
            "X-Authorization": sessionToken,
          },
        }
      );

      if (response.status === 200) {
        const responseJson = await response.json();
        console.log("hii");
        console.log(responseJson);
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
          type: "error",
          text1: "Error",
          text2: "Unauthorized",
        });
        throw "Unauthorized";
      } else if (response.status === 404) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Sorry User Not Found",
        });
        throw "Sorry User Not Found";
      } else if (response.status === 500) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "something went wrong",
        });
        throw "something went wrong";
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  updateData = async () => {
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");
    const userID = await AsyncStorage.getItem("whatsthat_user_id");
    console.log(userID);

    const toSend = {};
    if (this.state.firstname != this.state.origfirstname) {
      toSend.first_name = this.state.firstname;
    }
    if (this.state.lastname != this.state.origlastname) {
      toSend.last_name = this.state.lastname;
    }
    if (this.state.email != this.state.origemail) {
      toSend.email = this.state.email;
    }
    if (this.state.password != this.state.origpassword) {
      toSend.password = this.state.password;
    }

    if (!(this.state.firstname && this.state.lastname)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter valid firstname and passwrod",
      });
      return;
    }

    console.log(JSON.stringify(toSend));

    return fetch(`http://localhost:3333/api/1.0.0/user/${userID}`, {
      method: "PATCH",
      headers: {
        "X-Authorization": sessionToken,
        "content-type": "application/json",
      },
      body: JSON.stringify(toSend),
    })
      .then((response) => {
        if (response.status === 200) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Successfully Updated",
          });
          this.userData();
        } else if (response.status === 400) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Your password is weak, please try again",
          });
          throw "Weak Password";
        } else if (response.status === 401) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Unauthorized",
          });
          throw "Unauthorized";
        } else if (response.status === 403) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Forbidden",
          });
          throw "Forbidden";
        } else if (response.status === 404) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Sorry Contact Not Found",
          });
          throw "Sorry Contact Not Found";
        } else if (response.status === 500) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Server Error",
          });
          throw "Server Error";
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "something went wrong",
          });
          throw "something went wrong";
        }
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
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Successfully Logged Out",
          });
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
        this.setState = { error };
        this.setState = { submitted: false };
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
          </TouchableOpacity>
          <View>
            <Text style={styles.name}>
              {this.state.userData.first_name} {this.state.userData.last_name}
            </Text>
          </View>
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
    backgroundColor: "#20B2AA",
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
    backgroundColor: "Grey",
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
    color: "Black",
    fontSize: 18,
  },
});

//   render() {
//     return (
//       <View style={styles.container}>
//         <View style={styles.avatarContainer}>
//           <DisplayImage />
//           <TouchableOpacity
//             onPress={() => this.props.navigation.navigate("Profile")}
//           >
//             <View>
//               <Text style={styles.name}>
//                 {this.state.userData.first_name} {this.state.userData.last_name}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.button} onPress={this.Logout}>
//           <View>
//             <Text style={styles.text}>LOGOUT</Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 20,
//   },
//   avatarContainer: {
//     alignItems: "center",
//     marginTop: 20,
//   },
//   avatar: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//   },
//   name: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginTop: 10,
//   },
//   button: {
//     backgroundColor: "red",
//     height: 50,
//     width: "50%",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "absolute",
//     bottom: 50,
//     left: "25%",
//     borderRadius: 25,
//   },
//   text: {
//     color: "white",
//     fontSize: 18,
//   },
// });
