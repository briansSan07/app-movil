import React, { Component} from "react";
import { Updates } from 'expo';
import {
  Container,  Header,  Title, Subtitle,  Content,  Button,  ListItem,
  Text,  Thumbnail,  Left,  Body,  Right,  Item,  Footer,  FooterTab,
  Badge,  Accordion,  View,  Input,  List,  Toast,  H1,  H2,  H3, Switch,Spinner,
  FlatList, StyleSheet, StatusBar,
} from "react-native";

import { Icon } from '@rneui/themed';
import {TextInput, AppRegistry,Navigator,SafeAreaView, Alert} from "react-native";
import { withNavigationFocus } from '@react-navigation/native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import NumberFormat from 'react-number-format';


import CatalogosModel from '../../lib/model/CatalogosModel';
import ProductoModel from '../../lib/model/ProductoModel';
import ClienteModel from '../../lib/model/ClienteModel';

const SyncronizeCatalogs = require ('./../../lib/syncronization/SyncronizeCatalogs');
const syncronizeCatalogs = new SyncronizeCatalogs();

import styles from "./styles";
import globalStyles from "./../styles";


var inicial=" ";
//let porSurtir = [];
let textPersistence = "";

export default class Venta extends Component {

  constructor(props) {
    super(props);

if (process.env.NODE_ENV !== 'production') {
  //const {whyDidYouUpdate} = require('why-did-you-update');  whyDidYouUpdate(React)
}

//    console.log("* uniqueValue: " , (props.navigation.getParam('uniqueValue')));

    this.state = {
      count: 0, 
      text:" ", 
      subtotal:0 , 
      descuento:0 , 
      iva:0 , 
      ieps:0 , 
      suma:0 , 
      
//      total:0 , 
      showToast: false,
      isLoading:true , 
      isReload:false,

      categoriaArray: [],
      categoriaDisplayArray: [],
      categoriaExpanded:0,

      productosArray : [],
      productosDisplayArray : [],

      nivelSocioeconomico: 0,
      buscadorProductosActivo:false,
      busqueda:'',
      iniciarBusqueda:false,      
      busquedaConcluida:false,      
      productosDisplay:null,

      uniqueValue: (props.navigation.getParam('uniqueValue')) ? (props.navigation.getParam('uniqueValue')) : 0 ,
      carritoCompras:[],
      cliente:null,
      isAsignacionCliente:false,
      generaFactura: false,
      ventaSinIva: false,
      showUpdate: false,
      update:null

    };    

  }

  initializeComponent(){

    this.setState({
      carritoCompras: [],
      categoriaArray: [],
      categoriaDisplayArray: [],
      categoriaExpanded: 0,
      generaFactura: false,
      ventaSinIva: false,
      cliente:null

    
    }, () => {this.calculandoCarrito()});
    
    


  }

  componentDidMount(){
    console.log("componentDidMount");
    this.consultaCategoria();
    this.consultaNivelSocioeconomicoPublico();
    this.consultaMetodosPago();
    this.consultaBancos();
    this.consultaEstados();
    this.checkAppUpdates();
//    this.consultaClientes();

    this.setState({ ventaSinIva:global.preciosDeVentaSinIva });
    console.log("global.preciosDeVentaSinIva: " , global.preciosDeVentaSinIva );
    console.log("state.ventaSinIva: " , this.state.ventaSinIva );
    

    const { navigation } = this.props;

  }

  componentDidUpdate(prevProps) {
    
//    console.log( "********* venta.componentDidUpdate this.isLoading: " , prevProps );

    const prevUniqueValue =  prevProps.navigation.getParam('uniqueValue');
    const thisUniqueValue =  this.props.navigation.getParam('uniqueValue');
    
    const stateUniqueValue =  this.state.uniqueValue;


//    console.log("nuevaVenta: " , { thisUniqueValue, prevUniqueValue } );

    if(thisUniqueValue != undefined){
      if(prevUniqueValue != thisUniqueValue && prevUniqueValue != undefined){
//        console.log(" ES DIFERENTE!....REFRESCARE LA VENTANA");
        this.initializeComponent();
        this.componentDidMount();

      }


    }
    
  }
  
