import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Component } from "react";
import { View, Image, Text } from "react-native";

export default class DisplayImage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      photo: null,
      isLoading: true,
    };
  }

  componentDidMount() {
    this.get_profile_image();
  }

  async get_profile_image() {
    const sessionToken = await AsyncStorage.getItem("whatsthat_session_token");
    const userID = await AsyncStorage.getItem("whatsthat_user_id");

    fetch("http://localhost:3333/api/1.0.0/user/" + userID + "/photo", {
      method: "GET",
      headers: {
        "X-Authorization": sessionToken,
      },
    })
      .then((res) => {
        return res.blob();
      })
      .then((resBlob) => {
        let data = URL.createObjectURL(resBlob);

        this.setState({
          photo: data,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    if (this.state.photo) {
      return (
        <View style={{ flex: 1 }}>
          <Image
            source={{
              uri: this.state.photo,
            }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 75,
            }}
          />
        </View>
      );
    } else {
      return <Text>Loading</Text>;
    }
  }
}
