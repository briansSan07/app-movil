import React, { Component,useState, useEffect } from "react";
import { ImageBackground, StyleSheet, Image, View, Platform, StatusBar,Linking,Dimensions,SafeAreaView, Touchable } from "react-native";
import { Container, Content, Form, Item, Label, Input, Header, Left, Body, Right, Icon, Title,
  Spinner, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TextInput, 
  ActivityIndicator} from "react-native";
 // import { TextInput } from 'react-native-gesture-handler';
//import { SafeAreaView } from 'react-navigation';
//import * as Localization from 'expo-localization';
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;
const aspectRatio = deviceHeight/deviceWidth;
import { Button, ButtonGroup, withTheme, Text} from '@rneui/themed';

// import DateUtils from './../../lib/utils/dateUtils';

const ConcradServer = require('../../lib/remote/ConcradServer');
const SyncronizeCatalogs = require ('../../lib/syncronization/SyncronizeCatalogs');
const SyncronizeTransaction = require ('../../lib/syncronization/SyncronizeTransaction');

const AppConfiguration = require ('../../lib/model/AppConfiguration');
const UsuarioModel = require ('../../lib/model/UsuarioModel');
const VentaModel = require ('../../lib/model/VentaModel');
//import CatalogosModel from '../../lib/model/CatalogosModel';
import VideoIndex from "../public/VideoIndex";

import {BluetoothManager,BluetoothEscposPrinter,BluetoothTscPrinter} from 'tp-react-native-bluetooth-printer';

import {LogBox} from 'react-native';

import * as SQLite from "expo-sqlite";


// import { styles } from "./styles";
// import { globalStyles } from "./../styles";

const launchscreenBg = require("./../../../assets/blanco.png");
const launchscreenLogo = require("./../../../assets/concrad.png");
const concradServer = new ConcradServer();
const appConfiguration = new AppConfiguration();
const syncronizeCatalogs = new SyncronizeCatalogs();
const syncronizeTransaction = new SyncronizeTransaction();
const usuarioModel = new UsuarioModel();
const ventaModel = new VentaModel();

const FROM_ACTIVATION = 1;
const FROM_IS_ACTIVATED = 0;

/*
function openDatabase(){
  const db = SQLite.openDatabase("db.db");
  return db;
}
*/

class Login extends Component {

  constructor(props) {
    super(props);
    this.debug = true;
    this.eventSubscription = null;

    global.printer = null;

//    console.log("* props en Login-index:  " , props);
    this.state = {
      isReady: false,
      isActivated: false,
      codigoActivacionValido : null,
      usuarioValido : null,
      codigoActivacion: '',
      usuario:'',
      password:'',
      token:'',
      sucursalId:0,
      sourceId:0,
      preciosDeVentaSinIva:false,
    
      connecting:false,
      printer: null,
      onActivating:false,

    };

  }



  setAppIsActivated( state ){
    
    this.setState({ isActivated: state },() => { 

      if(this.debug) console.log ("this.state.isActivated: " , this.state.isActivated);
//      this.checkAppIsActivated();

      // cargar ultimo usuario logeado
      console.log("Cargando usuario logeado....");
      appConfiguration.loadKeyConfiguration('usuario')
      .then((result) => {
console.log("usuario logeado: ",{result});
        if(result.success){
          this.setState({usuario : result.value});    
        }
      })
      .catch((error) => {
        if(this.debug) console.log('ERROR DE loadKeyConfiguration', error);
      });


    });
  }


  checkAppIsActivated(){
    if(this.debug) console.log("...checkAppIsActivated on LOGIN!! ()");
    appConfiguration.isAppActivated()
    .then((result) => {
      if(result.success && result.isAppActivated){
        this.setAppIsActivated(true);
//        console.log('La aplicación SI esta activada!!!', result);
      }else{
        this.setAppIsActivated(false);
//        console.log('La aplicación NO esta activada!!!', result);
      }
    })
    .catch((error) => {
      this.setAppIsActivated(false);
//      console.log('La aplicación NO esta activada!!!', error);
    });
  }

