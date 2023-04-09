import React, { Component } from "react";
import SettingScreen from "./settings";
import ChatScreen from "./chat";
import ProfileScreen from "./profile";
import HomeScreen from "./home";
import ContactScreen from "./contacts";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default class HomeNavigation extends Component {
  render() {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Contact"
          component={ContactScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Setting" component={SettingScreen} />
      </Tab.Navigator>
    );
  }
}
