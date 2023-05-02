import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Component } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Modal,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";

class ChatScreenAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      allUsers: [],
      userID: null,
      userToAdd: "",
      userInChatData: [],
      photos: {},
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");
    const userID = await AsyncStorage.getItem("whatsthat_user_id");
    this.setState({ userID });

    const { chat } = this.props.route.params;
    console.log(chat);
    return fetch("http://localhost:3333/api/1.0.0/chat/" + chat.chat_id, {
      headers: {
        "X-Authorization": sessionToken,
        "content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);

        this.setState({
          messages: responseJson.messages,
          userInChatData: responseJson.members,
        });
      })
      .catch((error) => console.error(error));
  }
  async handleSearch(text) {
    this.setState({ search: text });
    if (text.length >= 3) {
      this.setState({ isLoading: true });
      const token = await AsyncStorage.getItem("whatsthat_session_token");
      fetch(
        "http://localhost:3333/api/1.0.0/search?q=" +
          text +
          "&search_in=contacts",
        {
          //   return fetch("http://localhost:3333/api/1.0.0/search?q="+allusers+ "&search_in="++"&limit="++"&offset="+, {

          headers: {
            "X-Authorization": token,
          },
        }
      )
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

  async AddUserToGroup(userid) {
    const { chat } = this.props.route.params;
    return fetch(
      "http://localhost:3333/api/1.0.0/chat/" +
        chat.chat_id +
        "/user/" +
        userid,
      {
        method: "POST",
        headers: {
          "X-Authorization": await AsyncStorage.getItem(
            "whatsthat_session_token"
          ),
        },
      }
    )
      .then((responseJson) => {
        this.getData();
        console.log("User Added");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async DeleteUserFromGroup(chatid) {
    const { chat } = this.props.route.params;
    return fetch(
      "http://localhost:3333/api/1.0.0/chat/" +
        chat.chat_id +
        "/user/" +
        chatid,
      {
        method: "DELETE",
        headers: {
          "X-Authorization": await AsyncStorage.getItem(
            "whatsthat_session_token"
          ),
        },
      }
    )
      .then((responseJson) => {
        this.getData();
        console.log("User Deleted");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  renderChatItem(item) {
    console.log("Im here");
    return (
      <View style={styles.chatItem}>
        <View style={styles.chatInfo}>
          <Text style={styles.nameText}>
            {item.first_name}
            {"  "}
            {item.last_name}
          </Text>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
        <TouchableOpacity
          onPress={() => this.DeleteUserFromGroup(chat.user_id)}
        >
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => this.AddUserToGroup(userId)}>
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
    const { allUsers, search } = this.state;

    const filteredUsers = allUsers.filter((user) =>
      user.given_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <View style={styles.container}>
        <View style={headerStyle}>
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}
            style={{ padding: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={headerTextStyle}>ADD USER</Text>
        </View>
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
              placeholder="Search user to add..."
              underlineColorAndroid="transparent"
              value={this.state.query}
              onChangeText={this.handleSearch}
            />
          </View>
        </View>
        {search ? (
          <FlatList
            data={filteredUsers}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.user_id.toString()}
          />
        ) : (
          <View style={styles.existingContainer}>
            <Text style={styles.existingHeader}>Existing Users</Text>
            <FlatList
              data={this.state.userInChatData}
              renderItem={({ item }) => this.renderChatItem(item)}
              keyExtractor={(item) => item.user_id.toString()}
            />
          </View>
        )}
      </View>
    );
  }

  //   <View style={styles.errorContainer}>
  //   <>
  //     {this.state.error && (
  //       <Text style={styles.error}>{this.state.error}</Text>
  //     )}
  //   </>
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    // padding: 20,
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
  emailText: {
    fontSize: 16,
    color: "#999",
  },
  formContent: {
    flexDirection: "row",
    marginTop: 30,
  },
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
  emailText: {
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
  existingHeader: {
    color: "#1ACB97",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  existingContainer: {
    justifyContent: "center",
  },
});
const headerStyle = {
  height: 50,
  backgroundColor: "#20B2AA",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 10,
};
const headerTextStyle = {
  color: "white",
  fontSize: 18,
  fontWeight: "bold",
};

export default ChatScreenAdd;
