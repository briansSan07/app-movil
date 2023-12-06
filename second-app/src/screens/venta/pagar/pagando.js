import React, { Component, useState } from "react";
dayjs.locale('es');
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, TextInput, TouchableOpacity, Animated, Dimensions,Platform,SafeAreaView, StyleSheet} from "react-native"
import { SwipeListView } from 'react-native-swipe-list-view';
import { NumericFormat } from 'react-number-format';
import moment from "moment";

import Constants from 'expo-constants';
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const LocalStorage = require ('../../../lib/database/LocalStorage');
const ConcradServer = require ('../../../lib/remote/ConcradServer');

const concradServer = new ConcradServer();
const localStorage = new LocalStorage();

import  DateTimePicker from 'react-native-ui-datepicker'
import dayjs from "dayjs";
const VentaModel = require ("../../../lib/model/VentaModel");
const CatalogosModel = require ("../../../lib/model/CatalogosModel");
const ventaModel = new VentaModel();
const catalogosModel = new CatalogosModel();
const Separator = () => <View style={styles.separator} />;


class Pagando extends Component {
  constructor(props) {
    super(props);

    
    global.flatListIndex = 0;
    this.state = {
      fechaSeleccionada: new Date(),
      carrito: this.props.route.params.carrito,
      metodosPago: [],
      bancos: global.bancos,
      total:0, 
      pagado:0, 
      cambio:0, 
      pagos:[],
      rowMap:null,
      cliente: this.props.route.params.cliente, 
      generaFactura: this.props.route.params.generaFactura, 
      ventaSinIva: this.props.route.params.ventaSinIva, 
      date: new Date()
    };

    this.state.fechaSeleccionada.setDate(this.state.fechaSeleccionada.getDate()-1);


//    console.log("global.carrito en EFECTIVO: " , global.carrito);
//    console.log("global.pagos en EFECTIVO: " , global.pagos);
//    console.log("global.metodosPago en EFECTIVO: " , global.metodosPago);
    
    this.rowSwipeAnimatedValues = {};
		Array(20).fill('').forEach((_, i) => {
			this.rowSwipeAnimatedValues[`${i}`] = new Animated.Value(0);
		});
  }


  consultaBancos(){
    if (global.bancos == null || global.bancos == undefined) {
      catalogosModel.consultarBancos()
      .then((result) => {
        console.log("Resultado de consultarBancos:" , result.bancosList.length);
        global.bancos = result.bancosList;
        this.setState({bancos:global.bancos});
      })
      .catch((error) => {
        console.log('error al consultarBancos: ', error.message);
      });
    }
  }  

  agregarOtroPago(){

console.log("agregarOtroPago");


    const nuevoPago = {
      key: "" + global.flatListIndex++,
      importe:null,
      formaPago: (Platform.OS === 'android') ? "1" : null,
      efectivo:null,
      cambio:null,
      idBanco:null,
      tipoTarjeta:null,
      autorizacion:null,
      ultimosDigitos:null,
      diasCredito:null

    };

    this.setState({
      pagos: [...this.state.pagos,nuevoPago]
    });
  }


  guardarVenta(){

    // se ha capturado el total del pago
    if(this.state.cambio <= 0){
      global.onSavingSale = true;

console.log("-GUARDARVENTA- : " ,{
  "this.state.ventaSinIva":this.state.ventaSinIva,
  "this.state.generaFactura":this.state.generaFactura,
  "this.state.cliente":this.state.cliente,
  "global.sourceId": global.sourceId}
  );
  



      ventaModel.salvarVenta(
        this.state.ventaSinIva,
        this.state.generaFactura,
        this.state.cliente,
        this.state.carrito,

        Math.round(this.state.subtotal *100)/100,
        Math.round(this.state.descuento *100)/100,
        Math.round(this.state.iva *100)/100,
        Math.round(this.state.ieps *100)/100,

        Math.round(this.state.total*100)/100,
        Math.round(this.state.pagado*100)/100,
        Math.round(this.state.cambio*100)/100,
        this.state.pagos
        )
      .then((result) => {

        console.log("Resultado de SalvarVenta:" , result);
        
        global.onSavingSale = false;

        this.props.navigation.navigate("Pagada",result);

      })
      .catch((error) => {

        console.log("168");
        console.log('error al salvarVenta: ', error.message);
        global.onSavingSale = false;
        console.log("171");

//        this.setState({usuarioValido: false});

      });
    }

    //carrito, total, pagado, cambio, id_metodo_pago, id_banco, tipo_tarjeta, autorizacion, ultimos_digitos, dias_credito
  }


