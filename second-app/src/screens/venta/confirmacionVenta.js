import React, { Component } from "react";
import { Text, View, Toast, Switch, Dimensions, StyleSheet, TouchableOpacity, 
  FlatList, Image, TextInput,SafeAreaView, Modal, Platform } from "react-native";
import {NumericFormat} from 'react-number-format';
import Icon from 'react-native-vector-icons/Ionicons';
import Constants from 'expo-constants';
import { Button } from "@rneui/themed";
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;
const Separator = () => <View style={styles.separator} />;


var inicial=" ";

class ConfirmacionVenta extends Component {
  constructor(props) {
    super(props);
    

//    carritoCompras: , 

    this.state = {
    carrito: this.props.route.params.carrito,
    cliente: this.props.route.params.cliente,
    generaFactura: this.props.route.params.generaFactura,
    ventaSinIva: this.props.route.params.ventaSinIva,
    count: 0, 
    suma:0, 
    subtotal:0 , 
    descuento:0 , 
    iva:0 , 
    ieps:0 , 
    suma:0 , 

   


    isLoading:true, 
    showToast: false,
    displayMetodoPago:false,
    selectedImage: null
  };
    
  }
  
  componentDidMount(){

    this.calculandoCarrito();
    this.setState({    isLoading:false    });
    
  }

  onChangeTBox(producto, cantidad){

    let carritoCompras = [...this.state.carrito];
    if(cantidad===" "||cantidad===undefined||cantidad === null|| cantidad==="NaN"){
       for(let i=0;i<this.state.carrito.length;i++){
        if(this.state.carrito[i].id===producto.idProducto){
         this.state.carrito.splice(i, 1)
         //console.log("state:"+this.state.carrito.length)
        }
      }
      for (let i = 0; i < carritoCompras.length; i++) {
        if (carritoCompras[i].id === producto.id) {
            carritoCompras.splice(i, 1)
            //console.log("Global:" + carritoCompras)
        }
    }
      Toast.show({
        text: "Se Elimino de su Carrito",
        buttonText: "Okay"
      })
      console.log("carritoCompras: " , {carritoCompras});
    }else{
    let nuevoProductoParaCarrito = this.state.carrito.filter (function (item) {return item.id === producto.id; })
      nuevoProductoParaCarrito[0].cantidad = parseInt(cantidad);
    }
    this.setState({carrito: carritoCompras},() => {this.calculandoCarrito()});
  }

  sumaUno(producto) {
        let carritoCompras = [...this.state.carrito];
        let nuevoProductoParaCarrito = carritoCompras.filter (function (item) {return item.id === producto.id; })
        if (nuevoProductoParaCarrito.length > 0) {
        nuevoProductoParaCarrito[0].cantidad ++;
        }
        this.setState({carrito: carritoCompras},() => {this.calculandoCarrito()});
    }

 
    menosUno(producto) {
      let carritoCompras = [...this.state.carrito];
      let nuevoProductoParaCarrito = carritoCompras.filter(function(item) {return item.id === producto.id;})
      if (nuevoProductoParaCarrito.length > 0) {
          nuevoProductoParaCarrito[0].cantidad--;
          if (nuevoProductoParaCarrito[0].cantidad === 0) {
              for (let i = 0; i < this.state.carrito.length; i++) {
                  if (this.state.carrito[i].id === producto.id) {
                      this.state.carrito.splice(i, 1)
                      //console.log("state:" + this.state.carrito)
                  }
              }
              for (let i = 0; i < carritoCompras.length; i++) {
                if (carritoCompras[i].id === producto.id) {
                    carritoCompras.splice(i, 1)
                    //console.log("Global:" + carritoCompras)
                }
            }
            //() =>
              Toast.show({
                text: "Se Elimino de su Carrito",
                buttonText: "Okay"
              })
              this.setState({carrito: carritoCompras}, () => {this.calculandoCarrito()});
          } else {
              this.setState({carrito: carritoCompras}, () => {this.calculandoCarrito()});
          }
      }
  }

  calculandoCarrito(){
  
      const carrito = this.state.carrito;
  
      let suma=0;
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
        suma = subtotal;
        iva = 0;
        ieps = 0;
      }else{
        suma = total;
      }
  