  async componentDidMount() {

    LogBox.ignoreWarnings([ 'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation - use another VirtualizedList-backed container instead', ]);

    this.checkAppIsActivated();
//    CatalogosModel.consultarConfiguracion();
//    this.setState({ isReady: true });
  }

  reenviarVenta(){
    
    ventaModel.reenviarVenta(30)
    .then( (success) => {
      if(this.debug) console.log("Actualizando la venta a estatus 1 para su reenvio");
      /*
      appConfiguration.saveConfigurationKey('reenviar_venta_31','true')
      .then( (success) => {
        if(this.debug) console.log("salvando reenviar_venta_31");
      }), (error) => {
          if(this.debug) console.log({error});
      }
      */
    })
    .catch((error) => {
      if(this.debug) console.log('ERROR al reenviarVenta', error);
      
  });

  }
  sendIncompleteData(){

    let sourceId = null;

    appConfiguration.loadKeyConfiguration('source_id')
    .then((result) => {
      if(this.debug) console.log('SI EXISTE source_id:', result);
        if(result.success){
          sourceId = parseInt(result.value);    

          if(sourceId == 142){ // voy a obtener la venta: 31

/*
            appConfiguration.loadKeyConfiguration('reenviar_venta_31')
            .then((result) => {
              console.log("reenviar_venta_31: ", {result});
              // ya se reenvio la venta
                if(result.success){
                  if(result.value == "true"){

                    if(this.debug) console.log('ya se envio la venta');
/-*                    
                    appConfiguration.saveConfigurationKey('reenviar_venta_31','false')
                    .then( (success) => {
                      if(this.debug) console.log("salvando reenviar_venta_31");
                    }), (error) => {
                        if(this.debug) console.log({error});
                    }  
*-/
                  }else{
                    this.reenviarVenta();
                  }
                }
              })
              .catch((error) => {                
                if(this.debug) console.log('NO SE HA REENVIADO LA venta');
                this.reenviarVenta();
              });
*/
this.reenviarVenta();
              



          }
        }
      })
      .catch((error) => {
        if(this.debug) console.log('ERROR DE loadKeyConfiguration', error.message);
      });

      
  }





  onChangeCodigoActivacion(inputText){
    this.setState({codigoActivacion: inputText }, () => {
      if(this.debug) console.log("this.state.codigoActivacion: " + this.state.codigoActivacion);
    });
  }


  onChangeUsuario(inputText){
    this.setState({usuario: inputText }, () => {
      if(this.debug) console.log("this.state.usuario: " + this.state.usuario);
    });
  }

  onChangePassword(inputText){
    this.setState({password: inputText }, () => {
      if(this.debug) console.log("this.state.password: " + this.state.password);
    });
  }














