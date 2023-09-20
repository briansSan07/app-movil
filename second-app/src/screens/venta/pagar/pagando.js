import React, { Component } from "react";
import { Container, Header, Title, Content, Button, Icon, Form, Body,   Footer,
  Picker, DatePicker, FooterTab, H3, List, ListItem, InputGroup, Separator,  
  Left, Right, Label, Item, H1, View,  Input, Text,  H2 
} from "react-native";
import { Image, TextInput, TouchableOpacity, TouchableHighlight, Animated, Dimensions,Platform,SafeAreaView} from "react-native"
import { SwipeListView } from 'react-native-swipe-list-view';
import moment from "moment";


import NumberFormat from 'react-number-format';
import CatalogosModel from '../../../lib/model/CatalogosModel';
const VentaModel = require ("../../../lib/model/VentaModel");

const ventaModel = new VentaModel();

import styles from "./styles";
import globalStyles from "../../styles";

class Efectivo extends Component {
  constructor(props) {
    super(props);

    const {navigation}= this.props;
    
    global.flatListIndex = 0;
    this.state = {
      
      carrito: navigation.getParam('carrito'),
      metodosPago: [],
      bancos: global.bancos,
      total:0, 
      pagado:0, 
      cambio:0, 
      pagos:[],
      rowMap:null,
      cliente: navigation.getParam('cliente'), 
      generaFactura: navigation.getParam('generaFactura'), 
      ventaSinIva: navigation.getParam('ventaSinIva'), 
      maxDate:null
  
    };

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
      CatalogosModel.consultarBancos()
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
      color: 'red'
    }
   } else {
     return {
      color: 'green'
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

onFechaTBox(fecha,key){
  console.log("onFechaTBox: ",{fecha, key});
  const pagos = this.state.pagos;
  let fechaFormat = moment(fecha).format("DD/MM/YYYY");                
  console.log("fechaFormat: ",fechaFormat);
  const index = pagos.findIndex( pago => pago.key == key);
  pagos[index].autorizacion = fechaFormat;
  this.setState({pagos:pagos})
}

onFechaCreditoTBox(fecha,key){
  console.log("onFechaCreditoTBox: ",{fecha, key});
  const pagos = this.state.pagos;
  let fechaFormat = moment(fecha).format("DD/MM/YYYY");                
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

    const cambioLabel = (this.state.cambio > 0) ? 'Por pagar' : 'Cambio';

    const pagos = this.state.pagos;

        console.log("pagos.length: " , pagos.length);

    return (


      <Container >

        <Header iosBarStyle={"dark-content"} style={globalStyles.header} >
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back"  style={globalStyles.headerButton} />
            </Button>
          </Left>
          <Body style={{flex: 2}}>
          <Title style={globalStyles.headerTitle} >Pago de venta</Title>
          </Body>
          <Right />
        </Header>


      <Content>
        <SafeAreaView padder style={{flex: 1}}>

        <List>
            <ListItem itemHeader first >
              <Body>
                <H1>Total a pagar: </H1>
              </Body>
              <Right style={{flex:1}}>
                <NumberFormat value={this.state.total} displayType={'text'} thousandSeparator={true} prefix={'$'} fixedDecimalScale={true} decimalScale={2} renderText={value => <H2>{value}</H2>} />
              </Right>
            </ListItem>
        </List>

        <SwipeListView
            useFlatList
            data={this.state.pagos}
            key={"slv_0"}
            renderItem={ (data, rowMap) => {
              if(this.state.rowMap == null){
                setTimeout(() => { this.setState({rowMap}) } , 100);
              }
//              console.log("renderItem (data.item.key): " , data);
              return (
              <View key={"v_" + data.item.key}>
              <TouchableHighlight
								onPress={ _ => console.log('You touched me') }
								style={styles.rowFront}
                underlayColor={'#fff'}
                key={"th_" + data.item.key}
							>
                <View key={"vi_" + data.item.key} style={[styles.rowFront,{flex:1,flexDirection:"row",backgroundColor:"#ffffff",}]} >
                
                    <Left>
                      <Text>Forma de pago:</Text>
                    </Left>                    
                    <Right style={{flex:1,backgroundColor:"#ffffff", height:40}}>
                      <InputGroup >
                              <Picker
                                key={"p_" + data.item.key}
                                mode="dropdown"
                                iosIcon={<Icon name="arrow-down" />}
                                placeholder="Selecciona..."
                                placeholderStyle={{ color: "#000000" }}
                                placeholderIconColor="#000000"                                
                                selectedValue={data.item.formaPago}
                                onValueChange={(value) => {this.onFormaPagoChange(value,data.item.key)} }
                              >                                
                                { this.state.metodosPago != null &&
                                  this.state.metodosPago.map((metodoPago) => {
                                      return <Picker.Item label={metodoPago.metodo_pago} value={""+metodoPago.id} key={"pi_"+metodoPago.id} />
                                  })
                                }
                              </Picker>
                      </InputGroup> 
                    </Right>  
                </View>
              </TouchableHighlight>
                      {
                      data.item.formaPago == "1" &&
                      <ListItem style={{backgroundColor:"#ffffff"}} >                      
                        <Body>
                          <Text>Importe recibido:</Text>
                        </Body>
                        <Right style={{flex:1}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            value={data.item.efectivo}
                            onChangeText={(cantidad) => this.onImporteEfectivoTBox(cantidad,data.item.key)}
                            keyboardType={"numeric"}
                          /> 
                        </Right>
                        </ListItem>                      
                      }
                      {
                      (data.item.formaPago == "2" || data.item.formaPago == "3") && // Tarjeta de Crédito || Tarjeta de Débito
                      <View style={{paddingTop:3,paddingBottom:3,backgroundColor:"#ffffff"}}>
                      <ListItem style={{paddingTop:3,paddingBottom:3}}>   
                      <Body>
                          <Text>No. de autorización:</Text>
                        </Body>
                        <Right style={{flex:1}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            value={data.item.autorizacion}
                            onChangeText={(autorizacion) => this.onAutorizacionTBox(autorizacion,data.item.key)}
                            keyboardType={"numeric"}
                          /> 
                        </Right>
                      </ListItem>                      
                      <ListItem style={{paddingTop:5,paddingBottom:5}}>
                      <Body>
                          <Text>Importe pagado:</Text>
                        </Body>
                        <Right style={{flex:1}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            value={data.item.importe}
                            onChangeText={(cantidad) => this.onImportePagadoTBox(cantidad,data.item.key)}
                            keyboardType={"numeric"}
                          /> 
                        </Right>
                        </ListItem>
                      </View>
                      }
                      {
                      data.item.formaPago == "4" && // Cheque
                      <View style={{paddingTop:3,paddingBottom:3,backgroundColor:"#ffffff"}}>
                      <ListItem style={{paddingTop:3,paddingBottom:3}}>   
                      <Body>
                          <Text>Banco:</Text>
                        </Body>
                        <Right style={{flex:1}}>
                        <InputGroup >
                        <Picker
                          mode="dropdown"
                          iosIcon={<Icon name="arrow-down" />}
                          placeholder="Selecciona..."
                          placeholderStyle={{ color: "#bbbbbb" }}
                          placeholderIconColor="#007aff"
                          style={{ width: 200 }}
                          selectedValue={data.item.idBanco}
                          onValueChange={(value) => {this.onBancoChange(value,data.item.key)} }
                        >
                          {
                            this.state.bancos.map((banco) => { 
                              return <Picker.Item label={banco.nombre_corto} value={""+banco.id} key={""+banco.id} /> 
                          })
                          }
                        </Picker>
                        </InputGroup>
                        </Right>
                      </ListItem>    
                      <ListItem style={{paddingTop:3,paddingBottom:3}}>   
                      <Body>
                          <Text>No. de cheque:</Text>
                        </Body>
                        <Right style={{flex:1}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            onChangeText={(autorizacion) => this.onAutorizacionTBox(autorizacion,data.item.key)}
                            keyboardType={"numeric"}
                          /> 
                        </Right>
                      </ListItem>                      
                      <ListItem style={{paddingTop:5,paddingBottom:5}}>
                      <Body>
                          <Text>Importe del cheque:</Text>
                        </Body>
                        <Right style={{flex:1}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            onChangeText={(cantidad) => this.onImportePagadoTBox(cantidad,data.item.key)}
                            value={data.item.importe}
                            keyboardType={"numeric"}
                          /> 
                        </Right>
                        </ListItem>
                      </View>
                      }
                      {
                      data.item.formaPago == "5" && // Credito
                      <View style={{paddingTop:3,paddingBottom:3,backgroundColor:"#ffffff"}}>
                      <ListItem style={{backgroundColor:"#ffffff"}}>
                      <Body>
                          <Text>Importe a crédito:</Text>
                        </Body>
                        <Right style={{flex:1}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 40, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            onChangeText={(cantidad) => this.onImportePagadoTBox(cantidad,data.item.key)}
                            value={data.item.importe}
                            keyboardType={"numeric"}
                          /> 
                        </Right>
                        </ListItem>
                        <ListItem style={{paddingTop:3,paddingBottom:3}}>   
                        <Body>
                            <Text>Fecha programada de pago:</Text>
                          </Body>
                          <Right style={{flex:1}}>
                          <DatePicker
                            defaultDate={new Date()}
                            minimumDate={new Date()}
                            maximumDate={this.state.maxCreditoDate}
                            locale={"es"}
                            timeZoneOffsetInMinutes={undefined}
                            modalTransparent={false}
                            animationType={"fade"}
                            androidMode={"default"}
                            placeHolderText="Selecciona una fecha"
                            textStyle={{ color: "green" }}
                            placeHolderTextStyle={{ color: "#bbbbbb" }}
                            onDateChange={(fecha) => this.onFechaCreditoTBox(fecha,data.item.key)}
                            disabled={false}
                          />

                          </Right>
                        </ListItem> 
                        </View>
                      }
                      {
                      data.item.formaPago == "7" && // Transferencia
                      <View style={{paddingTop:3,paddingBottom:3,backgroundColor:"#ffffff"}}>
                      <ListItem style={{paddingTop:3,paddingBottom:3}}>   
                      <Body>
                          <Text>Fecha de transferencia:</Text>
                        </Body>
                        <Right style={{flex:1}}>
                        <DatePicker
                          defaultDate={new Date()}
                          minimumDate={new Date()}
                          maximumDate={this.state.maxDate}
                          locale={"es"}
                          timeZoneOffsetInMinutes={undefined}
                          modalTransparent={false}
                          animationType={"fade"}
                          androidMode={"default"}
                          placeHolderText="Selecciona una fecha"
                          textStyle={{ color: "green" }}
                          placeHolderTextStyle={{ color: "#bbbbbb" }}
                          onDateChange={(fecha) => this.onFechaTBox(fecha,data.item.key)}
                          disabled={false}
                        />

                        </Right>
                      </ListItem>                      
                      <ListItem style={{paddingTop:5,paddingBottom:5}}>
                      <Body>
                          <Text>Importe:</Text>
                        </Body>
                        <Right style={{flex:1}}>
                          <TextInput   
                            placeholder=""
                            placeholderTextColor="#000000"
                            style={{ width:100 ,height: 30, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                            onChangeText={(cantidad) => this.onImportePagadoTBox(cantidad,data.item.key)}
                            value={data.item.importe}
                            keyboardType={"numeric"}
                          /> 
                        </Right>
                        </ListItem>
                      </View>
                     
                      }    



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
						//leftOpenValue={75}
						rightOpenValue={-150}
						previewRowKey={'0'}
						previewOpenValue={-40}
            previewOpenDelay={3000}
            disableRightSwipe={true}
            swipeToClosePercent={50}
   
            onRowDidOpen={this.onRowDidOpen}
            onSwipeValueChange={this.onSwipeValueChange}
                
//            keyExtractor={ (item) => {const index = global.flatListIndex++; return index.toString(); }}
            


        />

          <List>
            <ListItem footer bordered>
              <Body>
                <H2>{cambioLabel}: </H2>
              </Body>
              <Right style={{flex:1}}>
                <NumberFormat value={Math.abs(this.state.cambio)} displayType={'text'} thousandSeparator={true} prefix={'$'} fixedDecimalScale={true} decimalScale={2} renderText={value => <H2 style={this.getCambioStyle(this.state.cambio)}>{value}</H2>} />
              </Right>
            </ListItem>
          </List>
        </SafeAreaView>

      </Content>

        <Footer>
          <FooterTab style={{backgroundColor: "#51747F"}}>
            
            <Button onPress={() => this.guardarVenta()}
            style={{alignContent:"center"}}
            disabled={this.state.cambio>0 || global.onSavingSale}
            >
            
            <H3 style={{color: 'white'}}>Guardar</H3>
          </Button>
          <Button 
            activeOpacity={0.7}
            disabled={this.state.cambio<=0}
            onPress={() => this.agregarOtroPago()}
            >

              <Icon style={{color: 'white'}} name="md-add" />
              
              <Text style={{color: 'white'}}  > 
                Agregar forma de pago
              </Text>

          </Button>     
          </FooterTab>
       
        </Footer>

      </Container>
    );
  }
}

export default Efectivo;