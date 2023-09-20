import React, { Component} from "react";
import {
  Container,  Header,  Title,  Content,  Button,  Icon,  ListItem,  Text,  Thumbnail,  Left,  Body,
  Right,  Item,  Footer,  FooterTab,  Badge,  Accordion,  View,  Input,  List,  Toast,  H1,  H2,  H3, H4, CheckBox,
  Spinner, Separator
} from "react-native";
import { SafeAreaView } from 'react-native';

import {BluetoothManager, BluetoothEscposPrinter} from "tp-react-native-bluetooth-printer";


import styles from "./styles";
import globalStyles from "../styles";
import isObject from 'isobject';

export default class BluetoothList extends Component {
    _listeners = [];

    constructor(props) {
        super(props);

        let origen = this.props.navigation.getParam('origen');
        let paired = this.props.navigation.getParam('paired');
        
        console.log("paired en constructor de bluetooth... " , paired);
        if(paired == undefined || paired == null){
            paired = [];
        }
        console.log("origen: " , origen);
        this.state = {
            origen:origen,
            paired:paired,
            searching: false,
            origen: origen,
            prevOrigen: '',
            devicesArray: [],
            buscadorActivo:false,
            busqueda:'',
            deviceSelected:null,
          };        
    }

    componentDidMount() {

    }
        //alert(BluetoothManager)

    buscarDispositivos(){

        this.setState({
            searching: true,
            devicesArray: []
        },
        () => {

            BluetoothManager.scanDevices()
            .then((s)=> {
              console.log("result isObject: ",isObject(s));
              
              var ss = null;

              if(isObject(s)){
//              console.log("result - s: ",{s});
                ss = {};
                ss.found = JSON.parse(s.found);
                ss.paired = JSON.parse(s.paired);

              }else{
                ss = JSON.parse(s);

              }

                console.log("scanDevices.found...");
                
                const allDevices = ss.found;
    
                this.setState({
                    searching: false,
                    devicesArray: allDevices
                })
    
            }, (er)=> {
                this.setState({
                    searching: false,
                    devicesArray: []
    
                })
                console.log("scanDevices - error: ",er);
            });

        });



    }

    seleccionarDispositivo(device ){
        this.setState({deviceSelected:device})
        
      }
      conectarDispositivo(){
        console.log("dispositivo seleccionado: ", this.state.deviceSelected);
        this.props.navigation.state.params.onGoBack(this.state.deviceSelected);
        this.props.navigation.goBack();
      }
    

    render() {

        return (
            <Container style={styles.container}>
              <Header iosBarStyle={"dark-content"} style={{ ...globalStyles.header , height:90,paddingTop:10 }} searchBar rounded>
                
              {(this.state.origen=="MENU" && 
                <Left style={{flex: 0}}>
                  <Button
                    transparent
                    onPress={() => this.props.navigation.openDrawer()}>
                    <Icon name="menu" style={globalStyles.headerButton} />
                  </Button>
                </Left>
              )}
              {(this.state.origen=="VENTA" && 
              
              <Left>
                  <Button transparent onPress={() => this.props.navigation.goBack()}>
                    <Icon name="arrow-back"  style={globalStyles.headerButton} />
                  </Button>
                </Left>
              )}
      
      
      
              
              
                <Body style={{flex: 1,alignContent:"center"}}>
                <Title style={{...globalStyles.headerTitle}}>
                {this.state.origen == "MENU" && "Listado de impresoras"}
                {this.state.origen == "VENTA" && "Seleccionar Impresora"}            
                  </Title>
                </Body>
                       
              </Header>
              <Content>
                <SafeAreaView style={{flex: 1}}>

      
                
                {this.state.origen == "VENTA" && (this.state.paired.length > 0) && 
                <View>
                    <Text style={{paddingTop:10}}>Estas conectado a varios dispositivos, favor de seleccionar la impresora.</Text>
                    
                    <Separator bordered>
                    <Text>Dispositivos conectados</Text>
                    </Separator>



                  <List>
                {
                    this.state.paired.map((device,key) => {
//                        console.log("en render dentro del map: " , {device, key});

                        if(device.name != undefined){

                        return (                        
                            
                        <ListItem thumbnail key={device.address} style={[
                            (this.state.deviceSelected != null && this.state.deviceSelected.address == device.address) ? styles.itemSelected : styles.itemFree
                            
                        ]}
                        >
                    {this.state.origen == "VENTA" && 
                            <Left style={{padding:0,marginLeft:0}}>
                            <Button transparent
                                    onPress={() => {this.seleccionarDispositivo(device);}}
                            >
                                {
                                (this.state.deviceSelected != null && this.state.deviceSelected.address == device.address) ? <Icon name="ios-checkbox-outline" style={globalStyles.headerButton}/> : <Icon name="square-outline" style={globalStyles.headerButton}/>
                                }
                                
                            </Button>
                            </Left>
                    }
        
                            
                            <Body style={{marginLeft:0}}>
                            <Text style={{fontWeight:"bold"}}>{device.name}</Text>
                            </Body>
                        </ListItem>
                        );
                    }

                  })
                }
      
                  
                  </List>
                          
                </View>                    
                }

         
                {
                    !this.state.searching  &&
                    <Button block style={{ margin: 15, marginTop: 50, backgroundColor: "#568DAE" }} onPress={async () => this.buscarDispositivos()}>
                          <Icon name='ios-bluetooth' />
                          <Text>Buscar dispositivos</Text>
                    </Button>
                }
                {
                    this.state.searching &&
                    <View style={{alignItems:'center'}}>
                    <Spinner color='#51747F' />
                    <Text>Buscando dispositivos...</Text>
                    </View>
                }

                {
                    this.state.devicesArray.length > 0 &&
                    <Separator bordered>
                    <Text>Dispositivos encontrados</Text>
                    </Separator>

                }
                <List>

                
                {

                    this.state.devicesArray.map((device,key) => {
//                        console.log("en render dentro del map: " , {device, key});

                        if(device.name != undefined && device.name != ""){

                        return (
                        
                            
                        <ListItem thumbnail key={device.address} style={[
                            (this.state.deviceSelected != null && this.state.deviceSelected.address == device.address) ? styles.itemSelected : styles.itemFree
                            
                        ]}
                        >
                    {this.state.origen == "VENTA" && 
                            <Left style={{padding:0,marginLeft:0}}>
                            <Button transparent
                                    onPress={() => {this.seleccionarDispositivo(device);}}
                            >
                                {
                                (this.state.deviceSelected != null && this.state.deviceSelected.address == device.address) ? <Icon name="ios-checkbox-outline" style={globalStyles.headerButton}/> : <Icon name="square-outline" style={globalStyles.headerButton}/>
                                }
                                
                            </Button>
                            </Left>
                    }
        
                            
                            <Body style={{marginLeft:0}}>
                            <Text style={{fontWeight:"bold"}}>{device.name}</Text>
                            </Body>
                        </ListItem>
                        );
                    }

                  })
                }
      
                  
                </List>
                </SafeAreaView>

              </Content>
      {this.state.origen == "VENTA" &&
              
               <Footer >
                <FooterTab style={{backgroundColor: "#51747F"}}>
                  <Button
                  disabled = {this.state.deviceSelected == null}
                    
                   // onPress={() => this.toggleTab3()}
                   onPress={() => this.conectarDispositivo()}
                  >
                    
                    <Text style={{color: 'white'}}>Seleccionar impresora</Text>
                  </Button>
                  
                </FooterTab>
              </Footer>
      }
      
            </Container>
          );

    }

}