      console.log("------ CONSOLIDADO: ",{count, subtotal, suma, iva, ieps, total });
      console.log("----------------------", this.state.carrito)
  
      this.setState({
        count: count,
        suma: suma,
        subtotal:subtotal,
        descuento:0 , 
        iva:iva , 
        ieps:ieps 
      })
    }


actualizarPreciosIva(){

  console.log("actualizarPreciosIva: preciosDeVentaSinIva : " , global.preciosDeVentaSinIva , " paraFactura: ",this.state.generaFactura  , " ventaSinIva: ",this.state.ventaSinIva  );

  let ventaSinIva = false;

  if(global.preciosDeVentaSinIva){
    ventaSinIva = true;

    if( this.state.generaFactura ){
      ventaSinIva = false;
    }
  }
  this.setState({ ventaSinIva : ventaSinIva } , () => this.calculandoCarrito());
}

paraFactura(checked){
  console.log("paraFactura: " , checked);
  this.setState({generaFactura: checked},() => {this.actualizarPreciosIva()
  });
}

pasarDatos(){

  global.pagos = [];

  global.carrito = this.state.carrito;
  this.props.navigation.navigate("Pagando", {
    carrito:this.state.carrito,
    cliente:this.state.cliente , 
    generaFactura:(this.state.generaFactura == true) ? 1 : 0, 
    ventaSinIva:(this.state.generaFactura == true) ? 0 : this.state.ventaSinIva, 
  })
}



  render() {
  
    const ventaSinIva = this.state.ventaSinIva;
    const { selectedImage } = this.state;
    return (
      <View style={{flex:1}}>
        <View  style={{ 
    paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight , 
    backgroundColor:'#f6f6f6',
    color:'#000000',
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
    height:90,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', }}>
        <View style={{flex: 1}}>
                              <TouchableOpacity
                                style={{flex: 0,
                                  padding: 10,}}
                                onPress={() => this.props.navigation.goBack()}>
                                <Icon name="arrow-back" style={{color:'#2496bc', fontSize: 30}} />
                              </TouchableOpacity>
        </View>
          <View style={{flex: 1, paddingLeft: 20,flexDirection:'column', paddingTop: Platform.OS === 'ios' ? 15 : 0}}>
          <Text style={globalStyles.headerTitle} >Detalle de la venta</Text>
          {
           this.state.cliente != null && (
            
              
            <Text style={{fontSize:12, textAlign: 'left', paddingLeft:7}}>Cliente: { this.state.cliente.clave } - {this.state.cliente.nombre_comercial}</Text>
              
            )
          
          }
          { this.state.cliente == null && <Text style ={{textAlign:'left', paddingLeft:7}}>Venta al público</Text>}
          
          </View>
          <View style={{flex:1}}>
            { this.state.cliente != null && 
              <View style={{ alignItems:"center" }}>
                
                <Text style={{fontSize:10,paddingBottom:5}}>¿Con Factura? </Text>
                <Switch style={{paddingTop:10}} value={this.state.generaFactura} onValueChange={(checked) => this.paraFactura(checked) } />   
              </View>
            }
          </View>
        </View>
            <Separator/>
        <View style={{flex:1}}>
          <SafeAreaView style={{flex: 1}}>

            
              <FlatList 
              data={this.state.carrito}
              renderItem={({item}) =>

                <View style={{ marginLeft: 5, marginRight: 5 }}>
                  <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity style={{ flexDirection: 'row'}}onPress={() => this.setState({ selectedImage: item})}>
                      <Image style={{ width: 50, height: 50 }}
                      source={{ uri: 'https://atletl.api.concrad.com/' + item.img }}/>
                    
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
                    <View style={{flex:1,  flexDirection: "column", alignItems: "flex-end", marginTop: 5}}>
                      <View style={{ flexDirection: "row", alignItems: "flex-end"}}>
                    <TouchableOpacity onPress={() => this.menosUno(item)}>
                      <Icon name="remove" style={{ fontSize: 20, color: 'black' }} />
                    </TouchableOpacity>

                    <TextInput
                      placeholder= "0"
                      placeholderTextColor="#000000"
                      style={{
                        width: 40,
                        borderColor: "gray",
                        borderWidth: 1,
                        backgroundColor: "#f3f3f3",
                        textAlign: "center"
                        
                      }}
                      onChangeText={(cantidad) => this.onChangeTBox(item, cantidad)}
                      keyboardType={"numeric"}
                      value={ "" + this.state.carrito.filter(row => row.id == item.id).reduce((cant, row) => cant + row.cantidad, inicial)}
                    />
                    
                    <TouchableOpacity onPress={() => this.sumaUno(item)}>
                      <Icon name="add" style={{ fontSize: 20, color: 'black' }} />
                    </TouchableOpacity>
                    </View>
                  </View>
                  </View>

                  <Separator/>
                </View>}
                keyExtractor = {(item) => item.idProducto}
                />
              {selectedImage && (
    <Modal animationType="slide" transparent={false} visible={true}>
            <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor: "#eeeeee"}}>
              <Image source={{ uri: 'https://atletl.api.concrad.com/' + selectedImage.img }} style={{ width: '100%', height: 450, marginBottom: 10 }} />
              <Text style={{fontSize: 15}}>Nombre: <Text style={{fontWeight:'bold', fontSize: 25}}>{selectedImage.nombre}</Text></Text>
              <Text style={{fontSize: 15}}>Codigo: <Text style={{fontWeight:'bold', fontSize: 25}}>{selectedImage.codigo}</Text></Text>
              <Text style={{fontSize: 15}}>Precio: <Text style={{fontWeight:'bold', fontSize: 25}}>${selectedImage.precio}</Text></Text>
              <Text style={{fontSize: 15}}>Existencia: <Text style={{fontWeight:'bold', fontSize: 25}}>{selectedImage.cantidad}</Text></Text>
              <Button 
                      title="Cerrar"
                      icon={{
                        name: 'close',
                        type: 'font-awesome',
                        size: 20,
                        color: 'black',
                      }} 
                      iconPosition="left"
                      iconContainerStyle={{ marginLeft: 10}}
                      titleStyle={{ fontWeight: '700', color:'black' }}
                      buttonStyle={{
                      backgroundColor: 'rgba(204, 0, 0, 0.65)',
                      borderColor: 'transparent',
                      borderWidth: 0,
                      borderRadius: 30,
                    }}
                    containerStyle={{
                      width: 150,
                      marginHorizontal: 50,
                      marginVertical: 10,
                      
                    }}

                onPress={() => this.setState({ selectedImage: null })
                }/>
            </View>
          </Modal>
  )}
          </SafeAreaView>
        </View>

        <View  style={{backgroundColor: '#51747F',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center', bottom:0, flex:0 }}>
          <View style={{flex:1}}>
          <TouchableOpacity

                style={ [styles.footerButton, styles.confirmButton]}
                disabled={this.state.carrito.length == 0}
                onPress={() => this.pasarDatos()}
              >
                <View style ={{position: 'relative'}}>
                <Icon name="md-cash" style={{ color: 'white', fontSize: 25 }} />
                 {this.state.count != 0 &&
                <View style ={{
                  backgroundColor: '#33BFAA',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  top: -5,
                  flex: 0,
                  alignItems: 'center',
                  position: 'absolute',
                  marginLeft: 20
                }}>
                <Text style={{ color: 'white' }}>{this.state.count}</Text>
                </View>
}
                </View>
                <Text style={{ color: 'white' }}>Pagar</Text>
                
              </TouchableOpacity>
              </View>
              <View style={{flex:1}}>
              <TouchableOpacity
                style={styles.footerButton}
                disabled={this.state.carrito.length==0}
                onPress={() => this.pasarDatos()}
                
              >
                <NumericFormat
            value={Math.abs(this.state.suma)}
            displayType={'text'}
            thousandSeparator={true}
            prefix={'$'}
            fixedDecimalScale={true}
            decimalScale={2}
            renderText={value=> 
              <Text style={styles.h3}>{value}</Text>
            }
          />
              </TouchableOpacity>
            </View>
        </View>



      </View>
    );
  }
}

export default ConfirmacionVenta;


const styles = StyleSheet.create({

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
  footerButton: {
    flex: 0,
    alignItems: 'center',
    paddingVertical: 10,
  },
  confirmButton: {
    paddingTop: 10,
  },
  h3: {
    color: 'white',
    fontSize: 20,
  },
  separator:{
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  }

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