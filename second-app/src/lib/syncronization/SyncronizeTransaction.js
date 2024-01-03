import dateUtils from "../utils/dateUtils";
const SyncronizeCatalogs = require ('./SyncronizeCatalogs');
const VentaModel = require ('./../model/VentaModel');
const ConcradServer = require ('../../lib/remote/ConcradServer');
const ventaModel = new VentaModel();
const concradServer = new ConcradServer();
const syncronizeCatalogs = new SyncronizeCatalogs();

class SyncronizeTransaction {
  constructor() {
    this.debug = true;
  }


  executeSyncronization(){
    console.log("*** executeSyncronizationTransaction()");
    return this._performSyncronization();
  }


  startSyncronizationTransaction() {

    this._performSyncronization();

    setInterval(() => {

        this._performSyncronization();

    },1000 * 60 * 1);

}


/*

primero revisar si hay ventas enviadas pero sin respuesta 

y posteriormente revisar si hay nuevas ventas para su envío

*/
_performSyncronization(){
//          console.log("*** _performSyncronizationTransaction()" , new Date());
          
          return new Promise((resolve, reject) => {
              if(global.token == null){  
                syncronizeCatalogs._loadToken(global.usuario.username, global.usuario.password, global.sucursalId, global.sourceId)
                  .then(response => {                    
                      this._syncronizeVentas()
                      .then((success) => {
  //                        console.log('En SyncronizeTransaction.js Transaction de _loadToken exitosa...', success);
                          resolve( { success:true } );
                      })
                      .catch((error) => {
                          console.log('Error En SyncronizeTransaction.js Transaction de _loadToken: ', error);
                          reject({success:false, error:error})
                      });
                  })
                  .catch((error) => {
                      console.log('ERROR...', error);
                      reject({success:false, error:error})
                  });              
              } else {
                  this._syncronizeVentas()
                  .then((success) => {
//                      console.log('En SyncronizeTransaction.js Transaction de _syncronize exitosa...', success);
                      resolve( { success:true } );
                  })
                  .catch((error) => {
                      console.log('Error En SyncronizeTransaction.js Transaction de _syncronize: ', error);
                      reject({success:false, error:error})
                  });
              }  
          });
      }


      _syncronizeVentas(){
        return new Promise((resolve, reject) => {

// ventas Enviadas al server que no han sido confirmadas
          console.log("_syncronizeVentas");
          ventaModel.consultarVentasToSyncronizeByStatus(2)
            .then( result => {
              console.log("VentaModel.consultarVentasToSyncronizeByStatus(2): " , result);
              
              if(result.ventas.length > 0){
                this.verificarAplicacionVentas(result.ventas)
                .then((success) => {
                  console.log('En this.verificarAplicacionVentas exitosa...', success);
                  syncronizeCatalogs.executeSyncronization();
  
                  resolve( { success:true } );
                })
                .catch((error) => {
                    console.log('Error En this.verificarAplicacionVentas : ', error);
                    reject({success:false, error:error})
                });                
              }              

// nuevas ventas a sincronizar 
              console.log("***** En sincronizador de ventas: global.onSavingSale: " , global.onSavingSale);
              if( !global.onSavingSale ){

                ventaModel.consultarVentasToSyncronizeByStatus(1)
                .then( result => {
                  console.log("VentaModel.consultarVentasToSyncronizeByStatus(1): " , result);
                  if(result.ventas.length > 0){

                    this.sincronizarNuevasVentas(result.ventas)
                    .then((success) => {
                      console.log('En this.sincronizarNuevasVentas exitosa...', success);                
                      syncronizeCatalogs.executeSyncronization();
                      resolve( { success:true } );
                    })
                    .catch((error) => {
                      console.log('Error En this.sincronizarNuevasVentas : ', error);
                      reject({success:false, error:error})
                    });
                    
                  }
                })
                .catch((error) => {
                  console.log("Error VentaModel.consultarVentasToSyncronizeByStatus(1): " ,error);
                  reject({success:false, error:error})
                });

              }

            })
            .catch((error) => {
              console.log("Error VentaModel.consultarVentasToSyncronizeByStatus(2): " ,error);
              reject({success:false, error:error})
            });




        });

    }


  verificarAplicacionVentas(ventasList) {

    return new Promise((resolve, reject) => {      
      const ventasPromises = [];


      for(let i=0; i < ventasList.length; i++){
        console.log("Vamos a verificar la siguiente venta: " ,ventasList[i]);

        ventasPromises.push(this.verificarAplicacionVenta(ventasList[i].id));
        
      }
      
      Promise.all(ventasPromises)
      .then( (success ) => {
//        console.log("Promise.all(ventasPromises) - THEN: " , success);
        resolve( { success:true } );
      }), (error) => {
        console.log("Promise.all(ventasPromises) - ERROR: " , {error});
        reject({success:false, error:error})
      }
    });

  }    

