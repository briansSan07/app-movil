import React, { Component } from "react";
import { Text, View, Switch, Dimensions, StyleSheet, TouchableOpacity, 
  FlatList, Image, TextInput, SafeAreaView, Modal, Platform, Alert } from "react-native";
import { NumericFormat } from 'react-number-format';
import Icon from 'react-native-vector-icons/Ionicons';
import Constants from 'expo-constants';
import { Button } from "@rneui/themed";

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;
const Separator = () => <View style={styles.separator} />;

var inicial = " ";

class ConfirmacionVenta extends Component {
  constructor(props) {
    super(props);

    this.state = {
      carrito: this.props.route.params.carrito,
      cliente: this.props.route.params.cliente,
      generaFactura: this.props.route.params.generaFactura,
      ventaSinIva: this.props.route.params.ventaSinIva,
      count: 0,
      suma: 0,
      subtotal: 0,
      descuento: 0,
      iva: 0,
      ieps: 0,
      isLoading: true,
      displayMetodoPago: false,
      selectedImage: null
    };
  }

  componentDidMount() {
    this.calculandoCarrito();
    this.setState({ isLoading: false });
  }

  onChangeTBox(producto, cantidad) {
    let carritoCompras = [...this.state.carrito];
    if (cantidad === " " || cantidad === undefined || cantidad === null || cantidad === "NaN") {
      for (let i = 0; i < this.state.carrito.length; i++) {
        if (this.state.carrito[i].id === producto.idProducto) {
          this.state.carrito.splice(i, 1);
        }
      }
      for (let i = 0; i < carritoCompras.length; i++) {
        if (carritoCompras[i].id === producto.id) {
          carritoCompras.splice(i, 1);
        }
      }
      Alert.alert('Ha eliminado el producto del carrito.');
    } else {
      let nuevoProductoParaCarrito = this.state.carrito.filter(item => item.id === producto.id);
      nuevoProductoParaCarrito[0].cantidad = parseInt(cantidad);
    }
    this.setState({ carrito: carritoCompras }, () => { this.calculandoCarrito() });
  }

  sumaUno(producto) {
    let carritoCompras = [...this.state.carrito];
    let nuevoProductoParaCarrito = carritoCompras.filter(item => item.id === producto.id);
    if (nuevoProductoParaCarrito.length > 0) {
      nuevoProductoParaCarrito[0].cantidad++;
    }
    this.setState({ carrito: carritoCompras }, () => { this.calculandoCarrito() });
  }

  menosUno(producto) {
    let carritoCompras = [...this.state.carrito];
    let nuevoProductoParaCarrito = carritoCompras.filter(item => item.id === producto.id);
    if (nuevoProductoParaCarrito.length > 0) {
      nuevoProductoParaCarrito[0].cantidad--;
      if (nuevoProductoParaCarrito[0].cantidad === 0) {
        for (let i = 0; i < this.state.carrito.length; i++) {
          if (this.state.carrito[i].id === producto.id) {
            this.state.carrito.splice(i, 1);
          }
        }
        for (let i = 0; i < carritoCompras.length; i++) {
          if (carritoCompras[i].id === producto.id) {
            carritoCompras.splice(i, 1);
          }
        }
        Alert.alert('Ha eliminado el producto del carrito.');
        this.setState({ carrito: carritoCompras }, () => { this.calculandoCarrito() });
      } else {
        this.setState({ carrito: carritoCompras }, () => { this.calculandoCarrito() });
      }
    }
  }

