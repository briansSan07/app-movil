import React, { Component } from "react";
import {Platform,SafeAreaView} from 'react-native';
import { Container, Header, Title, Content, Button, Icon, Form, Body,   Footer,
  FooterTab, H3,
  ListItem, Separator,
Left, Right, Label, Item, H1, View,  Input, Text,  H2, Spinner } from "react-native";
import {Picker, TextInput} from "react-native"
const SyncronizeTransaction = require ('../../../lib/syncronization/SyncronizeTransaction');
const syncronizeTransaction = new SyncronizeTransaction();
const AppConfiguration = require ('../../../lib/model/AppConfiguration');
const appConfiguration = new AppConfiguration();
//import styles from "./styles";

import {BluetoothManager,BluetoothEscposPrinter,BluetoothTscPrinter} from 'tp-react-native-bluetooth-printer';

const VentaModel = require ('../../../lib/model/VentaModel');

import styles from "./../styles";
import globalStyles from "./../../styles";

const ventaModel = new VentaModel();

class Pagada extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {      
      folio: this.props.navigation.getParam('folio'),
      idVenta: this.props.navigation.getParam('idVenta'),

      connecting:false,
      printer: null,
      

    };

  }


  componentDidMount(){

    // disparar sincronizacion de transacciones
    syncronizeTransaction.executeSyncronization();

    console.log(" *** global.printer: " , global.printer );
    if(global.printer != null){
      console.log("Manteniendo conexión con impresora previamente conectada...");
      this.setStateDispositivo(global.printer);
    }else{
      appConfiguration.loadKeyConfiguration('global.printer')
      .then((result) => {
        console.log("global.printer in database: ",{result});
        if(result.success){
          global.printer = JSON.parse(result.value);
          this.setState({printer:global.printer});
          console.log(" *** global.printer: " , global.printer );
        }
      })
      .catch((error) => {
        console.log('ERROR al obtener global.printer de la base de datos', error);
      });

    }

  }

nuevaVenta(){

  this.props.navigation.navigate("Venta",{uniqueValue:global.ventaUnique})
  global.ventaUnique = global.ventaUnique + 1;

}

ascii (a) { return a.charCodeAt(0); }


