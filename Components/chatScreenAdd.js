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
      messages: [],
      search: "",
      newMessage: "",
      allUsers: [],
      userID: null,
      ModalVisible: false,
      userToAdd: "",
      userInChatData: [],
      selectedMessage: null,
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

  renderChatItem(chat) {
    console.log("Im here");
    console.log(chat);
    return (
      <View style={styles.chatItem}>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{chat.first_name}</Text>
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
          <Text style={styles.phoneText}>{item.email}</Text>
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
    const { chat } = this.props.route.params;

    const { messages, newMessage } = this.state;
    return (
      <View style={styles.container}>
        <View style={headerStyle}>
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}
            style={{ padding: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={headerTextStyle}>{chat.name}</Text>
        </View>
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
          <Text style={styles.modalTitle}>Existing User</Text>
          <FlatList
            data={this.state.userInChatData}
            renderItem={({ item }) => this.renderChatItem(item)}
            keyExtractor={(item) => item.user_id}
          />
        </SafeAreaView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  messageContainer: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
  },
  sendMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C5",
  },
  receivedMessage: {
    backgroundColor: "#FFF",
  },
  author: {
    fontSize: 12,
    marginBottom: 2,
    color: "#666",
  },
  message: {
    fontSize: 16,
    color: "#000",
  },
  time: {
    fontSize: 10,
    color: "#999",
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0084FF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  sendButtonText: {
    fontSize: 16,
    color: "#FFF",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "#075e54",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
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
  phoneText: {
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
