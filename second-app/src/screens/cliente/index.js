import 'react-native-gesture-handler';
import React, { Component} from "react";
import { Button, Text,  Dimensions, Platform,  View, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput, SafeAreaView } from "react-native";
import {Picker} from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';

const deviceHeight = Dimensions.get("window").height;
import Constants from 'expo-constants';
import { ScrollView } from 'react-native-gesture-handler';


const Stack = createNativeStackNavigator();

const Separator = () => <View style={styles.separator} />;

const CatalogosModel = require ('../../lib/model/CatalogosModel');

const ClienteModel = require ('../../lib/model/ClienteModel');

const catalogosModel = new CatalogosModel();
const clienteModel = new ClienteModel();


var inicial=" ";
let porSurtir = [];
let textPersistence = "";


export default class Cliente extends Component {

  constructor(props) {    
    super(props)

//    console.log("* props en Venta-index:  " , props.navigation.state.params);
    
const {route} = this.props;
this.origen = route.params.origen;


   console.log("origen:" , this.origen);

    if(this.origen == undefined){
      this.origen="MENU";
    }
    console.log("origen:" , this.origen);
 
    this.state = {
      isLoading: true, 
      origen: this.origen,
      prevOrigen: '',
      clientesArray: [],
      clientesDisplayArray: [],      
      buscadorActivo:false,
      busqueda:'',
      iniciarBusqueda:false,      
      busquedaConcluida:false,      

      clienteSelected:null,
      estadosArray: Platform.OS === 'ios' ?  ((global.estados) ? [...global.estados] : []) : ((global.estados) ? [{nombre:"Ver por estado",id_estado:"0"},...global.estados] : []),
      estado:(global.estados) ? global.estados : "0"

    };

    console.log("isLoading" , this.state.isLoading);
  }

  componentDidMount() {

    console.log("componentDidMount");

    this.consultarEstados();
//    this.consultarClientes();
    this.setState({isLoading:false});


  }

  componentDidUpdate(){


    const { route } = this.props;
    this.origen = route.params.origen; 
    
//    console.log("componentDidUpdate - origen:" , origen ,  " prevOrigen: ", this.state.prevOrigen );

    if(this.origen != this.state.prevOrigen){
      this.setState({origen: this.origen, prevOrigen: this.origen });
    }

    console.log("Finish componentDidUpdate ");
  }

  

  consultarEstados(){
    
    if (global.estados == null) {
      catalogosModel.consultarEstados()
      .then((result) => {
//        console.log("Resultado de consultarMetodosPago:" , result.metodosPagoList);

        global.estados = result.estadosList;

        this.setState({
          estadosArray:global.estados,
          estado:(this.state.estado == null) ? "1":this.state.estado
        },() => {
          this.filtrarClienteEstado(this.state.estado)
        });
      })
      .catch((error) => {
        console.log('error al consultarEstados: ', error.message);
      });
    }
    }
    
  





  consultarClientes(){
    clienteModel.consultarClientes()
    .then((result) => {
//      console.log("Resultado de onsultarClientes:" , result.clientesList);
      this.setState({
        clientesArray:result.clientesList,
        clientesDisplayArray:result.clientesList
      });
    })
    .catch((error) => {
      console.log('error al onsultarClientes: ', error.message);
    });
  }

  verCliente(cliente){
    console.log("verCliente: ",cliente);
    this.props.navigation.navigate("ClienteDetalle", {cliente})
  }

  seleccionarCliente(cliente ){
    this.setState({clienteSelected:cliente})
    console.log("seleccionarCliente: ");
  }
  agregarCliente(){
    const {route, navigation} = this.props;


    console.log("cliente seleccionado: ", this.state.clienteSelected);
    const onGoBack = route.params.onGoBack
    if (onGoBack){
      onGoBack(this.state.clienteSelected);
    }
    this.props.navigation.goBack();
  }

