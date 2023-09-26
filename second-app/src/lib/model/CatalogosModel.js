const LocalStorage = require ('../database/LocalStorage');

const localStorage = new LocalStorage();
import DateUtils from '../utils/dateUtils';

class CatalogosModel  {

  constructor() {
  }

  consultarNivelSocioeconomicoPublicoGral(){
    console.log("*** consultarNivelSocioeconomicoPublicoGral");

    return new Promise((resolve, reject) => {    
      let nivelPublico = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `SELECT id
             FROM NivelSocioeconomico
            WHERE NivelSocioeconomico.precio_publico = 1 AND status <> 0
         `, [], (tx, { rows }) => {

//            console.log("----> nivelPublico:",rows);
            
            if(rows._array.length > 0){
                nivelPublico = rows._array[0];
            }
            transactionResult = { type:'resolve', success:true, nivelPublico };
 
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


  consultarMetodosPago(){
    console.log("*** consultarMetodosPago");

    return new Promise((resolve, reject) => {
      let metodosPagoList = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `SELECT id,metodo_pago,clave
             FROM metodoPago
            WHERE metodoPago.is_venta = 1 
         `, [], (tx, { rows }) => {

//            console.log("----> consultarMetodosPago:",rows);
            
            if(rows._array.length > 0){
                metodosPagoList = rows._array;
            }
            transactionResult = { type:'resolve', success:true, metodosPagoList };
 
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

  consultarBancos(){
    console.log("*** consultarBancos");

    return new Promise((resolve, reject) => {
      let bancosList = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `SELECT id, nombre_corto
             FROM banco
            WHERE banco.id_status <> 0
            ORDER BY orden 
         `, [], (tx, { rows }) => {

//            console.log("----> consultarBancos:",rows);
            
            if(rows._array.length > 0){
              bancosList = rows._array;
            }
            transactionResult = { type:'resolve', success:true, bancosList };
 
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

  consultarEstados(){
    console.log("*** consultarEstados");

    return new Promise((resolve, reject) => {
      let estadosList = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `SELECT id_estado,nombre
             FROM dom_estado
            ORDER BY id_estado ASC 
         `, [], (tx, { rows }) => {

//            console.log("----> consultarMetodosPago:",rows);
            
            if(rows._array.length > 0){
              estadosList = rows._array;
            }
            transactionResult = { type:'resolve', success:true, estadosList };
 
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



  consultarConfiguracion(){
    console.log("*** consultarConfiguracion");

    return new Promise((resolve, reject) => {
      let bancosList = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql('UPDATE t_venta SET id_sync_status = 1 WHERE id_sync_status IS NULL');
        tx.executeSql(
          `select id,id_status,id_sync_status from t_venta ORDER BY id asc
         `, [], (tx, { rows }) => {

            console.log("----> consultarConfiguracion:",rows);
 
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

module.exports = CatalogosModel;