  sincronizarNuevasVentas(ventasList){
console.log("Aqui sie ntra");
    return new Promise((resolve, reject) => {      
      const ventasPromises = [];


      for(let i=0; i < ventasList.length; i++){
        console.log("Vamos a sincronizar la siguiente venta: " ,ventasList[i]);

        ventasPromises.push(this.sincronizarNuevaVenta(ventasList[i].id));
        
      }
      
      Promise.all(ventasPromises)
      .then( (success ) => {
        console.log("Promise.all(ventasPromises) - THEN: " , success);
        resolve( { success:true } );
      }), (error) => {
        console.log("Promise.all(ventasPromises) - ERROR: " , {error});
        reject({success:false, error:error})
      }
    });
  }

  verificarAplicacionVenta(idVenta){

    return new Promise((resolve, reject) => {
      ventaModel.consultarVentaById(idVenta)
      .then((result) => {
        console.log("VentaModel.consultarVentaById - THEN: " , result.venta.id);
        console.log("no es nueva");
        this.loadVentaTransactionStatus(result.venta)
        .then((success) => {
          console.log('En this.verificarAplicacionVenta exitosa...', success);
          resolve( { success:true } );
        })
        .catch((error) => {
            console.log('Error En this.verificarAplicacionVenta : ', error);
            reject({success:false, error:error})
        });
      })
      .catch((error) => {
        console.log('VentaModel.consultarVentaById - CATCH: ', error);
        reject({success:false, error:error})
      });
    });

  }


