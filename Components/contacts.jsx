/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

class ContactsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      blockedContacts: [],
      showModal: false,
      photos: {},
      photo: null,
      searchedUsers: [],
      isAddUserModalVisible: false,
      search: '',
    };

    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.checkAndFetchChats(); // Fetch chats and check login status when component mounts
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
      this.checkAndFetchChats(); // Fetch chats and check login status when screen receives focus
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async handleSearch(text) {
    this.setState({ search: text });
    if (text.length >= 0) {
      this.setState({ isLoading: true });
      const token = await AsyncStorage.getItem('whatsthat_session_token');
      fetch(
        `http://localhost:3333/api/1.0.0/search?q=${text}&search_in=contacts`,
        {
          //   return fetch("http://localhost:3333/api/1.0.0/search?q="+allusers+ "&search_in="++"&limit="++"&offset="+, {

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
            isLoading: false,
            searchedUsers: responseJson,
            photos,
          });
        })
        .catch((error) => {
          this.setState({ isLoading: false });
          throw new Error(error);
        });
    } else {
      this.setState({ searchedUsers: [], photos: {} });
    }
  }

  async getData() {
    const token = await AsyncStorage.getItem('whatsthat_session_token');

    return fetch('http://localhost:3333/api/1.0.0/contacts', {
      headers: {
        'X-Authorization': token,
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
          isLoading: false,
          allUsers: responseJson,
          photos,
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async get_profile_image(imageId) {
    const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');

    try {
      const response = await fetch(
        `http://localhost:3333/api/1.0.0/user/${imageId}/photo`,
        {
          method: 'GET',
          headers: {
            'X-Authorization': sessionToken,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const data = URL.createObjectURL(blob);

      this.setState({
        photo: data,
        isLoading: false,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  hideAlert = () => {
    this.setState({ showModal: false });
  };

  async blockContact(contactId) {
    return fetch(`http://localhost:3333/api/1.0.0/user/${contactId}/block/`, {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem(
          'whatsthat_session_token',
        ),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Successfully Blocked',
          });
          this.componentDidMount();
        } else if (response.status === 400) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: "You can't block yourself",
          });
          throw new Error("You can't block yourself");
        } else if (response.status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Unauthorized',
          });
          throw new Error('Unauthorized');
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

  async unblockContact(contactId) {
    return fetch(`http://localhost:3333/api/1.0.0/user/${contactId}/block/`, {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem(
          'whatsthat_session_token',
        ),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Successfully Unblocked',
          });
          this.componentDidMount();
        } else if (response.status === 400) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: "You can't block yourself",
          });
          throw new Error("You can't block yourself");
        } else if (response.status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Unauthorized',
          });
          throw new Error('Unauthorized');
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
        this.componentDidMount();
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async allBlockedContacts() {
    return fetch('http://localhost:3333/api/1.0.0/blocked/', {
      headers: {
        'X-Authorization': await AsyncStorage.getItem(
          'whatsthat_session_token',
        ),
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          blockedContacts: responseJson,
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async deleteContact(contactId) {
    return fetch(`http://localhost:3333/api/1.0.0/user/${contactId}/contact/`, {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem(
          'whatsthat_session_token',
        ),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Successfully Deleted',
          });
          this.componentDidMount();
        } else if (response.status === 400) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: "You can't remove yourself as a contact",
          });
          throw new Error("You can't remove yourself as a contact");
        } else if (response.status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Unauthorized',
          });
          throw new Error('Unauthorized');
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

  async checkLoggedIn() {
    try {
      const { navigation } = this.props;
      const sessionToken = await AsyncStorage.getItem(
        'whatsthat_session_token',
      );
      if (sessionToken == null) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User not logged in',
        });
        navigation.navigate('LoginScreen');
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async checkAndFetchChats() {
    await this.checkLoggedIn();
    await this.getData();
    await this.allBlockedContacts();
  }

  renderContact = (item) => {
    const userId = item.user_id;
    const {
      photos,
    } = this.state;

    return (
      <TouchableOpacity
        onPress={() => {
          this.get_profile_image(item.user_id);
          this.setState({ showModal: true });
        }}
        style={styles.notificationBox}
      >
        <View style={styles.itemContainer}>
          <Image
            style={styles.image}
            source={{ uri: photos[userId] }}
          />
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>
              {item.first_name}
              {'  '}
              {item.last_name}
            </Text>
            <Text style={styles.phoneText}>{item.email}</Text>
          </View>
        </View>
        <Menu>
          <MenuTrigger>
            <Text style={styles.menuIcon}>...</Text>
          </MenuTrigger>
          <MenuOptions>
            <MenuOption
              onSelect={() => this.deleteContact(item.user_id)}
              text="Delete"
            />
            <MenuOption
              onSelect={() => this.blockContact(item.user_id)}
              text="Block"
            />
          </MenuOptions>
        </Menu>
        {this.renderModal(item)}
      </TouchableOpacity>
    );
  };

  renderBlockContact = (item) => (
    <View style={styles.notificationBox}>
      <TouchableOpacity
        onPress={() => {
          this.get_profile_image(item.user_id);
          this.setState({ showModal: true });
        }}
        style={styles.itemContainer}
      >
        <View style={styles.chatInfo}>
          <Text style={styles.nameText}>
            {item.first_name}
            {'  '}
            {item.last_name}
          </Text>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          onPress={() => this.deleteContact(item.user_id)}
          style={styles.menuButton}
        >
          <Text style={styles.menuText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.unblockContact(item.user_id)}
          style={styles.menuButton}
        >
          <Text style={styles.menuText}>Unblock</Text>
        </TouchableOpacity>
      </View>
      {this.renderModal(item)}
    </View>
  );

  renderModal = () => {
    const { showModal, photo } = this.state;

    return (
      <Modal visible={showModal} animationType="slide">
        <View style={styles.mAvatarContainer}>
          <Image
            source={{
              uri: photo,
            }}
            style={styles.mAvatar}
          />
        </View>
        <TouchableOpacity onPress={this.hideAlert}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
      </Modal>
    );
  };

  renderItem = ({ item }) => {
    const userId = item.user_id;
    const {
      photos,
    } = this.state;

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
      searchedUsers, search, isAddUserModalVisible, isLoading, allUsers, blockedContacts,
    } = this.state;

    if (isLoading) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.container}>
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
              value={search}
              onChangeText={this.handleSearch}
            />
          </View>
        </View>
        {search ? (
          <FlatList
            data={searchedUsers}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.user_id.toString()}
          />
        ) : (
          <MenuProvider>
            <View style={styles.container}>
              <FlatList
                data={allUsers}
                renderItem={({ item }) => this.renderContact(item)}
                keyExtractor={(item) => item.user_id}
              />
            </View>
          </MenuProvider>
        )}

        <Modal
          visible={isAddUserModalVisible}
          animationType="slide"
          transparent
        >
          <View style={styles.amodalContainer}>
            <View style={styles.amodalContent}>
              <Text style={styles.amodalTitle}>Blocked Contacts</Text>
              <FlatList
                data={blockedContacts}
                renderItem={({ item }) => this.renderBlockContact(item)}
                keyExtractor={(item) => item.user_id}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => this.setState({ isAddUserModalVisible: false })}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <TouchableOpacity
          onPress={() => this.setState({ isAddUserModalVisible: true })}
          style={[styles.addButtonContainer]}
        >
          <MaterialIcons name="block" size={24} color="black" />
        </TouchableOpacity>
        <Toast />
      </View>
    );
  }
}

export default ContactsView;

const styles = StyleSheet.create({
  error: {
    color: 'red',
    fontWeight: '900',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  formContent: {
    flexDirection: 'row',
    marginTop: 30,
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
  iconBtnSearch: {
    alignSelf: 'center',
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
  notificationList: {
    marginTop: 20,
    padding: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
    alignSelf: 'center',
  },
  menuIcon: {
    fontSize: 20,
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
  button: {
    backgroundColor: '#075e54',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notificationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    marginHorizontal: 10,
  },

  mAvatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  mAvatar: {
    width: 350,
    height: 350,
    borderRadius: 75,
  },
  mName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  mInfoContainer: {
    marginTop: 20,
  },
  mInfoLabel: {
    fontWeight: 'bold',
  },
  mInfoValue: {
    marginTop: 5,
  },
  backButton: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  addModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addModalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
  },
  addModalbutton: {
    backgroundColor: '#075e54',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  phoneText: {
    fontSize: 16,
    color: '#999',
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
  amodalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  amodalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  amodalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
