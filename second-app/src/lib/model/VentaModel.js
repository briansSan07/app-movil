import React from 'react';

const LocalStorage = require ('../database/LocalStorage');
const localStorage = new LocalStorage();
const DateUtils = require ('./../../lib/utils/dateUtils');
const dateUtils = new DateUtils();

class VentaModel  {

  constructor() {
  }

  salvarVenta(
    ventaSinIva,
    generaFactura,
    cliente,
    carrito, 
    subtotal,descuento,iva,ieps,
    total, pagado, cambio, pagos){

      console.log("salvarVenta: " , {
        ventaSinIva, generaFactura,
        subtotal, descuento, iva, ieps,
        total, pagado, cambio
      });

    const venta  = {
      carrito:carrito,
      subtotal:subtotal,
      descuento:descuento,
      iva:iva,
      ieps:ieps,
      total:total,
      pagado:pagado,
      cambio:cambio,
      cliente:cliente,
      ventaSinIva:ventaSinIva,
      generaFactura:generaFactura
//      id_metodo_pago:id_metodo_pago,
//      id_banco:id_banco,
//      tipo_tarjeta:tipo_tarjeta,
//      autorizacion:autorizacion,
//      ultimos_digitos:ultimos_digitos,
//      dias_credito:dias_credito,
//      clave_metodo_pago:clave_metodo_pago,
//      metodo_pago:metodo_pago
    };

    return new Promise((resolve, reject) => {

      let folioFormat = '';

        this.obtenerSiguienteFolio()
        .then((result) => {
          console.log("obtenerSiguienteFolio:" , result);

          folioFormat = (result.serie + "" + result.folio.toString().padStart(5, "0"));

          this.insertVenta(folioFormat , result.folio, venta, pagos)
          .then((result) => {
            console.log("insertVenta:" , result);
            resolve({...result,folio:folioFormat});
          })
          .catch((error) => {
            console.log('ERROR DE insertVenta: ', error);
            reject({success: false, error: error});
          });
        })
        .catch((error) => {
          console.log('ERROR DE obtenerSiguienteFolio: ', error);
          reject({success: false, error: error});
        });


    });
  }