  shouldComponentUpdate(nextProps) {
    //productosDisplayArray
//    console.log(".shouldComponentUpdate:" , {nextProps:nextProps.navigation.state.params.uniqueValue , "this.props": this.props.navigation.state.params.uniqueValue});
//    if (this.props.navigation.state.params.uniqueValue == 0 || this.props.navigation.state.params.uniqueValue !== nextProps.navigation.state.params.uniqueValue) {
//      console.log("shouldComponentUpdate");
      return true;
//    } else {
//      return true;
//    }
  }


  checkAppUpdates(){
    
    try{
    Updates.checkForUpdateAsync().then(update => {
      this.setState({update:update});
      console.log("Updates.checkForUpdateAsync: " ,update);
      if (update.isAvailable) {
        this.setState({showUpdate: true});
      }
    }).catch((error) => {
      console.log('checkForUpdateAsync-error: ', error);
    });
  }catch(e){
    console.log({e});

  }

  }

  async doUpdate() {

    await Updates.fetchUpdateAsync();
    // ... notify user of update ...
    Updates.reloadFromCache();
//    Updates.reload();
    this.setState({showUpdate: false});

  }    
  // ---------




  consultaCategoria(){

    if (global.TiposProducto == null || global.TiposProducto == undefined) {
      ProductoModel.consultarTiposProducto()
      .then((result) => {
        console.log("consultarTiposProducto:" , result.list.length);
        global.TiposProducto = result.list;
        this.llenarCategoria(global.TiposProducto);
      })
      .catch((error) => {
        console.log('error al consultarTiposProducto: ', error);
      });
    }else{
      this.llenarCategoria(global.TiposProducto);
    }
    
  }

  consultaClientes(){

    if (global.clientes == null || global.clientes == undefined) {
      ClienteModel.consultarClientes()
      .then((result) => {
        console.log("consultar Clientes:" , result.clientesList.length);
        global.clientes = result.clientesList;
      })
      .catch((error) => {
        console.log('error al consultarClientes: ', error);
      });
    }
    
  }

  consultaProductos(nivelSocioeconomico){
    console.log("**** consultaProductos");

    ProductoModel.consultaProductos(nivelSocioeconomico)
    .then((result) => {
      console.log("consultaProductos:" , result.list.length);
      this.llenarProducto(result.list);

    })
    .catch((error) => {
      console.log('error al consultaProductos: ', error);
    });
  }


  consultaProductosByTipoProducto(nivelSocioeconomico,tipoProducto){
    console.log("**** consultaProductosByTipoProducto");

    ProductoModel.consultaProductosByTipoProducto(nivelSocioeconomico,tipoProducto)
    .then((result) => {
      console.log("consultaProductosByTipoProducto:" , result.list.length);
      this.llenarProducto(result.list);  
    })
    .catch((error) => {
      console.log('error al consultaProductos: ', error);
    });
  }


  consultaNivelSocioeconomicoPublico(){
    if (global.publicoGeneral == null) {
      CatalogosModel.consultarNivelSocioeconomicoPublicoGral()
      .then((result) => {
//        console.log("Resultado de consultarNivelPublico:" , result.nivelPublico);
        global.publicoGeneral = result.nivelPublico.id;
        this.setPublicoGeneral();
      })
      .catch((error) => {
        console.log('error al consultarNivelPublico: ', error);
      });
    } else {
      this.setPublicoGeneral();
    }
  }

  setPublicoGeneral(){

    console.log("setPublicoGeneral: ");

    this.setState({
      nivelSocioeconomico: global.publicoGeneral
    },() => { 
      console.log("nivelSocioeconomico:  ",this.state.nivelSocioeconomico);
      this.consultaProductos(this.state.nivelSocioeconomico);
    });
  }

