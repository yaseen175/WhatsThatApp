/* eslint-disable react/destructuring-assignment */
/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

class ChatScreenAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      allUsers: [],
      userInChatData: [],
      photos: {},
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  // Handles the search functioanlity for just the contacts
  async handleSearch(text) {
    this.setState({ search: text });
    if (text.length >= 3) {
      const token = await AsyncStorage.getItem('whatsthat_session_token');
      fetch(
        `http://localhost:3333/api/1.0.0/search?q=${text}&search_in=contacts`,
        {
          headers: {
            'X-Authorization': token,
          },
        },
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
                  method: 'GET',
                  headers: {
                    'X-Authorization': token,
                  },
                },
              );

              if (!response.ok) {
                throw new Error('Network response was not ok');
              }

              const blob = await response.blob();
              const data = URL.createObjectURL(blob);

              photos[user.user_id] = data;
            } catch (error) {
              throw new Error(error);
            }
          }

          this.setState({
            allUsers: responseJson,
            photos,
          });
        })
        .catch((error) => {
          throw new Error(error);
        });
    } else {
      this.setState({ allUsers: [], photos: {} });
    }
  }

  async getData() {
    try {
      const sessionToken = await AsyncStorage.getItem(
        'whatsthat_session_token',
      );

      const { chat } = this.props.route.params;

      const response = await fetch(
        `http://localhost:3333/api/1.0.0/chat/${chat.chat_id}`,
        {
          headers: {
            'X-Authorization': sessionToken,
            'content-type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        const responseJson = await response.json();
        this.setState({
          userInChatData: responseJson.members,
        });
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
          text2: 'Sorry Contact Not Found',
        });
        throw new Error('Sorry Contact Not Found');
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

  // Adds user to the group whom id is passed to the parameter.
  async AddUserToGroup(userid) {
    const { chat } = this.props.route.params;
    return fetch(
      `http://localhost:3333/api/1.0.0/chat/${chat.chat_id}/user/${userid}`,
      {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem(
            'whatsthat_session_token',
          ),
        },
      },
    )
      .then((response) => {
        if (response.status === 200) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Successfully Added',
          });
          this.getData();
        } else if (response.status === 400) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'User already in the chat',
          });
          throw new Error('User already in the chat');
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
            text2: 'Sorry Contact Not Found',
          });
          throw new Error('Sorry Contact Not Found');
        } else if (response.status === 500) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Server Error',
          });
          throw new Error('Server Error');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'something went wrong',
          });
          throw new Error('something went wrong');
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  // Deletes user from the group whom id is passed to the parameter.
  async DeleteUserFromGroup(chatid) {
    const userID = await AsyncStorage.getItem('whatsthat_user_id');

    if (chatid.toString() === userID) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You cannot remove yourself from the group',
      });
      return; // Prevent further execution if user tries to delete themselves
    }
    const { chat } = this.props.route.params;
    fetch(
      `http://localhost:3333/api/1.0.0/chat/${chat.chat_id}/user/${chatid}`,
      {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem(
            'whatsthat_session_token',
          ),
        },
      },
    )
      .then((response) => {
        if (response.status === 200) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Successfully Removed',
          });
          this.getData();
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
            text2: 'Sorry Contact Not Found',
          });
          throw new Error('Sorry Contact Not Found');
        } else if (response.status === 500) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Server Error',
          });
          throw new Error('Server Error');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'something went wrong',
          });
          throw new Error('something went wrong');
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  // Renders the exisitng users in group.
  renderChatItem(item) {
    return (
      <View style={styles.chatItem}>
        <View style={styles.chatInfo}>
          <Text style={styles.nameText}>
            {item.first_name}
            {'  '}
            {item.last_name}
          </Text>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
        <TouchableOpacity
          onPress={() => this.DeleteUserFromGroup(item.user_id)}
        >
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  }

  renderItem = ({ item }) => {
    const userId = item.user_id;
    const { photos } = this.state;

    return (
      <View style={styles.itemContainer}>
        <Image
          style={styles.image}
          source={{ uri: photos[userId] }}
        />
        <View style={styles.textContainer}>
          <Text style={styles.nameText}>
            {item.given_name}
            {'  '}
            {item.family_name}
          </Text>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => this.AddUserToGroup(userId)}>
          <Icon
            name="plus"
            size={24}
            style={{ marginRight: 10, color: '#20B2AA', fontWeight: 'bold' }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const {
      allUsers, search, query, userInChatData,
    } = this.state;
    const { navigation } = this.props;

    // checks if the lowercase given_name values include the lowercase search (What the user searched for)
    const filteredUsers = allUsers.filter((user) => user.given_name.toLowerCase().includes(search.toLowerCase()));

    return (
      <View style={styles.container}>
        <View style={headerStyle}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
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
                uri: 'https://img.icons8.com/color/70/000000/search.png',
              }}
            />
            <TextInput
              style={styles.inputs}
              placeholder="Search user to add..."
              underlineColorAndroid="transparent"
              value={query}
              onChangeText={this.handleSearch}
            />
          </View>
        </View>

        {/* If search is true, render a FlatList with filteredUsers data,
         if not, render a View with an 'Existing Users' header and a FlatList
         with exisitng users. */}
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
              data={userInChatData}
              renderItem={({ item }) => this.renderChatItem(item)}
              keyExtractor={(item) => item.user_id.toString()}
            />
          </View>
        )}
        <Toast />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
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
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 16,
    color: '#999',
  },
  formContent: {
    flexDirection: 'row',
    marginTop: 30,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
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
    borderBottomColor: '#FFFFFF',
    flex: 1,
    color: '#20B2AA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputIcon: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  error: {
    color: 'red',
    fontWeight: '900',
    alignItems: 'center',
  },
  existingHeader: {
    color: '#1ACB97',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  existingContainer: {
    justifyContent: 'center',
  },
});
const headerStyle = {
  height: 50,
  backgroundColor: '#20B2AA',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 10,
};
const headerTextStyle = {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
};

export default ChatScreenAdd;
