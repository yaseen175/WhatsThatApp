import React, { Component } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
  Modal,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";

export default class ContactScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      isLoading: true,
      contactsData: [],
      modalVisible: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    return fetch("http://localhost:3333/api/1.0.0/contacts", {
      headers: {
        "X-Authorization": await AsyncStorage.getItem(
          "whatsthat_session_token"
        ),
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          contactsData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async deleteContact(contactId) {
    console.log(contactId);
    return fetch(
      "http://localhost:3333/api/1.0.0/user/" + contactId + "/contact/",
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
        console.log("Deleted");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async addContact() {
    return fetch(
      "http://localhost:3333/api/1.0.0/user/" + this.state.id + "/contact/",
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
        console.log("Contact Added");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async blockContact(contactId) {
    return fetch(
      "http://localhost:3333/api/1.0.0/user/" + contactId + "/block/",
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
        console.log("Contact Blocked");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async unblockContact(contactId) {
    console.log(contactId);
    return fetch(
      "http://localhost:3333/api/1.0.0/user/" + contactId + "/contact/",
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
        console.log("Deleted");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  renderContact = ({ item }) => {
    return (
      <View style={styles.contactContainer}>
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{item.first_name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nameText}>{item.first_name}</Text>
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
      </View>
    );
  };

  handleSearch = (text) => {
    const newData = this.state.data.filter((item) => {
      const itemData = item.description.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({ results: newData, query: text });
  };

  renderAddContactModal = () => {
    return (
      <Modal
        visible={this.state.modalVisible}
        animationType={"slide"}
        onRequestClose={() => this.setState({ modalVisible: false })}
      >
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter contact ID"
            onChangeText={(id) => this.setState({ id })}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              this.addContact();
              this.setState({ modalVisible: false });
            }}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
          <Button
            title="Cancel"
            onPress={() => {
              this.setState({ modalVisible: false });
            }}
          />
        </View>
      </Modal>
    );
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    } else {
      return (
        <MenuProvider>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <FlatList
                data={this.state.contactsData}
                renderItem={this.renderContact}
                keyExtractor={({ id }, index) => id}
              />
            </View>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  this.setState({ modalVisible: true });
                }}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            {this.renderAddContactModal()}
          </View>
        </MenuProvider>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatlistContainer: {
    flex: 1,
    marginBottom: 50,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#1E6738",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 200,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
  },
  initialCircle: {
    backgroundColor: "#F4F4F4",
    borderRadius: 20,
    borderColor: "black",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  initialText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  nameText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  statusText: {
    color: "#555",
    fontSize: 14,
  },
  menuIcon: {
    fontSize: 20,
  },
});
