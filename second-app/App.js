import 'react-native-gesture-handler';
import { StyleSheet, PermissionsAndroid, Platform, Alert, Linking} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack'
import {  createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, createAppContainer, useNavigation } from '@react-navigation/native';
import * as React from 'react';
import SideBar from './src/screens/sidebar';
import Venta from './src/screens/venta';


import Cliente        from './src/screens/cliente';
import ClienteDetalle from './src/screens/cliente/detalle';
import BluetoothList from './src/screens/bluetooth/index';
import Prueba from './src/screens/bluetooth/prueba';
import VideoIndex from './src/screens/public/VideoIndex';

import ConfirmacionVenta from './src/screens/venta/confirmacionVenta';
import Pagando from './src/screens/venta/pagar/pagando';


import Pagada from './src/screens/venta/pagar/pagada';

const LocalStorage = require ('./src/lib/database/LocalStorage');
const ConcradServer = require ('./src/lib/remote/ConcradServer');
const AppConfiguration = require ('./src/lib/model/AppConfiguration')
const Login = require ('./src/screens/login');

const concradServer = new ConcradServer();
const localStorage = new LocalStorage();
const appConfiguration = new AppConfiguration();
const login = new Login();


////AQUI INICIA LA APP

const Drawer = createDrawerNavigator();

