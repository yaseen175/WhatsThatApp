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
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      newMessage: "",
      userID: null,
      isAddUserModalVisible: false,
      userToAdd: "",
      userInChatData: [],
      selectedMessage: null,
    };
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
        console.log(responseJson.creator.email);
        console.log(responseJson.messages);

        this.setState({
          messages: responseJson.messages,
          userInChatData: responseJson.members,
        });
      })
      .catch((error) => console.error(error));
  }

  componentDidMount() {
    this.getData();
  }

  async sendMessage() {
    const { chat } = this.props.route.params;
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");
    const { newMessage, userID } = this.state;

    const message = {
      message: newMessage,
    };

    return fetch(
      "http://localhost:3333/api/1.0.0/chat/" + chat.chat_id + "/message",
      {
        method: "POST",
        headers: {
          "X-Authorization": sessionToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    )
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({ newMessage: "" });
        this.getData();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async editMessage(item) {
    console.log(item);
    const { chat } = this.props.route.params;
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");

    const message = {
      message: newMessage,
    };

    return fetch(
      "http://localhost:3333/api/1.0.0/chat/" +
        chat.chat_id +
        "/message/" +
        item.message_id,
      {
        method: "PATCH",
        headers: {
          "X-Authorization": sessionToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    )
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({ newMessage: "" });
        this.getData();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async deleteMessage(item) {
    console.log(item);
    const { chat } = this.props.route.params;
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");

    return fetch(
      "http://localhost:3333/api/1.0.0/chat/" +
        chat.chat_id +
        "/message/" +
        item.message_id,
      {
        method: "DELETE",
        headers: {
          "X-Authorization": sessionToken,
        },
      }
    )
      .then((responseJson) => {
        console.log(responseJson);
        this.getData();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async AddUserToGroup() {
    const { chat } = this.props.route.params;
    return fetch(
      "http://localhost:3333/api/1.0.0/chat/" +
        chat.chat_id +
        "/user/" +
        this.state.userId,
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

  renderMessage = ({ item }) => {
    const { userID } = this.state;
    const sender = item.author.user_id;
    const messageTime = moment(item.timestamp).format("h:mm A");
    const senderMsg = parseInt(sender) === parseInt(userID);
    const messageStyle = senderMsg
      ? styles.sendMessage
      : styles.receivedMessage;
    const authorName = senderMsg
      ? "You"
      : `${item.author.first_name} ${item.author.last_name}`;
    const messageContent = item.editMode ? (
      <TextInput
        style={styles.editMessageInput}
        value={item.message}
        onChangeText={(text) => {
          item.message = text;
          this.forceUpdate();
        }}
        onSubmitEditing={() => {
          this.editMessage(item);
          item.editMode = false;
          this.forceUpdate();
        }}
      />
    ) : (
      <TouchableOpacity
        style={styles.messageWrapper}
        onLongPress={() => {
          item.editMode = true;
          this.forceUpdate();
        }}
        delayLongPress={500}
      >
        <Text style={styles.message}>{item.message}</Text>
      </TouchableOpacity>
    );
    return (
      <View style={[styles.messageContainer, messageStyle]}>
        <View style={styles.messageContent}>
          {!senderMsg && <Text style={styles.author}>{authorName}</Text>}
          {messageContent}
          <Text style={styles.time}>{messageTime}</Text>
          {item.editMode && senderMsg && (
            <View style={styles.editButtonsWrapper}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  this.editMessage(item);
                  item.editMode = false;
                  this.forceUpdate();
                }}
              >
                <Text style={styles.editButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  this.deleteMessage(item);
                  item.editMode = false;
                  this.forceUpdate();
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  render() {
    const { chat } = this.props.route.params;
    const { isAddUserModalVisible, userToAdd } = this.state;

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
          visible={isAddUserModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Existing User</Text>
              <FlatList
                data={this.state.userInChatData}
                renderItem={({ item }) => this.renderChatItem(item)}
                keyExtractor={(item) => item.user_id}
              />

              <View style={{ marginTop: 50 }}>
                <Text style={styles.modalTitle}>Add User</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter user ID"
                  onChangeText={(userId) => this.setState({ userId })}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => this.AddUserToGroup()}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    this.setState({ isAddUserModalVisible: false })
                  }
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <FlatList
          data={messages}
          renderItem={this.renderMessage}
          keyExtractor={(item) => item.message_id.toString()}
          inverted={true}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            placeholder="Type a message"
            onChangeText={(text) => this.setState({ newMessage: text })}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={this.sendMessage.bind(this)}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
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

export default ChatScreen;
