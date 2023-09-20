import React, { Component } from "react";
import { Image,SafeAreaView } from "react-native";
import {
  Content,
  Text,
  List,
  ListItem,
  Icon,
  Container,
  Left,
  Right,
  Badge
} from "react-native";
import styles from "./style";

const drawerCover = require("./../../../assets/blanco.png");
const drawerImage = require("./../../../assets/concrad.png");
const datas = [
  {
    name: "Nueva Venta",
    route: "Venta",
    icon: "md-cart",
    key: "1",
   // bg: "#C5F442"
  },
  {
    name: "Clientes",
    route: "Cliente",
    icon: "md-person",
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


  render() {

    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: "#fff", top: -1 }}
        >
          <SafeAreaView style={{flex: 1}}>

            <Image source={drawerCover} style={styles.drawerCover} />
            <Image square style={styles.drawerImage} source={drawerImage} />


            <List
            dataArray={datas}
            renderRow={data =>
              <ListItem
                button
                noBorder
                onPress={() => {
                  this.props.navigation.closeDrawer()
                  console.log("****** this.state.uniqueValue: " , global.ventaUnique);
                  this.props.navigation.navigate(data.route , {uniqueValue:global.ventaUnique,origen:"MENU"});
                  this.nextAction();                  

                }}
              >
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
                  </Right>}
              </ListItem>}
            />

          </SafeAreaView>
        </Content>
      </Container>
    );
  }
}

