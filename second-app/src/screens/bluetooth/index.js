import React, { Component} from "react";
import { Text, View, ActivityIndicator, StyleSheet, Platform, Dimensions, SafeAreaView } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
const deviceHeight = Dimensions.get("window").height;
import Constants from 'expo-constants';
import { DrawerActions } from "@react-navigation/native";
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
        this.setState({deviceSelected:device});
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



      const filteredProductos2 = this.state.devicesArray.filter((producto) => producto.name); // Filtra los productos con nombre definido

        return (
            <View style={styles.container}>
              <View style={{ ...globalStyles.header, height:70 }}>
                
              {(this.state.origen=="MENU" && 
                <View style={{flex:3}}>
                <TouchableOpacity style={{paddingLeft:10}}
                  
                  onPress={() => this.props.navigation.dispatch(DrawerActions.openDrawer())}>
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
                  this.state.paired!= null && Platform.OS == 'android' &&
                  
                  <View style={{flex:1}}>
                        <FlatList 
                          data={this.state.paired}
                          renderItem={({item}) =>
                          <TouchableOpacity
                                          onPress={() => this.seleccionarDispositivo({item})}
                                  >
                            <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                              
                                <View style={{flex:0.5, flexDirection:'row', justifyContent:'center'}}>
                                  
                                    {
                                    (this.state.deviceSelected != null && this.state.deviceSelected.address == item.address) 
                                      ? <Icon name="checkbox-outline" style={globalStyles.headerButton}/> 
                                      : <Icon name="square-outline" style={globalStyles.headerButton}/>
                                    }                                  
                                    
                                  </View>
                              
          
                              
                              <View style={{marginLeft:0, flex:1}}>
                                <Text style={{fontWeight:"bold"}}>{item.name}</Text>
                              </View>
                              
                            </View>
                            </TouchableOpacity>
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
                      <Button 
                        title="Buscar dispositivos"
                        icon={{
                          name: 'bluetooth',
                          type: 'font-awesome',
                          size: 15,
                          color: 'black',
                        }} 
                        iconPosition="left"
                        iconContainerStyle={{ marginLeft: 10}}
                        titleStyle={{ fontWeight: '700', color:'black' }}
                        buttonStyle={{
                          backgroundColor: 'rgba(58, 150, 232, 0.75)',
                          borderColor: 'transparent',
                          borderWidth: 0,
                          borderRadius: 30,
                        }}
                        containerStyle={{
                          width: 190,
                          marginHorizontal: 50,
                          marginVertical: 10,
                        }}
                        onPress={async () =>  this.buscarDispositivos()}
                      />
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
                        data={filteredProductos2}
                        renderItem={({item}) =>
                        <TouchableOpacity 
                                    onPress={() => this.seleccionarDispositivo({item})}
                            >
                          <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                            
                            <View style={{flex:0.5, flexDirection:'row', justifyContent:'center', alignContent:'center'}}>
                            
                                {
                                (this.state.deviceSelected != null && this.state.deviceSelected.address == item.address) 
                                ? <Icon name="checkbox-outline" style={globalStyles.headerButton}/> 
                                : <Icon name="square-outline" style={globalStyles.headerButton}/>
                                }
                                
                            
                            </View>
                    
        
                            
                            <View style={{marginLeft:0, flex:4}}>
                            <Text style={{fontWeight:"bold"}}>{item.name}</Text>
                            <Separator/>
                            </View>
                            
                            </View>
                            </TouchableOpacity>
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
    paddingTop: Platform.OS === 'ios' ? 0 : 0 , 
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