  consultaMetodosPago(){
    if (global.metodosPago == null) {
      CatalogosModel.consultarMetodosPago()
      .then((result) => {
//        console.log("Resultado de consultarMetodosPago:" , result.metodosPagoList);
        global.metodosPago = result.metodosPagoList;
      })
      .catch((error) => {
        console.log('error al consultarMetodosPago: ', error);
      });
    }
  }


  consultaBancos(){
    if (global.bancos == null || global.bancos == undefined) {
      CatalogosModel.consultarBancos()
      .then((result) => {
        console.log("Resultado de consultarBancos:" , result.bancosList.length);
        global.bancos = result.bancosList;
      })
      .catch((error) => {
        console.log('error al consultarBancos: ', error);
      });
    }
  }  



  consultaEstados(){
    if (global.estados == null) {
      CatalogosModel.consultarEstados()
      .then((result) => {
//        console.log("Resultado de consultarMetodosPago:" , result.metodosPagoList);
        global.estados = result.estadosList;
        
      })
      .catch((error) => {
        console.log('error al consultarEstados: ', error);
      });
    }
  }
  

  llenarCategoria(categoria){


//    console.log("------ llenarCategoria ",categoria);
    this.setState({categoriaArray: categoria});
    this.setState({categoriaDisplayArray: categoria});
    
    this.setState({isLoading:false});
  }

  llenarProducto(productos){

    this.setState({productosArray : productos}, () => {

      if(this.state.buscadorProductosActivo && this.state.busquedaConcluida){     // si es el buscador, y ya se hizo una busqueda actualizar con base al filtro de busqueda
        console.log(" actualizare el listado de productos del buscador");
        this.realizarBusqueda();
      }else{
        // si no es buscador actualizar con base al tipo de producto
        console.log(" actualizare la categoria: ",this.state.categoriaDisplayArray[parseInt(this.state.categoriaExpanded)]);
        this.onAccordionOpen(this.state.categoriaDisplayArray[parseInt(this.state.categoriaExpanded)],this.state.categoriaExpanded);
      }
      this.actualizarCarritoANuevosPrecios();
      this.calculandoCarrito();
      this.setState({isLoading:false});
    });
  }



  onChangeTBox(producto, cantidad) {

    let carritoCompras = [...this.state.carritoCompras];
    console.log("onChangeTBox: [" + cantidad+"]");

    if (cantidad >= producto.cantidad) {
        console.log("surtir: " + producto.nombre + " para surtir este pedido");
//        porSurtir.push(producto.nombre)
    }
    if (cantidad === "" || cantidad === " " || cantidad === undefined || cantidad === null || cantidad === "NaN") {
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
                key: '' + producto.idProducto,
                existencia: producto.cantidad,
                cantidad: parseInt(cantidad),
                codigo: producto.codigo,
                nombre: producto.nombre,                
                precio: producto.precio,
                precio_antes_impuestos: producto.precio_antes_impuestos,
                iva: producto.iva,
                ieps: producto.ieps,
                tasa_iva: producto.tasa_iva,
                has_stock: producto.has_stock,
                id_tasa_cuota_iva: producto.id_tasa_cuota_iva,
                id_tasa_cuota_ieps: producto.id_tasa_cuota_ieps,
                img: producto.imagen
            };
            carritoCompras.push(nuevoProductoParaCarrito);
        }
        //console.log({carritoCompras});
        this.setState({carritoCompras: carritoCompras }, () => {this.calculandoCarrito()});
        //console.log("this.state.carritoCompras1: ", this.state.carritoCompras);
    }
}