  validateForm() {

let sourceId = null;
    if(!this.state.isActivated){
 
//  SE VALIDA EL CODIGO DE ACTIVACION....
      concradServer.checkActivationCode(this.state.codigoActivacion)
      
      .then(response => {
        if(this.debug) console.log("checkActivationCode - success: " , response)
        if(response.success === false){
          // codigo inválido
          this.setState({codigoActivacionValido:false});
        }else{
          this.setState({onActivating:true});
          // codigo VALIDO!
          sourceId = response.id;
          this.setState({codigoActivacionValido: true}, () => {
// SE VALIDA EL USUARIO Y CONTRASEÑA 
            concradServer.remoteLogin(this.state.usuario,this.state.password,null,sourceId)
            .then(response => {
              if(this.debug) console.log("remote Login - success: " )
              if(response.success == false){
                // codigo inválido
                this.setState({usuarioValido: false});
                this.setState({onActivating:false});
              }else{
                // codigo VALIDO!

                if(this.debug) console.log("USUARIO VALIDO!");
// ACTUALIZO SOURCE_ID PARA INICIAR ACTIVACION.....                 
                appConfiguration.updateLocalConfiguration(sourceId,null)
                .then((result) => {
                  if(this.debug) console.log("---- then -----" , result);
                  if(result.success){
                    this.setState({usuarioValido: true}, () => { 
                      this.updateConfiguracion()
                      .then((result) => {
                        if(this.debug) console.log("---- then -----" , result);

                        appConfiguration.activateApp()
                        .then((result) => {
                          if(this.debug) console.log("---- then -----" , result);
                          
                          this.setAppIsActivated(true);
                          this.ingresarApp(FROM_ACTIVATION);
            
                        })
                        .catch((error) => {
                          if(this.debug) console.log("---- catch -----" , error.message);
                        });

                      })
                      .catch((error) => {
                        if(this.debug) console.log("---- catch -----" , error.message);
                      });
                    });
                  }
                })
                .catch((error) => {
                  if(this.debug) console.log("---- catch -----" , error.message);
                });
              }      
            })
            .catch(error=>{
              if(this.debug) console.log("checkActivationCode - error: " , error.message)
            })
            
            if(this.debug) console.log("CODIGO DE ACTIVACIÓN VALIDO!");
          });
        }

      })
      .catch(error=>{
        if(this.debug) console.log("checkActivationCode - error: " , error.message)
      })

//    }else{

    } else {
      this.ingresarApp(FROM_IS_ACTIVATED);
//      this.sendIncompleteData();

    }
//      this.props.navigation.navigate("Venta");
  }


  updateConfiguracion(){
    if(this.debug) console.log("updateConfiguracion()");

    return new Promise((resolve, reject) => {


    appConfiguration.loadKeyConfiguration('source_id')
    .then((result) => {
      if(this.debug) console.log('SI EXISTE ROW PARA source_id !!!', result);
        if(result.success){
          let sourceId = parseInt(result.value);

          concradServer.loadConfiguration(null,sourceId)
          .then(response => {
            if(this.debug) console.log("loadConfiguration - success: " , response)

            appConfiguration.updateLocalConfiguration(null,response, this.state.usuario)
            .then((result) => {
              if(this.debug) console.log("---- then -----" , result);
              
              resolve( { success:true } );
            })
            .catch((error) => {
              if(this.debug) console.log("---- catch -----" , error);
              reject({success:false,error:error})
            });
          })
          .catch((error) => {
            if(this.debug) console.log("loadConfiguration - error: " , error)
              reject({success:false,error:error})
            })
        }
      })
      .catch((error) => {
        if(this.debug) console.log('ERROR DE LOADKEY!!!', error);
        reject({success:false,error:error})
      });
    });

  }

