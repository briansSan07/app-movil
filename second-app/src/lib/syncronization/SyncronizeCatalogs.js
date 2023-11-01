import moment from "moment";
const AppConfiguration = require ('../../lib/model/AppConfiguration');
const ConcradServer = require ('../../lib/remote/ConcradServer');
const LocalStorage = require ('../database/LocalStorage');

const localStorage = new LocalStorage();
const appConfiguration = new AppConfiguration();
const concradServer = new ConcradServer();

class SyncronizeCatalogs {
  
  constructor() {
//      this.token = "";
    }


    executeSyncronization(){
//        console.log("*** executeSyncronization()");
        return this._performSyncronization();
    }

    startSyncronization() {

        return true;

//        this._performSyncronization();
/*
        setInterval(() => {

            this._performSyncronization();

        },1000 * 60);
*/
    }

    _performSyncronization(){

//        console.log("*** _performSyncronization()" , new Date());
        
        return new Promise((resolve, reject) => {
            

            if(global.token == null){

                this._loadToken(global.usuario.username, global.usuario.password, global.sucursalId, global.sourceId)
                .then(response => {                    
                    this._syncronize()
                    .then((success) => {
//                        console.log('En SyncronizeCatalogs.js Transaction de _loadToken exitosa...', success);
                        resolve( { success:true } );
                    })
                    .catch((error) => {
                        console.log('Error En SyncronizeCatalogs.js Transaction de _loadToken: ', error);
                        reject({success:false, error:error})
                    });
                })
                .catch((error) => {
                    console.log('ERROR...', error);
                    reject({success:false, error:error})
                });                    
            
            } else {
                this._syncronize()
                .then((success) => {


//                    console.log('En SyncronizeCatalogs.js Transaction de _syncronize exitosa...', success);
                    resolve( { success:true } );


                })
                .catch((error) => {
                    console.log('Error En SyncronizeCatalogs.js Transaction de _syncronize: ', error);
                    reject({success:false, error:error})
                });
            }

        });


    }

    
    _loadToken(usuario,password,sucursalId,sourceId){

        return new Promise((resolve, reject) => {

            concradServer.remoteLogin(usuario,password,sucursalId,sourceId)
            .then(response => {
//                console.log("remoteLogin - success: " , response)
//                console.log("USUARIO VALIDO! - guardar el TOKEN");

                global.token = response.token;

                resolve( { success:true } );

            })            
            .catch((error) => {
                console.log('ERROR...', error);
                reject({success:false, error:error.message})
            });

        });
        
    }


    _syncronize(){

        return new Promise((resolve, reject) => {

            appConfiguration.loadKeyConfiguration("lastUpdate").then((result) => {
                let lasUpdate = moment(result.value,"YYYY-MM-DD hh:mm:ss").toDate();                
                let lasUpdateTime = lasUpdate.getTime() / 1000;

                console.log("lasUpdateTime: " , lasUpdateTime);
                this.loadCatalogosFromServer("" + lasUpdateTime)
                .then((success) => {
                    console.log('En app.js Transaction de loadCatalogosFromServer exitosa...', success);
                    resolve( { success:true } );
                })
                .catch((error) => { // no tengo datos 
                    console.log('Error app.js en la Transaction de loadCatalogosFromServer: ', error);
                    reject({success:false, error:error})
                });

            })
            .catch((error) => {
                this.loadCatalogosFromServer("1")
                .then((success) => {
                    console.log('En app.js Transaction de loadCatalogosFromServer exitosa...', success);
                    resolve( { success:true } );
                })
                .catch((error) => {
                    console.log('Error app.js en la Transaction de loadCatalogosFromServer: ', error);
                    reject({success:false, error:error})
                });

            });

        });
    }

    loadCatalogosFromServer(longTimestamp) {

        return new Promise((resolve, reject) => {


            concradServer.loadCatalogosFromServer(longTimestamp)
            .then( result => {
                console.log("En app.js Transaction de loadCatalogosFromServer exitosa..." ,{keys: Object.keys(result.data)});
        
                localStorage.fillCatalogos(result.data)
                .then((success) => {
                    console.log('En app.js Transaction de fillCatalogos exitosa...', success);    
            
                    localStorage.verifyCatalogos()
                    .then((success) => {


                        console.log('En app.js Transaction de verifyCatalogos exitosa...', success);
                        resolve( { success:true } );


                    })
                    .catch((error) => {
                        console.log('Error app.js en la Transaction de verifyCatalogos: ', error);
                        reject({success:false, error:error})
                    });
                })
                .catch((error) => {
                    console.log('Error app.js en la Transaction de fillCatalogos: ', error);
                    reject({success:false, error:error})
                });
            })
            .catch((error) => {
                console.log("Error app.js en la Transaction de loadCatalogosFromServer: " ,error);
                reject({success:false, error:error})
            });

        });

    }

    
      

}

module.exports = SyncronizeCatalogs;