sumaUno(producto) {

  let carritoCompras = [...this.state.carritoCompras];
  if (producto.cantidad <= 0) {
      //console.log("surtir: " + producto.nombre + " para surtir este pedido");
//      porSurtir.push(producto.nombre)
  }
  let nuevoProductoParaCarrito = carritoCompras.filter(function(data) {
      return data.id === producto.idProducto;
  })
  if (nuevoProductoParaCarrito.length > 0) {
      nuevoProductoParaCarrito[0].cantidad++;
  } else {
      nuevoProductoParaCarrito = {
          id: producto.idProducto,
          key: '' + producto.idProducto,
          codigo: producto.codigo,
          nombre: producto.nombre,
          existencia: producto.cantidad,
          cantidad: 1,
          precio: producto.precio,
          precio_antes_impuestos: producto.precio_antes_impuestos,
          iva: producto.iva,
          ieps: producto.ieps,
          tasa_iva: producto.tasa_iva,
          has_stock: producto.has_stock,
          id_tasa_cuota_iva: producto.id_tasa_cuota_iva,
          id_tasa_cuota_ieps: producto.id_tasa_cuota_ieps,
          img: producto.imagen
      };
      carritoCompras.push(nuevoProductoParaCarrito);
  }
  //console.log({carritoCompras});
  this.setState({carritoCompras: carritoCompras}, () => {this.calculandoCarrito()});
}

menosUno(producto) {
  let carritoCompras = this.state.carritoCompras;

  let nuevoProductoParaCarrito = carritoCompras.filter(function(data) {return data.id === producto.idProducto;})

  if (nuevoProductoParaCarrito.length > 0) {
      nuevoProductoParaCarrito[0].cantidad--;
      if (nuevoProductoParaCarrito[0].cantidad <= 0) {
          for (let i = 0; i < carritoCompras.length; i++) {
              if (carritoCompras[i].id === producto.idProducto) {
                  carritoCompras.splice(i, 1)
              }
          }
      }
    console.log({carritoCompras});
    this.setState({carritoCompras: carritoCompras}, () => {this.calculandoCarrito()});

  }
}

