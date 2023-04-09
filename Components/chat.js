import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/FontAwesome";

class ChatListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatID: "",
      newChat: "",
      updateName: "",
      isAddUserModalVisible: false,
      isEditUserModalVisible: false,
      chatData: [],
    };
    this.onChatPress = this.onChatPress.bind(this);
  }

  componentDidMount() {
    this.getAllChats();
  }

  async getAllChats() {
    return fetch("http://localhost:3333/api/1.0.0/chat", {
      headers: {
        "X-Authorization": await AsyncStorage.getItem(
          "whatsthat_session_token"
        ),
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          isLoading: false,
          chatData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async createNewChat() {
    return fetch("http://localhost:3333/api/1.0.0/chat", {
      method: "POST",
      headers: {
        "X-Authorization": await AsyncStorage.getItem(
          "whatsthat_session_token"
        ),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: this.state.newChat,
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.getAllChats();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async updateChatName() {
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");
    console.log(this.state.chatID);

    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.chatID, {
      method: "PATCH",
      headers: {
        "X-Authorization": sessionToken,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: this.state.updateName,
      }),
    })
      .then((responseJson) => {
        console.log(responseJson);
        this.getAllChats();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  //   async createNewChat() {
  //     return fetch("http://localhost:3333/api/1.0.0/chat", {
  //       method: "POST",
  //       headers: {
  //         "X-Authorization": await AsyncStorage.getItem(
  //           "whatsthat_session_token"
  //         ),
  //       },
  //     })
  //       .then((response) => response.json())
  //       .then((responseJson) => {
  //         console.log(responseJson);
  //         this.setState({
  //           isLoading: false,
  //           chatData: responseJson,
  //         });
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   }

  onChatPress(chat) {
    console.log("clicked");
    this.props.navigation.navigate("ChatScreen", { chat });
  }

  renderChatItem(chat) {
    return (
      <TouchableOpacity onPress={() => this.onChatPress(chat)}>
        <View style={styles.chatItem}>
          <Image style={styles.avatar} source={chat.avatar} />
          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>{chat.name}</Text>
            <Text style={styles.lastMessage}>{chat.last_message.message}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              this.setState({ updateName: chat.name, chatID: chat.chat_id })
            }
          >
            <Icon name="edit" size={24} color="grey" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const { isAddUserModalVisible } = this.state;

    return (
      <View style={styles.container}>
        <View style={headerStyle}>
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}
            style={{ padding: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={headerTextStyle}>All Chats</Text>
          <TouchableOpacity
            onPress={() => this.setState({ isAddUserModalVisible: true })}
          >
            <Icon
              name="plus"
              size={24}
              color="white"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>

        <Modal
          visible={this.state.updateName !== ""}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Chat Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new chat name"
                value={this.state.updateName}
                onChangeText={(text) => this.setState({ updateName: text })}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "green" }]}
                  onPress={() => this.updateChatName()}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "red" }]}
                  onPress={() => this.setState({ updateName: "" })}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isAddUserModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New Chat</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Chat Name"
                onChangeText={(newChat) => this.setState({ newChat })}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => this.createNewChat()}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => this.setState({ isAddUserModalVisible: false })}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          data={this.state.chatData}
          renderItem={({ item }) => this.renderChatItem(item)}
          keyExtractor={(item) => item.chat_id}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  lastMessage: {
    fontSize: 16,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
});
const headerStyle = {
  height: 50,
  backgroundColor: "#075e54",
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

export default ChatListScreen;