const Stack = createStackNavigator();


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      isActivated:false,
      usuario: global.usuario,
      
    };
    this.debug = true;
  }

  verificarDatabase(){
    console.log("**** verificarDatabase con ErrorLog",{state: this.state});
    return localStorage.existLocalDatabase();
  }

  
  setAppIsReady(){
    
    this.setState({ isReady: true },() => { 
//      this.checkAppIsActivated();
    });
  }

  setAppIsActivated( state ){
    
    this.setState({ isActivated: state },() => { 
//      this.checkAppIsActivated();
    });
  }

  iniciarTodoTest(){

    console.debug("**** iniciarTodo ");
    localStorage.createLocalDatabase().then((success) => {
//      console.debug('En app.js Transaction de createLocalDatabase exitosa...', success);    

      concradServer.loadCatalogosFromServer().then( result => {
//        console.debug("En app.js Transaction de loadCatalogosFromServer exitosa..." , (isObject(result)) );

        localStorage.fillCatalogos(result.data).then((success) => {
//          console.debug('En app.js Transaction de fillCatalogos exitosa...', success);    

          localStorage.verifyCatalogos().then((success) => {

//            console.debug('En app.js Transaction de verifyCatalogos exitosa...', success);    
            this.setState({ isReady: true });
          })
          .catch((error) => {
            console.debug('Error app.js en la Transaction de verifyCatalogos: ', error);
          });
        })
        .catch((error) => {
          console.debug('Error app.js en la Transaction de fillCatalogos: ', error);
        });
      })
      .catch((err) => {
        console.debug("Error app.js en la Transaction de loadCatalogosFromServer: " ,err);
      });
    })
    .catch((error) => {
      console.debug('Error app.js en la Transaction de createLocalDatabase: ', error);
    });

    today=new Date();
    h=today.getHours();
    m=today.getMinutes();
    s=today.getSeconds();
    a=today.getFullYear();
    ms=today.getMonth();
    d=today.getDate();
    console.debug(a+"-"+ms+"-"+d+"T"+h+":"+m+":"+s);
  }

  /**
   * se encarga de inicializar el almacenamiento local con la base de datos. Si no existe la base se crea y se inicializa.
   */
  inicializarApp(){

    // VERIFICA SI EXISTE O NO EXISTE LA BASE DE DATOS
    this.verificarDatabase()    
    .then((success) => {
      if(this.debug) console.debug("SI existe la base de datos: ",{success});
      this.setAppIsReady();
    })
    .catch((error) => {
      if(this.debug) console.debug('NO existe la base de datos... Se creará la base de datos');
      // CREACION DE LA BASE DE DATOS LOCAL
      localStorage.createLocalDatabase()
      .then((success) => {
        if(this.debug) console.debug('Creación exitosa de la base de datos local. ', success);    

        localStorage.initializeLocalDatabase()
        .then((success) => {
          if(this.debug) console.debug('Inicialización exitosa de la base de datos local. ', success);
          this.setAppIsReady();
        })
        .catch((error) => {
          console.debug('Error en la inicialización de la base de datos local. ', error);
        });
      })
      .catch((error) => {
        console.debug('Error en la creación de la base de datos local. ', error);
      });
  

    });
  }

  solicitarPermisos = async () => {
    
    if (Platform.OS === 'android') {
      await this.solicitarPermisosAndroid();
    } 
  };

  solicitarPermisosAndroid = async () => {
    try {
      if (Platform.OS === 'android') {
        
  
        // Solicitar permiso de ubicación
        const locationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'La aplicación necesita acceso a la ubicación.',
            buttonNeutral: 'Preguntarme después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          }
        );
  
        if (locationGranted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso de Ubicación concedido');
        } else {
          console.log('Permiso de Ubicación denegado');
        }

        // Solicitar permiso de Bluetooth
        const bluetoothGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: 'Permiso de Bluetooth',
            message: 'La aplicación necesita acceso al Bluetooth.',
            buttonNeutral: 'Preguntarme después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          }
        );
  
        if (bluetoothGranted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso de Bluetooth concedido');
        } else {
          console.log('Permiso de Bluetooth denegado');
        }

        const bluetoothGranted2 = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: 'Permiso de Bluetooth',
            message: 'La aplicación necesita acceso al Bluetooth.',
            buttonNeutral: 'Preguntarme después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          }
        );
  
        if (bluetoothGranted2 === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso de Bluetooth concedido');
        } else {
          console.log('Permiso de Bluetooth denegado');
        }

        const bluetoothGranted3 = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
          {
            title: 'Permiso de Bluetooth',
            message: 'La aplicación necesita acceso al Bluetooth.',
            buttonNeutral: 'Preguntarme después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          }
        );
  
        if (bluetoothGranted3 === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso de Bluetooth concedido');
        } else {
          console.log('Permiso de Bluetooth denegado');
        }

        
        
      }
    } catch (error) {
      console.warn('Error al solicitar permisos en Android:', error);
    }
  };

  mostrarAlerta = () => {
    Alert.alert(
      'Permisos requeridos',
      'La aplicación necesita permisos para acceder a la ubicación y al Bluetooth.',
      [
        {
          text: 'Ir a configuración',
          onPress: () => this.abrirConfiguracion(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  abrirConfiguracion = () => {
    Linking.openSettings();
  };

  checkAppIsActivated(){
    if(this.debug) console.debug("...checkAppIsActivated()");
    appConfiguration.isAppActivated()
    .then((result) => {
      if(result.success && result.isAppActivated){
        this.setAppIsActivated(true);
//        console.debug('La aplicación SI esta activada!!!', result);
      }else{
        this.setAppIsActivated(false);
//        console.debug('La aplicación NO esta activada!!!', result);
      }
    })
    .catch((error) => {
      this.setAppIsActivated(false);
//      console.debug('La aplicación NO esta activada!!!', error);
    });
  }


  async componentDidMount() {


 

    this.inicializarApp();
    console.log("config");
    this.solicitarPermisos();
   
  }

  Rutas() {
    if (global.usuario=== undefined) {
      console.log("--------------------LOGIN")
    return(
      
      <Drawer.Navigator backBehavior="history" 
      
      screenOptions={{
            activeTintColor: "#e91e63"
      }}
      drawerContent={(props) =><SideBar {...props} />}
        >
           <Drawer.Screen name="Login" component={Login} options={{headerShown: false, swipeEnabled: false}}/>
          <Drawer.Screen  name="Venta" component={Venta} options={{headerShown: false}} />

          <Drawer.Screen name="ConfirmacionVenta" component={ConfirmacionVenta} options={{headerShown: false}} />
        
        <Drawer.Screen name="Cliente" component={Cliente} options={{headerShown: false}}/>

       
       
      </Drawer.Navigator>
      
    )
    }
    else{
      console.log("--------------------VENTA")
      return(
      <Drawer.Navigator backBehavior='none' 
      
      screenOptions={{
            activeTintColor: "#e91e63"
      }}
      drawerContent={(props) =><SideBar {...props} />}
        >
        
        <Drawer.Screen  name="Venta" component={Venta} options={{headerShown: false}} />
        <Drawer.Screen name="Cliente" component={Cliente} options={{headerShown: false}}/>
        <Drawer.Screen name="Pagada" component={Pagada} options={{headerShown: false, swipeEnabled: false, gestureEnabled: false}} />
        <Drawer.Screen name="ConfirmacionVenta" component={ConfirmacionVenta} options={{headerShown: false}} />
       
      </Drawer.Navigator>
      )
    }
  }
  

  render() {

    return(
    <NavigationContainer>
      <Stack.Navigator
        
      >
      <Stack.Screen
      name="Rutas"
      component={this.Rutas}
      options={{ headerShown: false, title: ''
      }}
      />
      <Stack.Screen name="Venta" component={Venta} options={{headerShown: false}}/>
      <Stack.Screen name="Cliente"  component={Cliente} options={{headerShown: false}}/>
      <Stack.Screen name="ClienteDetalle" component={ClienteDetalle} options={{headerShown: false}}/>
      <Stack.Screen name="ConfirmacionVenta" component={ConfirmacionVenta} options={{headerShown: false}} />
      <Stack.Screen name="Pagando" component={Pagando} options={{headerShown: false}} />
      <Stack.Screen name="Pagada" component={Pagada} options={{headerShown: false, swipeEnabled: false, gestureEnabled: false}}/>
      <Stack.Screen name="BluetoothList" component={BluetoothList} options={{headerShown: false}} />
      <Stack.Screen name="VideoIndex" component={VideoIndex} options={{title: '¿Qué es Concrad?'}} />
      <Stack.Screen name="Prueba" component={Prueba} options={{headerShown: false}}/>
      
      
      
    </Stack.Navigator>
    
    </NavigationContainer>
    );
  }

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
