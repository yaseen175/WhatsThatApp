import GlobalStyling from "./src/views/globalStyling";
import LocationExample from "./src/views/location";
import CameraBasic from "./src/views/camera";
import CameraTakePicture from "./src/views/camera-takephoto";
import CameraSendToServer from "./src/views/camera-sendtoserver";
import DisplayImage from "./src/views/display.js";

import React, { Component } from "react";
import LoginScreen from "./Components/login";
import SignUpScreen from "./Components/signup";
import ProfileScreen from "./Components/profile";
import ChatScreen from "./Components/chatscreen";
import HomeNavigation from "./Components/navigation";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RandomScreen from "./Components/random";

const Stack = createNativeStackNavigator();

export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: "#1ACB97",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          {/* <Stack.Screen name="Random" component={RandomScreen} /> */}
          <Stack.Screen name="Signin" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignUpScreen} />
          <Stack.Screen
            name="HomeNav"
            component={HomeNavigation}
            options={{ headerShown: false }}
          />
          {/* <Stack.Screen name="SettingScreen" component={SettingScreen} /> */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Camera" component={CameraSendToServer} />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