  calculandoCarrito() {
    const carrito = this.state.carrito;

    let suma = 0;
    let count = 0;
    let subtotal = 0;
    let total = 0;
    let iva = 0;
    let ieps = 0;

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
      ieps: ieps
    });
  }

  actualizarPreciosIva() {
    let ventaSinIva = false;

    if (global.preciosDeVentaSinIva) {
      ventaSinIva = true;

      if (this.state.generaFactura) {
        ventaSinIva = false;
      }
    }
    this.setState({ ventaSinIva: ventaSinIva }, () => this.calculandoCarrito());
  }

  paraFactura(checked) {
    this.setState({ generaFactura: checked }, () => { this.actualizarPreciosIva() });
  }

  pasarDatos() {
    global.pagos = [];
    global.carrito = this.state.carrito;
    this.props.navigation.navigate("Pagando", {
      carrito: this.state.carrito,
      cliente: this.state.cliente,
      generaFactura: (this.state.generaFactura == true) ? 1 : 0,
      ventaSinIva: (this.state.generaFactura == true) ? 0 : this.state.ventaSinIva,
    });
  }

  pasarDatos2() {
    let carritoCompras = [...this.state.carrito];
    const { route, navigation } = this.props;

    const onGoBack = route.params.onGoBack;
    if (onGoBack) {
      onGoBack(carritoCompras);
    }
    this.props.navigation.goBack();
  }

  render() {
    const ventaSinIva = this.state.ventaSinIva;
    const { selectedImage } = this.state;
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => this.pasarDatos2()}>
            <Icon name="arrow-back" style={styles.headerIcon} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Detalle de la venta</Text>
            {this.state.cliente != null ? (
              <Text style={styles.clientInfo}>Cliente: {this.state.cliente.clave} - {this.state.cliente.nombre_comercial}</Text>
            ) : (
              <Text style={styles.publicSaleText}>Venta al público</Text>
            )}
          </View>
          {this.state.cliente != null && (
            <View style={styles.invoiceSwitchContainer}>
              <Text style={styles.invoiceSwitchText}>¿Con Factura? </Text>
              <Switch style={styles.invoiceSwitch} value={this.state.generaFactura} onValueChange={(checked) => this.paraFactura(checked)} />
            </View>
          )}
        </View>
        <Separator />
        <View style={{ flex: 1 }}>
          <FlatList
            data={this.state.carrito}
            renderItem={({ item }) =>
              <View style={styles.productItem}>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.setState({ selectedImage: item })}>
                    <Image style={styles.productImage} source={{ uri: 'https://atletl.api.concrad.com/' + item.img }} />
                    <View style={{ marginLeft: 5 }}>
                      <Text style={{ fontSize: 14 }}>{item.codigo} - {item.nombre}</Text>
                      <View style={{ flexDirection: "row" }}>
                        <Text note>Disp: {item.existencia}</Text>
                        <Text note style={{ marginLeft: 10 }}>
                          $ {ventaSinIva ? Math.round(item.precio_antes_impuestos * 100) / 100 : item.precio}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.productQuantity}>
                    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                      <TouchableOpacity onPress={() => this.menosUno(item)}>
                        <Icon name="remove" style={{ fontSize: 20, color: 'black' }} />
                      </TouchableOpacity>
                      <TextInput
                        placeholder="0"
                        placeholderTextColor="#000000"
                        style={styles.productQuantityInput}
                        onChangeText={(cantidad) => this.onChangeTBox(item, cantidad)}
                        keyboardType={"numeric"}
                        value={"" + this.state.carrito.filter(row => row.id == item.id).reduce((cant, row) => cant + row.cantidad, inicial)}
                      />
                      <TouchableOpacity onPress={() => this.sumaUno(item)}>
                        <Icon name="add" style={{ fontSize: 20, color: 'black' }} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <Separator />
              </View>}
            keyExtractor={(item) => item.id.toString()}
          />
          {selectedImage && (
            <Modal animationType="slide" transparent={false} visible={true}>
              <View style={styles.modalContent}>
                <Image source={{ uri: 'https://atletl.api.concrad.com/' + selectedImage.img }} style={styles.modalImage} />
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
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[styles.footerButton, styles.confirmButton]}
              disabled={this.state.carrito.length == 0}
              onPress={() => this.pasarDatos()}
            >
              <View style={styles.cartIconContainer}>
                <Icon name="cash" style={styles.cartIcon} />
                {this.state.count != 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{this.state.count}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.confirmButtonText}>Pagar</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.footerButton}
              disabled={this.state.carrito.length == 0}
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

export default ConfirmacionVenta;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
    backgroundColor: '#f6f6f6',
    color: '#000000',
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerButton: {
    flex: 0,
    padding: 10,
  },
  headerIcon: {
    color: '#2496bc',
    fontSize: 30,
  },
  headerTitleContainer: {
    flex: 1,
    paddingLeft: 20,
    flexDirection: 'column',
    paddingTop: Platform.OS === 'ios' ? 15 : 0,
  },
  headerTitle: {
    color: '#000000',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  clientInfo: {
    fontSize: 12,
    textAlign: 'left',
    paddingLeft: 7,
  },
  publicSaleText: {
    textAlign: 'left',
    paddingLeft: 7,
  },
  invoiceSwitchContainer: {
    flex: 1,
    alignItems: "center",
  },
  invoiceSwitchText: {
    fontSize: 10,
    paddingBottom: 5,
  },
  invoiceSwitch: {
    paddingTop: 10,
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
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    marginTop: 5,
  },
  productQuantityInput: {
    width: 40,
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "#f3f3f3",
    textAlign: "center",
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
    flex: 0,
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
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