  calculandoCarrito(){
  
    const carrito = this.state.carrito;

    let pagado=0;
    let totalAPagar = 0;
    let count = 0;
    let subtotal = 0;
    let total = 0;
    let iva = 0;
    let ieps = 0;

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
      totalAPagar = subtotal;
      iva = 0;
      ieps = 0;
    }else{
      totalAPagar = total;
    }

    console.log("------ CONSOLIDADO: ",{count, subtotal, pagado, iva, ieps, total, totalAPagar });

    this.setState({
      count: count,
      total: totalAPagar,
      pagado: pagado,
      subtotal:subtotal,
      descuento:0 , 
      iva:iva , 
      ieps:ieps ,
      cambio: (totalAPagar - pagado),
    })
  }

  componentDidMount(){

    console.log("**** componentDidMount");
    const date = moment().add(7,'days');
    this.setState({maxDate:date.toDate()});

    console.log("**cliente: " , this.state.cliente);
    
    
    if(this.state.cliente != null && this.state.cliente.has_credito){

      const date = moment().add(this.state.cliente.dias_credito,'days');
      this.setState({maxCreditoDate:date.toDate()});
      const mp = global.metodosPago;
      this.setState({metodosPago,mp } , () => { setTimeout(() => {console.log("**metodosPago completo: " , this.state.metodosPago)},300); });
  
    }else{
      const mp = global.metodosPago;
      let metodosSinCredito = mp.filter(function(metodoPago) {
        return (metodoPago.id != 5);
      });

      console.log({metodosSinCredito});
      this.setState({metodosPago,metodosSinCredito },() => {   setTimeout(() => {console.log("**metodosPago sin credito: " , this.state.metodosPago)},300); });
    }

    this.consultaBancos();
    this.calculandoCarrito();

    this.agregarOtroPago();

  }


getCambioStyle(cambio){

  if(cambio > 0) {
    return {
      color: 'red',
      fontSize: 20
    }
   } else {
     return {
      color: 'green',
      fontSize: 20
     }
   }

}


onFormaPagoChange(value, key) {
  console.log("onFormaPagoChange: ",{value, key});
  const pagos = this.state.pagos;
  const index = pagos.findIndex( pago => pago.key == key);
  pagos[index].formaPago = value;
  pagos[index].importe = "";
  if(pagos[index].formaPago == "4"){
    pagos[index].idBanco = ""+this.state.bancos[0].id;
  }
  if(pagos[index].formaPago == "5"){ // a credito
    pagos[index].importe = ""+this.state.total;
  }

  console.log({pagos});
  this.setState({pagos:pagos},() => {this.calcularTotales()})
}

onBancoChange(value, key) {
  console.log("onBancoChange: ",{value, key});
  const pagos = this.state.pagos;
  const index = pagos.findIndex( pago => pago.key == key);
  pagos[index].idBanco = value;
  this.setState({pagos:pagos},() => this.calcularTotales());
}

onImporteEfectivoTBox(cantidad,key){
  console.log("onImporteEfectivoTBox: ",{cantidad, key});
  const pagos = this.state.pagos;
  const index = pagos.findIndex( pago => pago.key == key);
  
  if(cantidad != ""){
//    pagos[index].importe  = parseFloat(cantidad);
    pagos[index].efectivo = parseFloat(cantidad);
  }else{
//    pagos[index].importe = "";
    pagos[index].efectivo = "";
  }
  this.setState({pagos:pagos},() => {this.calcularTotales()})
}

