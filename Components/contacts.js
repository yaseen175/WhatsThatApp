import React, { Component } from "react";
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
  Button,
} from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/FontAwesome";

class ContactsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: "",
      isLoading: true,
      contactsData: [],
      blockedContacts: [],
      results: [],
      query: "",
      isAddUserModalVisible: false,
      newContactId: "",
      showModal: false,
      selectedC: "",
      error: "",
      submitted: false,
    };
  }

  componentDidMount() {
    this.getData();
    this.allBlockedContacts();
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
  async createNewContact() {
    this.setState({ submitted: true, error: "" });
    this.setState({ isAddUserModalVisible: true });

    return fetch(
      "http://localhost:3333/api/1.0.0/user/" +
        this.state.newContactId +
        "/contact/",
      {
        method: "POST",
        headers: {
          "X-Authorization": await AsyncStorage.getItem(
            "whatsthat_session_token"
          ),
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          response.text().then((text) => {
            if (text === "Already a contact") {
              this.setState({
                error: "Already a contact",
              });
            } else {
              this.setState({ isAddUserModalVisible: false });
              this.getData();
            }
          });
        } else if (response.status === 400) {
          this.setState({
            error: "You can't add yourself as a contact",
          });
          throw "You can't add yourself as a contact";
        } else if (response.status === 401) {
          this.setState({
            error: "Unauthorized",
          });
          throw "Unauthorized";
        } else if (response.status === 404) {
          this.setState({
            error: "Sorry Contact Not Found",
          });
          throw "Sorry Contact Not Found";
        } else {
          this.setState({ error: "something went wrong" });
          throw "something went wrong";
        }
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
        this.componentDidMount();
        console.log("Deleted");
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async allBlockedContacts() {
    return fetch("http://localhost:3333/api/1.0.0/blocked/", {
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
          blockedContacts: responseJson,
        });
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
        console.log(responseJson);
        this.componentDidMount();
        console.log("Contact Blocked");
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async unblockContact(contactId) {
    console.log(contactId);
    return fetch(
      "http://localhost:3333/api/1.0.0/user/" + contactId + "/block/",
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
        this.componentDidMount();
        console.log("Deleted");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleSearch = (text) => {
    console.log(text);
    const newData = this.state.contactsData.filter((item) => {
      const itemData = item.first_name.toUpperCase();
      console.log(itemData);
      const textData = text.toUpperCase();
      console.log(textData);
      return itemData.indexOf(textData) > -1;
    });
    this.setState({ results: newData, query: text });
  };

  renderContact = (item) => {
    const { selectedC } = this.state;

    return (
      <TouchableOpacity
        onPress={() => this.setState({ showModal: true, selectedC: item })}
        style={styles.notificationBox}
      >
        <Image
          style={styles.image}
          source={{
            uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
          }}
        />
        <Text style={styles.name}>{item.first_name}</Text>
        <Modal visible={this.state.showModal} animationType="slide">
          <View style={styles.mContainer}>
            <View style={styles.mAvatarContainer}>
              <Image
                source={{
                  uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                }}
                style={styles.mAvatar}
              />
              <Text style={styles.mName}> {selectedC.first_name}</Text>
            </View>

            <View style={styles.mInfoContainer}>
              <Text style={styles.mInfoLabel}>First Name:</Text>
              <Text style={styles.mInfoValue}>{selectedC.first_name}</Text>
              {console.log(selectedC)}
            </View>
            <View style={styles.mInfoContainer}>
              <Text style={styles.mInfoLabel}>Last Name:</Text>
              <Text style={styles.mInfoValue}>{selectedC.last_name}</Text>
            </View>
            <View style={styles.mInfoContainer}>
              <Text style={styles.mInfoLabel}>Email:</Text>
              <Text style={styles.mInfoValue}>{selectedC.email}</Text>
            </View>

            <View style={styles.modalButtons}>
              <View style={styles.actionButton}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.onDelete(item.user_id);
                    this.hideAlert();
                  }}
                >
                  <MaterialIcons name="delete" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <View style={styles.actionButton}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.onBlock(item.user_id);
                    this.hideAlert();
                  }}
                >
                  <MaterialIcons name="block" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={this.hideAlert}>
              <Text style={styles.backButton}>Back</Text>
            </TouchableOpacity>
          </View>
        </Modal>
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
      </TouchableOpacity>
    );
  };

  renderBlockContact = (item) => {
    const { selectedC } = this.state;

    return (
      <TouchableOpacity
        onPress={() => this.setState({ showModal: true, selectedC: item })}
        style={styles.notificationBox}
      >
        {console.log(selectedC)}
        <Image
          style={styles.image}
          source={{
            uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
          }}
        />
        <Text style={styles.name}>{item.first_name}</Text>
        <Modal visible={this.state.showModal} animationType="slide">
          <View style={styles.mContainer}>
            <View style={styles.mAvatarContainer}>
              <Image
                source={{
                  uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                }}
                style={styles.mAvatar}
              />
              <Text style={styles.mName}> {selectedC.first_name}</Text>
            </View>

            <View style={styles.mInfoContainer}>
              <Text style={styles.mInfoLabel}>First Name:</Text>
              <Text style={styles.mInfoValue}>{selectedC.first_name}</Text>
            </View>
            <View style={styles.mInfoContainer}>
              <Text style={styles.mInfoLabel}>Last Name:</Text>
              <Text style={styles.mInfoValue}>{selectedC.last_name}</Text>
            </View>
            <View style={styles.mInfoContainer}>
              <Text style={styles.mInfoLabel}>Email:</Text>
              <Text style={styles.mInfoValue}>{selectedC.email}</Text>
            </View>

            <View style={styles.modalButtons}>
              <View style={styles.actionButton}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.onDelete(item.user_id);
                    this.hideAlert();
                  }}
                >
                  <MaterialIcons name="delete" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <View style={styles.actionButton}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.onBlock(item.user_id);
                    this.hideAlert();
                  }}
                >
                  <MaterialIcons name="block" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={this.hideAlert}>
              <Text style={styles.backButton}>Back</Text>
            </TouchableOpacity>
          </View>
        </Modal>
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
              onSelect={() => this.unblockContact(item.user_id)}
              text="Unblock"
            />
          </MenuOptions>
        </Menu>
      </TouchableOpacity>
    );
  };

  hideAlert = () => {
    this.setState({ showModal: false });
  };
  renderAddContactModal = () => {
    return (
      <Modal
        visible={this.state.modalVisible}
        animationType={"slide"}
        onRequestClose={() => this.setState({ modalVisible: false })}
      >
        <View style={styles.addModalContainer}>
          <View style={styles.addModalContent}>
            <TextInput
              style={styles.addModalInput}
              placeholder="Enter contact ID"
              onChangeText={(id) => this.setState({ id })}
            />
            <TouchableOpacity
              style={styles.addModalButton}
              onPress={() => {
                this.addContact();
                this.setState({ modalVisible: false });
              }}
            >
              <Text style={styles.addModalButtonText}>Add</Text>
            </TouchableOpacity>
            <Button
              title="Cancel"
              onPress={() => {
                this.setState({ modalVisible: false });
              }}
            />
          </View>
        </View>
      </Modal>
    );
  };

  render() {
    const { isAddUserModalVisible } = this.state;

    if (this.state.isLoading) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    } else {
      return (
        <MenuProvider>
          <View style={styles.container}>
            <View style={headerStyle}>
              <TouchableOpacity
                onPress={() => this.props.navigation.goBack()}
                style={{ padding: 10 }}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={headerTextStyle}>All Contacts</Text>
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
              <View style={styles.addModalContainer}>
                <View style={styles.addModalContent}>
                  <Text style={styles.addModalTitle}>Add Contact</Text>
                  <TextInput
                    style={styles.addModalInput}
                    placeholder="Enter Contact Id To Add"
                    onChangeText={(newContactId) =>
                      this.setState({ newContactId })
                    }
                  />
                  <TouchableOpacity
                    style={styles.addModalbutton}
                    onPress={() => this.createNewContact()}
                  >
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                  <>
                    {this.state.error && (
                      <Text style={styles.error}>{this.state.error}</Text>
                    )}
                  </>
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
            </Modal>

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
            <FlatList
              data={this.state.contactsData}
              renderItem={({ item }) => this.renderContact(item)}
              keyExtractor={(item) => item.user_id}
            />
            <Text style={bHeaderTextStyle}>Blocked Contacts</Text>

            <FlatList
              data={this.state.blockedContacts}
              renderItem={({ item }) => this.renderBlockContact(item)}
              keyExtractor={(item) => item.user_id}
            />
            {/* <FlatList
              style={styles.notificationList}
              data={this.state.contactsData}
              keyExtractor={(item) => item.user_id}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    onPress={this.showAlert}
                    style={styles.notificationBox}
                  >
                    <Image
                      style={styles.image}
                      source={{
                        uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                      }}
                    />
                    <Text style={styles.name}>{item.first_name}</Text>
                    <Modal visible={this.state.showModal} animationType="slide">
                      <View style={styles.mContainer}>
                        <View style={styles.mAvatarContainer}>
                          <Image
                            source={{
                              uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                            }}
                            style={styles.mAvatar}
                          />
                          <Text style={styles.mName}> {item.first_name}</Text>
                        </View>

                        <View style={styles.mInfoContainer}>
                          <Text style={styles.mInfoLabel}>First Name:</Text>
                          <Text style={styles.mInfoValue}>
                            {item.first_name}
                            {console.log(item.first_name)}
                          </Text>
                        </View>
                        <View style={styles.mInfoContainer}>
                          <Text style={styles.mInfoLabel}>Last Name:</Text>
                          <Text style={styles.mInfoValue}>
                            {item.last_name}
                          </Text>
                        </View>
                        <View style={styles.mInfoContainer}>
                          <Text style={styles.mInfoLabel}>Email:</Text>
                          <Text style={styles.mInfoValue}>{item.email}</Text>
                        </View>

                        <View style={styles.modalButtons}>
                          <View style={styles.actionButton}>
                            <TouchableOpacity
                              onPress={() => {
                                this.props.onDelete(item.user_id);
                                this.hideAlert();
                              }}
                            >
                              <MaterialIcons
                                name="delete"
                                size={24}
                                color="black"
                              />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.actionButton}>
                            <TouchableOpacity
                              onPress={() => {
                                this.props.onBlock(item.user_id);
                                this.hideAlert();
                              }}
                            >
                              <MaterialIcons
                                name="block"
                                size={24}
                                color="black"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <TouchableOpacity onPress={this.hideAlert}>
                          <Text style={styles.backButton}>Back</Text>
                        </TouchableOpacity>
                      </View>
                    </Modal>
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
                  </TouchableOpacity>
                );
              }}
            /> */}
          </View>
        </MenuProvider>
      );
    }
  }
}

