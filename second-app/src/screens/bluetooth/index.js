import React, { Component} from "react";
import { Text, View, ActivityIndicator, StyleSheet, Platform, Dimensions, SafeAreaView } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
const deviceHeight = Dimensions.get("window").height;
import Constants from 'expo-constants';

import {BluetoothManager, BluetoothEscposPrinter} from "tp-react-native-bluetooth-printer";

const Separator = () => <View style={styles.separator} />;
import isObject from 'isobject';
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Button } from "@rneui/themed";

export default class BluetoothList extends Component {
    _listeners = [];

    constructor(props) {
        super(props);

        let origen = this.props.route.params.origen;
        let paired = this.props.route.params.paired;
        
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
        console.log("Deviceeeeee", paired)


    }

    seleccionarDispositivo(item){
      let device = item.item;
      console.log("SI ENTRAAAAAA A SELECCION", item.item)
      console.log("Vacio o null", this.state.deviceSelected)
        this.setState({deviceSelected:device});
          console.log("SEGUNDO ENTRA", this,this.state.deviceSelected)
      }
      conectarDispositivo(){
          const {route, navigation} = this.props;

          console.log("dispositivo seleccionado: ", this.state.deviceSelected);
          const onGoBack = route.params.onGoBack
          if (onGoBack){
            onGoBack(this.state.deviceSelected);
          }
          this.props.navigation.goBack();
      }
    

