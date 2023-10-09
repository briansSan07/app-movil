import React, { Component } from "react";
import { Image,SafeAreaView, FlatList, Text, View,
   Dimensions, Platform, StyleSheet, TouchableOpacity } from "react-native";


import Icon from 'react-native-vector-icons/Ionicons';
//import { TouchableOpacity } from "react-native-gesture-handler";




const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

const drawerCover = require("./../../../assets/blanco.png");
const drawerImage = require("./../../../assets/concrad.png");

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
  }
/*  ,
  {
    name: "Consultar venta",
    route: "Login",
    key: "3",
   // icon: "arrow-down",
   // bg: "#DA4437",
   // types: "4"
  },
  {
    name: "ConfirmacionVenta",
    route: "ConfirmacionVenta",
    key: "4",
   // icon: "arrow-down",
   // bg: "#DA4437",
   // types: "4"
  },
*/
/*  ,
  {
    name: "Accordion",
    route: "NHAccordion",
  //  icon: "repeat",
  //  bg: "#C5F442",
  //  types: "5"
  },
  {
    name: "Actionsheet",
    route: "Actionsheet",
  //  icon: "easel",
  // bg: "#C5F442"
  },
  {
    name: "Badge",
    route: "NHBadge",
    icon: "notifications",
    bg: "#4DCAE0"
  },
  {
    name: "Button",
    route: "NHButton",
    icon: "radio-button-off",
    bg: "#1EBC7C",
    types: "9"
  },
  {
    name: "Card",
    route: "NHCard",
    icon: "keypad",
    bg: "#B89EF5",
    types: "8"
  },
  {
    name: "Check Box",
    route: "NHCheckbox",
    icon: "checkmark-circle",
    bg: "#EB6B23"
  },
  {
    name: "Date Picker",
    route: "NHDatePicker",
    icon: "calendar",
    bg: "#EB6B23"
  },
  {
    name: "Deck Swiper",
    route: "NHDeckSwiper",
    icon: "swap",
    bg: "#3591FA",
    types: "2"
  },
  {
    name: "Fab",
    route: "NHFab",
    icon: "help-buoy",
    bg: "#EF6092",
    types: "2"
  },
  {
    name: "Form & Inputs",
    route: "NHForm",
    icon: "call",
    bg: "#EFB406",
    types: "12"
  },
  {
    name: "Icon",
    route: "NHIcon",
    icon: "information-circle",
    bg: "#bfe9ea",
    types: "4"
  },
  {
    name: "Layout",
    route: "NHLayout",
    icon: "grid",
    bg: "#9F897C",
    types: "5"
  },
  {
    name: "List",
    route: "NHList",
    icon: "lock",
    bg: "#5DCEE2",
    types: "8"
  },
  {
    name: "ListSwipe",
    route: "ListSwipe",
    icon: "code-working",
    bg: "#C5F442",
    types: "3"
  },
  {
    name: "Picker",
    route: "NHPicker",
    icon: "arrow-dropdown",
    bg: "#F50C75"
  },
  {
    name: "Radio",
    route: "NHRadio",
    icon: "radio-button-on",
    bg: "#6FEA90"
  },
  {
    name: "SearchBar",
    route: "NHSearchbar",
    icon: "search",
    bg: "#29783B"
  },
  {
    name: "Segment",
    route: "Segment",
    icon: "menu",
    bg: "#0A2C6B",
    types: "3"
  },
  {
    name: "Spinner",
    route: "NHSpinner",
    icon: "navigate",
    bg: "#BE6F50"
  },
  {
    name: "Tabs",
    route: "NHTab",
    icon: "home",
    bg: "#AB6AED",
    types: "3"
  },
  {
    name: "Thumbnail",
    route: "NHThumbnail",
    icon: "image",
    bg: "#cc0000",
    types: "2"
  },
  {
    name: "Toast",
    route: "NHToast",
    icon: "albums",
    bg: "#C5F442",
    types: "6"
  },
  {
    name: "Typography",
    route: "NHTypography",
    icon: "paper",
    bg: "#48525D"
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

            <Image source={drawerCover} style={styles.drawerCover} />
            <Image square style={styles.drawerImage} source={drawerImage} />


            <FlatList
            contentContainerStyle={{flex:1, marginLeft:20}}
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
  drawerCover: {
    alignSelf: "stretch",
    height: windowHeight / 3.5,
    width: null,
    position: "relative",
    marginBottom: 5
  },
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





/*
<Left>
                  <Icon
                    active
                    name={data.icon}
                    style={{ color: "#777", fontSize: 26, width: 30 }}
                  />
                  <Text style={styles.text}>
                    {data.name}
                  </Text>
                </Left>
                {data.types &&
                  <Right style={{ flex: 1 }}>
                    <Badge
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 72,
                        backgroundColor: data.bg
                      }}
                    >
                      <Text
                        style={styles.badgeText}
                      >{`${data.types} Types`}</Text>
                    </Badge>
                  </Right>
                  */