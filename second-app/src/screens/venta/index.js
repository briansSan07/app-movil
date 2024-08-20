import React, { Component } from "react";
import * as Updates from 'expo-updates';
import { View, SafeAreaView, Switch, Image, FlatList, StyleSheet, Dimensions, Text, ActivityIndicator, TextInput, Modal, Platform } from "react-native";
import { ScrollView } from 'react-native-virtualized-view';
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;
import { Button } from "@rneui/themed";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from "@react-navigation/native";
const Stack = createNativeStackNavigator();

import Constants from 'expo-constants';
import { NumericFormat } from 'react-number-format';
import Icon from 'react-native-vector-icons/Ionicons';

const Login = require('./../login/index');
const CatalogosModel = require('../../lib/model/CatalogosModel');
const SyncronizeCatalogs = require('./../../lib/syncronization/SyncronizeCatalogs');
const ProductoModel = require('../../lib/model/ProductoModel');
const ClienteModel = require('../../lib/model/ClienteModel');

const login = new Login();
const catalogosModel = new CatalogosModel();
const syncronizeCatalogs = new SyncronizeCatalogs();
const productoModel = new ProductoModel();
const clienteModel = new ClienteModel();

import { TouchableOpacity } from "react-native-gesture-handler";

var inicial = " ";
//let porSurtir = [];
let textPersistence = "";

export default class Venta extends Component {

  constructor(props) {
    super(props);

    if (process.env.NODE_ENV !== 'production') {
      //const {whyDidYouUpdate} = require('why-did-you-update');  whyDidYouUpdate(React)
    }

    this.state = {
      origen: this.origen,
      prevOrigen: '',
      count: 0,
      text: " ",
      subtotal: 0,
      descuento: 0,
      iva: 0,
      ieps: 0,
      suma: 0,

      isLoading: true,
      isReload: false,

      categoriaArray: [],
      categoriaDisplayArray: [],
      categoriaExpanded: -1,
      categoriaShow: null,
      listaAbierta: -1,

      productosArray: [],
      productosDisplayArray: [],

      nivelSocioeconomico: 0,
      buscadorProductosActivo: false,
      busqueda: '',
      iniciarBusqueda: false,
      busquedaConcluida: false,
      productosDisplay: null,

      uniqueValue: props.route.Param?.uniqueValue || 0,
      carritoCompras: [],
      cliente: null,
      isAsignacionCliente: false,
      generaFactura: false,
      ventaSinIva: false,
      showUpdate: false,
      update: null,
      selectedImage: null
    };

  }

  initializeComponent() {

    console.log("Inicializando")
    this.setState({
      carritoCompras: [],
      categoriaArray: [],
      categoriaDisplayArray: [],
      categoriaExpanded: -1,
      generaFactura: false,
      ventaSinIva: false,
      cliente: null

    }, () => { this.calculandoCarrito() });

  }

  componentDidMount() {

    if (this.state.origen == "ConfirmacionVenta") {
      this.checkAppUpdates();

      this.setState({ ventaSinIva: global.preciosDeVentaSinIva });
      console.log("global.preciosDeVentaSinIva: ", global.preciosDeVentaSinIva);
      console.log("state.ventaSinIva: ", this.state.ventaSinIva);

      const { navigation } = this.props;
    }

    else {
      console.log("componentDidMount");
      this.consultaCategoria();
      this.consultaNivelSocioeconomicoPublico();
      this.consultaMetodosPago();
      this.consultaBancos();
      this.consultaEstados();
      this.checkAppUpdates();

      this.setState({ ventaSinIva: global.preciosDeVentaSinIva });
      console.log("global.preciosDeVentaSinIva: ", global.preciosDeVentaSinIva);
      console.log("state.ventaSinIva: ", this.state.ventaSinIva);

      const { navigation } = this.props;
    }
  }

  componentDidUpdate(prevProps) {
    const prevUniqueValue = prevProps.route.params?.uniqueValue;
    const thisUniqueValue = this.props.route.params?.uniqueValue;

    if (thisUniqueValue != undefined) {
      if (prevUniqueValue != thisUniqueValue && prevUniqueValue != undefined) {
        this.initializeComponent();
        this.componentDidMount();
      }
    }
  }