export default ContactsView;

const headerStyle = {
  height: 50,
  backgroundColor: "#075e54",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 10,
};
const bHeaderTextStyle = {
  color: "red",
  fontSize: 18,
  fontWeight: "bold",
  textAlign: "center",
  textDecorationLine: "underline",
};
const headerTextStyle = {
  color: "white",
  fontSize: 18,
  fontWeight: "bold",
};

const styles = StyleSheet.create({
  error: {
    color: "red",
    fontWeight: "900",
  },
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
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
  },
  inputIcon: {
    marginLeft: 15,
    justifyContent: "center",
  },
  notificationList: {
    marginTop: 20,
    padding: 10,
  },
  notificationBox: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    borderRadius: 10,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 20,
    marginLeft: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginLeft: 10,
    alignSelf: "center",
  },
  menuIcon: {
    fontSize: 20,
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
  notificationBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  modalName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
  },
  actionButton: {
    marginHorizontal: 10,
  },
  mContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  mAvatarContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  mAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  mName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  mInfoContainer: {
    marginTop: 20,
  },
  mInfoLabel: {
    fontWeight: "bold",
  },
  mInfoValue: {
    marginTop: 5,
  },
  backButton: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  addModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  addModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addModalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: "100%",
  },
  addModalbutton: {
    backgroundColor: "#075e54",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
});
