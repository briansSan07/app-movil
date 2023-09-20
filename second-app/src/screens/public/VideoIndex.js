import React, { Component, useState, useCallback, useRef} from "react";
import {
  Container,  Header,  Title,  Content,  Button,  Icon,  ListItem,  Text,  Thumbnail,  Left,  Body,
  Right,  Item,  Footer,  FooterTab,  Badge,  Accordion,  View,  Input,  List,  Toast,  H1,  H2,  H3, H4, CheckBox,
  Spinner, Separator, Alert
} from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Constants from 'expo-constants';

import YoutubePlayer from "react-native-youtube-iframe";


export default function VideoIndex() {
  const [playing, setPlaying] = useState(true);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      Alert.alert("El video ha terminado!");
    }
  }, []);


  return (
    <View style={backgroundColor= "#fff"}>
      <View iosBarStyle={"dark-content"} style={{   paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight , 
            backgroundColor:'#f6f6f6', color:'#000000', marginBottom: Platform.OS === 'ios' ? 0 : 0,
            height:90 , height:90,paddingTop:10 }} searchBar rounded>     
      </View>
      <View>
        <YoutubePlayer
          height={500}
          play={playing}
          videoId={"p2JO8GyLf_s?si=l-noWywYqTpskrtA"}
          onChangeState={onStateChange}
        />
      </View>
    </View>
  );
}