  onChangeTBox(producto, cantidad) {

    let carritoCompras = [...this.state.carritoCompras];
    if (cantidad >= producto.cantidad) {
        console.log("surtir: " + producto.nombre + " para surtir este pedido");
        porSurtir.push(producto.nombre)
    }
    if (cantidad === " " || cantidad === undefined || cantidad === null || cantidad === "NaN") {
        for (let i = 0; i < carritoCompras.length; i++) {
            if (carritoCompras[i].id === producto.idProducto) {
                carritoCompras.splice(i, 1)
                //console.log("Global:" + carritoCompras.length)
            }
        }
        for (let i = 0; i < this.state.carritoCompras.length; i++) {
            if (this.state.carritoCompras[i].id === producto.idProducto) {
                this.state.carritoCompras.splice(i, 1)
                //console.log("state:" + this.state.carritoCompras.length)
            }
        }
        this.setState({carritoCompras: carritoCompras }, () => {this.calculandoCarrito()});
    } else {
        //console.log({carritoCompras});
        let nuevoProductoParaCarrito = carritoCompras.filter(function(data) {
            return data.id === producto.idProducto;
        })
        //console.log("ES ARRAY? " + Array.isArray(nuevoProductoParaCarrito));
        if (nuevoProductoParaCarrito.length > 0) { // si si existe
            //console.log("entre a if");
            nuevoProductoParaCarrito[0].cantidad = parseInt(cantidad);
        } else {
            //console.log("entre a else");
            nuevoProductoParaCarrito = {
                id: producto.idProducto,
                cantidad: parseInt(cantidad),
                nombre: producto.nombre,
                precio: producto.precio,
                img: producto.imagen
            };
            carritoCompras.push(nuevoProductoParaCarrito);
        }
        //console.log({carritoCompras});
        this.setState({carritoCompras: carritoCompras }, () => {this.calculandoCarrito()});
        //console.log("this.state.carritoCompras1: ", this.state.carritoCompras);
    }
}





    pasarDatos(){
      this.props.navigation.navigate("Carrito", {carrito:this.state.carritoCompras})
      this.categoriaArray=[];
      this.setState({car: this.state.carritoCompras=[]})
      this.consultaCategoria()
      this.consultaProductos()
      this.calculandoCarrito()
    }


    activarBuscadorClientes(){
      
      console.log("activarBuscadorClientes");
      this.setState({
        iniciarBusqueda:false,
        busquedaConcluida:false,
        buscadorActivo:!this.state.buscadorActivo,
        clientesDisplayArray:[]
      },() => {
        console.log("this.state.buscadorActivo: " , this.state.buscadorActivo);

        if(this.state.buscadorActivo == false){
          this.onChangeSeachBox("");          
        }
      });
    }
    
    onChangeSeachBox(busqueda){
        this.setState({busqueda:busqueda}); //,() => {          this.filtrarClientesByNombre();                  });
    }

    realizarBusqueda(){
      console.log("realizarBusqueda");
      this.setState({iniciarBusqueda:true,busquedaConcluida:false}, () => {
        setTimeout(() => {this.filtrarClientesByNombre()},300);
    });
      
    }
    

    filtrarClientesByNombre () {
      console.log("_______________________________________")
      let buscador=[];
      let query = this.state.busqueda;

      if(query.length >= 3){
        query = query.toUpperCase().trim().replace(" ","%");

        console.log("Buscando clientes por: " , query);
        clienteModel.consultarClientesByNombre("%" + query + "%" )
        .then((result) => {
    //      console.log("Resultado de onsultarClientes:" , result.clientesList);
          this.setState({
            estado:null,
            clientesArray:result.clientesList,
            clientesDisplayArray:result.clientesList,
            iniciarBusqueda:false,
            busquedaConcluida:true});

        })
        .catch((error) => {
          console.log('error al onsultarClientes: ', error.message);
        });        
      }


      
      /*
      //nombre = nombre.toUpperCase()
      const clientesDisplayArray = this.state.clientesArray.filter((cliente) => { return this.findPalabraClave( query , cliente.clave + " " + cliente.nombre_comercial ) } );       

      this.setState({ clientesDisplayArray : clientesDisplayArray }, () => {
        
        console.log("this.clientesDisplayArray: " , this.state.clientesDisplayArray);
        if(this.state.clienteSelected != null){
          const existeSeleccionado = this.state.clientesDisplayArray.filter((cliente) => { return  cliente.key == this.state.clienteSelected.key } );
          
          console.log("existeSeleccionado: " , existeSeleccionado);
          
          if(existeSeleccionado.length == 0){
            this.setState({clienteSelected:null});
          }
        }

      });
//      this.state.productosBuscados=buscador;
*/
//      this.render();
    }

    
    filtrarClienteEstado(estado){
      
        
      console.log("filtrarClienteEstado: " , {estado});
      this.setState({isLoading:true}, () => {


        if(estado == "0"){
          this.setState({
            isLoading:false,
            estado:estado,
            clientesArray:[],
            clientesDisplayArray:[]
          });
        }
        else{
          clienteModel.consultarClientesByEstado(estado)
          .then((result) => {
      //      console.log("Resultado de onsultarClientes:" , result.clientesList);
            this.setState({
              isLoading:false,
              estado:estado,
              clientesArray:result.clientesList,
              clientesDisplayArray:result.clientesList
            });
          })
          .catch((error) => {
            console.log('error al onsultarClientes: ', error.message);
          });
            
        }        

      });
    }
    
    


