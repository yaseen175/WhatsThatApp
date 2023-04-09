import React, { Component } from 'react';
import { View, Text } from 'react-native';

import * as Location from 'expo-location';

export default class LocationExample extends Component {
    constructor(props){
        super(props);

        this.state = {
            location: null,
            error_message: null
        }
    }

    componentDidMount(){
        Location.requestForegroundPermissionsAsync()
        .then((result) => {
            let status = result.status;

            if(status !== 'granted'){
                this.setState({"error_message": "Permission to location denied"})
                throw 'Permissions Error';
            }

            Location.getCurrentPositionAsync({})
            .then((pos) => {
                this.setState({location: pos})
            })
            .catch((err) => {
                console.log(err);
            })
        })
    }

    // Async/Await alternative
    // let { status } = await Location.requestForegroundPermissionsAsync();
    
    // if(status !== 'granted'){
    //   this.setState({error_message: "Permission to location denied"});
    //   return;
    // }

    // let pos = await Location.getCurrentPositionAsync({});
    // this.setState({location: pos})

    render(){
        if(this.state.error_message === null){
            return(
              <View>
                <Text>{JSON.stringify(this.state.location)}</Text>
              </View>
            );
          }else{
            return(
              <View>
                <Text>{this.state.error_message}</Text>
              </View>
            );
          }
    }
}