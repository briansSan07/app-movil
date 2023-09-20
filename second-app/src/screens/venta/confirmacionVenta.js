import React, { Component } from "react";
import {
  Container,  Header,  Title, Subtitle,  Content,  Button,  Icon,  ListItem,
  Text,  Thumbnail,  Left,  Body,  Right,  Item,  Footer,  FooterTab,
  Badge,  Accordion,  View,  Input,  List,  Toast,  H1,  H2,  H3, Switch
} from "react-native";
import { Col, Row, Grid } from 'react-native-easy-grid';
import NumberFormat from 'react-number-format';

//import styles from "./styles";
import globalStyles from "../styles";

import {TextInput,SafeAreaView} from "react-native";


var inicial=" ";

class ConfirmacionVenta extends Component {
  constructor(props) {
    super(props);


//    carritoCompras: , 

    this.state = {
    carrito: this.props.navigation.getParam('carrito'), 
    cliente: this.props.navigation.getParam('cliente'), 
    generaFactura:this.props.navigation.getParam('generaFactura'), 
    ventaSinIva:this.props.navigation.getParam('ventaSinIva'), 
    count: 0, 
    suma:0, 
    subtotal:0 , 
    descuento:0 , 
    iva:0 , 
    ieps:0 , 
    suma:0 , 

    isLoading:true, 
    showToast: false,
    displayMetodoPago:false
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
    let nuevoProductoParaCarrito = this.state.carrito.filter (function (data) {return data.id === producto.id; })
      nuevoProductoParaCarrito[0].cantidad = parseInt(cantidad);
    }
    this.setState({carrito: carritoCompras},() => {this.calculandoCarrito()});
  }

  sumaUno(producto) {
        let carritoCompras = [...this.state.carrito];
        let nuevoProductoParaCarrito = carritoCompras.filter (function (data) {return data.id === producto.id; })
        if (nuevoProductoParaCarrito.length > 0) {
        nuevoProductoParaCarrito[0].cantidad ++;
        }
        this.setState({carrito: carritoCompras},() => {this.calculandoCarrito()});
    }

 
    menosUno(producto) {
      let carritoCompras = [...this.state.carrito];
      let nuevoProductoParaCarrito = carritoCompras.filter(function(data) {return data.id === producto.id;})
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
  
    return (
      <Container >
        <Header iosBarStyle={"dark-content"} style={{ ...globalStyles.header , height:95,paddingTop:0 }} >
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back"  style={globalStyles.headerButton} />
            </Button>
          </Left>
          <Body style={{flex: 2}}>
          <Title style={globalStyles.headerTitle} >Detalle de la venta</Title>
          {
           this.state.cliente != null && (
            
              
            <Subtitle ><Text style={{fontSize:12}}>Cliente: { this.state.cliente.clave } - {this.state.cliente.nombre_comercial}</Text></Subtitle>
              
            )
          
          }
          { this.state.cliente == null && <Subtitle><Text>Venta al público</Text></Subtitle>}
          
          </Body>
          <Right>
            { this.state.cliente != null && 
              <View style={{ alignItems:"center" }}>
                
                <Text style={{fontSize:10,paddingBottom:5}}>¿Con Factura? </Text>
                <Switch style={{paddingTop:10}} value={this.state.generaFactura} onValueChange={(checked) => this.paraFactura(checked) } />   
              </View>
            }
          </Right>
        </Header>

        <Content>
          <SafeAreaView style={{flex: 1}}>
            <List
            dataArray={this.state.carrito}
            renderRow={data =>
              <ListItem thumbnail style={{marginLeft:5,marginRight:5}}>
                <Left>
                  <Thumbnail square source={{uri:'https://atletl.api.concrad.com/'+data.img}} />
                </Left>
                <Body style={{marginLeft:5,paddingTop:10,paddingBottom:10}}>
                  <Text style={{fontSize:14}}>
                    {data.codigo} - {data.nombre}                    
                  </Text>

                  <Grid>
                    
                    <Col style={{ backgroundColor:'#fff', height: 27 }}>
                    <Text note>Disp: {data.existencia}</Text> 
                    </Col>
                    <Col style={{ backgroundColor:'#fff', height: 27 }}>
                    <Text note>$ {ventaSinIva ? Math.round(data.precio_antes_impuestos*100)/100 : data.precio}</Text> 
                    </Col>
                    <Col style={{ backgroundColor:'#fff', width:93, height: 27, flex:0, flexDirection:'row' }}>
                      <Button transparent small style={{paddingTop:0,paddingBottom:0}} onPress={()=> this.menosUno(data)}>
                        <Icon name="remove" style={{...globalStyles.headerButton,marginLeft:8,marginRight:8}} />
                      </Button>
                          <TextInput   
                              placeholder="0"
                              placeholderTextColor="#000000"
                              style={{width:40, borderColor: "gray", borderWidth: 1,  backgroundColor: "#f3f3f3"}}
                              onChangeText={(cantidad) => this.onChangeTBox(data,cantidad)}
                              keyboardType={"numeric"}
                              //value={ "" + this.state.carritoCompras.filter(row => row.id == producto.idProducto).reduce((cant,row) => cant + row.cantidad,inicial) }
                              value={ "" + this.state.carrito.filter(row => row.id == data.id).reduce((cant,row) => cant + row.cantidad,inicial) }
                          />
                        <Button transparent small style={{paddingTop:0,paddingBottom:0}} onPress={()=> this.sumaUno(data)}>
                        <Icon name="add" style={{...globalStyles.headerButton,marginLeft:8,marginRight:10}} />
                      </Button>
                    </Col>
                    
                  </Grid>

                </Body>
                
              </ListItem>}
            />
          </SafeAreaView>
        </Content>

        <Footer>
          <FooterTab style={{backgroundColor: "#51747F"}}>
            <Button
              onPress={() => this.pasarDatos()}
              disabled={this.state.carrito.length == 0} 
              style={{paddingTop:15}}
              
              badge

            >
              <Badge style={{ backgroundColor: "#cb8d12" }}>
                <Text>{this.state.count}</Text>
              </Badge>
              <Icon style={{color: 'white'}} name="md-cash" />              
              <Text style={{color: 'white'}}  > 
                Pagar            
              </Text>

            

            </Button>
            <Button
            disabled={this.state.carrito.length == 0} 
              onPress={() => this.pasarDatos()}
            >

            <NumberFormat value={Math.abs(this.state.suma)} displayType={'text'} thousandSeparator={true} prefix={'$'} fixedDecimalScale={true} decimalScale={2} renderText={value => <H3 style={{color: 'white'}}>{value}</H3> } />

          </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default ConfirmacionVenta;