onImportePagadoTBox(cantidad,key){
  console.log("onImportePagadoTBox: ",{cantidad, key});
  const pagos = this.state.pagos;
  const index = pagos.findIndex( pago => pago.key == key);
  
  if(cantidad != ""){
    pagos[index].importe = parseFloat(cantidad);
  }else{
    pagos[index].importe = "";
  }
  this.setState({pagos:pagos},() => {this.calcularTotales()})
}

onAutorizacionTBox(autorizacion,key){
  console.log("onAutorizacionTBox: ",{autorizacion, key});
  const pagos = this.state.pagos;
  const index = pagos.findIndex( pago => pago.key == key);
  pagos[index].autorizacion = autorizacion;
  this.setState({pagos:pagos})
}

onFechaTBox (fecha,key) {
  
  console.log("onFechaTBox: ",{fecha, key});
  const pagos = this.state.pagos;
  let fechaFormat = dayjs(fecha).format("DD/MM/YYYY");             
  console.log("fechaFormat: ",fechaFormat);
  const index = pagos.findIndex( pago => pago.key == key);
  pagos[index].autorizacion = fechaFormat;
  this.setState({pagos:pagos})
  
}

onFechaCreditoTBox(fecha,key){
  
  console.log("onFechaCreditoTBox: ",{fecha, key});
  const pagos = this.state.pagos;
  let fechaFormat = dayjs(fecha).format("DD/MM/YYYY");                
  console.log("fechaFormat: ",fechaFormat);
  const index = pagos.findIndex( pago => pago.key == key);
  pagos[index].autorizacion = fechaFormat;
  this.setState({pagos:pagos})

}


calcularTotales(){

  const pagos = this.state.pagos;
  let pagado = 0;
  const total = Math.round(this.state.total*100)/100;
  console.log("calcularTotales");
  for(let i=0; i< pagos.length;i++){

    let importe = 0;
    if(pagos[i].formaPago == "1"){
      importe = pagos[i].efectivo;
    }else{
      importe = pagos[i].importe;
    }

    console.log("total: " , total);
    console.log("importe: " , {importe});
    if(importe == '') {
      importe = 0;
    }

    pagado += importe;
    if(pagos[i].formaPago == "1"){
      pagos[i].cambio = Math.round((total - pagado) *1000)/1000;
    }    
  }  

  pagado  = Math.round((pagado) *1000)/1000;
  const cambio = Math.round((total - pagado) *1000)/1000;

  this.setState({
    pagos: pagos,
    pagado: pagado, 
    cambio:cambio 
  })
}



closeRow(rowMap, rowKey) {
//  console.log("closeRow: " , {rowMap, rowKey} );
  if (rowMap[rowKey]) {
    rowMap[rowKey].closeRow();
  }
}

deleteRow(rowMap, rowKey) {
  console.log("deleteRow: " , {rowMap, rowKey});
  this.closeRow(rowMap, rowKey);
		const newData = [...this.state.pagos];
		const prevIndex = this.state.pagos.findIndex(item => item.key == rowKey);
		newData.splice(prevIndex, 1);
    this.setState({pagos: newData},() => {this.calcularTotales();});
    
}

deleteSectionRow(rowMap, rowKey) {
  console.log("deleteSectionRow");
  this.closeRow(rowMap, rowKey);
}

onRowDidOpen = (rowKey, rowMap) => {
  console.log('This row opened', rowKey);
  this.setState({rowMap});
//  this.closeRow(rowMap, rowKey);
}