async imprimir(){

  const idVenta = this.state.idVenta;

  const result = await ventaModel.consultarVentaById(idVenta)

//  console.log("consultarVentaById - THEN: " , result.venta);
  const venta = result.venta;
    
  await BluetoothEscposPrinter.printerInit();
  
  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
  await BluetoothEscposPrinter.setBlob(0);    

// TEST IOS
 const code = 0; //acentos solo en minusculas....
/* 
await BluetoothEscposPrinter.printText(global.nombre_comercial+" \r\n", {
  codepage:code,
  fonttype:0,
  widthtimes:0,
  heigthtimes:0,

});
await BluetoothEscposPrinter.printText(global.nombre_comercial+" \r\n", {
  codepage:code,
  fonttype:1,
fontType:1,
  widthtimes:1,
  heigthtimes:1,
});

return;
*/
  await BluetoothEscposPrinter.printText(global.nombre_comercial + "\r\n", {
  });
  await BluetoothEscposPrinter.printText(global.domicilio_comercial + "\r\n", {
    fonttype:1,
fontType:1,
    widthtimes:0
  });
  await BluetoothEscposPrinter.printText(global.telefono + "\r\n", {
    fonttype:1,
fontType:1,
    widthtimes:0
  });

  await BluetoothEscposPrinter.printText("Venta: " + venta.folio_venta + "\r\n", {});
  await BluetoothEscposPrinter.printText(venta.fecha + "\r\n", {});
  await  BluetoothEscposPrinter.printText("---------------------------------------------\n\r",{});
  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
  if(venta.nombre_comercial != null && venta.nombre_comercial != undefined){
    await BluetoothEscposPrinter.printText("Cliente: " + venta.nombre_comercial + "\r\n\r\n", {});
  }

  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);

  await BluetoothEscposPrinter.setWidth(78*8);

  let columnWidths = [9,32,10,12];


  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
  await BluetoothEscposPrinter.printColumn(columnWidths,
    [BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.CENTER],
    ["CANT.",'DESCRIPCION','PRECIO','IMPORTE'],{
      fonttype:1,
fontType:1,
      widthtimes:0  
    });

      
    const detalle = venta.detalle;

    

    for(let i=0;i<detalle.length;i++){
      const producto = detalle[i];

      let precio = ( venta.is_vsi == 1) ? (producto.precio_unitario) : (producto.importe);
      let importe =  ( venta.is_vsi == 1) ? (producto.precio_unitario * producto.cantidad) : (producto.total);

      if(venta.for_factura == 1){
        precio = producto.precio_unitario;
        importe = producto.precio_unitario * producto.cantidad;
      }

      precio = Math.round(precio * 100) / 100;
      importe = Math.round(importe * 100) / 100;
      

      await BluetoothEscposPrinter.printColumn(columnWidths,
        [BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT,BluetoothEscposPrinter.ALIGN.RIGHT],
        ["" + producto.cantidad, producto.codigo + " " + producto.nombre , "" + precio.toFixed(2) , "" + importe.toFixed(2) ],{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
  
    }

    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
    
    await  BluetoothEscposPrinter.printText("---------------------------------------------\n\r",{});
    if(venta.for_factura == 1 || venta.is_vsi == 0){

      await  BluetoothEscposPrinter.printText("SUBTOTAL: $ " + venta.subtotal.toFixed(2) +" \n\r",{
        fonttype:0,
        widthtimes:0  
      });
      if(venta.ieps > 0){
        await  BluetoothEscposPrinter.printText("I.E.P.S.: $ " + venta.ieps.toFixed(2) +" \n\r",{
          fonttype:0,
          widthtimes:0  
        });      
  
      }
      await  BluetoothEscposPrinter.printText("I.V.A.: $ " + venta.iva.toFixed(2) +" \n\r",{
        fonttype:0,
        widthtimes:0  
      });      
    }

    await  BluetoothEscposPrinter.printText("TOTAL: $ " + venta.total.toFixed(2) +" \n\r",{
      fonttype:0,
      widthtimes:0  
    });
    const pagos = venta.pagos;
    for(let i=0;i<pagos.length;i++){
      const pago = pagos[i];
      
      if(pago.id_metodo_pago == '1'){ // efectivo
        await  BluetoothEscposPrinter.printText("Metodo de pago: Efectivo \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        await  BluetoothEscposPrinter.printText("Efectivo: " + pago.efectivo.toFixed(2) + " \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        await  BluetoothEscposPrinter.printText("Cambio: "+ Math.abs(pago.cambio).toFixed(2) +" \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });

      } else if(pago.id_metodo_pago == '2' || pago.id_metodo_pago == '3'){ // efectivo
        await  BluetoothEscposPrinter.printText("Metodo de pago: XXXXX \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        await  BluetoothEscposPrinter.printText("Importe: " + pago.importe.toFixed(2) + " \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        let autorizacion = "";
        if (pago.autorizacion != null){
          autorizacion = pago.autorizacion;
        }

        await  BluetoothEscposPrinter.printText("Autorización: " + autorizacion + " \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
      } else if(pago.id_metodo_pago == '4'){ // cheque
        await  BluetoothEscposPrinter.printText("Metodo de pago: Cheque \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        await  BluetoothEscposPrinter.printText("Importe: " + pago.importe.toFixed(2) + " \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        let autorizacion = "";
        if (pago.autorizacion != null){
          autorizacion = pago.autorizacion;
        }

        await  BluetoothEscposPrinter.printText("No. de cheque: " + autorizacion + " \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });   
      } else if(pago.id_metodo_pago == '5'){ // crédito
        await  BluetoothEscposPrinter.printText("Metodo de pago: Credito \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        await  BluetoothEscposPrinter.printText("Importe: " + pago.importe.toFixed(2) + " \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        let autorizacion = "";
        if (pago.autorizacion != null){
          autorizacion = pago.autorizacion;
        }

        await  BluetoothEscposPrinter.printText("Fecha progamada de pago: " + autorizacion + " \n\r\n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });                    
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await  BluetoothEscposPrinter.printText("Me comprometo a realizar el deposito o transferencia por el importe total de la compra por: $"+pago.importe.toFixed(2) + " en la siguiente fecha acordada: " + autorizacion + ".\n\r\n\r\n\r\n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        await  BluetoothEscposPrinter.printText("---------------------------------------------\n\r",{});
        await  BluetoothEscposPrinter.printText("Nombre y firma.\n\r",{});

      }
      else if(pago.id_metodo_pago == '7'){ // transferencia
        await  BluetoothEscposPrinter.printText("Metodo de pago: Transferencia \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        await  BluetoothEscposPrinter.printText("Importe: " + pago.importe.toFixed(2) + " \n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        let autorizacion = "";
        if (pago.autorizacion != null){
          autorizacion = pago.autorizacion;
        }

        await  BluetoothEscposPrinter.printText("Fecha de transferencia: " + autorizacion + " \n\r\n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });                    
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await  BluetoothEscposPrinter.printText("Me comprometo a realizar el deposito o transferencia por el importe total de la compra por: $"+pago.importe.toFixed(2) + " en la siguiente fecha acordada: " + autorizacion + ".\n\r\n\r\n\r\n\r",{
          fonttype:1,
fontType:1,
          widthtimes:0  
        });
        await  BluetoothEscposPrinter.printText("---------------------------------------------\n\r",{});
        await  BluetoothEscposPrinter.printText("Nombre y firma.\n\r",{});

      }

    }
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);

    await  BluetoothEscposPrinter.printText("\n\r\n\r\n\r",{
      fonttype:0,
      widthtimes:0  
    });





      /*
  await BluetoothEscposPrinter.printColumn(columnWidths,
    [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.RIGHT],
    ["A",'B','C','D'],{
      fonttype:1,
fontType:1,
      widthtimes:0  
    });
      await  BluetoothEscposPrinter.printText("\n\r",{ fonttype:1,
fontType:1, widthtimes:0 });
  */
  /*
  BluetoothEscposPrinter.printText("P-00: " + new Date() + "\r\n", {
      fonttype:0,
      widthtimes:0
  });
  BluetoothEscposPrinter.printText("Prb-11: " + new Date() + "\r\n", {
      fonttype:1,
fontType:1,
      widthtimes:1
  });
  BluetoothEscposPrinter.printText("Prb-12: " + new Date() + "\n", {
      fonttype:1,
fontType:1,
      widthtimes:2
  });
  BluetoothEscposPrinter.printText("Prb-13: " + new Date() + "\n", {
      fonttype:1,
fontType:1,
      widthtimes:3
  });
  BluetoothEscposPrinter.printText("Prb-14: " + new Date() + "\n", {
      fonttype:1,
fontType:1,
      widthtimes:4
  });
  */

}



disconnectDevice(){


  this.setState({
      connecting:false,
      printer:null
  });
  global.printer = null;

 

}

async imprimirTesting(){

  const idVenta = this.state.idVenta;

  const result = await ventaModel.consultarVentaById(idVenta)

  console.log("---> CHECANDO EL OBJETO VEnTA: ",{result});
}

imprimirTicket(iteracion){
  
//  this.imprimirTesting();
  
      console.log("Platform.OS: " , Platform.OS , " iteracion: " , iteracion);

      console.log("imprimirTicket: this.state.printer.address: " , this.state.printer);

      BluetoothManager.isBluetoothEnabled().then((enabled)=> {

            console.log("enabled: " , {enabled} )
/*
            if(enabled == "false" && Platform.OS == "ios"){

              console.log("Favor de activar la conexión Bluetooth.");
              if(iteracion == 0)
                this.imprimirTicket(++iteracion);
                return;
            }
            */



                console.log("Escaneare los Dispositivos") 
              BluetoothManager.enableBluetooth().then(( r )=> {
                
                console.log("enableBluetooth r:" ) ;
                var paired = [];

                if(Platform.OS == "ios"){

                  if(this.state.printer != null){
                    paired.push(this.state.printer); // Solo para completar la información y mantener la conexión con la impresora
                  }                  
                }else{

                  if(r && r.length>0){
                      for(var i=0;i<r.length;i++){
                          try{
                              paired.push(JSON.parse(r[i])); // NEED TO PARSE THE DEVICE INFORMATION
                          }catch(e){
                              //ignore
                          }
                      }
                  }

                }



                        

                    console.log("Dispositivos conectados : " , {paired} , " paired.length: " , paired.length);
                  
                  if(paired.length == 1 && this.state.printer != null){
                      this.setStateDispositivo(paired[0]);
                  }else if(paired.length>0){
                        console.log("hay VARIOS dispositivos bluetooth conectados - global.printer: " , this.state.printer)

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
                 alert(err.message)
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
          console.log("no esta activo el bluetooth...... ", err.message);
          alert(err.message);
      });
}




setStateDispositivo(device){

  this.setState({
      printer:device,
      connecting:true
  },() => { 

    appConfiguration.saveConfigurationKey('global.printer',JSON.stringify(this.state.printer))

    setTimeout(() => {this.conectarDispositivo()},200);
  });

}

conectarDispositivo(attemps = 0){

      console.log("conectarDispositivo attemps: " +  attemps + "address: " + this.state.printer.address);
//            alert("Dispositivo conectado: " +  this.state.printer.name);
      BluetoothManager.connect(this.state.printer.address) // the device address scanned.
      .then((s)=> {
        console.log("Connect - THEN: " , {s});

          this.setState({
              connecting:false
          });
          global.printer = this.state.printer;
//            console.log("BluetoothManager.connect - then: " , {s});
          






          this.imprimir();
//            console.log("IMPRIMIENDO...." ,);

      },(error)=>{
        console.log("Error de conexion: " , error.message);
          if(attemps < 2){
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


  render() {
    return (
<Container style={styles.container}>

        <Header iosBarStyle={"dark-content"} style={globalStyles.header} searchBar rounded>        
          <Left/>
          <Body style={{flex: 1}}>
          <Title style={globalStyles.headerTitle} >Venta exitosa </Title>
          </Body>
          <Right />
        </Header>


        <Content padder>
        <SafeAreaView style={{flex: 1}}>

          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems:'center',marginTop:20}}>
            <Text>La venta se ha guardado exitosamente. </Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems:'center',margin:20}}>
            <Text > Folio: </Text>
            <Text style={{fontWeight:'bold',fontSize:20}}>{this.state.folio}</Text> 
          </View>

          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems:'center'}}>
              <Button primary style={{marginRight:10,backgroundColor: "#568DAE"}}
              onPress={() => {  this.imprimirTicket(0) }}
              >
                  <Icon name='md-print' />
                  <Text>Imprimir</Text>
              </Button>

{ false &&
              <Button primary style={{ marginLeft:10,backgroundColor: "#568DAE"}}>
                  <Icon name='ios-send' />
                  <Text>Enviar</Text>
              </Button>
              }
          </View>
          
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems:'center',marginTop:20}}>
              <Button primary style={{backgroundColor: "#568DAE"}}
              onPress={() => {  this.nuevaVenta() }}
              >
                  <Icon name='ios-add' />
                  <Text>Nueva Venta</Text>
              </Button>
          </View>
          
                {
                    this.state.connecting &&
                    <View style={{alignItems:'center'}}>
                    <Spinner color='#51747F' />
                    <Text>Conectando con {this.state.printer.name}...</Text>

                    <Button primary style={{backgroundColor: "#CC0000"}}
                      onPress={() => {  this.disconnectDevice() }}
                      >
                          <Icon name='ios-close' />
                          <Text>Cancelar</Text>
                      </Button>
                    </View>
                }
                {
                    this.state.printer != null &&
                    <View style={{alignItems:'center'}}>
                    <Button primary style={{backgroundColor: "#ffd700",marginTop:50}}
                      onPress={() => {  this.disconnectDevice() }}
                      >
                          <Icon name='ios-bluetooth' />
                          <Text>Desconectar dispositivo</Text>
                      </Button>
                    </View>
                }      
                </SafeAreaView>            
        </Content>


      </Container>
    );
  }
}

export default Pagada;