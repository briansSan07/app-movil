import React, { Component} from "react";
import {
  Container,  Header,  Title,  Content,  Button,  ListItem,  Text,  Thumbnail,  Left,  Body,
  Right,  Item,  Footer,  FooterTab,  Badge,  Accordion,  View,  Input,  List,  Toast,  H1,  H2,  H3, H4,
  Card, CardItem, StyleSheet, Platform, Dimensions } from "react-native";
import { Image , TextInput, AppRegistry,Navigator,SafeAreaView} from "react-native";
import {Linking} from 'react-native'
import Geocoder from 'react-native-geocoding';

import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

const ClienteModel = require ('../../lib/model/ClienteModel');

const clienteModel = new ClienteModel();
import Icon from 'react-native-vector-icons/Ionicons';


const Separator = () => <View style={styles.separator} />;

import { TouchableOpacity } from "react-native-gesture-handler";


const deviceHeight = Dimensions.get("window").height;
import Constants from 'expo-constants';

var inicial=" ";
let porSurtir = [];
let textPersistence = "";




class ClienteDetalle extends Component {

  constructor(props) {    
    super(props);
//    console.log("* props en Venta-index:  " , props.navigation.state.params);

    console.log("global.token: ",  global.token);
    console.log("global.sucursalId: ",  global.sucursalId);
    console.log("global.sourceId: ",  global.sourceId);
    
    const {route} = this.props;
    this.cliente = route.params.cliente;
    this.state = {
      cliente: this.cliente, 
      isLoading:true , 
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
  
    };
  }

  componentDidMount(){
    console.log("-----> clienteDetalle: ",this.state.cliente);
    this.consultarClienteById();
    this.setState({isLoading:false});


  }

  consultarClienteById(){
    clienteModel.consultarClienteById(this.state.cliente.idCliente)
    .then((result) => {
      console.log("Resultado de onsultarCliente:" , result.cliente);
      this.setState({
        cliente:result.cliente
      });
    })
    .catch((error) => {
      console.log('error al onsultarClientes: ', error.message);
    });
  }

