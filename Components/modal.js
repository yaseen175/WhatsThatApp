import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
} from "react-native";

class AddUserModal extends Component {
  state = {
    name: "",
    phone: "",
    email: "",
  };

  handleAddUser = () => {
    // Perform some action to add the user
    // You can pass the user data to the parent component via props or a callback function
    // For example: this.props.onAddUser(this.state);
    // Then close the modal
    this.props.onClose();
  };

  render() {
    return (
      <Modal
        visible={this.props.visible}
        animationType="slide"
        onRequestClose={this.props.onClose}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add User</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            onChangeText={(name) => this.setState({ name })}
            value={this.state.name}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            onChangeText={(phone) => this.setState({ phone })}
            value={this.state.phone}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={(email) => this.setState({ email })}
            value={this.state.email}
          />
          <TouchableOpacity style={styles.button} onPress={this.handleAddUser}>
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this.props.onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
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
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "80%",
  },
  button: {
    backgroundColor: "#075e54",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
