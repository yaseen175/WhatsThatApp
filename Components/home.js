import React, { Component } from "react";
import {
  View,
  Image,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: "",
      allUsers: [],
      isLoading: false,
      photos: {}, // Store user_id to profile image mapping
      error: "",
    };

    this.handleSearch = this.handleSearch.bind(this);
  }

  async handleSearch(text) {
    this.setState({ search: text });
    if (text.length >= 3) {
      this.setState({ isLoading: true });
      const token = await AsyncStorage.getItem("whatsthat_session_token");
      fetch(`http://localhost:3333/api/1.0.0/search?q=${text}`, {
        headers: {
          "X-Authorization": token,
        },
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          // Fetch profile images for all users
          const photos = {};
          for (const user of responseJson) {
            try {
              const response = await fetch(
                `http://localhost:3333/api/1.0.0/user/${user.user_id}/photo`,
                {
                  method: "GET",
                  headers: {
                    "X-Authorization": token,
                  },
                }
              );

              if (!response.ok) {
                throw new Error("Network response was not ok");
              }

              const blob = await response.blob();
              const data = URL.createObjectURL(blob);
              console.log(data);

              photos[user.user_id] = data;
            } catch (error) {
              console.error(
                `Error fetching profile image for user ${user.user_id}:`,
                error
              );
            }
          }

          this.setState({
            isLoading: false,
            allUsers: responseJson,
            photos,
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({ isLoading: false });
        });
    } else {
      this.setState({ allUsers: [], photos: {} });
    }
  }

  addContact = async (contact) => {
    this.setState({ submitted: true, error: "" });
    console.log(contact);

    return fetch(
      "http://localhost:3333/api/1.0.0/user/" + contact + "/contact/",
      {
        method: "POST",
        headers: {
          "X-Authorization": await AsyncStorage.getItem(
            "whatsthat_session_token"
          ),
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          response.text().then((text) => {
            if (text === "Already a contact") {
              this.setState({
                error: "Already a contact",
              });
            } else {
              console.log("Successfully added");
            }
          });
        } else if (response.status === 400) {
          this.setState({
            error: "You can't add yourself as a contact",
          });
          throw "You can't add yourself as a contact";
        } else if (response.status === 401) {
          this.setState({
            error: "Unauthorized",
          });
          throw "Unauthorized";
        } else if (response.status === 404) {
          this.setState({
            error: "Sorry Contact Not Found",
          });
          throw "Sorry Contact Not Found";
        } else {
          this.setState({ error: "something went wrong" });
          throw "something went wrong";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  renderItem = ({ item }) => {
    const userId = item.user_id;

    return (
      <View style={styles.itemContainer}>
        <Image
          style={styles.image}
          source={{ uri: this.state.photos[userId] }}
        />
        <View style={styles.textContainer}>
          <Text style={styles.nameText}>
            {item.given_name}
            {"  "}
            {item.family_name}
          </Text>
          <Text style={styles.phoneText}>{item.email}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => this.addContact(userId)}>
          <Icon
            name="plus"
            size={24}
            style={{ marginRight: 10, color: "#20B2AA", fontWeight: "bold" }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.formContent}>
          <View style={styles.inputContainer}>
            <Image
              style={[styles.icon, styles.inputIcon]}
              source={{
                uri: "https://img.icons8.com/color/70/000000/search.png",
              }}
            />
            <TextInput
              style={styles.inputs}
              placeholder="Search..."
              underlineColorAndroid="transparent"
              value={this.state.query}
              onChangeText={this.handleSearch}
            />
          </View>
        </View>
        <View style={styles.errorContainer}>
          <>
            {this.state.error && (
              <Text style={styles.error}>{this.state.error}</Text>
            )}
          </>
        </View>

        {this.state.isLoading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={this.state.allUsers}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.user_id.toString()}
          />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContainer: {
    marginLeft: 16,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  phoneText: {
    fontSize: 16,
    color: "#999",
  },
  formContent: {
    flexDirection: "row",
    marginTop: 30,
  },
  inputContainer: {
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderBottomWidth: 1,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    margin: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  iconBtnSearch: {
    alignSelf: "center",
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: "#FFFFFF",
    flex: 1,
    color: "#20B2AA",
    fontSize: 12,
    fontWeight: "bold",
  },
  inputIcon: {
    marginLeft: 15,
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  error: {
    color: "red",
    fontWeight: "900",
    alignItems: "center",
  },
});

// async Search() {
//   return fetch("http://localhost:3333/api/1.0.0/search?q="+allusers+ "&search_in="++"&limit="++"&offset="+, {
//     headers: {
//       "X-Authorization": await AsyncStorage.getItem(
//         "whatsthat_session_token"
//       ),
//     },
//   })
//     .then((response) => response.json())
//     .then((responseJson) => {
//       this.setState({
//         isLoading: false,
//         contactsData: responseJson,
//       });
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }
