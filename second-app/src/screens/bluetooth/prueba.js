import React, { Component} from "react";
import { View, ActivityIndicator, StyleSheet, Platform, 
    Dimensions, SafeAreaView, FlatList, TouchableOpacity} from "react-native";
    import { Button, Text} from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons';
const deviceHeight = Dimensions.get("window").height;
import Constants from 'expo-constants';
import ScrollView from "react-native-virtualized-view";
import { DrawerActions } from "@react-navigation/native";
import {BluetoothManager, BluetoothEscposPrinter} from "tp-react-native-bluetooth-printer";

const Separator = () => <View style={styles.separator} />;
import isObject from 'isobject';

const paired = [
    {
      address: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      name: 'First Item',
    },
    {
      address: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      name: 'Second Item',
    },
    {
      address: '58694a0f-3da1-471f-bd96-145571e29d72',
      name: 'Third Item',
    },
    {
        address: 'bd7acbea-c1b1-46c2-aed5-3ad5378974',
        name: 'First second Item',
      },
      {
        address: '3ac68afc-c605-48d3-a4f8-fbd91aa9asasa',
        name: 'Second second Item',
      },
      {
        address: '58694a0f-3da1-471f-bd96-145571128qw2',
        name: 'Third second Item',
      },
  ];

export default class Prueba extends Component{

    

    constructor(props) {
        super(props);

        
        console.log("paired en constructor de bluetooth... " , paired);
        if(paired == undefined || paired == null){
            paired = [];
        }
        this.state = {
            paired:paired,
            searching: false,
            prevOrigen: '',
            devicesArray: [{
                address: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
                name: 'First Item',
              },
              {
                address: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
                name: 'Second Item',
              },
              {
                address: '58694a0f-3da1-471f-bd96-145571e29d72',
                name: 'Third Item',
              },
              {
                  address: 'bd7acbea-c1b1-46c2-aed5-3ad5378974',
                  name: 'First second Item',
                },
                {
                  address: '3ac68afc-c605-48d3-a4f8-fbd91aa9asasa',
                  name: 'Second second Item',
                },
                {
                  address: '58694a0f-3da1-471f-bd96-145571128qw2',
                  name: 'Third second Item',
                },],
            buscadorActivo:false,
            busqueda:'',
            deviceSelected:null,
          };        
    }



    cambioEstado(){
        this.state.searching;
        if(this.state.searching === false){
            console.log("Cambio automatico")
        this.setState({searching:true});
        }
        else
        {
            console.log("no pasa")
            this.setState({searching:false})
        }
    }


