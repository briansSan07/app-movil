import React, { Component} from 'react';
import { 
    Header, 
    Left, 
    Right, 
    Icon, 
    Container, 
    Content, 
    Body,
    Footer,
    Title,
    FooterTab,
    Text,
    ActionSheet,
    Button} from 'react-native';

import { SQLite } from "expo-sqlite";


const db = SQLite.openDatabase("version2.db");
const categoria = [];
const product = [];

export default class HomeScreen extends React.Component{

  componentDidMount(){
    this.consulta()
  }

  consulta(){
    db.transaction(tx =>{
      tx.executeSql(
        'select * from TipoProducto', [], (_, { rows }) => {
          console.log(rows);
          this.llenarCategoria(rows._array);  
        }
      );
    });
  }

  llenarCategoria(categoria){
    this.categoria = categoria;
  }

  
    render() {
        return (
          <Container style={{backgroundColor: "#fff"}}>
            <Header>
              <Left>
                <Button>
                  <Icon name="ios-menu" />
                </Button>
              </Left>
              <Body>
                <Title>Header</Title>
              </Body>
              <Right />
            </Header>
            <Content padder>

          <Button onPress={()=> this.consulta()}>
            <Text>
              consulta
            </Text>
          </Button>
            </Content>
    
            <Footer>
              <FooterTab>
                <Button active full>
                  <Text>Footer</Text>
                </Button>
              </FooterTab>
            </Footer>
          </Container>
        );
      }

    }    