  sincronizarNuevaVenta(idVenta) {
    return new Promise((resolve, reject) => {
      ventaModel.consultarVentaById(idVenta)
      .then((result) => {
        console.log("VentaModel.consultarVentaById - THEN: " , result.venta.id);
        console.log("Es nuevo");
        this.nuevaVentaTransaction(result.venta)
        .then((success) => {
          console.log('En this.nuevaVentaTransaction exitosa...');
          resolve( { success:true } );
        })
        .catch((error) => {
            console.log('Error En this.nuevaVentaTransaction : ', error);
            reject({success:false, error:error})
        });
      })
      .catch((error) => {
        console.log('VentaModel.consultarVentaById - CATCH: ', error);
        reject({success:false, error:error})
      });
    });
  }

//  salvarTransferencia(carrito, total, suma, cambio, monto, id_metodo_pago, id_banco, tipo_tarjeta, autorizacion, ultimos_digitos, dias_credito, clave_metodo_pago, metodo_pago, folio, id_venta){
  nuevaVentaTransaction(venta){
    
    console.log("**** nuevaVentaTransaction");
    return new Promise((resolve, reject) => {      

      const detalle = this.armarItems(venta.detalle);
      const pagos = this.armarPago(venta.pagos);
      let fecha= venta.fecha;//dateUtils.fechaFormat(new Date(),'T');

      let data = {
        "id":venta.id,
        "folio_venta":venta.folio_venta,
        "folio_facturacion":null,
        "id_cliente":venta.id_cliente,
        "id_apartado":null,
        "id_empresa":0,
        "id_sucursal":0,
        "id_source":0,
        "id_factura_factrain":null,
        "metodo_de_pago":null,
        "observaciones":null,
        "nombre_comercial":null,
        "id_proceso":2,
        "proceso":null,
        "fecha":fecha,
        "id_paciente":null,
        "subtotal":venta.subtotal,
        "descuento":venta.descuento,
        "iva":venta.iva,
        "ieps":venta.ieps,
        "total":venta.total,
        "num_productos":venta.detalle.length,
        "metodo_pago":null,
        "pagado":venta.pagado,
        "cambio":venta.cambio,
        "for_factura":venta.for_factura,
        "for_sistema_apartado":0,
        "id_status":venta.id_status,
        "is_vsi":venta.is_vsi,
        "id_usuario":null,
        "id_apartado_local":null,
        "subtotal_antes_impuestos":null,
        "descuento_antes_impuestos":null,
        "id_corte":null,
        "id_usoCFDI":null,
        "uuid":null,
        "_id_remoto":0,
        "_time_sync":null,
        "_is_changed":0,
        "_checksum":null,
        "id_devolucion":null,
        "folio_devolucion":null,
        "apartadoLocal":null,
        "items":detalle,
        "pagos":pagos,
        "nuevoCliente":null,
        "listaVentas":null
    }

      concradServer.saveTransaction("COBRO_VENTA",global.sourceId,venta.id,venta.fecha,data)
      .then(response => {
        
        if(this.debug) console.log("saveTransaction venta: " + ( venta.id ) + " success: " , response);
        let status = 2;
        if(response.error != undefined){
          console.log("response.error: " , response.error);
          if(response.error.code == "ER_DUP_ENTRY"){
            status = 2;
          }          
        }

          // actualizar a enivada 2
          ventaModel.updateStatusTransaccionVenta(venta.id,status,response.transaction_server_id)
          .then((success) => {
            console.log('En VentaModel.updateStatusVenta exitosa...', success);
            resolve( { ...response } );
          })
          .catch((error) => {
              console.log('Error En VentaModel.updateStatusVenta : ', error);
              reject({success:false, error:error})
          });        

      })
      .catch(error => {
          if(this.debug) console.log("saveTransaction - error: " , error)
          reject({success:false, error:error})          
      });
    });
  }
  armarItems(detalle){
    let items = [];
    for(let i=0;i<detalle.length;i++){
    let newItem = {
      "id":detalle[i].id,
      "id_producto":detalle[i].id_producto,
      "cantidad":detalle[i].cantidad,
      "costo_unitario":0,  
      "precio_unitario":detalle[i].precio_unitario,
      "descuento":detalle[i].descuento,
      "iva":detalle[i].iva,
      "ieps":detalle[i].ieps,
      "importe":detalle[i].importe,
      "total":detalle[i].total,
      "id_status":detalle[i].id_status,
      "id_venta":detalle[i].id_venta,
      "precio_antes_impuestos":null,
      "descuento_antes_impuestos":null,
      "subtotal":detalle[i].precio_unitario,
      "tasa_iva":null,
      "tasa_ieps":null,
      "claveProdSAT":0,
      "claveUnidadSAT":null,
      "producto":null,
      "codigo":null,
      "costo_incluye_iva":null,
      "id_tasa_cuota_iva":null,
      "costo_incluye_ieps":null,
      "id_tasa_cuota_ieps":null,
      "folio_devolucion":null
    }
    items.push(newItem)
    }
    return items;
  }
  armarPago(ventaPagos){
    let pagos = [];
    for(let i=0;i<ventaPagos.length;i++){
    
    let newPago= {
        "id":ventaPagos[i].id,
        "importe":ventaPagos[i].importe,
        "id_metodo_pago":ventaPagos[i].id_metodo_pago,
        "efectivo":ventaPagos[i].efectivo,
        "cambio":ventaPagos[i].cambio,
        "id_banco":ventaPagos[i].id_banco,
        "tipo_tarjeta":ventaPagos[i].tipo_tarjeta,
        "autorizacion":ventaPagos[i].autorizacion,
        "ultimos_digitos":ventaPagos[i].ultimos_digitos,
        "dias_credito":ventaPagos[i].dias_credito,
        "id_venta":ventaPagos[i].id_venta,
        "clave_metodo_pago":null,
        "metodo_pago":null,
        "clave":null,
        "clave_sat":0
     }
     pagos.push(newPago);
    }
     return pagos;
     
  }

  loadVentaTransactionStatus(venta){
    
    console.log("**** loadVentaTransactionStatus");
    return new Promise((resolve, reject) => {      

      let fecha= venta.fecha;
      

      concradServer.getTransactionStatus("COBRO_VENTA",     global.sourceId,       venta.id, fecha, venta.id_sync_remote )
      .then(response => {

        
        if(this.debug) console.log("getTransactionStatus venta: " + ( venta.id ) + " error_message: " , response.error_message, " status_id: ",response.status_id);

        if(response.error_message == null){
        // actualizar la venta a 4 o 3
        
          ventaModel.updateStatusVenta(venta.id,response.status_id)
          .then((success) => {
//            console.log('En VentaModel.updateStatusVenta exitosa...', success);
            resolve( { ...response } );
          })
          .catch((error) => {
              console.log('Error En VentaModel.updateStatusVenta : ', error);
              reject({success:false, error:error})
          });
        
        } else {
          if(response.error_message == "No existe la transacción en el server"){

            ventaModel.updateStatusVenta(venta.id,1)
            .then((success) => {
//              console.log('En VentaModel.updateStatusVenta exitosa...', success);
              resolve( { ...response } );
            })
            .catch((error) => {
                console.log('Error En VentaModel.updateStatusVenta : ', error);
                reject({success:false, error:error})
            });
          }        
        }


      })
      .catch(error => {
          if(this.debug) console.log("getTransactionStatus - error: " , error)
          reject({success:false, error:error})          
      });
    });
  }  

}

module.exports = SyncronizeTransaction;
