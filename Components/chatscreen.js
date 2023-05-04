import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Component } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import Modal from "react-native-modal";

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      search: "",
      newMessage: props.route.params.message || "",
      allUsers: [],
      userID: null,
      ModalVisible: false,
      userToAdd: "",
      userInChatData: [],
      selectedMessage: null,
      photos: {},
      showDraftsModal: false,
      drafts: [],
      editMode: false,
      draftToEdit: null,
    };
  }

  componentDidMount() {
    this.getData();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.showDraftsModal !== prevState.showDraftsModal) {
      const drafts = await this.getDrafts();
      this.setState({ drafts });
    }
  }

  async saveDraft() {
    console.log("asdasd");
    const { userID, newMessage } = this.state;
    const draft = { id: Date.now(), content: newMessage };
    console.log(userID);
    console.log(draft);
    let userDrafts = await AsyncStorage.getItem(`drafts_${userID}`);
    userDrafts = userDrafts ? JSON.parse(userDrafts) : [];

    userDrafts.push(draft);
    await AsyncStorage.setItem(`drafts_${userID}`, JSON.stringify(userDrafts));
  }

  async getDrafts() {
    const { userID } = this.state;
    let userDrafts = await AsyncStorage.getItem(`drafts_${userID}`);
    userDrafts = userDrafts ? JSON.parse(userDrafts) : [];
    console.log(userDrafts);
    return userDrafts;
  }

  async deleteDraft(draftId) {
    const { userID } = this.state;
    const { drafts } = this.state;

    let userDrafts = await AsyncStorage.getItem(`drafts_${userID}`);
    userDrafts = drafts ? JSON.parse(userDrafts) : [];

    userDrafts = userDrafts.filter((draft) => draft.id !== draftId);
    await AsyncStorage.setItem(`drafts_${userID}`, JSON.stringify(userDrafts));
    this.setState({ drafts: userDrafts });
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

    const { messages, newMessage } = this.state;

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

  renderDraft = ({ item }) => {
    const { editMode, draftToEdit } = this.state;

    if (editMode && item.id === draftToEdit.id) {
      return (
        <View style={styles.draftContainer}>
          <TextInput
            style={styles.editDraftInput}
            value={draftToEdit.content}
            onChangeText={(text) => {
              draftToEdit.content = text;
              this.forceUpdate();
            }}
          />
          <TouchableOpacity
            style={styles.sendDraftButton}
            onPress={async () => {
              this.setState({ newMessage: item.content });
              await this.deleteDraft(item.id);
              this.sendMessage();
              this.setState({ showDraftsModal: false });
            }}
          >
            <Text style={styles.sendDraftButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              this.deleteDraft(item.id);
              this.setState({ editMode: false, draftToEdit: null });
            }}
          >
            <Text>Delete</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.draftContainer}>
        <Text style={styles.draftText}>{item.content}</Text>

        <TouchableOpacity
          style={styles.sendDraftButton}
          onPress={() => this.setState({ editMode: true, draftToEdit: item })}
        >
          <Text style={styles.sendDraftButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

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

    const { messages, newMessage, showDraftsModal } = this.state;
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
            onPress={() =>
              this.props.navigation.navigate("AddUserToChat", { chat })
            }
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
          isVisible={showDraftsModal}
          onBackdropPress={() =>
            this.setState({
              showDraftsModal: false,
              editMode: false,
              draftToEdit: null,
            })
          }
          animationIn="slideInRight"
          animationOut="slideOutRight"
        >
          <View style={styles.draftsModal}>
            <FlatList
              data={this.state.drafts}
              renderItem={this.renderDraft}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.draftsList}
            />
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
          <TouchableOpacity onPress={this.saveDraft.bind(this)}>
            <Text>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({ showDraftsModal: true })}
          >
            <Icon
              name="folder"
              size={24}
              color="black"
              style={{ marginRight: 10 }}
            />
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
  draftsModal: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  draftContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
  },
  draftText: {
    fontSize: 16,
  },
  sendDraftButton: {
    backgroundColor: "#4db6ac",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  sendDraftButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: "#f44336",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
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

export default ChatScreen;