mostrarValor(producto){
  let nuevoProductoParaCarrito = carritoCompras.filter (function (data) {return data.id === producto.id; })
  if(nuevoProductoParaCarrito[0].cantidad>0){
    return "0";
  } else{
    let cadena=String(nuevoProductoParaCarrito[0].cantidad);
    return cadena;
  }
}
    
  actualizarCarritoANuevosPrecios(){
    const carrito = this.state.carritoCompras;

    console.log("Actualizando precios del carrito..." , carrito);
    carrito.forEach((productoCarrito,index) => {

      const productoCatalogo = this.state.productosArray.filter(function (producto) {        
        return  producto.idProducto === productoCarrito.id;
      });
      if(productoCatalogo.length>0){
        productoCarrito.precio = productoCatalogo[0].precio
        productoCarrito.precio_antes_impuestos = productoCatalogo[0].precio_antes_impuestos
        productoCarrito.iva = productoCatalogo[0].iva
        productoCarrito.ieps = productoCatalogo[0].ieps
      }

    });
    console.log("Terminando actualizacion precios del carrito..." , carrito);
    this.setState({carritoCompras:carrito});


  }

  calculandoCarrito(){


    //total de productos seleccionados: 
    //totalCantidad =carritoCompras.reduce((acc, data) => acc + data.cantidad, 0);
    //let carritoCompras = [...this.state.carritoCompras];

    //total de la suma de los productos seleccionados:    
    //totalPrecio = carritoCompras.reduce((acc, data) => acc + (data.cantidad*data.precio), 0);

    const carrito = this.state.carritoCompras;

    let suma=0;
    let count = 0;
    let subtotal = 0;
    let total = 0;
    let iva = 0;
    let ieps = 0;

    console.log("-------- calculandoCarrito ------------ " , this.state.ventaSinIva);
    carrito.forEach((producto) => {

      console.log("producto: " , producto)
      const productoSubTotal = (producto.cantidad * producto.precio_antes_impuestos );
      count += producto.cantidad;
      subtotal += productoSubTotal;
      iva += Math.round(productoSubTotal * producto.tasa_iva *10000)/10000;
      ieps += ( productoSubTotal * 0 );      
      total += (producto.cantidad * producto.precio );
    });



    if(this.state.ventaSinIva){
      suma = subtotal;
      iva = 0;
      ieps = 0;
    }else{
      suma = total;
    }

//    console.log("------ CONSOLIDADO: ",{count, subtotal, suma, iva, ieps, total });

    this.setState({
      count: count,
      suma: suma,
      subtotal:subtotal,
      descuento:0 , 
      iva:iva , 
      ieps:ieps ,
      isLoading: false
    })
  }


  actualizarPreciosIva(){

    console.log("actualizarPreciosIva: preciosDeVentaSinIva : " , global.preciosDeVentaSinIva , " paraFactura: ",this.state.generaFactura  , " ventaSinIva: ",this.state.ventaSinIva  );

    let ventaSinIva = false;

    if(global.preciosDeVentaSinIva){
      ventaSinIva = true;

      if( this.state.generaFactura ){
        ventaSinIva = false;
      }
    }
    this.setState({ ventaSinIva : ventaSinIva } , () => {
      
      this.calculandoCarrito()
    });
  }

    pasarDatos(){

      this.props.navigation.navigate("ConfirmacionVenta", {
        carrito:this.state.carritoCompras, 
        cliente:this.state.cliente , 
        generaFactura:this.state.generaFactura, 
        ventaSinIva:this.state.ventaSinIva,
  
      })
//      this.categoriaArray=[];
//      this.setState({car: this.state.carritoCompras=[]})
//      this.consultaCategoria()
//      this.consultaProductos(this.state.nivelSocioeconomico)
      this.calculandoCarrito()
    }


    activarBuscadorProductos(){
      this.setState({
        iniciarBusqueda:false,
        busquedaConcluida:false,
        buscadorProductosActivo:!this.state.buscadorProductosActivo,
        productosDisplayArray: []
      },() => {

        if(this.state.buscadorProductosActivo == false){          
          this.setState({
            categoriaDisplayArray: this.state.categoriaArray,
            busqueda:""},() => {
              this.filtraProductos()
            });

        }
      });
    }
    
    onChangeSeachBox(busqueda){

      this.setState({busqueda:busqueda});

    }

    realizarBusqueda(){

      if(this.state.busqueda == "UPDATE"){
        Alert.alert("iniciando actualización de catalogos");
          syncronizeCatalogs.loadCatalogosFromServer("1")
            .then((success) => {
                console.log('En app.js Transaction de loadCatalogosFromServer exitosa...', success);
                Alert.alert("Actualización de catalogos concluida");

            })
            .catch((error) => {
                console.log('Error app.js en la Transaction de loadCatalogosFromServer: ', error);
            });
        return false;
      }

      console.log("realizarBusqueda");
      this.setState({iniciarBusqueda:true,busquedaConcluida:false}, () => {
        setTimeout(() => {
          this.filtraProductos()
        },300);
      });
      
    }

    filtraProductos() {
      return new Promise((resolve, reject) => {

        console.log("_______________________________________")
        let buscador=[];
        let query = this.state.busqueda;
  
        if(query.length >= 3){
          query = query.toUpperCase().trim();//replace(" ","%");
          console.log("buscando: " , query);

          const productosDisplayArray = this.state.productosArray.filter((producto) => { return this.findPalabraClave( query , producto.codigo + " " + producto.nombre)});
        
          const categoriasFinales = [{
            "idtipoProducto": 0,
            "tipo_producto": "Resultados de búsqueda...",
          }]
      
          this.setState({
            categoriaDisplayArray:categoriasFinales,
            categoriaExpanded:"0",
            productosDisplayArray : productosDisplayArray 
          }, () => {
//            console.log("this.productosDisplayArray: " , this.state.productosDisplayArray);          
            this.setState({
              iniciarBusqueda:false,
              busquedaConcluida:true,
              categoriaExpanded:"0"
            });
          });    
          resolve( { success:true } );
        }else{
          reject( { success:false } );
        }
      });
    }

    

    mostrarClientes(){
      this.props.navigation.navigate("AgregarCliente",
      {origen:"VENTA",
        onGoBack: (cliente) => this.asignarCliente(cliente),
      });
  
    }

    asignarCliente(cliente){

      console.log("asignarCliente: ",cliente);
      
      this.setState({cliente:cliente,isLoading:true,productosDisplay:null,productosDisplayArray:[]},() => {


        if( cliente.nivel_socioeconomico_id == undefined || cliente.nivel_socioeconomico_id == null){
          this.setPublicoGeneral();
        }else{
          this.setState({
            nivelSocioeconomico: cliente.nivel_socioeconomico_id
          },() => { 
            console.log("nivelSocioeconomico:  ",this.state.nivelSocioeconomico);
            this.consultaProductos(this.state.nivelSocioeconomico);
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
        

  paraFactura(checked){

    console.log("paraFactura: " , checked);

    const productos = this.state.productosDisplayArray;

    this.setState({isLoading:true},() => {

      setTimeout(() => {

        this.setState({generaFactura: checked,productosDisplayArray:[]}, () => {
          this.setState({productosDisplayArray:productos}, () => {
            this.actualizarPreciosIva()  ;  
          });
    
        });

      } , 100);
    });
    
  }


  onAccordionOpen(categoria,index){
    console.log("onAccordionOpen: " , {categoria,index});
    this.state.categoriaExpanded = index;
    const isBusqueda = this.state.busquedaConcluida;

    if(this.state.productosDisplay != categoria.idtipoProducto){
      console.log("filtrar productos por: " + categoria.idtipoProducto + " this.state.productosDisplay: " + this.state.productosDisplay );
    
      if(isBusqueda ){
        this.setState({productosDisplay:"0",productosDisplayArray:this.state.productosDisplayArray});  
        return true;
      } 
      const productosDisplayArray = this.state.productosArray.filter(function (producto) {        
        return  producto.idproductotipo === categoria.idtipoProducto;
      });
      console.log("Mostrare: " + productosDisplayArray.length + " productos.");
      this.setState({productosDisplay:categoria.idtipoProducto,productosDisplayArray:productosDisplayArray});  
    }
    
    
//    this.consultaProductosByTipoProducto(this.state.nivelSocioeconomico,item.idtipoProducto);
  }

  onAccordionClose(item,index){
    console.log("onAccordionClose: " );//, {item,index});
    this.setState({productosDisplayArray:[],productosDisplay:null,categoriaExpanded:0});
  }  
     
  _renderHeader(categoria, expanded) {
    

//console.log("categoriaBruta: " + categoria.tipo_producto + " expanded: " + expanded);

    return (

















      <View
        style={{
          flexDirection: "row",
          padding: 10,
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#568DAE"
        }}
      >
        <Text style={{ fontWeight: "600", color: 'white' }}>
          {" "}{categoria.tipo_producto}
        </Text>
        {expanded
          ? <Icon
              fontSize= '18' 
              color= 'white'
              name="remove-circle" />
          : <Icon 
              fontSize= '18' 
              color= 'white'
              name="add-circle" />}
      </View>

      

    );
  }






















  _renderContent(categoria) {


//  let productoFiltrados = this.state.productosDisplayArray;
  
const productoFiltrados = this.state.productosDisplayArray;

//productoFiltrados = productoFiltrados.map((row) => { return {...row,key:''+row.idProducto}});

const ventaSinIva = this.state.ventaSinIva;

if(productoFiltrados != null && productoFiltrados.length > 0){

    return (



























      <View
            dataArray={productoFiltrados}
            renderRow={(producto) =>
        <FlatList thumbnail style={{marginLeft:5,marginRight:5}}>
                <View>
                  <Image size="16" source ={{uri:'https://atletl.api.concrad.com/'+producto.imagen}} alt="react-native"   />
                </View>
                <View style={{marginLeft:5,paddingTop:10,paddingBottom:10}}>
                  <Text style={{fontSize:14}}>
                  {producto.codigo} - {producto.nombre}
                  </Text>
                  
                  <View>
                    
                    <View style={{ backgroundColor:'#fff', height: 27 }}>
                    <Text note>Disp: {producto.cantidad}</Text> 
                    </View>
                    <View style={{ backgroundColor:'#fff', height: 27 }}>
                    <Text note>$ {ventaSinIva ? Math.round(producto.precio_antes_impuestos*100)/100 : producto.precio}</Text> 
                    </View>
                    <View style={{ backgroundColor:'#fff', width:93, height: 27, flex:0, flexDirection:'row' }}>
                      <Button transparent small style={{paddingTop:0,paddingBottom:0}} onPress={()=> this.menosUno(producto)}>
                        <Icon name="remove" style={{...globalStyles.headerButton,marginLeft:8,marginRight:8}} />
                      </Button>
                      
                          <TextInput   
                              placeholder="0"
                              placeholderTextColor="#000000"
                              style={{width:40, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                              onChangeText={(cantidad) => this.onChangeTBox(producto,cantidad)}
                              
  //                            onChangeText={(cantidad) => this.setState({textPersistence:cantidad})}
                              keyboardType={"numeric"}
                              value={ "" + this.state.carritoCompras.filter(row => row.id == producto.idProducto).reduce((cant,row) => cant + row.cantidad,inicial) }
                          />
                        <Button transparent small style={{paddingTop:0,paddingBottom:0}}  onPress={()=> this.sumaUno(producto)}>
                        <Icon name="add" style={{...globalStyles.headerButton,marginLeft:8,marginRight:10}} />
                      </Button>
                    </View>
                    
                  </View>


                    
                    
                  
                   
                </View>

              </FlatList>}
              
              />
            

    );
  }






















  }


  render() {

    
    const buscadorProductosActivo = this.state.buscadorProductosActivo;

//    console.log("****** Render ");
    return (
<View style={styles.container}>
    

        <View iosBarStyle={"dark-content"} style={{ ...globalStyles.header , height:115,paddingTop:10 }} searchBar rounded>
        <View style={{flex: 0}}>
            <Button
              transparent
              onPress={() => this.props.navigation.openDrawer()}>
              <Icon name="menu" style={globalStyles.headerButton} />
            </Button>
        </View>

        {
          buscadorProductosActivo &&
          <View style={{flex: 3}}>
          <View >
              <Icon active name="search" style={globalStyles.headerButton} />
              <TextInput placeholder="Producto" 
                  autoFocus = {true}
                  onChangeText={(busqueda) => this.onChangeSeachBox(busqueda)}                            
                  onBlur={ this.realizarBusqueda.bind(this)}
                  blurOnSubmit={true}
                  value={ "" + this.state.busqueda }
                  style={globalStyles.headerButton}
              />
          </View>
          <Text style={{fontSize:10}}>Mínimo 3 caracteres.. Da enter para iniciar búsqueda</Text>
          </View>

        }
        {
          !buscadorProductosActivo &&
          <View style={{flex: 3}}>
          <Text style={globalStyles.headerTitle} >Nueva Venta</Text>
          

          {
           this.state.cliente != null && (
            
              
            <Text style={{fontSize:12}}>Cliente: { this.state.cliente.clave } - {this.state.cliente.nombre_comercial}</Text>
              
            )
          
          }
          { this.state.cliente == null && <Text>Venta al público</Text>}
          
          
          </View>
        }

          <View style={globalStyles.headerRight} >
            <View>
              <View style={{height: 45}}>
              <View style={{  height: 45,width:45 }}>
                <Button transparent style={{paddingLeft:10,paddingRight:5,height: 45}} onPress={() => this.activarBuscadorProductos() } >
                  {
                    !buscadorProductosActivo &&
                    <Icon name="search" style={globalStyles.headerButton} />
                  }
                  {
                    buscadorProductosActivo &&
                    <Icon name="close" style={globalStyles.headerButton} />
                  }
                </Button>
              </View>
              <View style={{   height: 45,width:45 }}>
                <Button  transparent style={{paddingLeft:10,paddingRight:5,height: 45}} onPress={() => this.mostrarClientes() } >
                  <Icon name="person-add" style={globalStyles.headerButton} />
                </Button>
              </View>
              </View>
              { this.state.cliente != null && 

                <View style={{height: 47, alignContent:"center"}}>
                  <View style={{ height:47,alignItems:"center" }}>
                    <Text style={{fontSize:10,paddingBottom:5}}>¿Con Factura? </Text>
                    <Switch style={{paddingTop:10}} value={this.state.generaFactura} onValueChange={(checked) => this.paraFactura(checked) } />   
                  </View>
                </View>

              }            
            </View>

          </View>
        </View>
        
        <View>
          
        <View style={{flex: 1}}>


        {
        this.state.isLoading &&

        <View style={{alignItems:'center'}}>
          <Spinner color='#51747F' />
          <Text style={{alignItems:'center'}}>Cargando...</Text>
        </View>  
        }

        {
          this.state.iniciarBusqueda &&

        <View style={{alignItems:'center'}}>
          <Spinner color='#51747F' />
          <Text style={{alignItems:'center'}}>Realizando la búsqueda de productos...</Text>
        </View>  
        }


        {
          this.state.showUpdate ?
          <View style={{alignItems:'center'}}>
            <Text>Se ha liberado una actualización al aplicativo.</Text> 
            <Button block style={{ margin: 15, marginTop: 20, backgroundColor: "#2496bc" }} onPress={() => this.doUpdate()}>
              <Text>Clic para actualizar</Text>
            </Button>
      
          </View>
        : null 
        }


{
  (!this.state.buscadorProductosActivo)  &&

<List.Accordion
            dataArray={this.state.categoriaDisplayArray}
            animation={true}
            expanded={this.state.categoriaExpanded} // Index of accordion set open
            renderHeader={this._renderHeader.bind(this)}
            renderContent={this._renderContent.bind(this)}
            onAccordionOpen={ this.onAccordionOpen.bind(this)}
            onAccordionClose={ this.onAccordionClose.bind(this)}
          />
}

{
  (( this.state.buscadorProductosActivo && !this.state.iniciarBusqueda && this.state.busquedaConcluida ))  &&
  

<View>
          <FlatList itemHeader first style={{paddingLeft:0,paddingRight:0,paddingBottom:0}}>
            <View
              style={{
                flex:1,
                flexDirection: "row",
                padding: 0,
                margin: 0,
                height:41.5,
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#568DAE",
                
              }}
            >
              <Text style={{ fontWeight: "600", color: 'white',paddingLeft:10 }}>
                 { this.state.productosDisplayArray.length} PRODUCTOS ENCONTRADOS...
              </Text>

            </View>

            </FlatList>
  
            {  this._renderContent('') }

          </View>

}
          </View>
        </View>

        <View >
          <View style={{backgroundColor: "#51747F"}}>
            <Button
              
             disabled={this.state.isLoading}
             onPress={() => this.pasarDatos()}
             style={{paddingTop:15}}
              vertical
              badge
            >
              <View style={{ backgroundColor: "#cb8d12" }}>
                <Text>{this.state.count}</Text>
              </View>
              <Icon style={{color: 'white'}} name="md-cart"/>
              <Text style={{color: 'white'}}>Confirmar</Text>

            </Button>
            <Button disabled={this.state.isLoading} onPress={() => this.pasarDatos()}>
              
              <NumberFormat value={Math.abs(this.state.suma)} displayType={'text'} thousandSeparator={true} prefix={'$'} fixedDecimalScale={true} decimalScale={2} renderText={value => <H3 style={{color: 'white'}}>{value}</H3> } />

            </Button>
          </View>
        </View>
      </View >
    );
  }
}

//export default Venta;


 