onSwipeValueChange = (swipeData) => {
  const { key, value } = swipeData;
//  console.log("onSwipeValueChange");//,swipeData , {rowMap,"window-width": Dimensions.get('window').width} );
  if(Math.abs(value) == Dimensions.get('window').width){
    const rowMap = this.state.rowMap;
  //  console.log("rowMap: " , rowMap);
    this.closeRow(rowMap, key);
  }else{
    this.rowSwipeAnimatedValues[key].setValue(Math.abs(value));
  }
}



  render() {

    const cambioLabel = (this.state.cambio > 0) ? 'Por pagar' : (this.state.cambio === 0) ? 'Sin cambio' : 'Cambio';

    const pagos = this.state.pagos;

        console.log("pagos.length: " , pagos.length);

    return (


      <View style={{flex:1}}>
        <View  style={{ 
          paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight , 
          backgroundColor:'#f6f6f6',
          flex: 0,
          color:'#000000',
          marginBottom: Platform.OS === 'ios' ? 0 : 0,
          height:90,
          paddingTop: 30,
          flexDirection: 'row',
          alignItems: 'center',
          }}>
          <View style={{flex: 1, paddingLeft:10}}>
            <TouchableOpacity
              style={{flex: 0}}
              onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" style={{color:'#2496bc', fontSize: 30}} />
            </TouchableOpacity>
          </View>
          <View style={{flex: 2, alignItems:'flex-start', paddingLeft:30}}>
            <Text style={globalStyles.headerTitle} >Pago de venta</Text>
          </View>
        </View>



      <View style={{flex:1, backgroundColor:'white'}}>
        <SafeAreaView  style={{flex: 1}}>

        <View style={{flex:0, flexDirection:'row', backgroundColor:'white', paddingTop:10}}>
            
              <View style={{flex:2, paddingLeft:10}}>
                <Text style={{fontSize:20}}>Total a pagar: </Text>
              </View>
              <View style={{flex:1, alignItems:'flex-end', paddingRight:10}}>
               <NumericFormat
                value={Math.abs(this.state.total)}
                displayType={'text'}
                thousandSeparator={true}
                prefix={'$'}
                fixedDecimalScale={true}
                decimalScale={2}
                renderText={value=> 
                  <Text style={styles.h3}>{value}</Text>
                } />
              </View>
            
        </View>
        <Separator/>
        <SwipeListView
            useFlatList
            data={this.state.pagos}
            key={"slv_0"}
            renderItem={ (data, rowMap) => {
              if(this.state.rowMap == null){
                setTimeout(() => { this.setState({rowMap}) } , 100);
              }
              console.log("renderItem (data.item.key): " , data.item.formaPago);
              return (
              <View key={"v_" + data.item.key}>
              <TouchableOpacity
								onPress={ _ => console.log('You touched me') }
								style={styles.rowFront}
                underlayColor={'#fff'}
                key={"th_" + data.item.key}
							>
                <View key={"vi_" + data.item.key} style={[styles.rowFront,{flexDirection:"row",backgroundColor:"#ffffff",}]} >
                
                    <View style={{flex:1}}>
                      <Text>Forma de pago:</Text>
                    </View>                    
                    <View style={{flex:1,backgroundColor:"#ffffff", height:60}}>
                              <Picker
                                key={"p_" + data.item.key}
                                mode="dropdown"

                                placeholder="Selecciona..."
                                style={{ color: "#000000"}}                              
                                selectedValue={data.item.formaPago}
                                onValueChange={(value) => {this.onFormaPagoChange(value,data.item.key)} }
                              >                                
                                { this.state.metodosPago != null &&
                                  this.state.metodosPago.map((metodoPago) => {
                                      return <Picker.Item label={metodoPago.metodo_pago} value={""+metodoPago.id} key={"pi_"+metodoPago.id} />
                                  })
                                }


                              </Picker>
                    </View>  
                </View>
              </TouchableOpacity>
              
                      {
                      data.item.formaPago == "1" && (
                      
                      <View style={{backgroundColor:"#ffffff", flexDirection: 'row', paddingTop:3, paddingBottom:10}} >    
                                        
                        <View style={{flex:1, paddingLeft: 15}}>
                          <Text>Importe recibido:</Text>
                        </View>
                        <View style={{flex:1, alignItems:'flex-end', paddingRight:10}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            value={data.item.efectivo}
                            onChangeText={(cantidad) => this.onImporteEfectivoTBox(cantidad,data.item.key)}
                            keyboardType={"numeric"}
                          /> 
                        </View>
                        <Separator/>  
                        </View>
             
                      )}
                      {
                      (data.item.formaPago == "2" || data.item.formaPago == "3") && (
                      <View style={{paddingTop:3,paddingBottom:3,backgroundColor:"#ffffff"}}>
                      <View style={{paddingTop:3,paddingBottom:3, flexDirection:'row'}}>   
                      <View style={{flex:2, paddingLeft:10}}>
                          <Text>No. de autorización:</Text>
                        </View>
                        <View style={{flex:1, alignItems:'flex-end', marginRight:10}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            value={data.item.autorizacion}
                            onChangeText={(autorizacion) => this.onAutorizacionTBox(autorizacion,data.item.key)}
                            keyboardType={"numeric"}
                          /> 
                        </View>
                      </View>    
                      <Separator/>                  
                      <View style={{paddingTop:5,paddingBottom:5, flexDirection:'row'}}>
                      <View style={{flex:2, paddingLeft:10}}>
                          <Text>Importe pagado:</Text>
                        </View>
                        <View style={{flex:1,  alignItems:'flex-end', marginRight:10}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            value={data.item.importe}
                            onChangeText={(cantidad) => this.onImportePagadoTBox(cantidad,data.item.key)}
                            keyboardType={"numeric"}
                          /> 
                        </View>
                        </View>
                        <Separator/>   
                      </View>
                      )}
                      {
                      data.item.formaPago == "4" && (
                      <View style={{paddingTop:3,paddingBottom:3,backgroundColor:"#ffffff"}}>
                      <View style={[styles.rowFront,{flexDirection:"row",backgroundColor:"#ffffff",}]}>   
                      <View style={{flex:2, paddingLeft:10}}>
                          <Text>Banco:</Text>
                        </View>
                        <View style={{flex:1, alignItems:'flex-end', flex:1,backgroundColor:"#ffffff", height:60}}>
                        
                        <Picker
                          mode="dropdown"
                          
                          placeholder="Selecciona..."
                          
                          style={{color: "black", width:200, alignItems:'flex-end' }}
                          selectedValue={data.item.idBanco}
                          onValueChange={(value) => {this.onBancoChange(value,data.item.key)} }
                        >
                          {
                            this.state.bancos.map((banco) => { 
                              return <Picker.Item label={banco.nombre_corto} value={""+banco.id} key={""+banco.id} /> 
                          })
                          }

                        </Picker>                 
                        </View>
                        
                      </View>    
                      <Separator/>  
                      <View style={{paddingTop:3,paddingBottom:3, flexDirection: 'row'}}>   
                      <View style={{flex:2, paddingLeft:15}}>
                          <Text>No. de cheque:</Text>
                        </View>
                        <View style={{flex:1, alignItems:'flex-end', paddingRight:10}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            onChangeText={(autorizacion) => this.onAutorizacionTBox(autorizacion,data.item.key)}
                            keyboardType={"numeric"}
                          /> 
                        </View>
                      </View>   
                      <Separator/>                     
                      <View style={{paddingTop:5,paddingBottom:5, flexDirection: 'row'}}>
                      <View style={{flex:2, paddingLeft:15}}>
                          <Text>Importe del cheque:</Text>
                        </View>
                        <View style={{flex:1, alignItems:'flex-end', paddingRight:10}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            onChangeText={(cantidad) => this.onImportePagadoTBox(cantidad,data.item.key)}
                            value={data.item.importe}
                            keyboardType={"numeric"}
                          /> 
                        </View>
                        </View>
                        <Separator/>  
                      </View>
                      )}
                      {
                      data.item.formaPago == "5" && (
                      <View style={{paddingTop:3,paddingBottom:3,backgroundColor:"#ffffff"}}>
                      
                        <View style={{paddingTop:3,paddingBottom:3}}>   
                        <View style={{flex:2, paddingLeft:10}}>
                            <Text>Fecha programada de pago:   </Text>
                          </View>
                          <View style={{flex:1}}>
                            
                          <DateTimePicker
                          style={{width:200}}
                          value={this.state.date}
                          mode="date"
                          minimumDate={this.state.fechaSeleccionada}
                          maximumDate={this.state.maxCreditoDate}
                          format="dd-mm-yyyy"

                          locale={'es'}
                        
                          
                          placeHolderText="Selecciona una fecha"
                          textStyle={{ color: "green" }}
                          placeHolderTextStyle={{ color: "#bbbbbb" }}
                          onValueChange={(fecha) => this.onFechaCreditoTBox(fecha,data.item.key)}
                         
                        />
                          </View>
                        </View> 
                        <View style={{paddingTop:5,paddingBottom:10, flexDirection:'row'}}>
                      <View style={{flex:2, paddingLeft:10}}>
                          <Text>Importe a crédito:</Text>
                        </View>
                        <View style={{flex:1}}>
                          <TextInput   
                            placeholder=" "
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 40, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            onChangeText={(cantidad) => this.onImportePagadoTBox(cantidad,data.item.key)}
                            value={data.item.importe}
                            keyboardType={"numeric"}
                          /> 
                        </View>
                        </View>
                        </View>
                      )}
                      {
                      data.item.formaPago == "7" && (
                      <View style={{paddingTop:3,paddingBottom:3,backgroundColor:"#ffffff"}}>
                      <View style={{paddingTop:3,paddingBottom:3}}>   
                      <View style={{flex:2, paddingLeft:10}}>
                          <Text>Fecha de transferencia:</Text>
                        </View>
                        <View style={{flex:5}}>
                        <DateTimePicker
                          style={{width:200}}
                          value={this.state.date}
                          mode="date"
                          minimumDate={this.state.fechaSeleccionada}
                          maximumDate={this.state.maxDate}
                          format="dd-mm-yyyy"

                          locale={"es"}
                        
                          
                          placeHolderText="Selecciona una fecha"
                          textStyle={{ color: "green" }}
                          placeHolderTextStyle={{ color: "#bbbbbb" }}
                          onValueChange={(fecha) => this.onFechaTBox(fecha,data.item.key)}
                         
                        />

                        </View>
                      </View>                      
                      <View style={{paddingTop:5,paddingBottom:10, flexDirection:'row'}}>
                      <View style={{flex:1, paddingLeft:10}}>
                          <Text>Importe:</Text>
                        </View>
                        <View style={{flex:1, alignItems:'flex-end', paddingRight: 10}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            onChangeText={(cantidad) => this.onImportePagadoTBox(cantidad,data.item.key)}
                            value={data.item.importe}
                            keyboardType={"numeric"}
                          /> 
                        </View>
                        </View>
                      </View>
                     
                      )}    



              </View>  
              );
            }}

						renderHiddenItem={ (data, rowMap) => (
							<View key={"shi_" + data.item.key} style={styles.rowBack}>
								
								<TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={ _ => this.closeRow(rowMap, data.item.key) }>
									<Text style={styles.backTextWhite}>Cerrar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={ _ => this.deleteRow(rowMap, data.item.key) }>
									<Text style={styles.backTextWhite}>Eliminar</Text>                  
								</TouchableOpacity>
							</View>
						)}
						renderSectionHeader={({section}) => <Text>{section.title}</Text>}
						rightOpenValue={-150}
						previewRowKey={'0'}
						previewOpenValue={-40}
            previewOpenDelay={3000}
            disableRightSwipe={true}
            swipeToClosePercent={50}
   
            onRowDidOpen={this.onRowDidOpen}
            onSwipeValueChange={this.onSwipeValueChange}
                
            


        />
      <Separator/>

        
            <View style={{flex:1, flexDirection: 'row'}}>
              <View style={{flex:2, paddingLeft:10}}>
                <Text style={{fontSize:20}}>{cambioLabel}: </Text>
              </View>
              <View style={{flex:1, alignItems:'flex-end', paddingRight:10}}>
                <NumericFormat
                value={Math.abs(this.state.cambio)}
                displayType={'text'}
                thousandSeparator={true}
                prefix={'$'}
                fixedDecimalScale={true}
                decimalScale={2}
                renderText={value=> 
                  <Text style={this.getCambioStyle(this.state.cambio)}>{value}</Text>
                } />
                
              </View>
              
            </View>
             
           
            
           
        </SafeAreaView>
      
      </View>

        <View  style={{backgroundColor: '#51747F',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center', bottom:0, flex:0 }}>
          <View style={{flex:1}}>
            <TouchableOpacity
                
                style={ [styles.footerButton, styles.confirmButton]}
                onPress={() => this.guardarVenta()}
              >
                <View style ={{position: 'relative'}}>
                <Text style={{ color: 'white'}} >
                  Guardar  </Text>
                </View>
                
            </TouchableOpacity>
          </View>
          <View style={{flex:1}}>
            <TouchableOpacity
            
              style={styles.footerButton}
              disabled={this.state.cambio<=0}
              onPress={() => this.agregarOtroPago()}
                
            >
              <View style ={{position: 'relative'}}>
              <Icon name="md-add" style={{ color: 'white', fontSize: 25 }} />
              </View>
              <Text style={{ color: 'white' }}>Agregar forma de pago</Text>
              </TouchableOpacity>
            </View>
        </View>


      </View>
    );
  }
}


export default Pagando;

const styles = StyleSheet.create({

  container: {
		backgroundColor: 'white',
		flex: 1
	},
	standalone: {
		marginTop: 30,
		marginBottom: 30,
	},
	standaloneRowFront: {
		alignItems: 'center',
		backgroundColor: '#CCC',
		justifyContent: 'center',
		height: 50,
	},
	standaloneRowBack: {
		alignItems: 'center',
		backgroundColor: '#8BC645',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 15
	},
	backTextWhite: {
		color: '#FFF'
	},
	rowFront: {
		alignItems: 'center',
//		backgroundColor: '#CCC',
//		borderBottomColor: 'black',
		borderBottomWidth: 0,
		justifyContent: 'center',
		height: 40,
	},
	rowBack: {
		alignItems: 'center',
//		backgroundColor: '#DDD',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
	},
	backRightBtn: {
		alignItems: 'center',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		width: 75
	},
	backRightBtnLeft: {
		backgroundColor: '#2496bc',
		right: 75
	},
	backRightBtnRight: {
		backgroundColor: '#ee0000',
		right: 0
	},
	controls: {
		alignItems: 'center',
		marginBottom: 30
	},
	switchContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 5
	},
	switch: {
		alignItems: 'center',
		borderWidth: 0,
		borderColor: 'black',
		paddingVertical: 10,
		width: Dimensions.get('window').width / 4,
	},
	trash: {
		height: 25,
		width: 25,
	},
  h3: {
    color: 'black',
    fontSize: 20,
  },
  separator:{
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  text: {
    alignSelf: "center",
    marginBottom: 7
  },
  mb: {
    marginBottom: 15
  },
  footerButton: {
    flex:0,
    alignItems: 'center',
    paddingVertical: 10,
  },
  confirmButton: {
    paddingTop: 10,
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
  textAlign:'left',
  fontWeight: 'bold'
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