    render() {
      console.log("CONNNNN", this.state.paired)
        return (
            <View style={styles.container}>
              <View style={{ ...globalStyles.header, height:110, paddingTop:40 }}>
                
              {(this.state.origen=="MENU" && 
                <View style={{flex:3}}>
                <TouchableOpacity style={{paddingLeft:10}}
                  
                  onPress={() => this.props.navigation.openDrawer()}>
                  <Icon name="menu" style={{color:'#2496bc', fontSize: 30}} />
                </TouchableOpacity>
                </View>
              )}
              {(this.state.origen=="VENTA" && 
              
              <View style={{flex:3, paddingLeft:10}}>
              <TouchableOpacity style={{flex:0}}onPress={() => this.props.navigation.goBack()}>
                <Icon name="arrow-back"  style={globalStyles.headerButton} />
              </TouchableOpacity>
            </View>
              )}
  
                <View style={{flex: 5,alignItems:"flex-end", justifyContent:"center", paddingRight:10}}>
                <Text style={{...globalStyles.headerTitle}}>
                {this.state.origen == "MENU" && "Listado de impresoras"}
                {this.state.origen == "VENTA" && "Seleccionar Impresora"}            
                  </Text>
                </View>
                   
              </View>


              <View style={{flex:1}}>
                <SafeAreaView style={{flex: 1}}>

      
                
                {this.state.origen == "VENTA" && (this.state.paired.length > 0) && 
                <View style={{flex:6}}>
                    <Text style={{paddingTop:10}}>Estas conectado a varios dispositivos, favor de seleccionar la impresora.</Text>
                    
                      <View style={{flex:0, backgroundColor:'#f6f6f6', justifyContent:'center'}}>
                        <Text style={{marginLeft:15}}>Dispositivos conectadoss</Text>
                      </View>



                  <View style={{flex:1}}>
                {
                  this.state.paired!= null &&
                  
                  <View style={{flex:1}}>
                        <FlatList 
                          data={this.state.paired}
                          renderItem={({item}) =>
                            <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                              {this.state.origen == "VENTA" && 
                                <View style={{flex:0.5, flexDirection:'row', justifyContent:'center'}}>
                                  <TouchableOpacity
                                          onPress={() => this.seleccionarDispositivo({item})}
                                  >
                                    {
                                    (this.state.deviceSelected != null && this.state.deviceSelected.address == item.address) 
                                      ? <Icon name="checkbox-outline" style={globalStyles.headerButton}/> 
                                      : <Icon name="square-outline" style={globalStyles.headerButton}/>
                                    }                                  
                                    </TouchableOpacity>
                                  </View>
                              }
          
                              
                              <View style={{marginLeft:0, flex:1}}>
                                <Text style={{fontWeight:"bold"}}>{item.name}</Text>
                              </View>
                            </View>
                          }
                        />
                  </View>
                }

                  </View>
                </View>   
                              
                }

         
                {
                    !this.state.searching  &&
                    <View style={{flex:2, flexDirection:'column', alignItems:'center'}}>
                    <TouchableOpacity style={{ margin: 15, marginTop: 50, backgroundColor: "#568DAE", flexDirection:'row', 
                    height:30, alignItems:'center', width:200, justifyContent:'center' }} 
                    onPress={async () => this.buscarDispositivos()}>
                          <Icon name='ios-bluetooth' style={{fontSize:25}}/>
                          <Text>Buscar dispositivos</Text>
                    </TouchableOpacity>
                    </View>
                }
                {
                    this.state.searching &&
                    <View style={{alignItems:'center', flex:1}}>
                    <ActivityIndicator size="large" color='#51747F' />
                    <Text>Buscando dispositivos...</Text>
                    </View>
                }

                {
                    this.state.devicesArray.length > 0 &&
                    <View style={{flex:0, backgroundColor:'#f6f6f6', justifyContent:'center'}}>
                    <Text>Dispositivos encontrados</Text>
                    </View>

                }
                <View style={{flex:4}}>

                
                {

                    this.state.devicesArray!= null &&
                        
                        <View style={{flex:1}}>    
                        <FlatList 
                        data={this.state.devicesArray}
                        renderItem={({item}) =>
                          <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                    {this.state.origen == "VENTA" && 
                            <View style={{flex:0.5, flexDirection:'row', justifyContent:'center', alignContent:'center'}}>
                            <TouchableOpacity 
                                    onPress={() => this.seleccionarDispositivo({item})}
                            >
                                {
                                (this.state.deviceSelected != null && this.state.deviceSelected.address == item.address) 
                                ? <Icon name="checkbox-outline" style={globalStyles.headerButton}/> 
                                : <Icon name="square-outline" style={globalStyles.headerButton}/>
                                }
                                
                            </TouchableOpacity>
                            </View>
                    }
        
                            
                            <View style={{marginLeft:0, flex:4}}>
                            <Text style={{fontWeight:"bold"}}>{item.name}</Text>
                            <Separator/>
                            </View>
                            </View>
                            }
                        />
                        </View>
                }
      
                  
                </View>
                </SafeAreaView>

              </View>
      {this.state.origen == "VENTA" &&
              
               <View style={{ 
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', bottom:0, flex:0}}>
                <View style={{backgroundColor: "#51747F", flex: 1, position: 'relative'}}>
                  <Button
                  title='Seleccionar impresora'
                  disabled = {this.state.deviceSelected == null}
                  onPress={() => this.conectarDispositivo()}
                  />
                  
                </View>
              </View>
      }

      
            </View>
          );

    }

}

const styles = StyleSheet.create({

  container: {
    backgroundColor: "#fff",
    flex: 1
  },
  itemSelected: {
    backgroundColor:"lightgray"    
  },
  itemFree:{
    backgroundColor:"white"    

  },
  btn: {
    marginBottom: 8
  },
  separator:{
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth
  }

})

const globalStyles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF", flex: 1
  },
  text: {
    alignSelf: "center",
    marginBottom: 7
  },
  mb: {
    marginBottom: 15
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight , 
    backgroundColor:'#f6f6f6',
    color:'#000000',
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
    height:90,
    flexDirection: 'row',
    flex: 0,
    alignItems: 'center',
    justifyContent: 'flex-start', 
    paddingTop: 35,
  },
  headerRight: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10
  },
  headerButton: {
    color:'#2496bc',
    fontSize: 25
  },
  headerTitle: {
    color:'#000000',
    textAlign:'center',
    fontWeight: 'bold',
  },
  TouchableOpacityStyle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 110,
  },
  FloatingButtonStyle: {
//    resizeMode: 'contain',
    width: 50,
    height: 50,
    //backgroundColor:'black'
  },
}
)