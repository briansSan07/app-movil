const LocalStorage = require ('../database/LocalStorage');
const ConcradServer = require ('../../lib/remote/ConcradServer');
import React from 'react';

const concradServer = new ConcradServer();
const localStorage = new LocalStorage();

class AppConfiguration { 
  
  constructor() {
      this.debug = false;
    }


    loadKeyConfiguration(key){
        if(this.debug) console.log("**** loadKeyConfiguration["+key+"] ");
    
        let result = {};
        return new Promise((resolve, reject) => {

            localStorage.getConnection().transaction(tx => {
                tx.executeSql('SELECT * FROM c_configuracion WHERE key = ?', [key],
                function(tx, resultSet) {
                    const rows = resultSet.rows;
                    result = {type : 'reject', success: false, error: "No existe la llave de configuración."};    
                    if(rows){
                        for(let index = 0; index < rows.length ; index++ ){
                            const row = rows.item(index);
                            if(this.debug) console.log("row: ",index , row);
                            if (row.value != '' ){ // true = SI esta activado , false no esta activado
                                result = {type : 'resolve', success:true, value: row.value };
                                break;
                            }
                        }
                    }
                }, function(tx, error) {
                    if(this.debug) console.log('Termino de executeSql error.',new Date());
                    result = {type : 'reject', success: false, error: error.message};
                });
            }, function(error) {
                if(this.debug) console.log('Termino de Transaction de existLocalDatabase: error.',new Date());
                reject({success:false,error:error})
            }, () => {
                if(this.debug) console.log('Termino de Transaction de existLocalDatabase: success.',result);
                if(result.type == 'resolve'){
                    resolve( { success:result.success , value:result.value } );
                }
                reject({success:result.success,error:result.error})
            });
        })
    
    }
    

    isAppActivated(){
        if(this.debug) console.log("**** isAppActivated ");

        result = {};

        let result = {};
        
        return new Promise((resolve, reject) => {

            this.loadKeyConfiguration('isActivado')
            .then((result) => {
                if(this.debug) console.log('SI EXISTE ROW PARA isActivado !!!', result);
                if(result.success){
                    resolve( { success:result.success , isAppActivated:parseInt(result.value) } );
                }else{
                    reject({success:false,error:'No existe la llave de configuración'})
                }
            })
            .catch((error) => {
                if(this.debug) console.log('ERROR DE LOADKEY!!!', error);
                reject({success:false,error:error})
            });
        })
    }





    _saveConfigurationKey(tx, key, value){

    if(this.debug) console.log("**** _saveConfigurationKey["+key+"] = " + value);

    let result = {};
    return new Promise((resolve, reject) => {
            tx.executeSql('UPDATE c_configuracion SET value = ? WHERE key = ?',[value,key],
            function(tx, resultSet) {
                if(this.debug) console.log("ON UPDATE: resultSet["+key+"]: " ,  resultSet);              
                if(resultSet.rowsAffected == 0){
                    tx.executeSql('INSERT INTO c_configuracion (key,value) VALUES (?,?)',[key,value],
                    function(tx, resultSet) {
                        console.log("ON INSERT: resultSet["+key+"]: " ,  resultSet);
                        resolve( { success:true ,  action:"INSERTED" , key, insertId: resultSet.insertId} );
                    }, 
                    function(tx, error) {
                        result = {type : 'reject', success: false};
                        reject( { success:false , action:"INSERTED", key,error: error.message } );

                    });                
                } else {
                    resolve( { success:true , action:"UPDATED", key,value, resultSet} );
                }
            }, 
            function(tx, error) {
                reject( { success:false , action:"UPDATED", key, error: error.message } );
            });

        
    })

    }



