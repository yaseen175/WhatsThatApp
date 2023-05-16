/* eslint-disable no-use-before-define */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SettingScreen from './settings';
import ChatScreen from './chat';
import HomeScreen from './home';
import ContactScreen from './contacts';

const Tab = createBottomTabNavigator();

export default class HomeNavigation extends Component {
  render() {
    return (
      <Tab.Navigator
        screenOptions={() => ({
          headerStyle: {
            backgroundColor: '#20B2AA',
          },
          headerTitleStyle: styles.headerTitleStyle,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Contacts" component={ContactScreen} />
        <Tab.Screen name="Setting" component={SettingScreen} />
      </Tab.Navigator>
    );
  }
}

const styles = StyleSheet.create({
  headerTitleStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 60,
  },

  headerIcon: {
    marginRight: 10,
  },
});