  findPalabraClave (buscando, origenBusqueda) {

  origenBusqueda = origenBusqueda.toUpperCase()
        const palabrasClave = buscando.toUpperCase().trim()
        const palabrasList = palabrasClave.split(' ')
        
        let finded = true
        palabrasList.forEach(function (palabra) {
          const reg = new RegExp( palabra)
          if (origenBusqueda.match(reg)) {
          } else {
            finded = false
          }
        })
        return finded
  }

  
  render() {

    
    const buscadorActivo = this.state.buscadorActivo;
    return (
      <View style={styles.container}>
        <View style={{ ...globalStyles.header, height:110, paddingTop:40}} >
          
        {(this.state.origen=="MENU" && 
          <View style={{flex: 3,}}>
            <TouchableOpacity style={{paddingLeft:10}}
              
              onPress={() => this.props.navigation.dispatch(DrawerActions.openDrawer())}>
              <Icon name="menu" style={{color:'#2496bc', fontSize: 30}} />
            </TouchableOpacity>
          </View>
        )}
        {(this.state.origen=="VENTA" && 
        
        <View style={{flex:3, paddingLeft:10}}>
            <TouchableOpacity style={{flex:0}} onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back"  style={globalStyles.headerButton} />
            </TouchableOpacity>
          </View>
        )}



        {
          buscadorActivo &&
          <View style={{flex: 3}}>
          <View >
              
              <TextInput placeholder = "Nombre del cliente"
                  autoFocus = {true}
                  onChangeText = {(busqueda) => this.onChangeSeachBox(busqueda)}
                  onBlur={ this.realizarBusqueda.bind(this)}
                  blurOnSubmit={true}
                  value = { "" + this.state.busqueda }
              
              />
          </View>
          <Text style={{fontSize:10}}>Mínimo 3 caracteres. Da enter para iniciar búsqueda</Text>
          </View>

        }
        {
          !buscadorActivo &&
          <View style={{flex: 8,alignContent:"center", paddingTop: 12, paddingBottom: 5}}>
            <Text style={globalStyles.headerTitle}>
            {this.state.origen == "MENU" && "Clientes"}
            {this.state.origen == "VENTA" && "Agregar cliente"}            
            </Text>
            {Platform.OS === 'android' ? <View style={{ flex:1,flexDirection:"row", paddingTop:0, paddingBottom: 0, borderWidth:1, justifyContent: 'center', alignSelf:'stretch',
                                borderLeftColor:"#000000",borderBottomColor:"#000000",
                                borderTopColor:"#000000",borderRightColor:"#000000", 
                                alignItems: 'center', borderRadius:20}}>
                            
                              <Picker
                                
                                key={'edo'}
                                mode="dropdown"
                                
                               
                                style={{ width:225}} 
                                selectedValue={ this.state.estado}
                                onValueChange={(value) => {this.filtrarClienteEstado(value)} }
                              > 
                                {
                                  this.state.estadosArray.map((estado) => { 
                                    return <Picker.Item label={estado.nombre} value={""+estado.id_estado} key={"pi_"+estado.id_estado} /> 
                                })
                                }
                              </Picker>
                              </View>
                              
                            : 
                            <View style={{flex:1, flexDirection:'row'}}>
                            <RNPickerSelect
                            darkTheme={true}
                            style={{
                              ...pickerSelectStyles,
                              iconContainer: {
                                top: 7,
                                right: 14,
                              },
                            }}                              
                            items={this.state.estadosArray.map(estado => ({
                              label: estado.nombre,
                              value: "" + estado.id_estado
                              
                            }))}
                            placeholder={{ label: 'Ver por estado', value: null }}     
                            onValueChange={(value) => {this.filtrarClienteEstado(value)} }
                            Icon={() => {
                              return <Icon name="caret-down-outline" size={24} color="gray" />;
                            }}
                          />
                          </View>
                          }
            </View>                              




            





        }

          <View style={{flex: 3, alignItems: 'flex-end', paddingRight:18, flexDirection:'row', justifyContent:'flex-end'}}>
            <TouchableOpacity style={{paddingRight:10}}
                onPress={() => this.activarBuscadorClientes() }
            >
              {
                !buscadorActivo &&
                <Icon name="search" style={globalStyles.headerButton}/>
              }
              {
                buscadorActivo &&
                <Icon name="close" style={globalStyles.headerButton}/>
              }            
            </TouchableOpacity>

          

          </View>          
        </View>
        <View style={{flex: 10}}>
          <SafeAreaView style={{flex: 10}}>   

          
        {
        this.state.isLoading &&

        <View style={{alignItems:'center'}}>
          <ActivityIndicator color='#51747F' />
          <Text style={{alignItems:'center'}}>Cargando...</Text>
        </View>  
        }

          
          {this.state.clientesDisplayArray.length == 0 && 
          
          <View style={{alignContent:"center",alignItems:"center",paddingTop:30, flex: 1, flexDirection: 'column'}}>
              <Text style={{fontSize:20}}>La busqueda esta vacía.</Text>
          <Text>
            Favor hacer uso de uno de los filtros superiores.
            </Text>
          </View>
          }
          

          <View >
            <ScrollView>
          {
            this.state.clientesDisplayArray.map((cliente) => {
              return (
                <View>
                <TouchableOpacity  style={[
                  (this.state.clienteSelected != null && this.state.clienteSelected.key == cliente.key) 
                  ? styles.itemSelected 
                  : styles.itemFree ,{paddingLeft:0,marginLeft:0} 
                ]}
                onPress={() => {this.seleccionarCliente(cliente);}}
                >
          {this.state.origen == "VENTA" && 
                  <View style={{justifyContent:'center', flex:1, alignItems:'center'}}>
                    <TouchableOpacity 
                          onPress={() => {this.seleccionarCliente(cliente);}}
                    >
                      {
                        (this.state.clienteSelected != null && this.state.clienteSelected.key == cliente.key) 
                        ? <Icon name="checkbox-outline" style={globalStyles.headerButton}/> 
                        : <Icon name="square-outline" style={globalStyles.headerButton}/>
                      }
                        
                    </TouchableOpacity>
                  </View>
          }

                  
                  <TouchableOpacity style={{flex:3}}>
                    <Text style={{fontWeight:"bold"}}>{cliente.clave} - {cliente.nombre_comercial}</Text>
                    {(cliente.rfc != null && cliente.rfc != "") && 
                    <Text >RFC: {cliente.rfc}</Text>}
                    {(cliente.telefono != null && cliente.telefono != "") && 
                    <Text style={{color:'gray'}}>
                      Teléfono: <Text >{cliente.telefono} </Text>
                    </Text>
                    }
                    {(cliente.celular != null && cliente.celular != "") && 
                      <Text style={{color:'gray'}}> 
                      Cel: <Text >{cliente.celular}</Text>
                      </Text>
                      }
                  </TouchableOpacity>
                  <View style={{marginLeft:0,marginRight:0,flex:1,width:80, alignItems:'center', justifyContent:'center'}}>
                    
                      <TouchableOpacity
                            onPress={() => {this.verCliente(cliente);}}
                      >
                          <Icon name="person-circle-outline" style={globalStyles.headerButton}/>
                      </TouchableOpacity>

                    
                  </View>
                  
                </TouchableOpacity>
                <Separator />
                </View>
              );
            })
          }
        </ScrollView>
          </View>

          </SafeAreaView>
        </View>
{this.state.origen == "VENTA" &&
        
         <View style={{ 
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'center', bottom:0, flex:0}}>
          <View style={{backgroundColor: "#51747F", flex: 1, position: 'relative'}}>
            <Button title='Agregar a la venta' disabled = {this.state.clienteSelected == null}
              
             onPress={() => this.agregarCliente()}
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
    backgroundColor: "#fff", flex: 1
  },
  itemSelected: {
    backgroundColor:"lightgray",   
    flexDirection: 'row' 
  },
  itemFree:{
    backgroundColor:"white",    
    flexDirection: 'row'
  },
  separator:{
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: 220,
    height:35,
    paddingLeft:20,
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginRight:10
  },
  inputAndroid: {
    fontSize: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon

  },
});