  ingresarApp(from){


    if(this.debug) console.log("ingresarApp(" + from + ")");
    

  
  
    
  



    appConfiguration.loadKeyConfiguration('id_sucursal')
    .then((result) => {
      if(this.debug) console.log('SI EXISTE ROW PARA id_sucursal !!!', result);
        
        if(result.success){
          const sucursalId = parseInt(result.value);
          this.setState({sucursalId:sucursalId});

          appConfiguration.loadKeyConfiguration('source_id')
          .then((result) => {
              if(this.debug) console.log('SI EXISTE ROW PARA source_id !!!', result);
              
              if(result.success){
                const sourceId = parseInt(result.value);
                this.setState({sourceId:sourceId});

                appConfiguration.loadKeyConfiguration('precios_de_venta_sin_iva')
                .then((result) => {
                    if(this.debug) console.log('SI EXISTE ROW PARA precios_de_venta_sin_iva !!!', result);
                    
                    if(result.success){
                      const precios_de_venta_sin_iva = parseInt(result.value);
                      this.setState({preciosDeVentaSinIva : precios_de_venta_sin_iva},() => {
      
       
      //  PROPIEDADES GLOBALES
       
                        global.token = null;
                        global.sourceId = this.state.sourceId;
                        global.sucursalId = this.state.sucursalId;
                        if(global.usuario == undefined){
                          global.usuario = {};
                        }
                        global.usuario.username = this.state.usuario;
                        global.usuario.password = this.state.password;
                        global.ventaUnique = 1;
                        global.carrito = null;
                        global.pagos = null;
                        global.onSavingSale = false;
                        global.publicoGeneral = null;
                        global.metodosPago = null;
                        global.TiposProducto = null;
                        global.estadosArray = null;
                        global.bancos = null;
                        global.clientes = null;
                        global.preciosDeVentaSinIva = this.state.preciosDeVentaSinIva;
                        global.printer = null;
      
                        this.loadEmpresaData();
      
      
                        if(from == FROM_IS_ACTIVATED){
                          // logueo local... Y en paralelo corre el logueo remoto para iniciar la sincronizacion. 
                          if(this.debug) console.log("**** PENDIENTE HACER EL LOGUEO LOCAL!");
      
                          usuarioModel.userLogin(this.state.usuario,this.state.password)
                          .then((result) => {
      
                            if(this.debug) console.log( 'SI EXISTE el usuario  !!!', result.usuario );
      
                            global.usuario = result.usuario;
                            if(this.debug) console.log( 'SI EXISTE el usuario  global.usuario: ', global.usuario );
                            this.updateConfiguracion();
      
                            syncronizeCatalogs.executeSyncronization();
                            syncronizeCatalogs.startSyncronization(); // THREAD DE SINCRONIZACIÓN DE CATALOGOS
                            syncronizeTransaction.startSyncronizationTransaction(); // INICIA THREAD DE SINCRONIZACION DE TRANSACCIONES (VENTAS)
      
                            this.setState({onActivating:false});
                            this.props.navigation.navigate("Venta",{uniqueValue:0});
      
                          })
                          .catch((error) => {
                            if(this.debug) console.log('ERROR DE LOADKEY!!!', error);
                            this.setState({usuarioValido: false});
                          });
      
                        }
                        if(from == FROM_ACTIVATION){
                          //logeo remoto
                          if(this.debug) console.log("**** VENGO DEL PROCESO DE ACTIVACIÓN X LO QUE DEBO SINCRONIZAR LOS CATALOGOS LA PRIMERA VEZ!");
      
                          syncronizeCatalogs.executeSyncronization()
                          .then((success) => {
                              if(this.debug) console.log('En executeSyncronization exitosa...', success);            
      
                              syncronizeCatalogs.startSyncronization(); // THREAD DE SINCRONIZACIÓN DE CATALOGOS


                              this.props.navigation.navigate("Venta");
          
                          })
                          .catch((error) => {
                              if(this.debug) console.log('Error En executeSyncronization: ', error);                        
      
                              syncronizeCatalogs.startSyncronization(); // THREAD DE SINCRONIZACIÓN DE CATALOGOS
      
                              this.props.navigation.navigate("Venta");
          
                          });
                          
                        }
      
      
                      });
                    }
                  })
                  .catch((error) => {
                    if(this.debug) console.log('ERROR DE LOADKEY!!!', error);
                  });
      

              }
            })
            .catch((error) => {
              if(this.debug) console.log('ERROR DE LOADKEY!!!', error);
            });
      
        }
      })
      .catch((error) => {
        if(this.debug) console.log('ERROR DE LOADKEY!!!', error);
      });


  }
  