    updateLocalConfiguration(sourceId,config, usuario){

    if(this.debug) console.log("**** updateLocalConfiguration " , sourceId,"global.sourceId: ",global.sourceId);

    result = {};

    let result = {};
    return new Promise((resolve, reject) => {


        let promises = [];
        localStorage.getConnection().transaction((tx) => {
            if(sourceId){
                console.log("no")
                promises.push(this._saveConfigurationKey(tx,"source_id",sourceId));
            }
            if(config){
                console.log("sigue");
                promises.push(this._saveConfigurationKey(tx,"usuario",usuario));
                promises.push(this._saveConfigurationKey(tx,"id_sucursal",config.id_sucursal));
                promises.push(this._saveConfigurationKey(tx,"sucursal",config.sucursal));
                promises.push(this._saveConfigurationKey(tx,"id_empresa",config.id_empresa));
                promises.push(this._saveConfigurationKey(tx,"id_razon_social",config.id_razon_social));
                promises.push(this._saveConfigurationKey(tx,"nombre_comercial",config.nombre_comercial));
                promises.push(this._saveConfigurationKey(tx,"domicilio_comercial",config.domicilio_comercial));
                promises.push(this._saveConfigurationKey(tx,"telefono",config.telefono));
                promises.push(this._saveConfigurationKey(tx,"logotipo",config.logotipo));
                promises.push(this._saveConfigurationKey(tx,"tiene_rfc",config.tiene_rfc));


                promises.push(this._saveConfigurationKey(tx,"credito_clientes_con_previa_autorizacion",(config.modulos_contratados.credito_clientes_con_previa_autorizacion == true) ? 1 : 0));
                promises.push(this._saveConfigurationKey(tx,"credito_clientes_global",(config.modulos_contratados.credito_clientes_global == true) ? 1 : 0));
                promises.push(this._saveConfigurationKey(tx,"activacion_ventas_sin_inventario",(config.modulos_contratados.activacion_ventas_sin_inventario == true) ? 1 : 0));
                promises.push(this._saveConfigurationKey(tx,"precios_de_venta_sin_iva",(config.modulos_contratados.precios_de_venta_sin_iva == true)? 1 : 0));

                for(let index = 0; index < config.serie_folios.length; index++){
                    const serieFolio = config.serie_folios[index];
                    promises.push(this._saveConfigurationKey(tx,"proceso_"+serieFolio.id_proceso+"_serie",serieFolio.serie));
                    promises.push(this._saveConfigurationKey(tx,"proceso_"+serieFolio.id_proceso+"_folio",serieFolio.folio));
                    concradServer.confirmConfigurationSeriesFolios(global.sourceId)
                    .then(response => {
                        if(this.debug) console.log("confirmConfigurationSeriesFolios - success: " , response);
                    })
                    .catch(error => {
                        if(this.debug) console.log("confirmConfigurationSeriesFolios - error: " , error)
                    });
        
                }
                

            }
          
            Promise.all(promises)
            .then( (success) => {
                if(this.debug) console.log("Ejecucion de todas las promesas: ",{success});
              result = {type : 'resolve', success: true};
            }), (error) => {
                if(this.debug) console.log({error});
              result = {type : 'reject', success: false, error: error};
            }


        }, function(error) {
            if(this.debug) console.log('Termino de Transaction de updateLocalConfiguration: error.',error);
            reject({success:false,error:error})
        }, () => {
            if(this.debug) console.log('Termino de Transaction de updateLocalConfiguration: success.',result);
            if(result.type == 'resolve'){
                resolve( { success:result.success , isAppActivated:result.isAppActivated} );
            }
            reject({success:result.success,error:result.error})
        });

    })

    }


    saveConfigurationKey(key,value){

    let result = {};
    return new Promise((resolve, reject) => {


        localStorage.getConnection().transaction(tx => {
 
            this._saveConfigurationKey(tx, key, value)
            .then( (success) => {
                if(this.debug) console.log("salvando key : ",{success});
                result = {type : 'resolve', success: true};
            }), (error) => {
                if(this.debug) console.log({error});
                result = {type : 'reject', success: false, error: error};
            }


        }, function(error) {
            if(this.debug) console.log('Termino de Transaction de updateLocalConfiguration: error.',error);
            reject({success:false,error:error})
        }, () => {
            if(this.debug) console.log('Termino de Transaction de updateLocalConfiguration: success.',result);
            if(result.type == 'resolve'){
                resolve( { success:result.success , isAppActivated:result.isAppActivated} );
            }
            reject({success:result.success,error:result.error})
        });

    })

    }



    activateApp(){

    if(this.debug) console.log("**** activateApp " );

    result = {};

    let result = {};
    return new Promise((resolve, reject) => {


        let promises = [];
        localStorage.getConnection().transaction(tx => {
 
            promises.push(this._saveConfigurationKey(tx,"isActivado","1"));
          
            Promise.all(promises)
            .then( (success) => {
                if(this.debug) console.log("Ejecucion de todas las promesas: ",{success});
              result = {type : 'resolve', success: true};
            }), (error) => {
                if(this.debug) console.log({error});
              result = {type : 'reject', success: false, error: error};
            }


        }, function(error) {
            if(this.debug) console.log('Termino de Transaction de activateApp: error.',error);
            reject({success:false,error:error})
        }, () => {
            if(this.debug) console.log('Termino de Transaction de activateApp: success.',result);
            if(result.type == 'resolve'){
                resolve( { success:result.success , isAppActivated:true} );
            }else{
                reject({success:result.success,error:result.error})
            }
        });

    })

    }

}

module.exports = AppConfiguration;

