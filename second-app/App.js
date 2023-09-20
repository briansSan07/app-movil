import 'react-native-gesture-handler';
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

import Login from './src/screens/login';
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

import isObject from 'isobject';

import AppConfiguration from './src/lib/model/AppConfiguration';


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



function MyDrawer(){
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Cliente" component={HomeScreen} />
      <Drawer.Screen name="Venta" component={DetailsScreen} />
    </Drawer.Navigator>
  );
}

function MyStack() {
  return (
    <Stack.Navigator
      initialRouteName="SettingScreen"
      screenOptions={{
        headerMode: 'screen',
        headerTintColor: 'white',
        headerStyle: { backgroundColor: 'tomato' },
      }}
      >
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
      <Stack.Screen name="VideoIndex" component={VideoIndex} />
      
      
    </Stack.Navigator>
  )
}

function Rutas() {
  return(
      <Drawer.Navigator initialRouteName="Cliente">
        <Drawer.Screen name="Cliente" component={HomeScreen} />
       
        <Stack.Screen name="Detalles" component={SettingScreen} />
      </Drawer.Navigator>
  )
}



export default function App() {
  
  return (
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


