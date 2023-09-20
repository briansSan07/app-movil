const LocalStorage = require ('../database/LocalStorage');

const localStorage = new LocalStorage();
import DateUtils from './../../lib/utils/dateUtils';


class ClienteModel  {

  constructor() {
  }


  


  consultarClientes(){
    console.log("*** consultarClientes");

    return new Promise((resolve, reject) => {    
      let clientesList = [];
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `SELECT idCliente as key,idCliente,clave,nombre_comercial,razon_social,rfc,telefono,celular,id_estado,nivel_socioeconomico_id,
                  has_credito,dias_credito,importe_credito,saldo_favor,
                  id_status
             FROM Clientes
        WHERE Clientes.id_status > 0
       ORDER BY nombre_comercial ASC
         `, [], (tx, { rows }) => {
            
            if(rows._array.length > 0){
                clientesList = rows._array;
            }
            transactionResult = { type:'resolve', success:true, clientesList };
 
          }, function(tx, error) {
            console.log({error});
            reject({type:'reject', success: false, error: error.message});
          });
        }, 
        function(error) {
          reject({success:false,error:error})
        }, () => {       
          const { type, ...result} = transactionResult;
          if(transactionResult.type == 'resolve'){
            resolve(result);
          }
          reject(result)
        });
    });
  }

  

  consultarClientesByEstado(estado){
    console.log("*** consultarClientesByEstado: " , estado);

    return new Promise((resolve, reject) => {    
      let clientesList = [];
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `SELECT idCliente as key,idCliente,clave,nombre_comercial,razon_social,rfc,telefono,celular,nivel_socioeconomico_id,
                  has_credito,dias_credito,importe_credito,saldo_favor,
                  id_status
             FROM Clientes
        WHERE Clientes.id_status > 0
        and Clientes.id_estado = ?
       ORDER BY nombre_comercial ASC
         `, [estado], (tx, { rows }) => {
            
            if(rows._array.length > 0){
                clientesList = rows._array;
            }
            transactionResult = { type:'resolve', success:true, clientesList };
 
          }, function(tx, error) {
            console.log({error});
            reject({type:'reject', success: false, error: error.message});
          });
        }, 
        function(error) {
          reject({success:false,error:error})
        }, () => {       
          const { type, ...result} = transactionResult;
          if(transactionResult.type == 'resolve'){
            resolve(result);
          }
          reject(result)
        });
    });
  }

  

  consultarClientesByNombre(nombre){
    console.log("*** consultarClientesByNombre: " , nombre);

    return new Promise((resolve, reject) => {    
      let clientesList = [];
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `SELECT idCliente as key,idCliente,clave , nombre_comercial,razon_social,rfc,telefono,celular,nivel_socioeconomico_id,
                  has_credito,dias_credito,importe_credito,saldo_favor,
                  id_status
             FROM Clientes
        WHERE Clientes.id_status > 0
        and (
          UPPER(Clientes.nombre_comercial) like ?
          OR UPPER(Clientes.clave) like ?
          )
       ORDER BY nombre_comercial ASC
         `, [nombre,nombre], (tx, { rows }) => {

          console.log("*** consultarClientesByNombre - encontre : " , rows._array.length);
            
            if(rows._array.length > 0){
                clientesList = rows._array;
            }
            console.log({clientesList});

            transactionResult = { type:'resolve', success:true, clientesList };
 
          }, function(tx, error) {
            console.log({error});
            reject({type:'reject', success: false, error: error.message});
          });
        }, 
        function(error) {
          reject({success:false,error:error})
        }, () => {       
          const { type, ...result} = transactionResult;
          if(transactionResult.type == 'resolve'){
            resolve(result);
          }
          reject(result)
        });
    });
  }


  consultarClienteById(idCliente){
    console.log("*** consultarClienteById:" , idCliente);

    return new Promise((resolve, reject) => {    
      let clientesList = [];
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `SELECT idCliente as key,idCliente,clave,nombre_comercial,razon_social,rfc,calle,no_ext,no_int,colonia,Clientes.id_municipio,dom_municipio.nombre as municipio,Clientes.id_estado,dom_estado.nombre as estado,codigo_postal,telefono,celular,nivel_socioeconomico_id,NivelSocioeconomico.nivel_socioeconomico,
                  Clientes.has_credito,Clientes.dias_credito,Clientes.importe_credito,Clientes.saldo_favor,
                  Clientes.id_status
             FROM Clientes

        LEFT JOIN dom_estado
               ON Clientes.id_estado = dom_estado.id_estado
        LEFT JOIN dom_municipio
               ON Clientes.id_municipio = dom_municipio.id_municipio
        LEFT JOIN NivelSocioeconomico
               ON NivelSocioeconomico.id = Clientes.nivel_socioeconomico_id
            WHERE idCliente = ?
         ORDER BY nombre_comercial ASC`, [idCliente], (tx, { rows }) => {

//            console.log("----> config",rows);
            
            if(rows._array.length > 0){
                clientesList = rows._array;
            }
            transactionResult = { type:'resolve', success:true, cliente: clientesList[0] };
 
          }, function(tx, error) {
            console.log({error});
            reject({type:'reject', success: false, error: error.message});
          });
        }, 
        function(error) {
          reject({success:false,error:error})
        }, () => {       
          const { type, ...result} = transactionResult;
          if(transactionResult.type == 'resolve'){
            resolve(result);
          }
          reject(result)
        });
    });
  }



}

export default new ClienteModel();
