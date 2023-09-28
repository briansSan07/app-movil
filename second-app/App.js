import 'react-native-gesture-handler';

import * as Font from 'expo-font';
import * as gluestack from '@gluestack-ui/themed';
import { ScrollView, Text,StyleSheet, TouchableNativeFeedback, View, Button, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { createStackNavigator } from '@react-navigation/stack'
import {  createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, createAppContainer, useNavigation } from '@react-navigation/native';

import Gradient from './assets/Icons/Gradient';
import DocumentData from './assets/Icons/DocumentData';
import LightBulbPerson from './assets/Icons/LightbulbPerson';
import Rocket from './assets/Icons/Rocket';
import Logo from './assets/Icons/Logo';
import * as React from 'react';


import SideBar from './src/screens/sidebar';

//import Home from './src/screens/HomeScreen';
import SettingScreen from './src/screens/SettingScreen';
import Venta from './src/screens/venta';

import Cliente        from './src/screens/cliente';
import ClienteDetalle from './src/screens/cliente/detalle';
import BluetoothList from './src/screens/bluetooth/index';
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

import isObject from 'isobject';
import Constants from 'expo-constants';





function HomeScreen({ navigation, route }) {
  React.useEffect(() => {
    if (route.params?.post) {
        <Button
        title="Actualizar el titulo"
        onPress={() => navigation.setOptions({ title: 'Actualizado! '})}
        />
    }
  }, [route.params?.post]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Pantalla de Inicio</Text>
      <Button
      title="Crear post"
      onPress={() => navigation.navigate('CreatePost')}
      />
      <Text style={{ margin: 10 }}>Post: {route.params?.post}</Text>

      <Button 
            title="¿Qué es Concrad?"
            icon={{
              name: 'arrow-right',
              type: 'font-awesome',
              size: 15,
              color: 'white',
            }}
            iconRight
            iconContainerStyle={{ marginLeft: 10 }}
            titleStyle={{ fontWeight: '700' }}
            buttonStyle={{
              backgroundColor: 'rgba(92, 99,216, 1)',
              borderColor: 'transparent',
              borderWidth: 0,
              borderRadius: 30,
            }}
            containerStyle={{
              width: 200,
              marginHorizontal: 50,
              marginVertical: 10,
            }}
          
            onPress={() => navigation.navigate('Login')
            }/>
    </View>
  );
}

function CreatePostScreen({ navigation, route }) {
  const [postText, setPostText] = React.useState('');
  
  return(
    <>
      <TextInput
      multiline
      placeholder="Que piensas?"
      style={{ height: 200, padding: 10, backgroundColor: 'white'}}
      value={postText}
      onChangeText={setPostText}
      />
      <Button
      title="Hecho"
      onPress={() => {
      navigation.navigate({
        name: 'Home',
        params: { post: postText },
        merge: true,
        });
      }}
      />
    </>
  );
}

function DetailsScreen({ route, navigation }) {
  //const { itemId, otherParam } = route.params;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Pantalla de detalles</Text>
      <Button
        title="Ve a los detalles... de nuevo"
        onPress={() => navigation.push('Detalles', {
          itemId: Math.floor(Math.random() * 100),
        })
      }
      />
      <Button title="Regresa al inicio" onPress={() => navigation.navigate('Inicio')} />
      <Button title="Regresa" onPress={() => navigation.goBack()} />
    </View>
  );
}

/*const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      }}
      >
        <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
        />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

function LogoTitle() {
  return (
    <Image
      style={{ width: 50, height: 50 }}
      source={require("./assets/icon.png")}
    />
  );
}

function StackScreen(){
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ 
          title: 'Mi inicio',
          headerStyle: {
          backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          }, 
        }}    
      />
      <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={({ route }) => ({ title: route.params.name })}
      />
    </Stack.Navigator>
  );
}

export default App;

*/

                                ///--------APPPP

/*export default class App extends React.Component {
  constructor() {
    super(props);
    this.state = {
      isReady: false,
      isActivated:false
    };
    this.debug = true;
  }
}
*/


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})






////AQUI INICIA LA APP

const Drawer = createDrawerNavigator();

const Stack = createStackNavigator();





function Rutas() {
  return(
      <Drawer.Navigator
      initialRouteName = "Login"
      screenOptions={{
            activeTintColor: "#e91e63"
      }}
      drawerContent={(props) =><SideBar {...props} />}
        >
        <Drawer.Screen name="HomeScreen" component={HomeScreen} />
        <Drawer.Screen name="SettingScreen" component={SettingScreen} />
        <Drawer.Screen name="Cliente" component={Cliente} />
        <Drawer.Screen name="Login" component={Login} 
                                    options={{
                                      headerShown: false, hidden: true
                                            }} />
        <Drawer.Screen name="Venta" component={Venta} options={{title: 'Nueva venta'}} />
      </Drawer.Navigator>
  )
}



export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      isActivated:false
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


  }

  render() {
    return(
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen
      name="Ruta"
      component={Rutas}
      options={{ headerShown: false, title: ''
      }}
      />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="Cliente" component={Cliente} />
      <Stack.Screen name="AgregarCliente" component={Cliente} />
      <Stack.Screen name="ClienteDetalle" component={ClienteDetalle} />
      <Stack.Screen name="Venta" component={Venta} />
      <Stack.Screen name="ConfirmacionVenta" component={ConfirmacionVenta} />
      <Stack.Screen name="Pagando" component={Pagando} />
      <Stack.Screen name="Pagada" component={Pagada} />
      <Stack.Screen name="BluetoothList" component={BluetoothList} />
      <Stack.Screen name="VideoIndex" component={VideoIndex} options={{title: '¿Qué es Concrad?'}} />
      
      
    </Stack.Navigator>
    
    </NavigationContainer>
    );
  }

}


