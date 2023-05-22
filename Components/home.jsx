/* eslint-disable no-await-in-loop */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import {
  View,
  Image,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allUsers: [],
      isLoading: false,
      photos: {},
    };

    this.handleSearch = this.handleSearch.bind(this);
  }

  // Search for all users, the search executes after typing more than 2 charecters
  async handleSearch(text) {
    if (text.length >= 2) {
      this.setState({ isLoading: true });
      const token = await AsyncStorage.getItem('whatsthat_session_token');
      fetch(`http://localhost:3333/api/1.0.0/search?q=${text}`, {
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

              // It assigns the image URL to the user ID in the photos object,
              // so it gets the profile picture of a user.
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
          this.setState({ isLoading: false });
          throw new Error(error);
        });
    } else {
      this.setState({ allUsers: [], photos: {} });
    }
  }

  // Sends a request to the api to add a contact and handles the response
  addContact = async (contact) => {
    this.setState({ submitted: true });

    try {
      const response = await fetch(
        `http://localhost:3333/api/1.0.0/user/${contact}/contact/`,
        {
          method: 'POST',
          headers: {
            'X-Authorization': await AsyncStorage.getItem(
              'whatsthat_session_token',
            ),
          },
        },
      );

      if (response.status === 200) {
        const text = await response.text();
        if (text === 'Already a contact') {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Already a contact',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Successfully added',
          });
        }
      } else if (response.status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: "You can't add yourself as a contact",
        });
        throw new Error("You can't add yourself as a contact");
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
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong',
        });
        throw new Error('Something went wrong');
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  // Renders all the users that are in the search query.
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
          <Text style={styles.phoneText}>{item.email}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => this.addContact(userId)}>
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
      query, isLoading, allUsers,
    } = this.state;

    return (
      <SafeAreaView style={styles.container}>
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
              placeholder="Search for any contact to add..."
              underlineColorAndroid="transparent"
              value={query}
              onChangeText={this.handleSearch}
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={allUsers}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.user_id.toString()}
          />
        )}
        <Toast />
      </SafeAreaView>
    );
  }
}

// Stlying
const styles = StyleSheet.create({
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
