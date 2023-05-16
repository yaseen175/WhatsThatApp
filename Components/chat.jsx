/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

class ChatListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatID: '',
      newChat: '',
      updateName: '',
      isAddUserModalVisible: false,
      isEditUserModalVisible: false,
      chatData: [],
    };
    this.onChatPress = this.onChatPress.bind(this);
  }

  componentDidMount() {
    this.checkAndFetchChats();
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
      this.checkAndFetchChats();
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChatPress(chat) {
    const { navigation } = this.props;
    navigation.navigate('ChatScreen', { chat });
  }

  async getAllChats() {
    return fetch('http://localhost:3333/api/1.0.0/chat', {
      headers: {
        'X-Authorization': await AsyncStorage.getItem(
          'whatsthat_session_token',
        ),
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          chatData: responseJson,
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async checkAndFetchChats() {
    await this.checkLoggedIn();
    await this.getAllChats();
  }

  async checkLoggedIn() {
    const { navigation } = this.props;

    try {
      const sessionToken = await AsyncStorage.getItem(
        'whatsthat_session_token',
      );
      if (sessionToken == null) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User not logged in',
        });
        navigation.navigate('LoginScreen'); // assuming you have a LoginScreen
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async createNewChat() {
    const { newChat } = this.state;

    if (!newChat) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Must Enter Chat Name',
      });
      this.setState({ error: 'Must Enter Chat Name' });
      return;
    }

    try {
      const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');

      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        method: 'POST',
        headers: {
          'X-Authorization': sessionToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChat,
        }),
      });

      if (response.status === 201) {
        this.setState({ isAddUserModalVisible: false });
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Successfully Created New Chat',
        });
        this.getAllChats();
      } else if (response.status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Bad Name',
        });
        throw new Error('Bad Name');
      } else if (response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Unauthorized',
        });
        throw new Error('Unauthorized');
      } else if (response.status === 500) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Server Error',
        });
        throw new Error('Server Error');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateChatName() {
    const { updateName, chatID } = this.state;

    if (!updateName) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Must Enter Chat Name',
      });
      this.setState({ error: 'Must Enter Chat Name' });
      return;
    }

    try {
      const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');

      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatID}`, {
        method: 'PATCH',
        headers: {
          'X-Authorization': sessionToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updateName,
        }),
      });

      if (response.status === 200) {
        this.setState({ isEditUserModalVisible: false });
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Successfully Updated Chat',
        });
        this.getAllChats();
      } else if (response.status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Bad Name',
        });
        throw new Error('Bad Name');
      } else if (response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Unauthorized',
        });
        throw new Error('Unauthorized');
      } else if (response.status === 403) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Forbidden',
        });
        throw new Error('Forbidden');
      } else if (response.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Not Found',
        });
        throw new Error('Not Found');
      } else if (response.status === 500) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Server Error',
        });
        throw new Error('Server Error');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  renderChatItem(chat) {
    return (
      <TouchableOpacity onPress={() => this.onChatPress(chat)}>
        <View style={styles.chatItem}>
          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>{chat.name}</Text>
            <Text style={styles.lastMessage}>{chat.last_message.message}</Text>
          </View>
          <TouchableOpacity
            onPress={() => this.setState({
              updateName: chat.name,
              chatID: chat.chat_id,
              isEditUserModalVisible: true,
            })}
          >
            <Icon name="edit" size={24} color="grey" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const {
      isAddUserModalVisible, isEditUserModalVisible, updateName, error, chatData,
    } = this.state;

    return (
      <View style={styles.container}>
        <Modal
          visible={isEditUserModalVisible}
          transparent
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Chat Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new chat name"
                value={updateName}
                onChangeText={(text) => this.setState({ updateName: text })}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: 'green' }]}
                  onPress={() => this.updateChatName()}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: 'red' }]}
                  onPress={() => this.setState({ isEditUserModalVisible: false })}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                {error && (
                <Text style={styles.error}>{error}</Text>
                )}
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isAddUserModalVisible}
          animationType="slide"
          transparent
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

              {error && (
              <Text style={styles.error}>{error}</Text>
              )}

            </View>
          </View>
        </Modal>

        <FlatList
          data={chatData}
          renderItem={({ item }) => this.renderChatItem(item)}
          keyExtractor={(item) => item.chat_id}
        />

        <TouchableOpacity
          onPress={() => this.setState({ isAddUserModalVisible: true })}
          style={[styles.addButtonContainer]}
        >
          <Icon name="plus" size={24} color="black" />
        </TouchableOpacity>
        <Toast />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1ACB97',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#075e54',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 20,
    marginLeft: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: '900',
  },
});

export default ChatListScreen;