  checkAppUpdates() {

    try {
      Updates.checkForUpdateAsync().then(update => {
        this.setState({ update: update });
        console.log("Updates.checkForUpdateAsync: ", update);
        if (update.isAvailable) {
          this.setState({ showUpdate: true });
        }
      }).catch((error) => {
        console.log('checkForUpdateAsync-error: ', error);
      });
    } catch (e) {
      console.log({ e });

    }

  }

  async doUpdate() {

    await Updates.fetchUpdateAsync();
    Updates.reloadFromCache();
    this.setState({ showUpdate: false });

  }

  consultaCategoria() {

    if (global.TiposProducto == null || global.TiposProducto == undefined) {
      productoModel.consultarTiposProducto()
        .then((result) => {
          console.log("consultarTiposProducto:", result.list.length);
          global.TiposProducto = result.list;
          this.llenarCategoria(global.TiposProducto);
        })
        .catch((error) => {
          console.log('error al consultarTiposProducto: ', error);
        });
    } else {
      this.llenarCategoria(global.TiposProducto);
    }

  }

  consultaClientes() {

    if (global.clientes == null || global.clientes == undefined) {
      clienteModel.consultarClientes()
        .then((result) => {
          console.log("consultar Clientes:", result.clientesList.length);
          global.clientes = result.clientesList;
        })
        .catch((error) => {
          console.log('error al consultarClientes: ', error);
        });
    }

  }

  consultaProductos(nivelSocioeconomico) {
    console.log("**** consultaProductos");

    productoModel.consultaProductos(nivelSocioeconomico)
      .then((result) => {
        console.log("consultaProductos:", result.list.length);
        this.llenarProducto(result.list);

      })
      .catch((error) => {
        console.log('error al consultaProductos: ', error);
      });
  }


  consultaProductosByTipoProducto(nivelSocioeconomico, tipoProducto) {
    console.log("**** consultaProductosByTipoProducto");

    productoModel.consultaProductosByTipoProducto(nivelSocioeconomico, tipoProducto)
      .then((result) => {
        console.log("consultaProductosByTipoProducto:", result.list.length);
        this.llenarProducto(result.list);
      })
      .catch((error) => {
        console.log('error al consultaProductos: ', error);
      });
  }


