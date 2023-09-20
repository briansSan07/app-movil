import 'react-native-gesture-handler';
import React, { Component} from "react";
import {
  Container,  Header,  Title,  Content,  Button,  Icon,  ListItem,  Text,  Thumbnail,  Left,  Body,
  Right,  Item,  Footer,  FooterTab,  Badge,  Accordion,  View,  Input,  List,  Toast,  H1,  H2,  H3, H4, CheckBox,Picker,Spinner
} from "react-native";
import {TextInput, AppRegistry,Navigator,SafeAreaView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack'
import {  createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, createAppContainer, useNavigation } from '@react-navigation/native';


import CatalogosModel from '../../lib/model/CatalogosModel';
import ClienteModel from '../../lib/model/ClienteModel';


import styles from "./styles";
import globalStyles from "./../styles";


var inicial=" ";
let porSurtir = [];
let textPersistence = "";


export default class Cliente extends Component {

  constructor(props) {    
    super(props)
    this.state = {
      info: null
    }
//    console.log("* props en Venta-index:  " , props.navigation.state.params);
    
    const origen = this.props.route.params.origen;

    console.log("origen:" , origen);

    if(origen == undefined){
      origen="MENU";
    }
    console.log("origen:" , origen);


    this.state = {
      isLoading: true, 
      origen: origen,
      prevOrigen: '',
      clientesArray: [],
      clientesDisplayArray: [],      
      buscadorActivo:false,
      busqueda:'',
      iniciarBusqueda:false,      
      busquedaConcluida:false,      

      clienteSelected:null,
      estadosArray: (global.estados) ? [{nombre:"Ver por estado",id_estado:"0"},...global.estados] : [],
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

    let origen = this.props.navigation.getParam('origen');
//    console.log("componentDidUpdate - origen:" , origen ,  " prevOrigen: ", this.state.prevOrigen );

    if(origen != this.state.prevOrigen){
      this.setState({origen: origen, prevOrigen: origen });
    }

    console.log("Finish componentDidUpdate ");
  }

  

  consultarEstados(){
    if (global.estados == null) {
      CatalogosModel.consultarEstados()
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
    ClienteModel.consultarClientes()
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
    console.log("cliente seleccionado: ", this.state.clienteSelected);
    this.props.navigation.state.params.onGoBack(this.state.clienteSelected);
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
        ClienteModel.consultarClientesByNombre("%" + query + "%" )
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
          ClienteModel.consultarClientesByEstado(estado)
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



        {
          buscadorActivo &&
          <Body style={{flex: 3}}>
          <Item >
              <Icon active name="search" style={globalStyles.headerButton} />
              <Input placeholder = "Nombre del cliente"
                  autoFocus = {true}
                  onChangeText = {(busqueda) => this.onChangeSeachBox(busqueda)}
                  onBlur={ this.realizarBusqueda.bind(this)}
                  blurOnSubmit={true}
                  value = { "" + this.state.busqueda }
              
              />
          </Item>
          <Text style={{fontSize:10}}>Mínimo 3 caracteres. Da enter para iniciar búsqueda</Text>
          </Body>

        }
        {
          !buscadorActivo &&
          <Body style={{flex: 0,alignContent:"center",paddingTop:10}}>
            <Title style={globalStyles.headerTitle}>
            {this.state.origen == "MENU" && "Clientes"}
            {this.state.origen == "VENTA" && "Agregar cliente"}            
            </Title>
            <View style={{flex:0,flexDirection:"row",paddingTop:2}}>

                              <Picker
                                key={"edo"}
                                mode="dropdown"
                                iosIcon={<Icon name="arrow-down" />}
                                placeholder="Ver por estado..."
                                placeholderStyle={{ color: "#000000" }}
                                placeholderIconColor="#000000"
                                style={{borderWidth:1,borderLeftColor:"#000000",borderBottomColor:"#000000",borderTopColor:"#000000",borderRightColor:"#000000",width:200,paddingTop:0,height:35 }} 
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


          </Body>
        }

          <Right style={{flex: 1}}>
            <Button transparent
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
            </Button>

            {this.state.origen == "MENU" && 
              <Button transparent>
                <Icon name="person-add" style={globalStyles.headerButton}/>
              </Button>
            }

          </Right>          
        </Header>
        <Content>
          <SafeAreaView style={{flex: 1}}>   

          
        {
        this.state.isLoading &&

        <View style={{alignItems:'center'}}>
          <Spinner color='#51747F' />
          <Text style={{alignItems:'center'}}>Cargando...</Text>
        </View>  
        }

          
          {this.state.clientesDisplayArray.length == 0 && 
          <View style={{alignContent:"center",alignItems:"center",paddingTop:30}}>
              <Text style={{fontSize:20}}>La busqueda esta vacía.</Text>
          <Text>
            Favor hacer uso de uno de los filtros superiores.</Text>
          </View>
          }
          

          <List >
          {
            this.state.clientesDisplayArray.map((cliente) => {
              return (
                
                <ListItem thumbnail key={cliente.key} style={[
                  (this.state.clienteSelected != null && this.state.clienteSelected.key == cliente.key) ? styles.itemSelected : styles.itemFree
                 ,{paddingLeft:0,marginLeft:0} 
                ]}
                onPress={() => {this.seleccionarCliente(cliente);}}
                >
          {this.state.origen == "VENTA" && 
                  <Left style={{padding:0,marginLeft:0}}>
                    <Button transparent
                          onPress={() => {this.seleccionarCliente(cliente);}}
                    >
                      {
                        (this.state.clienteSelected != null && this.state.clienteSelected.key == cliente.key) ? <Icon name="ios-checkbox-outline" style={globalStyles.headerButton}/> : <Icon name="square-outline" style={globalStyles.headerButton}/>
                      }
                        
                    </Button>
                  </Left>
          }

                  
                  <Body style={{marginLeft:0}}>
                    <Text style={{fontWeight:"bold"}}>{cliente.clave} - {cliente.nombre_comercial}</Text>
                    {(cliente.rfc != null && cliente.rfc != "") && 
                    <Text >RFC: {cliente.rfc}</Text>}
                    {(cliente.telefono != null && cliente.telefono != "") && 
                    <Text note>
                      Teléfono: <Text >{cliente.telefono} </Text>
                    </Text>
                    }
                    {(cliente.celular != null && cliente.celular != "") && 
                      <Text note> 
                      Cel: <Text >{cliente.celular}</Text>
                      </Text>
                      }
                  </Body>
                  <Right style={{marginLeft:0,marginRight:0,flex:0,flexDirection: 'row',width:80}}>
                    
                      <Button transparent
                            onPress={() => {this.verCliente(cliente);}}
                      >
                          <Icon name="contact" style={globalStyles.headerButton}/>
                      </Button>

                    
                  </Right>
                </ListItem>
              );
            })
          }

          </List>

          </SafeAreaView>
        </Content>
{this.state.origen == "VENTA" &&
        
         <Footer >
          <FooterTab style={{backgroundColor: "#51747F"}}>
            <Button
            disabled = {this.state.clienteSelected == null}
              
             // onPress={() => this.toggleTab3()}
             onPress={() => this.agregarCliente()}
            >
              
              <Text style={{color: 'white'}}>Agregar a la Venta</Text>
            </Button>
            
          </FooterTab>
        </Footer>
}

      </Container>
    );
  }
}