    render() {
    return(
        <View style={styles.container}>
        <View style={{ ...globalStyles.header, height:110, paddingTop:40 }}>
          
        {(this.state.origen!=="MENU" && 
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
          <SafeAreaView style={{flex:1}}>


          
          {this.state.origen !== "VENTA" &&
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
                renderItem={(paired) =>
                    <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                    <View style={{flex:0.5, flexDirection:'row', justifyContent:'center'}}>
                    <TouchableOpacity
                            onPress={() => {<Text>Holaaa</Text>}}
                    >
                    <Icon name="checkbox-outline" style={globalStyles.headerButton}/> 
                    </TouchableOpacity>
                    </View>
                    <View style={{flex:4}}>
                    <Text style={{fontWeight:"bold", color:'black', fontSize:15}}>nombre: {paired.item.name}</Text>
                    <Text style={{color:'black', fontSize:15}}>id: {paired.item.address}</Text>
                    <Separator/>
                    </View>
                    
                    </View>
                    
                    }
                keyExtractor={(paired) => paired.address.toString()} style={[
                    (this.state.deviceSelected != null && this.state.deviceSelected.address == device.address) 
                    ? styles.itemSelected 
                    : styles.itemFree
                    
                ]}
                                
                />
                </View>
                
            
        }

        
        </View>
        </View>
        }

                {
                    !this.state.searching  &&
                    <View style={{flex:1, flexDirection:'column', alignItems:'center'}}>
                    <TouchableOpacity style={{ margin: 15, marginTop: 50, backgroundColor: "#568DAE", flexDirection:'row', height:30, alignItems:'center', width:200, justifyContent:'center' }} 
                    onPress={this.cambioEstado()}>
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

                    <Text style={{marginLeft:15}}>Dispositivos encontrados</Text>


                    </View>

                }


                <View style={{flex:4}}>

                
                {

                    this.state.devicesArray!= null && this.state.searching &&
                        
                        <View style={{flex:1}}>    
                        <FlatList 
                        data={this.state.devicesArray}
                        renderItem={({item}) =>
                          <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                    {this.state.origen !== "MENU" && 
                            <View style={{flex:0.5, flexDirection:'row', justifyContent:'center', alignContent:'center'}}>
                            <TouchableOpacity 
                                    onPress={() => {}}
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
                            <Text style={{fontWeight:"bold", fontSize:15}}>nombre: {item.name}</Text>
                            <Text style={{fontWeight:"bold", fontSize:15}}>id: {item.address}</Text>
                            
                            <Separator/>
                            </View>
                            </View>
                            }
                            keyExtractor={(item) => item.address.toString()} style={[
                            (this.state.deviceSelected != null && this.state.deviceSelected.address == item.address) 
                            ? styles.itemSelected 
                            : styles.itemFree
                          ]}
                        />
                        </View>

                }
                </View>

                <View style={{ alignItems:'center'}}>


                <View style={{justifyContent: 'center', alignItems:'center'}}>
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

              onPress={() => {  this.buscadorDispositivos() }
              }/>
          </View>

<View >
        <SafeAreaView>

          <View style={{justifyContent: 'center', alignItems:'center',marginTop:20}}>
            <Text>La venta se ha guardado exitosamente. </Text>
          </View>
          <View style={{justifyContent: 'center', alignItems:'center',margin:20}}>
            <Text > Folio: </Text>
            <Text style={{fontWeight:'bold',fontSize:20}}>{this.state.folio}</Text> 
          </View>

          <View style={{justifyContent: 'center', alignItems:'center'}}>
              <Button 

              title="Imprimir"
              icon={{
                name: 'print',
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
              width: 150,
              marginHorizontal: 50,
              marginVertical: 10,
              
            }}

              onPress={() => {  this.imprimirTicket(0) }
              }/>

{ false &&
              <TouchableOpacity style={{ marginLeft:10,backgroundColor: "#568DAE"}}>
                  <Icon style={{flex:1, fontSize:20, paddingLeft:5}} name='ios-send' />
                  <Text style={{flex:2}}>Enviar</Text>
              </TouchableOpacity>
              }
          </View>
          
          <View style={{justifyContent: 'center', alignItems:'center'}}>
              <Button 

              title="Nueva Venta"
              icon={{
                name: 'plus',
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
              width: 150,
              marginHorizontal: 50,
              marginVertical: 10,
              
            }}

              onPress={() => {  this.nuevaVenta() }
              }/>
          </View>


          
                {
                    !this.state.connecting &&

                    <View style={{justifyContent: 'center', alignItems:'center'}}>
                      <ActivityIndicator size="large" color='#51747F' />
                      <Text>Conectando con ...</Text>
                      <Button 

                      title="Cancelar"
                      icon={{
                        name: 'close',
                        type: 'font-awesome',
                        size: 20,
                        color: 'black',
                      }} 
                      iconPosition="left"
                      iconContainerStyle={{ marginLeft: 10}}
                      titleStyle={{ fontWeight: '700', color:'black' }}
                      buttonStyle={{
                      backgroundColor: 'rgba(204, 0, 0, 0.65)',
                      borderColor: 'transparent',
                      borderWidth: 0,
                      borderRadius: 30,
                    }}
                    containerStyle={{
                      width: 150,
                      marginHorizontal: 50,
                      marginVertical: 10,
                      
                    }}

                      onPress={() => {  this.nuevaVenta() }
                      }/>
               </View>
                }
                {
                    !this.state.printer &&

                    <View style={{justifyContent: 'center', alignItems:'center'}}>
                      <Button 

                      title="Desconectar dispositivo"
                      icon={{
                        name: 'bluetooth',
                        type: 'font-awesome',
                        size: 20,
                        color: 'black',
                      }} 
                      iconPosition="left"
                      iconContainerStyle={{ marginLeft: 10}}
                      titleStyle={{ fontWeight: '700', color:'black' }}
                      buttonStyle={{
                      backgroundColor: 'rgba(255,215,0,0.5)',
                      borderColor: 'transparent',
                      borderWidth: 0,
                      borderRadius: 30,
                    }}
                    containerStyle={{
                      width: 160,
                      marginHorizontal: 50,
                      marginVertical: 10,
                      
                    }}

                      onPress={() => {  this.disconnectDevice() }
                      }/>
               </View>
                }      

</SafeAreaView>
</View>

            </View>
        </SafeAreaView>
        </View>
        {this.state.origen !== "VENTA" &&
              
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


        )
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