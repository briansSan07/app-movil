import React, { Component} from "react";
import { Updates } from 'expo';
import {
 View, Switch,Spinner, Image,
  FlatList, StyleSheet, Dimensions, Text, ActivityIndicator
} from "react-native";

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

import { AccordionList } from 'accordion-collapse-react-native';
import Constants from 'expo-constants';
import { Button, ListItem } from '@rneui/themed';
import {TextInput, AppRegistry,Navigator,SafeAreaView, Alert} from "react-native";
import NumberFormat from 'react-number-format';
import Icon from 'react-native-vector-icons/Ionicons';

const CatalogosModel = require ('../../lib/model/CatalogosModel');
const SyncronizeCatalogs = require ('./../../lib/syncronization/SyncronizeCatalogs');
const ProductoModel = require ('../../lib/model/ProductoModel');
const ClienteModel = require ('../../lib/model/ClienteModel');

const catalogosModel = new CatalogosModel();
const syncronizeCatalogs = new SyncronizeCatalogs();
const productoModel = new ProductoModel();
const clienteModel = new ClienteModel();

import { TouchableOpacity } from "react-native-gesture-handler";


var inicial=" ";
//let porSurtir = [];
let textPersistence = "";

export default class Venta extends Component {

  constructor(props) {
    super(props);

if (process.env.NODE_ENV !== 'production') {
  //const {whyDidYouUpdate} = require('why-did-you-update');  whyDidYouUpdate(React)
}

   //console.log("* uniqueValue: " , (props.route.params.uniqueValue));

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

      uniqueValue: props.route.Param?.uniqueValue || 0 ,
      carritoCompras:[],
      cliente:null,
      isAsignacionCliente:false,
      generaFactura: false,
      ventaSinIva: false,
      showUpdate: false,
      update:null,
      showProducts: false

    };    

  }

  _onPress = () => {
    if (this.state.showProducts === false){
    this.setState({showProducts: true})
    }
    else{
      this.setState({showProducts: false})
    }
    
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
//uniqueValue: props.route.Param?.uniqueValue || 0 ,
    const prevUniqueValue =  prevProps.route.params?.uniqueValue;
    const thisUniqueValue =  this.props.route.params?.uniqueValue;
    
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
  
  /*shouldComponentUpdate(nextProps) {
    //productosDisplayArray
//    console.log(".shouldComponentUpdate:" , {nextProps:nextProps.navigation.state.params.uniqueValue , "this.props": this.props.navigation.state.params.uniqueValue});
//    if (this.props.navigation.state.params.uniqueValue == 0 || this.props.navigation.state.params.uniqueValue !== nextProps.navigation.state.params.uniqueValue) {
//      console.log("shouldComponentUpdate");
      return true;
//    } else {
//      return true;
//    }
  }
  */


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
      productoModel.consultarTiposProducto()
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
      clienteModel.consultarClientes()
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

    productoModel.consultaProductos(nivelSocioeconomico)
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

    productoModel.consultaProductosByTipoProducto(nivelSocioeconomico,tipoProducto)
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
      catalogosModel.consultarNivelSocioeconomicoPublicoGral()
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
      catalogosModel.consultarMetodosPago()
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
      catalogosModel.consultarBancos()
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
      catalogosModel.consultarEstados()
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



  onChangeTBox = (producto, cantidad) => {

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

sumaUno = (producto) => {

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

menosUno = (producto) => {
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

  onAccordionOpen(categoria, expanded){

    if (!categoria.item) {
      return null;
    }

    console.log("onAccordionOpen: " , (categoria), "index", (categoria.index));

    this.state.categoriaExpanded = categoria.index;
    const isBusqueda = this.state.busquedaConcluida;
    if(this.state.productosDisplay != categoria.item.idtipoProducto){
      console.log("filtrar productos por: " + categoria.item.idtipoProducto + " this.state.productosDisplay: " + this.state.productosDisplay );
    
      if(isBusqueda ){
        this.setState({productosDisplay:"0",productosDisplayArray:this.state.productosDisplayArray});  
        return true;
      }
      const productosDisplayArray = this.state.productosArray.filter(function (producto) {        
        return  producto.idproductotipo === categoria.item.idtipoProducto;
      });
      console.log("Mostrare: " + productosDisplayArray.length + " productos.");
      this.setState({productosDisplay: categoria.item.idtipoProducto, productosDisplayArray: productosDisplayArray});

  }

   /* else {
      console.log("onAccordionClose: " );//, {item,index});
    this.setState({productosDisplayArray:[],productosDisplay:null,categoriaExpanded:0});
    }
    */
//    this.consultaProductosByTipoProducto(this.state.nivelSocioeconomico,item.idtipoProducto);
  }

  onAccordionClose(producto,index){
    console.log("onAccordionClose: " );//, {item,index});
    this.setState({productosDisplayArray:[],productosDisplay:null,categoriaExpanded:0});
  }  
     
  _renderHeader(categoria, expanded ) {
    if (!categoria) {
      return null;
    }
//console.log("categoriaBruta: " + categoria.tipo_producto + " expanded: " + expanded);
    return (
      <View>
      <TouchableOpacity style={{ flexDirection: "row", 
      padding: 10, 
      justifyContent: "space-between", 
      alignItems: "center", 
      backgroundColor: "#568DAE" }}
      onPress={(expanded) => {this.onAccordionOpen(categoria, expanded)} }
      >
        <Text style={{ fontWeight: "600", color: 'white' }}>
          
          {" "}{categoria.item.tipo_producto}
        </Text>
        {expanded
          ? <Icon style={{ fontSize: 18, color: 'white' }} name="remove-circle" />
          : <Icon style={{ fontSize: 18, color: 'white' }} name="add-circle" />}
    </TouchableOpacity>

    </View>
    );
  }

renderProducto = ({ producto }) => {
  const productoFiltrado = this.state.productosDisplayArray;
  const { ventaSinIva } = this.state;
  console.log("-----------", producto)
  if(productoFiltrado != null && productoFiltrado.length > 0){
  return (
    <FlatList
    data={productoFiltrado}
    renderItem={(producto) => 
      <View style={{ marginLeft: 5, marginRight: 5 }}>
        <View style={{ flexDirection: "row" }}>
          <Image
            style={{ width: 50, height: 50 }}
            source={{ uri: 'https://atletl.api.concrad.com/' + producto.imagen }}
          />
          <View style={{ marginLeft: 5 }}>
            <Text style={{ fontSize: 14 }}>{producto.codigo} - {producto.nombre}</Text>
            <View style={{ flexDirection: "row" }}>
              <Text note>Disp: {producto.cantidad}</Text>
              <Text note style={{ marginLeft: 10 }}>
                $ {ventaSinIva ? Math.round(producto.precio_antes_impuestos * 100) / 100 : producto.precio}
              </Text> 
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
          <TouchableOpacity onPress={() => this.menosUno(producto)}>
            <Icon name="remove" style={{ fontSize: 20, color: 'black' }} />
          </TouchableOpacity>

          <TextInput
            placeholder="0"
            placeholderTextColor="#000000"
            style={{
              width: 40,
              borderColor: "gray",
              borderWidth: 1,
              backgroundColor: "#f3f3f3",
              marginLeft: 5,
              marginRight: 5,
              textAlign: "center"
            }}
            onChangeText={(cantidad) => this.onChangeTBox(producto, cantidad)}
            keyboardType={"numeric"}
            value={"" + this.state.carritoCompras.filter(row => row.id === producto.idProducto).reduce((cant, row) => cant + row.cantidad, 0)}
          />

          <TouchableOpacity onPress={() => this.sumaUno(producto)}>
            <Icon name="add" style={{ fontSize: 20, color: 'black' }} />
          </TouchableOpacity>
        </View>
      </View> 
    }
    keyExtractor={(producto) => producto.idProducto.toString()}
      />
          
  );
          }
          
}


render() {

    const buscadorProductosActivo = this.state.buscadorProductosActivo;

//    console.log("****** Render ");
    return (
  <SafeAreaView style={{ flex: 1 }}>
    <View style={{ flex: 1}}>
      <View style={{ height: 115, paddingTop: 10, backgroundColor: "#51747F" }}>
            <View style={{ flexDirection: "row" }}>
              


    {buscadorProductosActivo ? (
                <View style={{ flex: 3 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon active name="search" style={{ color: 'white', marginLeft: 10 }} />
                    <TextInput
                      placeholder="Producto"
                      autoFocus={true}
                      onChangeText={(busqueda) => this.onChangeSeachBox(busqueda)}
                      onBlur={this.realizarBusqueda.bind(this)}
                      blurOnSubmit={true}
                      value={"" + this.state.busqueda}
                      style={{ color: 'white', flex: 1 }}
                    />
                  </View>
                  <Text style={{ fontSize: 10, color: 'white', marginLeft: 10 }}>Mínimo 3 caracteres.. Da enter para iniciar búsqueda</Text>
                </View>
    ) : (
                <View style={{ flex: 3 }}>
                  {this.state.cliente != null && (
                    <Text style={{ fontSize: 12, color: 'white', marginLeft: 10 }}>
                      Cliente: {this.state.cliente.clave} - {this.state.cliente.nombre_comercial}
                    </Text>
                  )}
                  {this.state.cliente == null && <Text style={{ color: 'white', fontSize: 12, marginLeft: 10 }}>Venta al público</Text>}
                </View>
    )}
              <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity
                  style={{ flex: 0, paddingLeft: 10, paddingRight: 5, paddingTop: 15 }}
                  onPress={() => this.activarBuscadorProductos()}
                >
                  {!buscadorProductosActivo ? (
                    <Icon name="search" style={{ color: 'white' }} />
                  ) : (
                    <Icon name="close" style={{ color: 'white' }} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 0, paddingLeft: 10, paddingRight: 5, paddingTop: 15 }}
                  onPress={() => this.mostrarClientes()}
                >
                  <Icon name="person-add" style={{ color: 'white' }} />
                </TouchableOpacity>
              </View>
            </View>
            {this.state.cliente != null && (
              <View style={{ height: 47, alignItems: "center", flexDirection: "row" }}>
                <Text style={{ fontSize: 10, paddingBottom: 5, color: 'white', marginLeft: 10 }}>¿Con Factura? </Text>
                <Switch
                  style={{ paddingTop: 10 }}
                  value={this.state.generaFactura}
                  onValueChange={(checked) => this.paraFactura(checked)}
                />
              </View>
            )}     
            </View>

          
        
        
        <View>
          
        <View>
      {(this.state.isLoading) &&
      <View style={{ alignItems: 'center' }}>
        <ActivityIndicator color='#51747F' />
        <Text>Cargando...</Text>
      </View>
      }

      {(this.state.iniciarBusqueda) &&
      <View style={{ alignItems: 'center' }}>
        <ActivityIndicator color='#51747F' />
        <Text>Realizando la búsqueda de productos...</Text>
      </View>
      }

      {(this.state.showUpdate) &&
      <View style={{ alignItems: 'center' }}>
        <Text>Se ha liberado una actualización al aplicativo.</Text>
        <Button
          title="Clic para actualizar"
          onPress={() => this.doUpdate()}
          style={{ margin: 15, marginTop: 20, backgroundColor: "#2496bc" }}
        />
      </View>
      }

    {(!this.state.buscadorProductosActivo) &&
      <FlatList
      data={this.state.categoriaDisplayArray}
      
      renderItem={ (categoria, index, expanded) => this._renderHeader(categoria, index, expanded)}
      
      keyExtractor={(categoria, index, expanded) => categoria.idtipoProducto.toString() + index + expanded}
      
      />
    }

    {(this.state.buscadorProductosActivo && !this.state.iniciarBusqueda && this.state.busquedaConcluida) &&
      <View>
        <Text style={{ fontWeight: "600", color: 'white', paddingLeft: 10 }}>
          {this.state.productosDisplayArray.length} PRODUCTOS ENCONTRADOS...
        </Text>
        {this.renderProducto('')}
      </View>
    }
          </View>
        </View>

        <View >
          <View style={{backgroundColor: "#51747F"}}>
          <TouchableOpacity
                disabled={this.state.isLoading}
                onPress={() => this.pasarDatos()}
                style={{ paddingTop: 15, alignItems: "center" }}
              >
                <Icon name="md-cart" style={{ color: 'white', fontSize: 30 }} />
                <Text style={{ color: 'white' }}>Confirmar</Text>
                <Text style={{ color: 'white' }}>{this.state.count}</Text>
              </TouchableOpacity>
              </View>
              <View>
              <TouchableOpacity
                disabled={this.state.isLoading}
                onPress={() => this.pasarDatos()}
                style={{ backgroundColor: "#51747F", alignItems: "center", paddingTop: 10 }}
              >
                <Text style={{ color: 'white', fontSize: 18 }}>{this.state.suma}</Text>
              </TouchableOpacity>
            </View>
        </View>
        </View>
      </SafeAreaView>
    );
    
  }
  
}

//export default Venta;

const styles = StyleSheet.create({

  container: {
    backgroundColor: "#FFF"
  },
  text: {
    alignSelf: "center",
    marginBottom: 7
  },
  mb: {
    marginBottom: 15
  },

})


const globalStyles = StyleSheet.create({
container: {
  backgroundColor: "#FFF"
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
  height:90
},
headerRight: {
  paddingTop: Platform.OS === 'ios' ? 0 : 10
},
headerButton: {
  color:'#2496bc'
},
headerTitle: {
  color:'#000000',
  textAlign:'center'
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
})