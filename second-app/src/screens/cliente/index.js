import 'react-native-gesture-handler';
import React, { Component } from "react";
import { Button, Text, Dimensions, Platform, View, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ScrollView } from "react-native";
import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import Constants from 'expo-constants';

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const Stack = createNativeStackNavigator();

const Separator = () => <View style={styles.separator} />;

const CatalogosModel = require('../../lib/model/CatalogosModel');
const ClienteModel = require('../../lib/model/ClienteModel');

const catalogosModel = new CatalogosModel();
const clienteModel = new ClienteModel();

export default class Cliente extends Component {
  constructor(props) {
    super(props);

    const { route } = this.props;
    this.origen = route.params.origen;

    if (this.origen == undefined) {
      this.origen = "MENU";
    }

    this.state = {
      isLoading: true,
      origen: this.origen,
      prevOrigen: '',
      clientesArray: [],
      clientesDisplayArray: [],
      buscadorActivo: false,
      busqueda: '',
      iniciarBusqueda: false,
      busquedaConcluida: false,
      clienteSelected: null,
      estadosArray: Platform.OS === 'ios' ? ((global.estados) ? [...global.estados] : []) : ((global.estados) ? [{ nombre: "Ver por estado", id_estado: "0" }, ...global.estados] : []),
      estado: (global.estados) ? global.estados : "0"
    };
  }

  componentDidMount() {
    this.consultarEstados();
    this.setState({ isLoading: false });
  }

  componentDidUpdate() {
    const { route } = this.props;
    this.origen = route.params.origen;

    if (this.origen != this.state.prevOrigen) {
      this.setState({ origen: this.origen, prevOrigen: this.origen });
    }
  }

  consultarEstados() {
    if (global.estados == null) {
      catalogosModel.consultarEstados()
        .then((result) => {
          global.estados = result.estadosList;
          this.setState({
            estadosArray: global.estados,
            estado: (this.state.estado == null) ? "1" : this.state.estado
          }, () => {
            this.filtrarClienteEstado(this.state.estado)
          });
        })
        .catch((error) => {
          console.log('error al consultarEstados: ', error.message);
        });
    }
  }

  consultarClientes() {
    clienteModel.consultarClientes()
      .then((result) => {
        this.setState({
          clientesArray: result.clientesList,
          clientesDisplayArray: result.clientesList
        });
      })
      .catch((error) => {
        console.log('error al consultarClientes: ', error.message);
      });
  }

  verCliente(cliente) {
    this.props.navigation.navigate("ClienteDetalle", { cliente });
  }

  seleccionarCliente(cliente) {
    this.setState({ clienteSelected: cliente });
  }

  agregarCliente() {
    const { route, navigation } = this.props;
    const onGoBack = route.params.onGoBack;
    if (onGoBack) {
      onGoBack(this.state.clienteSelected);
    }
    this.props.navigation.goBack();
  }

  activarBuscadorClientes() {
    this.setState({
      iniciarBusqueda: false,
      busquedaConcluida: false,
      buscadorActivo: !this.state.buscadorActivo,
      clientesDisplayArray: []
    }, () => {
      if (this.state.buscadorActivo == false) {
        this.onChangeSeachBox("");
      }
    });
  }

  onChangeSeachBox(busqueda) {
    this.setState({ busqueda: busqueda });
  }

  realizarBusqueda() {
    this.setState({ iniciarBusqueda: true, busquedaConcluida: false }, () => {
      setTimeout(() => { this.filtrarClientesByNombre() }, 300);
    });
  }

  filtrarClientesByNombre() {
    let query = this.state.busqueda;
    if (query.length >= 3) {
      query = query.toUpperCase().trim().replace(" ", "%");
      clienteModel.consultarClientesByNombre("%" + query + "%")
        .then((result) => {
          this.setState({
            estado: null,
            clientesArray: result.clientesList,
            clientesDisplayArray: result.clientesList,
            iniciarBusqueda: false,
            busquedaConcluida: true
          });
        })
        .catch((error) => {
          console.log('error al consultarClientes: ', error.message);
        });
    }
  }

  filtrarClienteEstado(estado) {
    this.setState({ isLoading: true }, () => {
      if (estado == "0") {
        this.setState({
          isLoading: false,
          estado: estado,
          clientesArray: [],
          clientesDisplayArray: []
        });
      }
      else {
        clienteModel.consultarClientesByEstado(estado)
          .then((result) => {
            this.setState({
              isLoading: false,
              estado: estado,
              clientesArray: result.clientesList,
              clientesDisplayArray: result.clientesList
            });
          })
          .catch((error) => {
            console.log('error al consultarClientes: ', error.message);
          });
      }
    });
  }

