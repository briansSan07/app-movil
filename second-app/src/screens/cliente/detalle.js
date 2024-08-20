import React, { Component } from "react";
import { Text, View, StyleSheet, Platform, Dimensions, SafeAreaView, Linking } from 'react-native';
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

    const { route } = this.props;
    this.cliente = route.params.cliente;
    this.state = {
      cliente: this.cliente, 
      isLoading: true, 
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0822,
        longitudeDelta: 0.0421,
      },
    };
  }

  componentDidMount() {
    this.consultarClienteById();
    this.setState({ isLoading: false });
  }

  consultarClienteById() {
    clienteModel.consultarClienteById(this.state.cliente.idCliente)
      .then((result) => {
        this.setState({
          cliente: result.cliente
        });
      })
      .catch((error) => {
        console.log('error al consultarClientes: ', error.message);
      });
  }

  verCliente(cliente) {
    this.props.navigation.navigate("ConfirmacionVenta", { cliente });
  }

  onChangeTBox(producto, cantidad) {
    let carritoCompras = [...this.state.carritoCompras];
    if (cantidad >= producto.cantidad) {
        porSurtir.push(producto.nombre);
    }
    if (cantidad === " " || cantidad === undefined || cantidad === null || cantidad === "NaN") {
        carritoCompras = carritoCompras.filter(item => item.id !== producto.idProducto);
        this.setState({ carritoCompras }, () => { this.calculandoCarrito(); });
    } else {
        let nuevoProductoParaCarrito = carritoCompras.filter(data => data.id === producto.idProducto);
        if (nuevoProductoParaCarrito.length > 0) {
            nuevoProductoParaCarrito[0].cantidad = parseInt(cantidad);
        } else {
            nuevoProductoParaCarrito = {
                id: producto.idProducto,
                cantidad: parseInt(cantidad),
                nombre: producto.nombre,
                precio: producto.precio,
                img: producto.imagen
            };
            carritoCompras.push(nuevoProductoParaCarrito);
        }
        this.setState({ carritoCompras }, () => { this.calculandoCarrito(); });
    }
  }

  pasarDatos() {
    this.props.navigation.navigate("Carrito", { carrito: this.state.carritoCompras });
    this.setState({ carritoCompras: [] });
    this.consultaCategoria();
    this.consultaProductos();
    this.calculandoCarrito();
  }

  activarBuscadorProductos() {
    this.setState({ buscadorProductosActivo: !this.state.buscadorProductosActivo }, () => {
      if (!this.state.buscadorProductosActivo) {
        this.onChangeSeachBox("");
      }
    });
  }

  onChangeSeachBox(busqueda) {
    this.setState({ busqueda }, () => this.filtraProductos());
  }

  buscarProducto(text) {
    db.transaction(tx => {
      tx.executeSql(
        'select nombre from Producto where nombre = ? ', [text], (tx, { rows }) => {
          console.log(rows);
        }, function (tx, error) {
          console.log("Line: 161", error.message);
        }
      );
    });
  }

  filtraProductos() {
    let productosDisplayArray = this.state.productosArray.filter((producto) => {
      return this.findPalabraClave(this.state.busqueda, producto.nombre);
    });

    const categoriasFiltradas = productosDisplayArray.reduce((acum, producto) => {
      if (!acum.includes(producto.idproductotipo)) {
        acum.push(producto.idproductotipo);
      }
      return acum;
    }, []);

    const categoriasFinales = this.state.categoriaArray.filter(categoria => {
      return categoriasFiltradas.includes(categoria.idtipoProducto);
    });

    this.setState({ categoriaDisplayArray: categoriasFinales, productosDisplayArray });
  }

  findPalabraClave(buscando, origenBusqueda) {
    origenBusqueda = origenBusqueda.toUpperCase();
    const palabrasClave = buscando.toUpperCase().trim().split(' ');

    return palabrasClave.every(palabra => origenBusqueda.includes(palabra));
  }

  render() {
    const { buscadorProductosActivo } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <View style={globalStyles.header}>
          <View style={{ flex: 0, paddingLeft: 10 }}>
            <TouchableOpacity style={{ flex: 0 }} onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" style={globalStyles.headerButton} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.headerTitle}>Detalle del cliente</Text>
          </View>
        </View>
        <Separator />
        <View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
              <View style={{ flex: 0 }}>
                <Text style={{ fontWeight: "bold" }}>{this.state.cliente.nombre_comercial}</Text>
                <Text style={{ color: 'gray' }}>{this.state.cliente.razon_social}</Text>
                <Text style={{ color: 'gray' }}>Clave: {this.state.cliente.clave}</Text>
                <Text style={{ color: 'gray' }}>RFC: {this.state.cliente.rfc}</Text>
              </View>
              <Separator />
              <View style={{ flex: 0, flexDirection: 'row', marginTop: 10 }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => { if (this.state.cliente.telefono) { Linking.openURL(`tel:${this.state.cliente.telefono}`) } }}>
                    <Icon name="call" style={{ color: '#2496bc', marginRight: 10, fontSize: 17 }} />
                    <Text style={{ color: '#2496bc' }}>{this.state.cliente.telefono || "Ninguno"}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => { if (this.state.cliente.celular) { Linking.openURL(`tel:${this.state.cliente.celular}`) } }}>
                    <Icon name="phone-portrait" style={{ color: '#2496bc', marginRight: 10, fontSize: 17 }} />
                    <Text style={{ color: '#2496bc' }}>{this.state.cliente.celular || "Ninguno"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flex: 0, marginTop: 20 }}>
                <View style={{ flex: 0 }}>
                  <Text>Calle: {this.state.cliente.calle}</Text>
                  <Text>No. ext: {this.state.cliente.no_ext} No. int: {this.state.cliente.no_int}</Text>
                  <Text>Colonia: {this.state.cliente.colonia} C.P.: {this.state.cliente.codigo_postal}</Text>
                  <Text>Estado: {this.state.cliente.estado}</Text>
                  <Text>Municipio: {this.state.cliente.municipio}</Text>
                  <Text>Nivel: {this.state.cliente.nivel_socioeconomico}</Text>
                </View>
              </View>
              <Separator />
            </View>
          </SafeAreaView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1
  },
  itemSelected: {
    backgroundColor: "lightgray",
    flexDirection: 'row'
  },
  itemFree: {
    backgroundColor: "white",
    flexDirection: 'row'
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

const globalStyles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    flex: 1
  },
  text: {
    alignSelf: "center",
    marginBottom: 7
  },
  mb: {
    marginBottom: 15
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    backgroundColor: '#f6f6f6',
    color: '#000000',
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerRight: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10
  },
  headerButton: {
    color: '#2496bc',
    fontSize: 25
  },
  headerTitle: {
    color: '#000000',
    textAlign: 'center',
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
    width: 50,
    height: 50,
  },
});

export default ClienteDetalle;
