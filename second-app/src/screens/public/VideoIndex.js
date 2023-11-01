import React, { Component, useState, useCallback, useRef} from "react";
import { View, Alert } from "react-native";
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