  reenviarVenta(id){

    return new Promise((resolve, reject) => {
      
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {

      tx.executeSql(
        'UPDATE t_venta SET id_sync_status = 1 WHERE id >= ? ',
        [id],
        (tx, resultSet) => {

          const rowsAffected = resultSet.rowsAffected;
          transactionResult = { type:'resolve', success:true, rowsAffected };
          
        }, function(tx, error) {
          transactionResult = { type:'reject', success: false, error: error.message };
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

  obtenerSiguienteFolio(){
    let serie = '';
    let folio = 0;

    return new Promise((resolve, reject) => {
      
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {

      tx.executeSql(
        'SELECT value FROM c_configuracion WHERE [key] = ? ',
        ['proceso_2_serie'],
        (tx, resultSet) => {

          console.log("obtenerSiguienteFolio - resultSet: " , {resultSet});
          const rows = resultSet.rows;
          serie = rows._array[0].value;
          this.consultaFolio(tx)
          .then((resultFolio) => {
            folio = (resultFolio.folio + 1);
            transactionResult = { type:'resolve', success:true, serie, folio };
          })
          .catch((error) => {
            console.log('ERROR DE consultaFolio: ', error);
            transactionResult = { type:'reject',success: false, error: error};
          });
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

  consultaFolio(tx){
    let folio = 0;
    return new Promise((resolve, reject) => {
    
      tx.executeSql(
        'select value from c_configuracion where [key] = ?', ['proceso_2_folio'], 
        (tx, { rows }) => { //THEN
          folio = parseInt(rows._array[0].value);
          console.log("consultaFolio then: " , folio);
          resolve({folio});
        }, function (tx,error) { //CATCH
          console.log("consultaFolio error:"  ,{error})
          reject( {success:false,error:error} );
        }
      );
    });
  }

  
  insertVenta(folioVenta , folio, venta, pagos){
    return new Promise((resolve, reject) => {

      let fecha=dateUtils.fechaFormat(new Date());
//      let fecha=(f.getDate() +  "/" + f.getMonth() + "/" + f.getFullYear())
      console.log("formatoFecha : ", fecha)
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {

      let idCliente = null;
      if(venta.cliente){
        idCliente = venta.cliente.idCliente;
      }

      tx.executeSql('INSERT INTO t_venta (folio_venta ,folio_facturacion ,id_cliente ,id_nuevo_cliente ,id_proceso ,id_apartado ,id_apartado_local ,fecha ,id_paciente , ' +
      'subtotal ,descuento ,iva ,total ,pagado ,cambio , ' +
      'id_corte ,for_factura ,for_sistema_apartado ,id_status ,ieps ,is_vsi , id_sync_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [folioVenta, null, idCliente, null, 2, null, null, fecha, null,
          venta.subtotal, venta.descuento, venta.iva, venta.total, venta.pagado, venta.cambio,
          null, venta.generaFactura, 0, 1, venta.ieps, venta.ventaSinIva, 1],
          (tx,  result) => {
            console.log("result de insert venta: ",result);
            const idVenta = result.insertId;
//            this.consulta(tx, idVenta);

            this.actualizarFolio(tx,folio);

            this.insertVentaPago(tx, folio, idVenta, venta, pagos)
            .then((result) => {
              console.log("insertVentaPago; " , result); // idVentaPago y detalleSuccess
              
              transactionResult = { type:'resolve',success:true,idVenta, ...result };
              
            })
            .catch((error) => {
              console.log('ERROR DE insertVentaPago: ', error);
              transactionResult = { type:'reject',success: false, error: error};
            });  
          },
          function (tx,error) {
            console.log("error de transaccion: " , {error})
            transactionResult = { type:'reject',success:false,error:error} ;
            return true;
          }
        );
      }, 
      function(error) {
        reject({success:false,error:error})
      }, () => {       
        console.log("ENDING transaction in(insertVenta): " , transactionResult);
        const { type, ...result} = transactionResult;
        if(transactionResult.type == 'resolve'){
          resolve(result);
        }
        reject(result)
      });
    });

  }
  
  actualizarFolio(tx, newfolio){

      tx.executeSql(
        'UPDATE c_configuracion SET value = ? where key = ?', [newfolio,'proceso_2_folio'], 
        function(tx,  result ){
          console.log("actualizarFolio: success: " , result)
        }, function (tx,error) {
          console.log("actualizarFolio: error: " , {error})
        }
      );
  }

  /*
  insertVentaPago(tx, folio, idVenta, venta, pagos){
    //console.log(tventa)
    return new Promise((resolve, reject) => {

      tx.executeSql('INSERT INTO t_venta_pago (id_venta , importe , id_metodo_pago , efectivo, cambio, id_banco, tipo_tarjeta, autorizacion, ultimos_digitos, dias_credito) VALUES(?,?,?,?,?,?,?,?,?,?)',
      [idVenta,venta.total,1,venta.pagado,venta.cambio,venta.id_banco,venta.tipo_tarjeta,venta.autorizacion,venta.ultimos_digitos,venta.dias_credito],
      (tx,  result)=> {
        const idVentaPago = result.insertId;
        
        this.insertVentadetalle(tx,idVenta,venta)
        .then((result) => {
          console.log("insertVentadetalle " , result);
          
          this.actualizarFolio(tx,folio);

          resolve({detalleSuccess:true,idVentaPago});
        })
        .catch((error) => {
          console.log('ERROR DE insertVentadetalle: ', error);
          reject( {success:false,error:error} );        
        });  
      }, function (tx,error) {
        console.log({error})
        reject( {success:false,error:error} );        
      });
    });
  }
*/
  insertVentaPago(tx, folio, idVenta, venta, pagos){
    //console.log(tventa)
    return new Promise((resolve, reject) => {
      let promiseDetalle = [];
      for(let i=0;i<pagos.length;i++){
        console.log("-------->insertVentaPago " + i + " : ",pagos[i]);

        if(pagos[i].formaPago == "1"){

          let importe = pagos[i].efectivo;
          if(pagos[i].cambio < 0){
            importe += pagos[i].cambio;
          }

          promiseDetalle.push(
            tx.executeSql('INSERT INTO t_venta_pago (id_venta , importe , id_metodo_pago , efectivo, cambio) VALUES(?,?,?,?,?)',
            [idVenta,importe, pagos[i].formaPago, pagos[i].efectivo, pagos[i].cambio])  
          );  
        }else if(pagos[i].formaPago == "2" || pagos[i].formaPago == "3"){
          promiseDetalle.push(
            tx.executeSql('INSERT INTO t_venta_pago (id_venta , importe , id_metodo_pago , autorizacion, ultimos_digitos) VALUES(?,?,?,?,?)',
            [idVenta,pagos[i].importe, pagos[i].formaPago, pagos[i].autorizacion, pagos[i].ultimosDigitos])  
          );  
        } else if(pagos[i].formaPago == "4"){ // cheque
          promiseDetalle.push(
            tx.executeSql('INSERT INTO t_venta_pago (id_venta , importe , id_metodo_pago , autorizacion, id_banco) VALUES(?,?,?,?,?)',
            [idVenta,pagos[i].importe, pagos[i].formaPago, pagos[i].autorizacion, pagos[i].idBanco])  
          );  
        }else if(pagos[i].formaPago == "5"){
          promiseDetalle.push(
            tx.executeSql('INSERT INTO t_venta_pago (id_venta , importe , id_metodo_pago , autorizacion) VALUES(?,?,?,?)',
            [idVenta,pagos[i].importe, pagos[i].formaPago, pagos[i].autorizacion])
          );  
        }else if(pagos[i].formaPago == "7"){
          promiseDetalle.push(
            tx.executeSql('INSERT INTO t_venta_pago (id_venta , importe , id_metodo_pago , autorizacion) VALUES(?,?,?,?)',
            [idVenta,pagos[i].importe, pagos[i].formaPago, pagos[i].autorizacion])
          );  
        }
/*
        promiseDetalle.push(
          tx.executeSql('INSERT INTO t_venta_pago (id_venta , importe , id_metodo_pago , efectivo, cambio, autorizacion, ultimos_digitos, dias_credito) VALUES(?,?,?,?,?,?,?,?)',
          [idVenta,pagos[i].importe, pagos[i].formaPago, pagos[i].importe, pagos[i].cambio. pagos[i].autorizacion, pagos[i].ultimosDigitos, pagos[i].diasCredito])  
        );
*/        
      }

      if(promiseDetalle.length>0){

        Promise.all(promiseDetalle).then( (result) => {
          console.log("insertVentadetalle: ",result);
  
          this.insertVentadetalle(tx,idVenta,venta)
          .then((result) => {
            console.log("insertVentadetalle " , result);
            
  
            resolve({detalleSuccess:true,idVentaPago:result});
          })
          .catch((error) => {
            console.log('ERROR DE insertVentadetalle: ', error);
            reject( {success:false,error:error} );        
          });  
  
        }), (error) => {
          console.log("insertVentadetalle: ",{error})
          reject( {success:false,error:error} );
          return true;
        }

      } else {
          this.insertVentadetalle(tx,idVenta,venta)
          .then((result) => {
            console.log("insertVentadetalle " , result);
            
  
            resolve({detalleSuccess:true,idVentaPago:null});
          })
          .catch((error) => {
            console.log('ERROR DE insertVentadetalle: ', error);
            reject( {success:false,error:error} );        
          });  
      }
    });
  }


  insertVentadetalle(tx,idVenta,venta){
    //console.log(tventa)
    return new Promise((resolve, reject) => {
      let promiseDetalle = [];
      for(let i=0;i<venta.carrito.length;i++){
        console.log("--------> ",venta.carrito[i]);

        let iva = 0;
        let tasa = 0;
        let importe = 0;
        if(!venta.ventaSinIva){
          iva = venta.carrito[i].iva;
          tasa = venta.carrito[i].tasa_iva;
          importe = venta.carrito[i].cantidad * venta.carrito[i].precio
        }else{
          importe = venta.carrito[i].cantidad * venta.carrito[i].precio_antes_impuestos
        }


        promiseDetalle.push(
          tx.executeSql('INSERT INTO t_venta_detalle (id_venta ,id_producto ,cantidad ,precio_unitario , descuento , iva , importe , total , id_status , ieps)  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [idVenta,venta.carrito[i].id, venta.carrito[i].cantidad, venta.carrito[i].precio_antes_impuestos, 0, iva, importe, importe, 1, 0])  
        );
      }

      Promise.all(promiseDetalle).then( (result) => {
        console.log("insertVentadetalle: ",result);
        resolve(true);
      }), (error) => {
        console.log("insertVentadetalle: ",{error})
        reject( {success:false,error:error} );
        return true;
      }
    });
  }


  consultarVentaById(idVenta){
    console.log("*** consultarVentaById");

    return new Promise((resolve, reject) => {
      let venta = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `select t_venta.id,
                  t_venta.folio_venta,
                  t_venta.folio_facturacion,
                  t_venta.id_cliente,
                  t_venta.id_nuevo_cliente,
                  t_venta.id_proceso,
                  t_venta.id_apartado,
                  t_venta.id_apartado_local,
                  t_venta.fecha,
                  t_venta.id_paciente,
                  t_venta.subtotal,
                  t_venta.descuento,
                  t_venta.iva,
                  t_venta.total,
                  t_venta.pagado,
                  t_venta.cambio,
                  t_venta.id_corte,
                  t_venta.for_factura,
                  t_venta.for_sistema_apartado,
                  t_venta.id_status,
                  t_venta.ieps,
                  t_venta.is_vsi,
                  t_venta.id_sync_status,
                  t_venta.id_sync_remote,
                  Clientes.nombre_comercial
          from t_venta 
          left join Clientes
                on Clientes.idCliente = t_venta.id_cliente
          where id = ? `, [idVenta], (tx, { rows }) => {

            
            if(rows._array.length > 0){
              venta = rows._array[0];
            }

            this.consultarVentaPagoByIdVenta(tx,idVenta)  
            .then((result) => {
              venta.pagos = result.pagos;
              venta.detalle = result.detalle;
              transactionResult = { type:'resolve', success:true, venta };
            })
            .catch((error) => {
              console.log('consultarVentaPagoByIdVenta - CATCH: ', error);
              reject({type:'reject', success: false, error: error});
            });
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

  consultarVentaPagoByIdVenta(tx,idVenta) {
    return new Promise((resolve, reject) => {
      let pagos = [];
      tx.executeSql(
        'select * from t_venta_pago WHERE id_venta = ?', [idVenta], (tx, { rows }) => {
//          console.log(" --> consultarVentaPagoByIdVenta: " ,  {idVenta,rows});
        if(rows._array.length > 0){
          pagos = [...rows._array];
        }
        this.consultarVentaDetalleByIdVenta(tx,idVenta)
        .then((detalle) => {
          resolve({pagos,detalle});
        })
        .catch((error) => {
          console.log('consultarVentaDetalleByIdVenta - CATCH: ', error);
          reject({ success: false, error: error});
        });
      }, function (tx,error) {
        console.log({error})
        reject( {success:false,error:error.message} );        
      });
    });    
  }

  consultarVentaDetalleByIdVenta(tx,idVenta){
    return new Promise((resolve, reject) => {
      let detalle = [];
      tx.executeSql(
        'select t_venta_detalle.*,Producto.codigo,Producto.nombre from t_venta_detalle,Producto WHERE Producto.idProducto = t_venta_detalle.id_producto AND id_venta = ?', [idVenta], (tx, { rows }) => {
          if(rows._array.length > 0){
              detalle = [...rows._array];
          }
          resolve(detalle);
        }, function (tx,error) {
          console.log({error})
          reject( {success:false,error:error.message} );        
        });
    });
    
    
  }

  consultarVentasToSyncronizeByStatus(idStatus){
//    console.log("*** consultarVentasToSyncronize");

    return new Promise((resolve, reject) => {    
      let ventas = [];
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          'select id from t_venta WHERE id_sync_status = ? ORDER BY id asc ', [idStatus], (tx, { rows }) => {
            if(rows._array.length > 0){
              ventas = rows._array;
            }
            transactionResult = { type:'resolve', success:true, ventas };

          }, function(tx, error) {
            console.log({error});
            reject({type:'reject', success: false, error: error.message});
          });
        }, 
        function(error) {
          if(error.message){
            reject({success:false,error:error.message})            
          }else{
            reject({success:false,error:error})
          }
        }, () => {       
          const { type, ...result} = transactionResult;
          if(transactionResult.type == 'resolve'){
            resolve(result);
          }
          reject(result)
        });
    });
  }

  updateStatusVenta(idVenta, status){
    return new Promise((resolve, reject) => {

      let fecha=dateUtils.fechaFormat(new Date());
//      let fecha=(f.getDate() +  "/" + f.getMonth() + "/" + f.getFullYear())
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {

      tx.executeSql('UPDATE t_venta SET id_sync_status = ? WHERE id = ?',
          [status, idVenta],
          (tx,  result) => {
            console.log("result de updateStatusVenta: ",result);
            transactionResult = { type:'resolve',success:true,...result };
          },
          function (tx,error) {
            console.log("error de updateStatusVenta: " , {error})
            transactionResult = { type:'reject',success:false,error:error} ;
          }
        );
      }, 
      function(error) {
        reject({success:false,error:error})
      }, () => {       
//        console.log("ENDING updateStatusVenta: " , transactionResult);
        const { type, ...result} = transactionResult;
        if(transactionResult.type == 'resolve'){
          resolve(result);
        }
        reject(result)
      });
    });

  }
  updateStatusTransaccionVenta(idVenta, status, idTransaccion){
    return new Promise((resolve, reject) => {

      let fecha=dateUtils.fechaFormat(new Date());
//      let fecha=(f.getDate() +  "/" + f.getMonth() + "/" + f.getFullYear())
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {

      tx.executeSql('UPDATE t_venta SET id_sync_status = ?, id_sync_remote = ? WHERE id = ?',
          [status, idTransaccion ,idVenta],
          (tx,  result) => {
            console.log("result de updateStatusTransaccionVenta.rowsAffected: ",result.rowsAffected);
            transactionResult = { type:'resolve',success:true,...result };
          },
          function (tx,error) {
            console.log("error de updateStatusTransaccionVenta: " , {error})
            transactionResult = { type:'reject',success:false,error:error} ;
          }
        );
      }, 
      function(error) {
        reject({success:false,error:error})
      }, () => {       
//        console.log("ENDING updateStatusVenta: " , transactionResult);
        const { type, ...result} = transactionResult;
        if(transactionResult.type == 'resolve'){
          resolve(result);
        }
        reject(result)
      });
    });

  }



  consultarTablaVenta(){
    console.log("*** consultarTablaVenta");

    return new Promise((resolve, reject) => {
      let ventas = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `select t_venta.*
          from t_venta 
                
           `, [], (tx, { rows }) => {

            
            if(rows._array.length > 0){
              ventas = rows._array;
            }
            
            transactionResult = { type:'resolve', success:true, ventas };

          }, function(tx, error) {
            console.log({error});
            transactionResult = {type:'reject', success: false, error: error.message};
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


  consultarTablaVentaDetalle(){
    console.log("*** consultarTablaVentaDetalle");

    return new Promise((resolve, reject) => {
      let detalle = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `select t_venta_detalle.*
          from t_venta_detalle 
                
           `, [], (tx, { rows }) => {

            
            if(rows._array.length > 0){
              detalle = rows._array;
            }
            
            transactionResult = { type:'resolve', success:true, detalle };

          }, function(tx, error) {
            console.log({error});
            transactionResult = {type:'reject', success: false, error: error.message};
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


  consultarTablaVentaPago(){
    console.log("*** consultarTablaVentaPago");

    return new Promise((resolve, reject) => {
      let pagos = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `select t_venta_pago.*
          from t_venta_pago 
                
           `, [], (tx, { rows }) => {

            
            if(rows._array.length > 0){
              pagos = rows._array;
            }
            
            transactionResult = { type:'resolve', success:true, pagos };

          }, function(tx, error) {
            console.log({error});
            transactionResult = {type:'reject', success: false, error: error.message};
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

module.exports = VentaModel;