  render() {
    const buscadorActivo = this.state.buscadorActivo;
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ ...globalStyles.header, height: 110, paddingTop: Platform.OS === 'ios' ? 50 : 40 }}>
          {(this.state.origen == "MENU" &&
            <TouchableOpacity style={{ flex: 1, paddingLeft: 10 }}
              onPress={() => this.props.navigation.dispatch(DrawerActions.openDrawer())}>
              <Icon name="menu" style={{ color: '#2496bc', fontSize: 30 }} />
            </TouchableOpacity>
          )}
          {(this.state.origen == "VENTA" &&
            <TouchableOpacity style={{ flex: 1, paddingLeft: 10 }} onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" style={globalStyles.headerButton} />
            </TouchableOpacity>
          )}
          {buscadorActivo &&
            <View style={{ flex: 5 }}>
              <TextInput placeholder="Nombre del cliente"
                autoFocus={true}
                onChangeText={(busqueda) => this.onChangeSeachBox(busqueda)}
                onBlur={this.realizarBusqueda.bind(this)}
                blurOnSubmit={true}
                value={this.state.busqueda}
                style={styles.searchInput}
              />
              <Text style={styles.searchHint}>Mínimo 3 caracteres. Da enter para iniciar búsqueda</Text>
            </View>
          }
          {!buscadorActivo &&
            <View style={{ flex: 5, alignItems: 'center' }}>
              <Text style={globalStyles.headerTitle}>
                {this.state.origen == "MENU" ? "Clientes" : "Agregar cliente"}
              </Text>
              {Platform.OS === 'android' ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    key={'edo'}
                    mode="dropdown"
                    style={{ width: deviceWidth * 0.7 }}
                    selectedValue={this.state.estado}
                    onValueChange={(value) => { this.filtrarClienteEstado(value) }}
                  >
                    {this.state.estadosArray.map((estado) => (
                      <Picker.Item label={estado.nombre} value={"" + estado.id_estado} key={"pi_" + estado.id_estado} />
                    ))}
                  </Picker>
                </View>
              ) : (
                <RNPickerSelect
                  style={pickerSelectStyles}
                  items={this.state.estadosArray.map(estado => ({
                    label: estado.nombre,
                    value: "" + estado.id_estado
                  }))}
                  placeholder={{ label: 'Ver por estado', value: null }}
                  onValueChange={(value) => { this.filtrarClienteEstado(value) }}
                  Icon={() => <Icon name="caret-down-outline" size={24} color="gray" />}
                />
              )}
            </View>
          }
          <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end', paddingRight: 18 }}
            onPress={() => this.activarBuscadorClientes()}>
            <Icon name={buscadorActivo ? "close" : "search"} style={globalStyles.headerButton} />
          </TouchableOpacity>
        </View>
        <Separator />
        <View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            {this.state.isLoading &&
              <View style={styles.loadingContainer}>
                <ActivityIndicator color='#51747F' />
                <Text>Cargando...</Text>
              </View>
            }
            {!this.state.isLoading && this.state.clientesDisplayArray.length == 0 &&
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 20 }}>La búsqueda está vacía.</Text>
                <Text>Favor hacer uso de uno de los filtros superiores.</Text>
              </View>
            }
            <ScrollView>
              {this.state.clientesDisplayArray.map((cliente) => (
                <View key={cliente.id}>
                  <TouchableOpacity style={[
                    this.state.clienteSelected != null && this.state.clienteSelected.key == cliente.key
                      ? styles.itemSelected
                      : styles.itemFree, { paddingLeft: 0, marginLeft: 0 }
                  ]}
                    onPress={() => { this.seleccionarCliente(cliente); }}
                  >
                    {this.state.origen == "VENTA" &&
                      <TouchableOpacity style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}
                        onPress={() => { this.seleccionarCliente(cliente); }}>
                        <Icon name={this.state.clienteSelected != null && this.state.clienteSelected.key == cliente.key
                          ? "checkbox-outline" : "square-outline"} style={globalStyles.headerButton} />
                      </TouchableOpacity>
                    }
                    <View style={{ flex: 3, paddingLeft: 15 }}>
                      <Text style={{ fontWeight: "bold" }}>{cliente.clave} - {cliente.nombre_comercial}</Text>
                      {cliente.rfc && <Text>RFC: {cliente.rfc}</Text>}
                      {cliente.telefono && <Text style={{ color: 'gray' }}>Teléfono: {cliente.telefono}</Text>}
                      {cliente.celular && <Text style={{ color: 'gray' }}>Cel: {cliente.celular}</Text>}
                    </View>
                    <View style={styles.clientIconContainer}>
                      <TouchableOpacity onPress={() => { this.verCliente(cliente); }}>
                        <Icon name="person-circle-outline" style={globalStyles.headerButton} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  <Separator />
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
        {this.state.origen == "VENTA" &&
          <View style={styles.footer}>
            <TouchableOpacity style={styles.botonGrande}
              disabled={this.state.clienteSelected == null}
              onPress={() => this.agregarCliente()}>
              <Text style={styles.botonTexto}>Agregar a la venta</Text>
            </TouchableOpacity>
          </View>
        }
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
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
  botonGrande: {
    backgroundColor: "#51747F",
    flex: 1,
    position: 'relative',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonTexto: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    paddingRight: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pickerContainer: {
    flex: 1,
    flexDirection: "row",
    paddingTop: 0,
    paddingBottom: 0,
    borderWidth: 1,
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderColor: "#000000",
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  emptyState: {
    alignContent: "center",
    alignItems: "center",
    paddingTop: 30,
    flex: 1,
    flexDirection: 'column',
  },
  clientIconContainer: {
    marginLeft: 0,
    marginRight: 0,
    flex: 1,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  searchHint: {
    fontSize: 10,
    color: 'gray'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    //paddingVertical: 10,
  },
});

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
    paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
    backgroundColor: '#f6f6f6',
    color: '#000000',
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: deviceWidth * 0.7,
    height: 35,
    paddingLeft: 20,
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    marginRight: 10
  },
  inputAndroid: {
    width: deviceWidth * 0.7,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
});