  loadEmpresaData(){
    console.log("loadEmpresaData...");

    appConfiguration.loadKeyConfiguration('nombre_comercial')
    .then((result) => {
      if(this.debug) console.log('SI EXISTE ROW PARA nombre_comercial !!!', result);
      if(result.success){
        global.nombre_comercial = result.value;
      }
      console.log("global.nombre_comercial:" , global.nombre_comercial);
    })
    .catch((error) => {
      if(this.debug) console.log('ERROR DE LOADKEY!!!', error);
    });

    appConfiguration.loadKeyConfiguration('domicilio_comercial')
    .then((result) => {
      if(this.debug) console.log('SI EXISTE ROW PARA domicilio_comercial !!!', result);
      if(result.success){
        global.domicilio_comercial = result.value;
        console.log("global.domicilio_comercial:" , global.domicilio_comercial);
      }
    })
    .catch((error) => {
      if(this.debug) console.log('ERROR DE LOADKEY!!!', error);
    });

    appConfiguration.loadKeyConfiguration('telefono')
    .then((result) => {
      if(this.debug) console.log('SI EXISTE ROW PARA telefono !!!', result);
      if(result.success){
        global.telefono = result.value;
        console.log("global.telefono:" , global.telefono);
      }
    })
    .catch((error) => {
      if(this.debug) console.log('ERROR DE LOADKEY!!!', error);
    });


  }

 
  revisarVenta() {
  

    let fecha=new Date();

//    console.log("DateUtils.fechaFormat: " , DateUtils.fechaFormat(fecha));
/* 
    ProductoModel.consultarProductosPrecio()    
    .then((result) => {
      console.log("consultarProductosPrecio - THEN: " , result);
    })
    .catch((error) => {
      console.log('consultarProductosPrecio - CATCH: ', error);
    });
    */
    this.loadEmpresaData();    
/*
    const idVenta = 2;

    ventaModel.consultarVentaById(idVenta)
    .then((result) => {
      console.log("consultarVentaById - THEN: " , result.venta);
    })
    .catch((error) => {
      console.log('consultarVentaById - CATCH: ', error);
    });
*/

  }



async imprimir(){

    const idVenta = 2;

    const result = await ventaModel.consultarVentaById(idVenta)

    console.log("consultarVentaById - THEN: " , result.venta);
    const venta = result.venta;
      
    await BluetoothEscposPrinter.printerInit();
    
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.setBlob(0);    
    await BluetoothEscposPrinter.printText(global.nombre_comercial + "\r\n", {
    });
    await BluetoothEscposPrinter.printText(global.domicilio_comercial + "\r\n", {
      fonttype:1,
      widthtimes:0
    });
    await BluetoothEscposPrinter.printText(global.telefono + "\r\n", {
      fonttype:1,
      widthtimes:0
    });

    await BluetoothEscposPrinter.printText("Venta: " + venta.folio_venta + "\r\n", {});
    await BluetoothEscposPrinter.printText(venta.fecha + "\r\n\r\n", {});

    await BluetoothEscposPrinter.setWidth(78*8);

    let columnWidths = [9,32,10,12];


    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
    await BluetoothEscposPrinter.printColumn(columnWidths,
      [BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.CENTER],
      ["CANT.",'DESCRIPCION','PRECIO','IMPORTE'],{
        fonttype:1,
        widthtimes:0  
      });

        
      const detalle = venta.detalle;
      for(let i=0;i<detalle.length;i++){
        const producto = detalle[i];

        let precio = ( venta.is_vsi == 1) ? (producto.precio_unitario): (producto.importe);
        let importe = producto.total;

        precio = Math.round(precio * 100) / 100;
        importe = Math.round(importe * 100) / 100;
        
        await BluetoothEscposPrinter.printColumn(columnWidths,
          [BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT,BluetoothEscposPrinter.ALIGN.RIGHT],
          ["" + producto.cantidad, producto.codigo + " " + producto.nombre , "" + precio.toFixed(2) , "" + importe.toFixed(2) ],{
            fonttype:1,
            widthtimes:0  
          });
    
      }

      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
      
      await  BluetoothEscposPrinter.printText("---------------------------------------------\n\r",{});
      await  BluetoothEscposPrinter.printText("TOTAL:" + venta.total.toFixed(2) +" \n\r",{
        fonttype:0,
        widthtimes:0  
      });
      const pagos = venta.pagos;
      for(let i=0;i<pagos.length;i++){
        const pago = pagos[i];
        
        if(pago.id_metodo_pago == '1'){ // efectivo
          await  BluetoothEscposPrinter.printText("Metodo de pago: Efectivo \n\r",{
            fonttype:1,
            widthtimes:0  
          });
          await  BluetoothEscposPrinter.printText("Efectivo: " + pago.efectivo.toFixed(2) + " \n\r",{
            fonttype:1,
            widthtimes:0  
          });
          await  BluetoothEscposPrinter.printText("Cambio: "+ Math.abs(pago.cambio).toFixed(2) +" \n\r",{
            fonttype:1,
            widthtimes:0  
          });
        } else if(pago.id_metodo_pago == '2' || pago.id_metodo_pago == '3'){ // efectivo
          await  BluetoothEscposPrinter.printText("Metodo de pago: XXXXX \n\r",{
            fonttype:1,
            widthtimes:0  
          });
          await  BluetoothEscposPrinter.printText("Importe: " + pago.importe.toFixed(2) + " \n\r",{
            fonttype:1,
            widthtimes:0  
          });
          await  BluetoothEscposPrinter.printText("Autorización: " + pago.autorizacion + " \n\r",{
            fonttype:1,
            widthtimes:0  
          });
        } else if(pago.id_metodo_pago == '4'){ // cheque
          await  BluetoothEscposPrinter.printText("Metodo de pago: Cheque \n\r",{
            fonttype:1,
            widthtimes:0  
          });
          await  BluetoothEscposPrinter.printText("Importe: " + pago.importe.toFixed(2) + " \n\r",{
            fonttype:1,
            widthtimes:0  
          });
          await  BluetoothEscposPrinter.printText("No. de cheque: " + pago.autorizacion + " \n\r",{
            fonttype:1,
            widthtimes:0  
          });   
        } else if(pago.id_metodo_pago == '7'){ // cheque
          await  BluetoothEscposPrinter.printText("Metodo de pago: Transferencia \n\r",{
            fonttype:1,
            widthtimes:0  
          });
          await  BluetoothEscposPrinter.printText("Importe: " + pago.importe.toFixed(2) + " \n\r",{
            fonttype:1,
            widthtimes:0  
          });
          await  BluetoothEscposPrinter.printText("No. de autorizacion: " + pago.autorizacion + " \n\r",{
            fonttype:1,
            widthtimes:0  
          });                    
        }

      }

      await  BluetoothEscposPrinter.printText("\n\r\n\r\n\r",{
        fonttype:0,
        widthtimes:0  
      });                    





        /*
    await BluetoothEscposPrinter.printColumn(columnWidths,
      [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.RIGHT],
      ["A",'B','C','D'],{
        fonttype:1,
        widthtimes:0  
      });
        await  BluetoothEscposPrinter.printText("\n\r",{ fonttype:1, widthtimes:0 });
    */
    /*
    BluetoothEscposPrinter.printText("P-00: " + new Date() + "\r\n", {
        fonttype:0,
        widthtimes:0
    });
    BluetoothEscposPrinter.printText("Prb-11: " + new Date() + "\r\n", {
        fonttype:1,
        widthtimes:1
    });
    BluetoothEscposPrinter.printText("Prb-12: " + new Date() + "\n", {
        fonttype:1,
        widthtimes:2
    });
    BluetoothEscposPrinter.printText("Prb-13: " + new Date() + "\n", {
        fonttype:1,
        widthtimes:3
    });
    BluetoothEscposPrinter.printText("Prb-14: " + new Date() + "\n", {
        fonttype:1,
        widthtimes:4
    });
    */

}

setStateDispositivo(device){

    this.setState({
        printer:device,
        connecting:true
    },() => { 
        setTimeout(() => {this.conectarDispositivo()},200);
    });

}

conectarDispositivo(attemps = 0){

        console.log("conectarDispositivo attemps: " +  attemps + "address: " + this.state.printer.address);
//            alert("Dispositivo conectado: " +  this.state.printer.name);
        BluetoothManager.connect(this.state.printer.address) // the device address scanned.
        .then((s)=> {

            this.setState({
                connecting:false
            });
            global.printer = this.state.printer;
//            console.log("BluetoothManager.connect - then: " , {s});
            
            this.imprimir();
//            console.log("IMPRIMIENDO...." ,);

        },(error)=>{
            if(attemps < 10){
                setTimeout(() => {this.conectarDispositivo(++attemps)},200);

            }else{
                alert("No se pudo realizar la impresión con el dispositivo " + this.state.printer.name + ". Err: "+error.message+".");
                this.setState({
                    connecting:false,
                    printer:null
                });
                global.printer = null;
            }
        })
}

imprimirTicket(){
    


        console.log("this.state.printer.address: " , this.state.printer);

        BluetoothManager.isBluetoothEnabled().then((enabled)=> {

            console.log("enabled: "  + enabled )



                console.log("Escaneare los Dispositivos") 
                BluetoothManager.enableBluetooth().then(( r )=> {
                        console.log("enableBluetooth r:" , r) 

                    var paired = [];
                    if(r && r.length>0){
                        for(var i=0;i<r.length;i++){
                            try{
                                paired.push(JSON.parse(r[i])); // NEED TO PARSE THE DEVICE INFORMATION
                            }catch(e){
                                //ignore
                            }
                        }
                    } 

//                    console.log("Dispositivos conectados : " , {paired} , " paired.length: " , paired.length);
                    
                    if(paired.length == 1){
                        this.setStateDispositivo(paired[0]);
                    }else if(paired.length>0){
//                        console.log("hay VARIOS dispositivos bluetooth conectados - global.printer: " , this.state.printer)

                        if(this.state.printer != null){
                            this.setStateDispositivo(this.state.printer);
                        }else{
                            
                            this.props.navigation.navigate("BluetoothList",
                            {
                                origen:"VENTA",
                                paired:paired,
                                onGoBack: (pairedDevice) => { this.setStateDispositivo(pairedDevice); },
                            });    
                        }

                    }else{
                        // no hay dispositivo bluetooth conectado 
//                        console.log("no hay dispositivo bluetooth conectado") 

                        this.props.navigation.navigate("BluetoothList",
                        {
                          origen:"VENTA",
                          paired:paired,
                          onGoBack: (pairedDevice) => { this.setStateDispositivo(pairedDevice); },
                        });
                    }
                    
                },(err)=>{
                   alert(err)
               });
                /*
                BluetoothManager.scanDevices()
                .then((s)=> {
                    var ss = JSON.parse(s);
                    console.log("scanDevices.found: ",ss.found);
                    console.log("scanDevices.paired: ",ss.paired);
                }, (er)=> {
                    this.setState({
                        loading: false
                    })
                    console.log("scanDevices - error: ",er);
                });
                */
                


/*

            BluetoothManager.connect("asdf") // the device address scanned.
            .then((s)=>{



                console.log("BluetoothManager.connect - then: " , {s});
                this.setState({
                    loading:false
                })
/ *                
             BluetoothEscposPrinter.printerInit();
//                 BluetoothEscposPrinter.printText("CONCRAD MOBIL POS\r\n\r\n", {});
             BluetoothEscposPrinter.printText("PRUEBA: " + new Date() + "\r\n\r\n", {});
* /
             console.log("IMPRIMENDO.............");


            },(e)=>{
            this.setState({
                loading:false
            })
            alert("BluetoothManager.connect ERROR: " + e);
            })
*/                

        }, (err)=> {
            console.log("no esta activo el bluetooth...... ", err);
            alert(err);
        });
}


openPage() {

  Linking.canOpenURL("https://concrad.com").then(supported => {
    if (supported) {
      Linking.openURL("https://concrad.com");
    } else {
      console.log("Don't know how to open URI: " + this.props.url);
    }
  });
};

openVideo(){
  
    this.props.navigation.navigate(VideoIndex);  

}