  consultaNivelSocioeconomicoPublico() {
    if (global.publicoGeneral == null) {
      catalogosModel.consultarNivelSocioeconomicoPublicoGral()
        .then((result) => {
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

  setPublicoGeneral() {

    console.log("setPublicoGeneral: ");

    this.setState({
      nivelSocioeconomico: global.publicoGeneral
    }, () => {
      console.log("nivelSocioeconomico:  ", this.state.nivelSocioeconomico);
      this.consultaProductos(this.state.nivelSocioeconomico);
    });
  }

  consultaMetodosPago() {
    if (global.metodosPago == null) {
      catalogosModel.consultarMetodosPago()
        .then((result) => {
          global.metodosPago = result.metodosPagoList;
        })
        .catch((error) => {
          console.log('error al consultarMetodosPago: ', error);
        });
    }
  }


  consultaBancos() {
    if (global.bancos == null || global.bancos == undefined) {
      catalogosModel.consultarBancos()
        .then((result) => {
          console.log("Resultado de consultarBancos:", result.bancosList.length);
          global.bancos = result.bancosList;
        })
        .catch((error) => {
          console.log('error al consultarBancos: ', error);
        });
    }
  }


  consultaEstados() {
    if (global.estados == null) {
      catalogosModel.consultarEstados()
        .then((result) => {
          global.estados = result.estadosList;

        })
        .catch((error) => {
          console.log('error al consultarEstados: ', error);
        });
    }
  }

  llenarCategoria(categoria) {
    this.setState({ categoriaArray: categoria });
    this.setState({ categoriaDisplayArray: categoria });
    this.setState({ isLoading: false });
  }

  llenarProducto(productos) {
    this.setState({ productosArray: productos }, () => {
      if (this.state.buscadorProductosActivo && this.state.busquedaConcluida) {
        this.realizarBusqueda();
      } else {
        this.onAccordionOpen(this.state.categoriaDisplayArray[parseInt(this.state.categoriaExpanded)], this.state.categoriaExpanded);
      }
      this.actualizarCarritoANuevosPrecios();
      this.calculandoCarrito();
      this.setState({ isLoading: false });
    });
  }

  onChangeTBox = (producto, cantidad) => {
    let carritoCompras = [...this.state.carritoCompras];

    if (cantidad >= producto.item.cantidad) {
    }

    if (cantidad === "" || cantidad === " " || cantidad === undefined || cantidad === null || cantidad === "NaN" || cantidad === 0) {
      for (let i = 0; i < carritoCompras.length; i++) {
        if (carritoCompras[i].id === producto.item.idProducto) {
          carritoCompras.splice(i, 1)
        }
      }
      for (let i = 0; i < this.state.carritoCompras.length; i++) {
        if (this.state.carritoCompras[i].id === producto.item.idProducto) {
          this.state.carritoCompras.splice(i, 1)
        }
      }
      this.setState({ carritoCompras: carritoCompras }, () => { this.calculandoCarrito() });
    } else {
      let nuevoProductoParaCarrito = carritoCompras.filter(function (data) {
        return data.id === producto.item.idProducto;
      })

      if (nuevoProductoParaCarrito.length > 0) {
        nuevoProductoParaCarrito[0].cantidad = parseInt(cantidad);
      } else {
        nuevoProductoParaCarrito = {
          id: producto.item.idProducto,
          key: '' + producto.item.idProducto,
          existencia: producto.item.cantidad,
          cantidad: parseInt(cantidad),
          codigo: producto.item.codigo,
          nombre: producto.item.nombre,
          precio: producto.item.precio,
          precio_antes_impuestos: producto.item.precio_antes_impuestos,
          iva: producto.item.iva,
          ieps: producto.item.ieps,
          tasa_iva: producto.item.tasa_iva,
          has_stock: producto.item.has_stock,
          id_tasa_cuota_iva: producto.item.id_tasa_cuota_iva,
          id_tasa_cuota_ieps: producto.item.id_tasa_cuota_ieps,
          img: producto.item.imagen
        };
        carritoCompras.push(nuevoProductoParaCarrito);
      }
      this.setState({ carritoCompras: carritoCompras }, () => { this.calculandoCarrito() });
    }
  }

  sumaUno = (producto) => {
    let carritoCompras = [...this.state.carritoCompras];
    if (producto.item.cantidad <= 0) {
    }
    let nuevoProductoParaCarrito = carritoCompras.filter(function (data) {
      return data.id === producto.item.idProducto;
    })
    if (nuevoProductoParaCarrito.length > 0) {
      nuevoProductoParaCarrito[0].cantidad++;
    } else {
      nuevoProductoParaCarrito = {
        id: producto.item.idProducto,
        key: '' + producto.item.idProducto,
        codigo: producto.item.codigo,
        nombre: producto.item.nombre,
        existencia: producto.item.cantidad,
        cantidad: 1,
        precio: producto.item.precio,
        precio_antes_impuestos: producto.item.precio_antes_impuestos,
        iva: producto.item.iva,
        ieps: producto.item.ieps,
        tasa_iva: producto.item.tasa_iva,
        has_stock: producto.item.has_stock,
        id_tasa_cuota_iva: producto.item.id_tasa_cuota_iva,
        id_tasa_cuota_ieps: producto.item.id_tasa_cuota_ieps,
        img: producto.item.imagen
      };
      carritoCompras.push(nuevoProductoParaCarrito);
    }
    this.setState({ carritoCompras: carritoCompras }, () => { this.calculandoCarrito() });
  }

  menosUno = (producto) => {
    console.log("Change en el carrito con: ", producto)
    let carritoCompras = this.state.carritoCompras;
    let nuevoProductoParaCarrito = carritoCompras.filter(function (data) { return data.id === producto.item.idProducto; })

    if (nuevoProductoParaCarrito.length > 0) {
      nuevoProductoParaCarrito[0].cantidad--;
      if (nuevoProductoParaCarrito[0].cantidad <= 0) {
        for (let i = 0; i < carritoCompras.length; i++) {
          if (carritoCompras[i].id === producto.item.idProducto) {
            carritoCompras.splice(i, 1)
          }
        }
      }
      this.setState({ carritoCompras: carritoCompras }, () => { this.calculandoCarrito() });

    }
  }

  mostrarValor(producto) {
    let nuevoProductoParaCarrito = carritoCompras.filter(function (data) { return data.id === producto.item.id; })
    if (nuevoProductoParaCarrito[0].cantidad > 0) {
      return "0";
    } else {
      let cadena = String(nuevoProductoParaCarrito[0].cantidad);
      return cadena;
    }
  }

  actualizarCarritoANuevosPrecios() {
    const carrito = this.state.carritoCompras;

    console.log("Actualizando precios del carrito...", carrito);
    carrito.forEach((productoCarrito, index) => {
      const productoCatalogo = this.state.productosArray.filter(function (producto) {
        return producto.idProducto === productoCarrito.id;
      });
      if (productoCatalogo.length > 0) {
        productoCarrito.precio = productoCatalogo[0].precio
        productoCarrito.precio_antes_impuestos = productoCatalogo[0].precio_antes_impuestos
        productoCarrito.iva = productoCatalogo[0].iva
        productoCarrito.ieps = productoCatalogo[0].ieps
      }
    });
    console.log("Terminando actualizacion precios del carrito...", carrito);
    this.setState({ carritoCompras: carrito });
  }

  calculandoCarrito(producto) {
    const carrito = this.state.carritoCompras;
    let suma = 0;
    let count = 0;
    let subtotal = 0;
    let total = 0;
    let iva = 0;
    let ieps = 0;

    console.log("-------- calculandoCarrito ------------ ", this.state.ventaSinIva);

    const borrador = carrito.filter(item => item.cantidad > 0)

    this.setState({ carritoCompras: borrador });
    console.log("carrito", this.state.carritoCompras)
    carrito.forEach((producto) => {
      const productoSubTotal = (producto.cantidad * producto.precio_antes_impuestos);
      count += producto.cantidad;
      subtotal += productoSubTotal;
      iva += Math.round(productoSubTotal * producto.tasa_iva * 10000) / 10000;
      ieps += (productoSubTotal * 0);
      total += (producto.cantidad * producto.precio);
    });

    if (this.state.ventaSinIva) {
      suma = subtotal;
      iva = 0;
      ieps = 0;
    } else {
      suma = total;
    }

    this.setState({
      count: count,
      suma: suma,
      subtotal: subtotal,
      descuento: 0,
      iva: iva,
      ieps: ieps,
      isLoading: false
    })

  }

  actualizarPreciosIva() {
    let ventaSinIva = false;

    if (global.preciosDeVentaSinIva) {
      ventaSinIva = true;

      if (this.state.generaFactura) {
        ventaSinIva = false;
      }
    }
    this.setState({ ventaSinIva: ventaSinIva }, () => {
      this.calculandoCarrito()
    });
  }

  pasarDatos() {

    this.props.navigation.push("ConfirmacionVenta", {
      origen: "VENTA",
      carrito: this.state.carritoCompras,
      cliente: this.state.cliente,
      generaFactura: this.state.generaFactura,
      ventaSinIva: this.state.ventaSinIva,
      onGoBack: (producto) => this.calculandoCarrito(producto),
    })
    this.calculandoCarrito()
  }

  activarBuscadorProductos() {
    this.setState({
      iniciarBusqueda: false,
      busquedaConcluida: false,
      buscadorProductosActivo: !this.state.buscadorProductosActivo,
      productosDisplayArray: []
    }, () => {
      if (this.state.buscadorProductosActivo == false) {
        this.setState({
          categoriaDisplayArray: this.state.categoriaArray,
          busqueda: ""
        }, () => {
          this.filtraProductos()
        });

      }
    });
  }

  onChangeSeachBox(busqueda) {
    this.setState({ busqueda: busqueda });
  }

  realizarBusqueda() {
    if (this.state.busqueda == "UPDATE") {
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

    this.setState({ iniciarBusqueda: true, busquedaConcluida: false }, () => {
      setTimeout(() => {
        this.filtraProductos()
      }, 300);
    });

  }

  filtraProductos() {
    return new Promise((resolve, reject) => {
      let buscador = [];
      let query = this.state.busqueda;

      if (query.length >= 3) {
        query = query.toUpperCase().trim();
        const productosDisplayArray = this.state.productosArray.filter((producto) => { return this.findPalabraClave(query, producto.codigo + " " + producto.nombre) });

        const categoriasFinales = [{
          "idtipoProducto": 0,
          "tipo_producto": "Resultados de búsqueda...",
        }]

        this.setState({
          categoriaDisplayArray: categoriasFinales,
          categoriaExpanded: "-1",
          productosDisplayArray: productosDisplayArray
        }, () => {
          this.setState({
            iniciarBusqueda: false,
            busquedaConcluida: true,
            categoriaExpanded: "-1"
          });
        });
        resolve({ success: true });
      } else {
        reject({ success: false });
      }
    });
  }

  mostrarClientes() {
    const { navigation } = this.props;
    navigation.navigate("Cliente",
      {
        origen: "VENTA",
        onGoBack: (cliente) => this.asignarCliente(cliente),
      });
  }

  asignarCliente(cliente) {
    this.setState({ cliente: cliente, isLoading: true, productosDisplay: null, productosDisplayArray: [] }, () => {
      if (cliente.nivel_socioeconomico_id == undefined || cliente.nivel_socioeconomico_id == null) {
        this.setPublicoGeneral();
      } else {
        this.setState({
          nivelSocioeconomico: cliente.nivel_socioeconomico_id
        }, () => {
          this.consultaProductos(this.state.nivelSocioeconomico);
        });
      }
    });
  }

  findPalabraClave(buscando, origenBusqueda) {
    origenBusqueda = origenBusqueda.toUpperCase()
    const palabrasClave = buscando.toUpperCase().trim()
    const palabrasList = palabrasClave.split(' ')

    let finded = true
    palabrasList.forEach(function (palabra) {
      const reg = new RegExp(palabra)
      if (origenBusqueda.match(reg)) {
      } else {
        finded = false
      }
    })
    return finded
  }

  paraFactura(checked) {
    const productos = this.state.productosDisplayArray;

    this.setState({ isLoading: true }, () => {
      setTimeout(() => {
        this.setState({ generaFactura: checked, productosDisplayArray: [] }, () => {
          this.setState({ productosDisplayArray: productos }, () => {
            this.actualizarPreciosIva();
          });

        });

      }, 100);
    });

  }

  onDialogOpen(visible, producto) {
    this.setState({ visibleModal: visible });
  }

  onAccordionOpen(categoria, categoriaExpanded) {
    if (!categoria) {
      return null;
    }

    if (this.state.listaAbierta !== -1) {
      this.onAccordionClose(this.state.listaAbierta);
    }

    this.setState({ listaAbierta: categoria.index })

    const isBusqueda = this.state.busquedaConcluida;
    if (this.state.productosDisplay != categoria.item.idtipoProducto) {
      if (isBusqueda) {
        this.state.productosDisplay = "-1", this.state.productosDisplayArray = this.state.productosDisplayArray;
        return true;
      }
      const productosDisplayArray = this.state.productosArray.filter(function (producto) {
        return producto.idproductotipo === categoria.item.idtipoProducto;
      });
      this.state.productosDisplay = categoria.item.idtipoProducto, this.state.productosDisplayArray = productosDisplayArray;
    }
  }

  onAccordionClose(categoria) {
    this.setState({ listaAbierta: -1 });
    this.state.productosDisplayArray = [], this.state.productosDisplay = null;

  }

  _renderHeader(categoria, index) {
    const { selectedImage } = this.state;
    const { ventaSinIva } = this.state;

    if (!categoria) {
      return null;
    }
    return (
      <View>
        <View>
          <TouchableOpacity style={styles.accordionHeader}
            onPress={this.state.listaAbierta == categoria.index
              ? () => { this.onAccordionClose(categoria, index) }
              : () => { this.onAccordionOpen(categoria, index) }}
          >
            <Text style={styles.accordionHeaderText}>
              {" "}{categoria.item.tipo_producto}
            </Text>
            {this.state.listaAbierta == categoria.index
              ? <Icon style={styles.accordionIcon} name="remove-circle" />
              : <Icon style={styles.accordionIcon} name="add-circle" />}
          </TouchableOpacity>
        </View>

        <View>
          {this.state.listaAbierta == categoria.index
            ? (
              <View>
                <FlatList
                  data={this.state.productosDisplayArray}
                  renderItem={(producto) =>
                    <View style={styles.productItem}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
  <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.setState({ selectedImage: producto.item })}>
    <Image style={styles.productImage} source={{ uri: 'https://atletl.api.concrad.com/' + producto.item.imagen }} />
    <View style={{ marginLeft: 5, maxWidth: deviceWidth * 0.5 }}>
      <Text style={{ fontSize: 14 }} numberOfLines={1} ellipsizeMode="tail">{producto.item.codigo} - {producto.item.nombre}</Text>
      <View style={{ flexDirection: "row" }}>
        <Text note>Disp: {producto.item.cantidad}</Text>
        <Text note style={{ marginLeft: 10 }}>
          $ {ventaSinIva ? Math.round(producto.item.precio_antes_impuestos * 100) / 100 : producto.item.precio}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
  <View style={styles.productQuantity}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity onPress={() => this.menosUno(producto)}>
        <Icon name="remove" style={{ fontSize: 20, color: 'black' }} />
      </TouchableOpacity>

      <TextInput
        placeholderTextColor="#000000"
        style={styles.productQuantityInput}
        onChangeText={(cantidad) => this.onChangeTBox(producto, cantidad)}
        keyboardType={"numeric"}
        value={"" + this.state.carritoCompras.filter(row => row.id == producto.item.idProducto).reduce((cant, row) => cant + row.cantidad, inicial)}
      />

      <TouchableOpacity onPress={() => this.sumaUno(producto)}>
        <Icon name="add" style={{ fontSize: 20, color: 'black' }} />
      </TouchableOpacity>
    </View>
  </View>
</View>

                    </View>}
                  keyExtractor={(producto) => producto.idProducto.toString()}
                />
                {selectedImage && (
                  <Modal animationType="slide" transparent={false} visible={true}>
                    <View style={styles.modalContent}>
                      <Image source={{ uri: 'https://atletl.api.concrad.com/' + selectedImage.imagen }} style={styles.modalImage} />
                      <Text style={styles.modalText}>Nombre: <Text style={{ fontWeight: 'bold', fontSize: 25 }}>{selectedImage.nombre}</Text></Text>
                      <Text style={styles.modalText}>Codigo: <Text style={{ fontWeight: 'bold', fontSize: 25 }}>{selectedImage.codigo}</Text></Text>
                      <Text style={styles.modalText}>Precio: <Text style={{ fontWeight: 'bold', fontSize: 25 }}>${selectedImage.precio}</Text></Text>
                      <Text style={styles.modalText}>Existencia: <Text style={{ fontWeight: 'bold', fontSize: 25 }}>{selectedImage.cantidad}</Text></Text>
                      <Button
                        title="Cerrar"
                        icon={{
                          name: 'close',
                          type: 'font-awesome',
                          size: 20,
                          color: 'black',
                        }}
                        iconPosition="left"
                        iconContainerStyle={{ marginLeft: 10 }}
                        titleStyle={{ fontWeight: '700', color: 'black' }}
                        buttonStyle={styles.closeButton}
                        containerStyle={styles.closeButtonContainer}
                        onPress={() => this.setState({ selectedImage: null })}
                      />
                    </View>
                  </Modal>
                )}
              </View>
            ) : null}
        </View>
      </View>
    );
  }

  render() {
    if (this.state.reload) {
      this.setState({ reload: false });
    }

    const buscadorProductosActivo = this.state.buscadorProductosActivo;
    const productoFiltrado = this.state.productosDisplayArray;
    const { ventaSinIva } = this.state;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => this.props.navigation.dispatch(DrawerActions.openDrawer())}>
            <Icon name="menu" style={styles.headerIcon} />
          </TouchableOpacity>

          {buscadorProductosActivo ? (
            <View style={styles.searchContainer}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon active name="search" style={styles.searchIcon} />
                <TextInput
                  placeholder="Producto"
                  autoFocus={true}
                  onChangeText={(busqueda) => this.onChangeSeachBox(busqueda)}
                  onBlur={this.realizarBusqueda.bind(this)}
                  blurOnSubmit={true}
                  value={"" + this.state.busqueda}
                  style={styles.searchInput}
                />
              </View>
              <Text style={styles.searchHelpText}>Mínimo 3 caracteres.. Da enter para iniciar búsqueda</Text>
            </View>
          ) : (
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Nueva Venta</Text>
              {this.state.cliente != null && (
                <Text style={styles.clientInfo}>
                  Cliente: {this.state.cliente.clave} - {this.state.cliente.nombre_comercial}
                </Text>
              )}
              {this.state.cliente == null && <Text style={styles.publicSaleText}>Venta al público</Text>}
            </View>
          )}
          <View style={styles.headerActions}>
            <View style={styles.headerIconsContainer}>
              <TouchableOpacity
                style={styles.searchIconButton}
                onPress={() => this.activarBuscadorProductos()}
              >
                {!buscadorProductosActivo ? (
                  <Icon name="search" style={styles.searchIcon} />
                ) : (
                  <Icon name="close" style={styles.searchIcon} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addClientButton}
                onPress={() => this.mostrarClientes()}
              >
                <Icon name="person-add" style={styles.addClientIcon} />
              </TouchableOpacity>
            </View>
            {this.state.cliente != null && (
              <View style={styles.invoiceSwitchContainer}>
                <Text style={styles.invoiceSwitchText}>¿Con Factura? </Text>
                <Switch
                  style={styles.invoiceSwitch}
                  value={this.state.generaFactura}
                  onValueChange={(checked) => this.paraFactura(checked)}
                />
              </View>
            )}
          </View>
        </View>

        <View style={{ flex: 10 }}>
          {this.state.isLoading &&
            <View style={styles.loadingContainer}>
              <ActivityIndicator color='#51747F' />
              <Text>Cargando...</Text>
            </View>
          }

          {this.state.iniciarBusqueda &&
            <View style={styles.loadingContainer}>
              <ActivityIndicator color='#51747F' />
              <Text>Realizando la búsqueda de productos...</Text>
            </View>
          }

          {this.state.showUpdate &&
            <View style={styles.updateContainer}>
              <Text>Se ha liberado una actualización al aplicativo.</Text>
              <Button
                title="Clic para actualizar"
                onPress={() => this.doUpdate()}
                style={styles.updateButton}
              />
            </View>
          }

          {!this.state.buscadorProductosActivo &&
            <FlatList
              data={this.state.categoriaDisplayArray}
              renderItem={(categoria, index) => this._renderHeader(categoria, index)}
              keyExtractor={(categoria, index) => categoria.idtipoProducto.toString() + index}
            />
          }

          {this.state.buscadorProductosActivo && !this.state.iniciarBusqueda && this.state.busquedaConcluida &&
            <View>
              <View style={styles.searchResultsHeader}>
                <Text style={styles.searchResultsText}>
                  {this.state.productosDisplayArray.length} PRODUCTOS ENCONTRADOS...
                </Text>
              </View>
              <FlatList
                data={productoFiltrado}
                renderItem={(producto) =>
                  <View style={styles.productItem}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => { this.onDialogOpen(producto, !this.state.onDialogOpen) }}>
                          <Image
                            style={styles.productImage}
                            source={{ uri: 'https://atletl.api.concrad.com/' + producto.item.imagen }}
                          />
                        </TouchableOpacity>
                        <View style={{ marginLeft: 5 }}>
                          <Text style={{ fontSize: 14 }}>{producto.item.codigo} - {producto.item.nombre}</Text>
                          <View style={{ flexDirection: "row" }}>
                            <Text note>Disp: {producto.item.cantidad}</Text>
                            <Text note style={{ marginLeft: 10 }}>
                              $ {ventaSinIva ? Math.round(producto.item.precio_antes_impuestos * 100) / 100 : producto.item.precio}
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
                          style={styles.productQuantityInput}
                          onChangeText={(cantidad) => this.onChangeTBox(producto, cantidad)}
                          keyboardType={"numeric"}
                          value={"" + this.state.carritoCompras.filter(row => row.id === producto.item.idProducto).reduce((cant, row) => cant + row.cantidad, 0)}
                        />

                        <TouchableOpacity onPress={() => this.sumaUno(producto)}>
                          <Icon name="add" style={{ fontSize: 20, color: 'black' }} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>}
                keyExtractor={(producto) => producto.idProducto.toString()}
              />
            </View>
          }
        </View>

        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[styles.footerButton, styles.confirmButton]}
              disabled={this.state.isLoading}
              onPress={() => this.pasarDatos()}
            >
              <View style={styles.cartIconContainer}>
                <Icon name="cart" style={styles.cartIcon} />
                {this.state.count > 0 &&
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{this.state.count}</Text>
                  </View>
                }
              </View>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.footerButton}
              disabled={this.state.isLoading}
              onPress={() => this.pasarDatos()}
            >
              <NumericFormat
                value={Math.abs(this.state.suma)}
                displayType={'text'}
                thousandSeparator={true}
                prefix={'$'}
                fixedDecimalScale={true}
                decimalScale={2}
                renderText={value =>
                  <Text style={styles.h3}>{value}</Text>
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
    backgroundColor: '#f6f6f6',
    flex: 0,
    color: '#000000',
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
    paddingTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  headerButton: {
    flex: 0,
    padding: 10,
  },
  headerIcon: {
    color: '#2496bc',
    fontSize: 30,
  },
  searchContainer: {
    flex: 3,
  },
  searchIcon: {
    color: 'black',
    marginLeft: 10,
    fontSize: 22, // Ajuste para coincidir con los demás iconos
  },
  searchInput: {
    color: 'black',
    flex: 1,
  },
  searchHelpText: {
    fontSize: 10,
    color: 'black',
    marginLeft: 10,
  },
  titleContainer: {
    flex: 3,
    paddingLeft: 25,
    paddingTop: Platform.OS === 'ios' ? 14 : 0,
  },
  headerTitle: {
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  clientInfo: {
    fontSize: 12,
    color: 'black',
    marginLeft: 10,
    textAlign: 'center',
  },
  publicSaleText: {
    color: 'black',
    fontSize: 12,
    textAlign: 'center',
  },
  headerActions: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  headerIconsContainer: {
    flexDirection: "row",
    height: 55,
  },
  searchIconButton: {
    flex: 0,
    paddingRight: 5,
    paddingTop: 15,
  },
  addClientButton: {
    flex: 0,
    paddingLeft: 10,
    paddingRight: 5,
    paddingTop: 15,
  },
  addClientIcon: {
    color: 'black',
    fontSize: 22,
  },
  invoiceSwitchContainer: {
    height: 50,
    alignItems: "center",
    flexDirection: "column",
  },
  invoiceSwitchText: {
    fontSize: 10,
    paddingBottom: 5,
    color: 'black',
    marginLeft: 10,
  },
  invoiceSwitch: {
    paddingTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  updateContainer: {
    alignItems: 'center',
  },
  updateButton: {
    margin: 15,
    marginTop: 20,
    backgroundColor: "#2496bc",
  },
  searchResultsHeader: {
    flex: 1,
    flexDirection: "row",
    padding: 0,
    margin: 0,
    height: 41.5,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#568DAE",
  },
  searchResultsText: {
    fontWeight: "600",
    color: 'white',
    paddingLeft: 10,
  },
  productItem: {
    marginLeft: 5,
    marginRight: 5,
  },
  productImage: {
    width: 50,
    height: 50,
  },
  productQuantity: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    maxWidth: deviceWidth * 0.3, // Ajusta el ancho máximo según tus necesidades

  },
  productQuantityInput: {
    width: 40,
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "#f3f3f3",
    textAlign: "center",
  },
  accordionHeader: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "space-between",
    alignItems: 'center',
    backgroundColor: "#568DAE",
  },
  accordionHeaderText: {
    fontWeight: "600",
    color: 'white',
  },
  accordionIcon: {
    fontSize: 18,
    color: 'white',
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#eeeeee",
  },
  modalImage: {
    width: '100%',
    height: 450,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: 'rgba(204, 0, 0, 0.65)',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 30,
  },
  closeButtonContainer: {
    width: 150,
    marginHorizontal: 50,
    marginVertical: 10,
  },
  footer: {
    backgroundColor: '#51747F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    flex: 1,
  },
  footerButton: {
    flex: 0,
    alignItems: 'center',
    paddingVertical: 10,
  },
  confirmButton: {
    paddingTop: 10,
  },
  confirmButtonText: {
    color: 'white',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartIcon: {
    color: 'white',
    fontSize: 25,
  },
  cartBadge: {
    backgroundColor: '#33BFAA',
    borderRadius: 10,
    width: 20,
    height: 20,
    top: -5,
    flex: 0,
    alignItems: 'center',
    position: 'absolute',
    marginLeft: 20,
  },
  cartBadgeText: {
    color: 'white',
  },
  h3: {
    color: 'white',
    fontSize: 20,
  },
});

