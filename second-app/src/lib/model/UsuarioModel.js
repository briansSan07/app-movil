const LocalStorage = require ('../database/LocalStorage');
import React from 'react';
const localStorage = new LocalStorage();

class UsuarioModel {
  
  constructor() {
    }


    userLogin(usuario, password){
    
        let result = {};
        return new Promise((resolve, reject) => {
    
            localStorage.getConnection().transaction(tx => {
                
                tx.executeSql('SELECT id_usuario, username, password, id_rol, autorizar_descuento FROM t_usuario WHERE username = ? AND password = ?', [usuario, password],
                function(tx, resultSet) {
                    const rows = resultSet.rows;
                    result = {type : 'reject', success: false, error: "No existe el usuario o la contraseña es inválida."};    
                    if(rows){
                        for(let index = 0; index < rows.length ; index++ ) {
                            const row = rows.item(index);    
                            result = {type : 'resolve', success:true, usuario: row };
                            break;
                        }
                    }
                }, function(tx, error) {
            //            console.log('Termino de executeSql error.',new Date());
                    result = {type : 'reject', success: false, error: error.message};
                });
            }, function(error) {
        //          console.log('Termino de Transaction de existLocalDatabase: error.',new Date());
                reject({success:false,error:error})
            }, () => {
        //          console.log('Termino de Transaction de existLocalDatabase: success.',result);
                if(result.type == 'resolve'){
                    resolve( { success:result.success , usuario:result.usuario } );
                }
                reject({success:result.success,error:result.error})
            });
        })
    
    }
    

    isAppActivated(){
        console.log("**** isAppActivated ");

        result = {};

        let result = {};
        
        return new Promise((resolve, reject) => {

            this.loadKeyConfiguration('isActivado')
            .then((result) => {
                console.log('SI EXISTE ROW PARA isActivado !!!', result);
                if(result.success){
                    resolve( { success:result.success , isAppActivated:parseInt(result.value) } );
                }else{
                    reject({success:false,error:'No existe la llave de configuración'})
                }
            })
            .catch((error) => {
                console.log('ERROR DE LOADKEY!!!', error);
                reject({success:false,error:error})
            });
        })
    }








  activateApp(){

    console.log("**** activateApp " );

    result = {};

    let result = {};
    return new Promise((resolve, reject) => {


        let promises = [];
        localStorage.getConnection().transaction(tx => {
 
            promises.push(this._saveConfigurationKey(tx,"isActivado",true));
          
            Promise.all(promises)
            .then( (success) => {
              console.log("Ejecucion de todas las promesas: ",{success});
              result = {type : 'resolve', success: true};
            }), (error) => {
              console.log({error});
              result = {type : 'reject', success: false, error: error};
            }


        }, function(error) {
              console.log('Termino de Transaction de activateApp: error.',error);
            reject({success:false,error:error})
        }, () => {
              console.log('Termino de Transaction de activateApp: success.',result);
            if(result.type == 'resolve'){
                resolve( { success:result.success , isAppActivated:true} );
            }else{
                reject({success:result.success,error:result.error})
            }
        });

    })

  }

}

module.exports = UsuarioModel;