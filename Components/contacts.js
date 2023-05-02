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
      newContactId: "",
      showModal: false,
      selectedC: "",
      error: "",
      submitted: false,
      photos: {},
      allUsers: [],
      isAddUserModalVisible: false,
    };
  }

  componentDidMount() {
    this.getData();
    this.allBlockedContacts();
  }
  async getData() {
    const token = await AsyncStorage.getItem("whatsthat_session_token");

    return fetch("http://localhost:3333/api/1.0.0/contacts", {
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
  async get_profile_image(imageId) {
    console.log(imageId);
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");

    try {
      const response = await fetch(
        "http://localhost:3333/api/1.0.0/user/" + imageId + "/photo",
        {
          method: "GET",
          headers: {
            "X-Authorization": sessionToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const data = URL.createObjectURL(blob);

      this.setState({
        photo: data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  }

  renderContact = (item) => {
    const userId = item.user_id;

    return (
      <TouchableOpacity
        onPress={() => {
          this.get_profile_image(item.user_id);
          this.setState({ showModal: true, selectedC: item });
        }}
        style={styles.notificationBox}
      >
        <View style={styles.itemContainer}>
          <Image
            style={styles.image}
            source={{ uri: this.state.photos[userId] }}
          />
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>
              {item.first_name}
              {"  "}
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

  // Renders a blocked contact item
  renderBlockContact = (item) => {
    const userId = item.user_id;

    return (
      <View style={styles.notificationBox}>
        <TouchableOpacity
          onPress={() => {
            this.get_profile_image(item.user_id);
            this.setState({ showModal: true, selectedC: item });
          }}
          style={styles.itemContainer}
        >
          <View style={styles.chatInfo}>
            <Text style={styles.nameText}>
              {item.first_name}
              {"  "}
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
  };

  renderModal = (selectedC) => {
    return (
      <Modal visible={this.state.showModal} animationType="slide">
        <View style={styles.mContainer}>
          <View style={styles.mAvatarContainer}>
            <Image
              source={{
                uri: this.state.photo,
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
    );
  };

  hideAlert = () => {
    this.setState({ showModal: false });
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
              data={this.state.allUsers}
              renderItem={({ item }) => this.renderContact(item)}
              keyExtractor={(item) => item.user_id}
            />
          </View>
          <Modal
            visible={isAddUserModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.amodalContainer}>
              <View style={styles.amodalContent}>
                <Text style={styles.amodalTitle}>Blocked Contacts</Text>
                <FlatList
                  data={this.state.blockedContacts}
                  renderItem={({ item }) => this.renderBlockContact(item)}
                  keyExtractor={(item) => item.user_id}
                />
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
          <TouchableOpacity
            onPress={() => this.setState({ isAddUserModalVisible: true })}
            style={[styles.addButtonContainer]}
          >
            <MaterialIcons name="block" size={24} color="black" />
          </TouchableOpacity>
        </MenuProvider>
      );
    }
  }
}

export default ContactsView;

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
    color: "#20B2AA",
    fontSize: 12,
    fontWeight: "bold",
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
  addButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1ACB97",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  amodalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  amodalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  amodalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
