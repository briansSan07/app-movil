import { Component } from "react";
import * as React from 'react';


import {
  Container,
  Header,
  Title,
  Content,
  Text,
  Button,
  Footer,
  FooterTab,
  Left,
  Right,
  Body,
  Image,
  View
} from "react-native";

import { Icon } from '@rneui/themed';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from "react-native-safe-area-context";

//import HomeScreen from "./HomeScreen";
const Stack = createNativeStackNavigator();



function LogoTitle() {
  return (
    <Image
      style={{ width: 50, height: 50 }}
      source={require("../../assets/icon.png")}
    />
  );
}

function DetailsScreen({ route, navigation }) {
  //const { itemId, otherParam } = route.params;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Pantalla de detalles</Text>
      <Button
        title="Ve a los detalles... de nuevo"
        onPress={() => navigation.push('Detalles', {
          itemId: Math.floor(Math.random() * 100),
        })
      }
      />
      <Button title="Regresa al inicio" onPress={() => navigation.navigate('Inicio')} />
      <Button title="Regresa" onPress={() => navigation.goBack()} />
    </View>
  );
}



export default class SettingScreen extends Component {
  render() {
    return (
      <View style={{backgroundColor: "#fff", flex: 1, flexDirection: 'column'}}>


        <View>
          <Text>Segunda Pagina</Text>
        </View>

        <View style={{position: 'absolute', flex: 0.1, flexDirection:'row', left: 0,
        right: 0, height:80, alignItems:'center', bottom: -10, backgroundColor:'green'}}>
        </View>
      </View>
    );
  }
}



/*
<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: "#fff"}}>
<Button
title="Opeeeen"
  transparent
  onPress={() => this.props.navigation.openDrawer()}
>
  
</Button>
<Text>Header</Text>

<Text>Segunda Pagina</Text>

<Button 
title="Open">
  <Text>Footer</Text>
</Button>
</View>
*/