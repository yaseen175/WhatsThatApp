import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import globalStyles from '../styles/global'

export default class GlobalStyling extends Component {
    render(){
        return (
            <View style={[styles.container, globalStyles.backgroundOverride]}>
              <Text style={globalStyles.red}>Hello World!</Text>
            </View>
          );
    }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