  verCliente(cliente){

    console.log("verCliente: ",cliente);
    this.props.navigation.navigate("ConfirmacionVenta", {cliente})

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


    activarBuscadorProductos(){
      this.setState({buscadorProductosActivo:!this.state.buscadorProductosActivo},() => {

        if(this.state.buscadorProductosActivo == false){
          this.onChangeSeachBox("");
        }
      });
    }
    
    onChangeSeachBox(busqueda){
      this.setState({busqueda:busqueda},() => this.filtraProductos());
    }
    
    buscarProducto(text){
      db.transaction(tx =>{

        tx.executeSql(
          'select nombre from Producto where nombre = %? ', [text], (tx, { rows }) => {
  
            console.log(rows)
  
          }, function (tx,error) { //CATCH
              console.log("Line: 161",error.message)
            }
        );
      });
    }

    filtraProductos () {
      console.log("_______________________________________")
      let buscador=[];
      const query = this.state.busqueda;

      //nombre = nombre.toUpperCase()
      const productosDisplayArray = this.state.productosArray.filter((producto) => { return this.findPalabraClave( query , producto.nombre)});

      const categoriasFiltradas = productosDisplayArray.reduce((acum , producto) => {

        console.log("acum: " , acum);
        console.log("acum.find: " , acum.find);

        const exist = acum.find( (id) => (id == producto.idproductotipo)  );
        console.log({exist});
        if( exist == undefined ){
          acum.push(producto.idproductotipo);
        }
        return acum;
       },[]);

       console.log("categoriasFiltradas: " , categoriasFiltradas);


       console.log("categoriaArray: " , this.state.categoriaArray);


       const categoriasFinales = this.state.categoriaArray.filter( (categoria) => {

        const exist = categoriasFiltradas.find( (id) => (id == categoria.idtipoProducto )  );
        console.log({exist});

        if( exist == undefined ){
          return false;
        }
        return true;


       });

       console.log("categoriasFinales: " , categoriasFinales);
       this.setState({categoriaDisplayArray:categoriasFinales});
       

      this.setState({ productosDisplayArray : productosDisplayArray }, () => {
        
        console.log("this.productosDisplayArray: " , this.state.productosDisplayArray);

      });
//      this.state.productosBuscados=buscador;

      this.render();
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
        
/*     
  _renderContent(categoria) {

//console.log(this.productosArray)

let productoFiltrados = this.state.productosDisplayArray.filter(function (producto) {
  return producto.idproductotipo === categoria.idtipoProducto;
});

    return (
      <Text>Hola</Text>
    );
  }
  */

  render() {

    const buscadorProductosActivo = this.state.buscadorProductosActivo;
    return (
<View style={styles.container}>
        <View style={globalStyles.header} >
          <View style={{flex:0, paddingLeft:10}}>
            <TouchableOpacity style={{flex:0}}onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back"  style={globalStyles.headerButton} />
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}>
          <Text style={globalStyles.headerTitle} >Detalle del cliente</Text>
          </View>
          
        </View>
        <Separator />
        <View style={{flex:1}}>
        <SafeAreaView style={{flex: 1}}>
          <View style={{flex: 1}}>
            <View style={{flex:0}}>
             
                {/*
                <Thumbnail source={{uri: 'Image URL'}} />
                 */}
                
                  <Text style={{fontWeight:"bold"}}>{this.state.cliente.nombre_comercial}</Text>
                  <Text style={{color:'gray'}}>{this.state.cliente.razon_social}</Text>
                  <Text style={{color:'gray'}}>Clave: {this.state.cliente.clave}</Text>                  
                  <Text style={{color:'gray'}}>RFC: {this.state.cliente.rfc}</Text>
                
              
            </View>
            <Separator />
{            <View style={{flex:0}}>
              <MapView 
              style={{height: 300,flex: 0}} 
              region={this.state.region}
              
              >
              <Marker
                    coordinate={this.state.region}
                    title={this.state.cliente.nombre_comercial}
                    
                  />
              </MapView>
{/*
              <Image source={{uri: 'https://www.pdcahome.com/wp-content/uploads/2017/12/madrid-google-maps.png'}} style={{height: 200, width: null, flex: 1}}/>

*/}
            </View>}
            <View style={{flex:0, flexDirection:'row', marginTop:10}}>
              <View style={{flex:1,  alignItems: 'center'}}>
                <TouchableOpacity  style={{flexDirection:'row'}}
                onPress={()=> {if ( this.state.cliente.telefono != null && this.state.cliente.telefono != "" ) { Linking.openURL(`tel:${this.state.cliente.telefono}`) } } }
                >
                  <Icon  name="call" style={{color:'#2496bc', marginRight:10, fontSize:17}} />
                  <Text style={{color:'#2496bc'}}>{(this.state.cliente.telefono != null && this.state.cliente.telefono != "") ? this.state.cliente.telefono: "Ninguno"}</Text>
                </TouchableOpacity>
              </View>
              <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
              <TouchableOpacity style={{flexDirection:'row'}}
               onPress={()=> { if ( this.state.cliente.celular != null && this.state.cliente.celular != "" ) { Linking.openURL(`tel:${this.state.cliente.celular}`) } }}

              >
                  <Icon name="phone-portrait" style={{color:'#2496bc', marginRight:10, fontSize:17}} />
                  <Text style={{color:'#2496bc'}}>{(this.state.cliente.celular != null && this.state.cliente.celular != "") ? this.state.cliente.celular: "Ninguno"}</Text>
                </TouchableOpacity>                  
              </View>
            </View>

            
            <View style={{flex:0, marginTop:20}}>
              <View style={{flex:0}}>
                  <Text>Calle: {this.state.cliente.calle}</Text>
                  <Text>No. ext: {this.state.cliente.no_ext}
                  <Text> No. int: {this.state.cliente.no_int}</Text>
                  </Text>
                  
                  <Text>Colonia: {this.state.cliente.colonia}
                  <Text> C.P.: {this.state.cliente.codigo_postal}</Text>
                  </Text>
                  
                  <Text>Estado: {this.state.cliente.estado}</Text>
                  <Text>Municipio: {this.state.cliente.municipio}</Text>
                  <Text>Nivel: {this.state.cliente.nivel_socioeconomico}</Text>
              </View>
            </View>
            <Separator />
          </View>

        </SafeAreaView>
        </View>
       
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

export default ClienteDetalle;