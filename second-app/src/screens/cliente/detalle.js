import React, { Component} from "react";
import {
  Container,  Header,  Title,  Content,  Button,  Icon,  ListItem,  Text,  Thumbnail,  Left,  Body,
  Right,  Item,  Footer,  FooterTab,  Badge,  Accordion,  View,  Input,  List,  Toast,  H1,  H2,  H3, H4,
  Card, CardItem } from "react-native";
import { Image , TextInput, AppRegistry,Navigator,SafeAreaView} from "react-native";
import {Linking} from 'react-native'

import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

import ClienteModel from '../../lib/model/ClienteModel';


import styles from "./styles";
import globalStyles from "../styles";


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
    

    this.state = {
      cliente: this.props.navigation.getParam('cliente'),   
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
    ClienteModel.consultarClienteById(this.state.cliente.idCliente)
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
<Container style={styles.container}>
        <Header iosBarStyle={"dark-content"} style={globalStyles.header} >
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back"  style={globalStyles.headerButton} />
            </Button>
          </Left>
          <Body style={{flex: 2}}>
          <Title style={globalStyles.headerTitle} >Detalle del cliente</Title>
          </Body>
          <Right />
        </Header>

        <Content>
        <SafeAreaView style={{flex: 1}}>
          <Card>
            <CardItem>
              <Left>
                {/*
                <Thumbnail source={{uri: 'Image URL'}} />
                 */}
                <Body>
                  <H3 style={{fontWeight:"bold"}}>{this.state.cliente.nombre_comercial}</H3>
                  <Text note>{this.state.cliente.razon_social}</Text>
                  <Text note>Clave: {this.state.cliente.clave}</Text>                  
                  <Text note>RFC: {this.state.cliente.rfc}</Text>
                </Body>
              </Left>
            </CardItem>
            <CardItem cardBody>
              <MapView 
              style={{height: 200, width: null, flex: 1}} 
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
            </CardItem>
            <CardItem>
              <Left>
                <Button transparent 
                onPress={()=> {if ( this.state.cliente.telefono != null && this.state.cliente.telefono != "" ) { Linking.openURL(`tel:${this.state.cliente.telefono}`) } } }
                >
                  <Icon active name="call" />
                  <Text>{this.state.cliente.telefono}</Text>
                </Button>
              </Left>
              <Right>
              <Button transparent 
                              onPress={()=> { if ( this.state.cliente.celular != null && this.state.cliente.celular != "" ) { Linking.openURL(`tel:${this.state.cliente.celular}`) } }}

              >
                  <Icon active name="phone-portrait" />
                  <Text>{(this.state.cliente.celular != null && this.state.cliente.celular != "") ? this.state.cliente.celular: "Ninguno"}</Text>
                </Button>                  
              </Right>
            </CardItem>
            <CardItem>
              <Body>
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
              </Body>
            </CardItem>
          </Card>

        </SafeAreaView>
        </Content>
       
      </Container>
    );
  }
}

export default ClienteDetalle;