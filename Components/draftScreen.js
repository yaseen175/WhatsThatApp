import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

class DraftsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localDrafts: [],
      editMode: false,
      draftToEdit: null,
    };
  }

  componentDidMount() {
    this.getDrafts();
  }

  // Add getDrafts function here
  async getDrafts() {
    const drafts = await AsyncStorage.getItem("local_drafts");
    console.log(drafts);
    const localDrafts = drafts ? JSON.parse(drafts) : [];
    console.log(localDrafts);
    this.setState({ localDrafts });
  }

  // Add deleteDraft function here
  async deleteDraft(id) {
    const { localDrafts } = this.state;
    const newDrafts = localDrafts.filter((draft) => draft.id !== id);
    await AsyncStorage.setItem("local_drafts", JSON.stringify(newDrafts));
    this.setState({ localDrafts: newDrafts });
  }

  renderDraft = ({ item }) => {
    const { editMode, draftToEdit } = this.state;
    console.log(draftToEdit);

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
            style={styles.saveButton}
            onPress={() => {
              this.deleteDraft(item.id);
              this.props.navigation.navigate("ChatScreen", {
                chat: this.props.route.params.chat,
                message: draftToEdit.content,
              });
              // Get the ChatScreen component instance and call the sendMessage function
              //   this.props.navigation
              //     .dangerouslyGetParent()
              //     .getParam("sendMessage")(draftToEdit.content);
            }}
          >
            <Text style={styles.saveButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              this.deleteDraft(item.id);
              this.setState({ editMode: false, draftToEdit: null });
            }}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.draftContainer}>
        <Text style={styles.draftText}>{item.content}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => this.setState({ editMode: true, draftToEdit: item })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const { localDrafts } = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          data={localDrafts}
          renderItem={this.renderDraft}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  draftContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 10,
  },
  draftText: {
    flex: 1,
    fontSize: 16,
  },
  editButton: {
    marginLeft: 10,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
  },
  editDraftInput: {
    flex: 1,
    fontSize: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  saveButton: {
    marginLeft: 10,
    backgroundColor: "#2196F3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#fff",
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: "#f44336",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
  },
});

export default DraftsScreen;