  render() {

    const isActivated = this.state.isActivated;
    const codigoActivacionValido = this.state.codigoActivacionValido;
    const usuarioValido = this.state.usuarioValido;
    
    const deviceWidth = Dimensions.get("window").width;
























    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        
       

        <ImageBackground source={launchscreenBg} style={styles.imageContainer}>
          <View style={styles.logoContainer}>
          <View style={{alignContent:"center"}}>
            <SafeAreaView style={{flex: 1}}>

            <Image source={launchscreenLogo} style={styles.logo} />
            <KeyboardAvoidingView
        style={styles.container}
        behavior='position'
        keyboardVerticalOffset={32}>
          <View>
            
            {
              (codigoActivacionValido == false) &&
              <Text style={{color: 'red'}}>Codigo de activación inválido</Text>
            }
            
            {
              (usuarioValido == false) &&
              <View>
                <Text style={{color: 'red'}}>El usuario o la contraseña no </Text>
                <Text style={{color: 'red'}}>son válidos, favor de verificarlos.</Text>
              </View>
            }
            {!isActivated &&
              <TouchableOpacity>
                <Text>Codigo de activación:</Text>
                <TextInput
                  style= {{height: 40, margin: 12, borderWidth: 1, padding: 10}}
                  onChangeText={inputText => this.onChangeCodigoActivacion(inputText)} 
                  value={this.state.codigoActivacion} />
              </TouchableOpacity>
            }
            

        {
        this.state.onActivating &&

        <View style={{alignItems:'center',padding:15}}>
          <ActivityIndicator size="large" color='#51747F' />
          <Text style={{alignItems:'center'}}>Sincronizando catalogos del sistema.</Text>
          <Text style={{alignItems:'center'}}> Espera por favor...</Text>
        </View>  
        }

          {
          !this.state.onActivating &&

            <View>
                <TouchableOpacity>
                  <Text>Usuario:</Text>
                  <TextInput 
                    style= {{height: 40, margin: 12, borderWidth: 1, padding: 10}}
                    onChangeText={inputText => this.onChangeUsuario(inputText)} 
                    value={this.state.usuario} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text>Contraseña:</Text>
                  <TextInput secureTextEntry 
                  style= {{height: 40, margin: 12, borderWidth: 1, padding: 10}}
                  onChangeText={inputText => this.onChangePassword(inputText)} 
                  value={this.state.password} />
                </TouchableOpacity>
              
            </View>
          }  
          </View>
          {
          !this.state.onActivating &&
          <View> 
          <Button 
          title="Ingresar"
          buttonStyle={{  marginVertical: 20, backgroundColor: 'rgba(111, 202, 186, 1)',
          borderRadius: 5, marginHorizontal: 10}} 
          onPress={() => this.validateForm()}
          />
          </View>
          }
          
            <View >
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
          
            onPress={() => this.openVideo()
            }/>


            </View>

            
                {
                    this.state.connecting &&
                    <View style={{alignItems:'center'}}>
                    <ActivityIndicator size="large" color='#51747F' />
                    <Text>Conectando con {this.state.printer.name}...</Text>
                    </View>
                }          
                <Text></Text>
                <Text></Text>
                <Text></Text>
                <Text></Text>
                <Text></Text>
</KeyboardAvoidingView>
          </SafeAreaView>
          
        </View>
        
        </View>
        
        </ImageBackground>
      </View>
    
    );
  }
}



const styles = StyleSheet.create({
  imageContainer: {
    flex: 2,
    width: deviceWidth,
    height: null
  },
  logoContainer: {
    flex: 1,
    marginTop: deviceHeight / 15,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center'


  },
  logo: {
//    position: "absolute",
//(deviceWidth - 280)/3 
    left:  0, //(aspectRatio>1.6) ? ((deviceWidth/2) - 140) : ((deviceWidth/2) - 140),
//    top: Platform.OS === "android" ? 45 : 60,
    width: 280,
    height: 300,
    alignContent:"center"
  },
  text: {
    color: "#D8D8D8",
    bottom: 6,
    marginTop: 5
  }
})


module.exports = Login;
