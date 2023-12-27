import React, { Component } from "react";
import { Image,SafeAreaView, FlatList, Text, View, Dimensions, Platform, StyleSheet, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const drawerImage = require("./../../../assets/icon.png");

const datas = [
  {
    name: "Nueva Venta",
    route: "Venta",
    icon: "cart",
    key: "1",
   // bg: "#C5F442"
  },
  {
    name: "Clientes",
    route: "Cliente",
    icon: "person",
    key: "2",
  //  bg: "#477EEA",
  // types: "11"
  },
  /*{
    name: "BluetoothList",
    route: "BluetoothList",
    icon: "cart",
    key: "3",
  },
  {
    name: "Prueba",
    route: "Prueba",
    icon: "person",
    key: "4",
  }*/
];


export default class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4
      
    };
    global.ventaUnique = 1;

  }
  nextAction = () => {
    global.ventaUnique = global.ventaUnique + 1
  }

  componentDidMount(){
  }

  componentWillUnmount(){
  } 

  render() {

    return (
        <View
          bounce={false}
          style={{ flex: 1, backgroundColor: "#fff", top: -1 }}
        >
          <SafeAreaView style={{flex: 1}}>

            <View style={{flex:0.6}}>
            <Image square style={styles.drawerImage} source={drawerImage} />
            </View>

            <FlatList
            contentContainerStyle={{flex:0, marginLeft:20}}
            data={datas}
            renderItem={({item}) => {
              return (
              <TouchableOpacity
                style={{alignItems: 'center',
                flexDirection:'row',
                marginBottom: 20}}
                onPress={() => {
                  this.props.navigation.closeDrawer();
                  console.log("****** this.state.uniqueValue: " , global.ventaUnique);
                  this.props.navigation.navigate(item.route , {uniqueValue:global.ventaUnique,origen:"MENU"});
                  this.nextAction();                  
              
                }}
              >
                <Icon
                    name={item.icon}
                    style={{ color: "#33BFAA", fontSize: 26, width: 30 }}
                  />
                <Text style={styles.text}>{item.name}</Text>
                {item.types &&
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 72,
                        backgroundColor: item.bg
                      }}
                    >
                      <Text
                        style={styles.badgeText}
                      >{`${item.types} Types`}</Text>
                    </View>
                  </View>}
              </TouchableOpacity>
              )
            }}
            />
          </SafeAreaView>
        </View>

    );
  }
}

const styles = StyleSheet.create({
  drawerImage: {
    position: "absolute",
    left: Platform.OS === "android" ? windowWidth / 13 : windowWidth / 9,
    top: Platform.OS === "android" ? windowHeight / 13 : windowHeight / 12,
    width: 200,
    height: 150,
    resizeMode: "cover"
  },
  text: {
    fontWeight: Platform.OS === "ios" ? "500" : "400",
    fontSize: 16,
    marginLeft: 20,
    color: '#420EBA'
  },
  badgeText: {
    fontSize: Platform.OS === "ios" ? 13 : 11,
    fontWeight: "400",
    textAlign: "center",
    marginTop: Platform.OS === "android" ? -3 : undefined
  }
})
