 import * as SQLite from "expo-sqlite";

class LocalStorage {
  
  constructor() {
    this.db = null; //SQLite.openDatabase("version2.db");
    this.lastUpdated = null;
    this.debug = true;
  }
//db.transaction(callback, error, success)
//tx.executeSql(sqlStatement, arguments, success, error)

  getConnection() {
    this.db = SQLite.openDatabase("version2.db");
    return this.db;
  }




    existLocalDatabase() {
//      console.log("...existLocalDatabase()");

      let result = {};
      return new Promise((resolve, reject) => {
        if(this.db == null){ this.getConnection();}
        this.db.transaction(tx => {
//          tx.executeSql('DROP TABLE c_configuracion', []);
          
          /*
          tx.executeSql('DROP TABLE c_configuracion', []);
          tx.executeSql('DELETE FROM TipoProducto', []);
          tx.executeSql('DELETE FROM NivelSocioeconomico', []);
          tx.executeSql('DROP TABLE NivelSocioeconomico', []);
          tx.executeSql('DELETE FROM Producto', []);
          tx.executeSql('DELETE FROM Clientes', []);
          tx.executeSql('DELETE FROM t_venta_pago', []);
          tx.executeSql('DELETE FROM t_venta_detalle', []);
          tx.executeSql('DELETE FROM t_venta', []);
          tx.executeSql('DROP TABLE t_venta', []);
          tx.executeSql('DELETE FROM t_usuario', []);
          
          */
          
            

          tx.executeSql('select key, value from c_configuracion', [],
          function(tx, resultSet) {
//              console.log('Termino de executeSql success.',new Date());
              result = {type : 'resolve', success: true};
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
            resolve( { success:result.success} );            
          }
          reject({success:result.success,error:result.error})
        });

      })
    }


    createLocalDatabase() {

      console.log("...createLocalDatabase()");
      let result = {};

      return new Promise((resolve, reject) => {

        let promises = [];
        if(this.db == null){ this.getConnection();}
        this.db.transaction(tx => {
          promises.push(this._createTipoProducto(tx));
          promises.push(this._createNivelSocioeconomico(tx));
          promises.push(this._createProducto(tx));
          promises.push(this._createProductoPrecio(tx));          
          promises.push(this._createClientes(tx));
         // promises.push(this._createClienteDireccion(tx));
          promises.push(this._createTventa(tx));
          promises.push(this._createDetalleventa(tx));
          promises.push(this._createVentaPago(tx));
          promises.push(this._createConfiguracion(tx));
          promises.push(this._createMetodopago(tx));
          promises.push(this._createBanco(tx));
          promises.push(this._createUsuario(tx));
          promises.push(this._createEstados(tx));
          promises.push(this._createMunicipios(tx));
          promises.push(this._createImpuestoTasaCuota(tx));
          promises.push(this._createSyntransaction(tx));

          Promise.all(promises)
          .then( (success) => {

            result = {type : 'resolve', success: true};
          }), (error) => {
//            console.log({error});
            result = {type : 'reject', success: false, error: error};
          }

        }, function(error) {
          reject({success:false,error:error})
        }, () => {
//          console.log('Transaction de inicialización exitosa...');
          if(result.type == 'resolve'){
            resolve( { success:result.success} );            
          }
          reject({success:result.success,error:result.error})
        });
      })
    }

    initializeLocalDatabase() {
//      console.log("...initializeLocalDatabase()");

      let result = {};
      return new Promise((resolve, reject) => {

        let promises = [];
        if(this.db == null){ this.getConnection();}

        this.db.transaction(tx => {

          promises.push(tx.executeSql('INSERT INTO c_configuracion ( key, value) VALUES(?,?)',["token",""]));
          promises.push(tx.executeSql('INSERT INTO c_configuracion ( key, value) VALUES(?,?)',["isActivado",0]));

          Promise.all(promises)
          .then( (success) => {
//            console.log("Ejecucion de todas las promesas: ",{success});
            result = {type : 'resolve', success: true};
          }), (error) => {
            console.log({error});
            result = {type : 'reject', success: false, error: error};
          }

        }, function(error) {
//          console.log('Termino de Transaction de existLocalDatabase: error.',new Date());
          reject({success:false,error:error})
        }, () => {
//          console.log('Termino de Transaction de existLocalDatabase: success.',result);
          if(result.type == 'resolve'){
            resolve( { success:result.success} );            
          }
          reject({success:result.success,error:result.error})
        });

      })
    }    

    loadLastUpdate(){

    }
    saveLastUpdate(update){

//      console.log("saveLastUpdate: " , {update});

      if(this.lastUpdated == null){
        this.lastUpdated = update;
      }
      if(this.lastUpdated < update){
        this.lastUpdated = update;
      }
    }



    _createTipoProducto(tx){
      return tx.executeSql(
//        'DELETE FROM TipoProducto',

        'CREATE TABLE IF NOT EXISTS TipoProducto (idtipoProducto INTEGER PRIMARY KEY NOT NULL, tipo_producto VARCHAR(100), orden INT, has_stock INT, created_at TEXT, updated_at TEXT)'
      );
    }    
    _createNivelSocioeconomico(tx){
      return tx.executeSql(
//        'DELETE FROM NivelSocioeconomico',        
        'CREATE TABLE IF NOT EXISTS NivelSocioeconomico (id INTEGER PRIMARY KEY NOT NULL, nivel_socioeconomico VARCHAR(100), orden INT, precio_publico INT, status INT, created_at TEXT, updated_at TEXT)'
      );
    }
    _createProducto(tx){
      return tx.executeSql(
//        'DELETE FROM Producto',
        `CREATE TABLE IF NOT EXISTS Producto (idProducto INTEGER PRIMARY KEY NOT NULL, idproductotipo INT, codigo VARCHAR(100), nombre VARCHAR(100), descripcion  VARCHAR(225), cantidad INT, precio INT, id_laboratorio INT, id_status INT, 
        id_proveedor INT, 
        id_tasa_cuota_iva INT,
        id_tasa_cuota_ieps INT, 
        imagen TEXT, 
        created_at TEXT, 
        updated_at TEXT)`
      );
    }
    _createProductoPrecio(tx){
      return tx.executeSql(
//        'DELETE FROM ProductoServicioPrecio
        `CREATE TABLE IF NOT EXISTS ProductoServicioPrecio (
          id INTEGER PRIMARY KEY NOT NULL, 
          id_producto INT, 
          nivel_socioeconomico_id INT, 
          precio_antes_impuestos DECIMAL(18, 4) NULL, 
          iva DECIMAL(18, 4) NULL, 
          ieps DECIMAL(18, 4) NULL, 
          precio DECIMAL(18, 4) NULL, 
          created_at DATETIME, 
          updated_at DATETIME)`
      );
    }
    _createClientes(tx){
      return tx.executeSql(
//        'DELETE FROM Clientes',        
        `CREATE TABLE IF NOT EXISTS Clientes (idCliente INTEGER PRIMARY KEY NOT NULL,
                                              clave INT, 
                                              nombre_comercial VARCHAR(100), 
                                              razon_social VARCHAR(100), 
                                              rfc  VARCHAR(20), 
                                              calle VARCHAR(225), 
                                              no_ext VARCHAR(50), 
                                              no_int VARCHAR(50), 
                                              colonia VARCHAR(100), 
                                              id_municipio INT, 
                                              id_estado INT,                                           
                                              codigo_postal INT, 
                                              genera_factura INT, 
                                              telefono VARCHAR(20), 
                                              celular VARCHAR(20), 
                                              nivel_socioeconomico_id INT, 
                                              id_status INT, 
                                              has_credito INT, 
                                              dias_credito INT, 
                                              importe_credito DECIMAL(18, 4) NULL, 
                                              saldo_favor  DECIMAL(18, 4) NULL,
                                              created_at TEXT, updated_at TEXT)`
      );
//importe_credito DECIMAL(18, 4) NULL,  hay que cambiar estos tipos de datos en la aplicación actual de miguel....
//saldo_favor  DECIMAL(18, 4) NULL,
      
    }
    _createTventa(tx){

/* 

id_sync_status 

1 - Nueva Transaccion
2 - Enviada a sincronizacion
3 - Rechazada
4 - Recibida en proceso de sincronizacion


*/      
      return tx.executeSql(
        `CREATE TABLE IF NOT EXISTS t_venta (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                                             folio_venta VARCHAR(15) NULL, 
                                             folio_facturacion VACHAR(20) NULL, 
                                             id_cliente INT NULL, 
                                             id_nuevo_cliente INT NULL, 
                                             id_proceso INT NULL, 
                                             id_apartado INT NULL, 
                                             id_apartado_local INT NULL, 
                                             fecha DATETIME, 
                                             id_paciente INT NULL, 
                                             subtotal DECIMAL(18, 4) NULL, 
                                             descuento DECIMAL(18, 4) NULL, 
                                             iva DECIMAL(18, 4) NULL, 
                                             total DECIMAL(18, 4) NULL, 
                                             pagado DECIMAL(18, 4) NULL, 
                                             cambio DECIMAL(18, 4) NULL, 
                                             id_corte INT NULL, 
                                             for_factura INT, 
                                             for_sistema_apartado INT NULL, 
                                             id_status INT NULL, 
                                             ieps DECIMAL(18, 4) NULL, 
                                             is_vsi INT NOT NULL,
                                             id_sync_status INT NULL,
                                             id_sync_remote INT NULL
                                             
                                             )`
      );
    }
    _createDetalleventa(tx){
      return tx.executeSql(
//        'DELETE FROM t_venta_detalle',
        `CREATE TABLE IF NOT EXISTS t_venta_detalle (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                                                     id_venta INT NULL, 
                                                     id_producto INT NULL, 
                                                     cantidad DECIMAL(18, 4) NULL, 
                                                     precio_unitario DECIMAL(18, 4) NULL, 
                                                     descuento DECIMAL(18, 4) NULL, 
                                                     iva DECIMAL(18, 4) NULL, 
                                                     importe DECIMAL(18, 4) NULL, 
                                                     total DECIMAL(18, 4) NULL, 
                                                     id_status INT NULL, 
                                                     ieps DECIMAL(18, 4) NULL)`
      );
    }
    _createVentaPago(tx){
      return tx.executeSql(
//        'DELETE FROM t_venta_pago',
        'CREATE TABLE IF NOT EXISTS t_venta_pago (id INTEGER PRIMARY KEY AUTOINCREMENT, id_venta INT NULL, importe DECIMAL(18, 4) NULL, id_metodo_pago VARCHAR(5) NULL, efectivo DECIMAL(18, 4) NULL, cambio DECIMAL(18, 4) NULL, id_banco INT NULL, tipo_tarjeta VARCHAR(50) NULL, autorizacion VARCHAR(20) NULL, ultimos_digitos VARCHAR(10) NULL, dias_credito INT NULL)'
      );
    }
    _createConfiguracion(tx){
      return tx.executeSql(
//        'DELETE FROM c_configuracion',
        'CREATE TABLE IF NOT EXISTS c_configuracion (id INTEGER PRIMARY KEY AUTOINCREMENT, key VARCHAR(50), value VARCHAR(50))'
      );
    }
    _createMetodopago(tx){
      return tx.executeSql(
        'CREATE TABLE IF NOT EXISTS metodoPago (id INTEGER PRIMARY KEY NOT NULL, metodo_pago VARCHAR(50), clave VARCHAR(50), is_venta INT, is_pago_credito INT, created_at VARCHAR(100), update_at VARCHAR(100))'
      );
    }
    _createBanco(tx){
      return tx.executeSql(
        'CREATE TABLE IF NOT EXISTS banco (id SMALLINT PRIMARY KEY NOT NULL, nombre_corto VARCHAR(50), orden SMALLINT, id_status SMALLINT, created_at VARCHAR(100), update_at VARCHAR(100))'
      );
    }
    _createUsuario(tx){
      return tx.executeSql(
        'CREATE TABLE IF NOT EXISTS t_usuario (id_usuario INTEGER PRIMARY KEY NOT NULL, username VARCHAR(50), password VARCHAR(50), id_rol SMALLINT, autorizar_descuento SMALLINT, created_at VARCHAR(100), updated_at DATETIME)'
      );
    }
    _createEstados(tx){
      return tx.executeSql(
        'CREATE TABLE IF NOT EXISTS dom_estado (id_estado SMALLINT PRIMARY KEY NOT NULL, nombre VARCHAR(250), created_at DATETIME, updated_at DATETIME)'
      );
    }
   /* _createClienteDireccion(tx){
      return tx.executeSql(
        'CREATE TABLE IF NOT EXISTS t_cliente_direccion (id INTEGER PRIMARY KEY NOT NULL, idCliente INT NOT NULL, latitude VARCHAR(20), longitude VARCHAR(20))'
      );
    }*/
    _createMunicipios(tx){
      return tx.executeSql(
        'CREATE TABLE IF NOT EXISTS dom_municipio (id_municipio SMALLINT PRIMARY KEY NOT NULL, nombre VARCHAR(250), clave_mun SMALLINT, id_estado SMALLINT, created_at DATETIME, updated_at DATETIME)'
      );
    }
    _createImpuestoTasaCuota(tx){
      return tx.executeSql(
/*
          descripcion VARCHAR(200),
          para_traslado SMALLINT NULL, 
          para_retencion SMALLINT NULL, 
*/
        `CREATE TABLE IF NOT EXISTS c_impuesto_tasa_cuota (
          id SMALLINT PRIMARY KEY NOT NULL, 
          id_tipo_impuesto SMALLINT NULL, 
          id_tipo_factor SMALLINT NULL, 
          tipo_cuota VARCHAR(20),
          minimo DECIMAL(18, 6) NULL, 
          maximo DECIMAL(18, 6) NULL
          )`
      );
    }
    _createSyntransaction(tx){
      return tx.executeSql('CREATE TABLE IF NOT EXISTS syn_transaction (id INTEGER PRIMARY KEY AUTOINCREMENT, transaction_type_id INT, transaction_status_id INT, id_transaction_server INT, sended_datetime INT)');
    }


    _inicializarFolio(tx){
//      tx.executeSql('INSERT INTO c_configuracion ( key, value) VALUES(?,?)',["proceso_2_serie","V"]);
//      tx.executeSql('INSERT INTO c_configuracion ( key, value) VALUES(?,?)',["proceso_2_folio","1"]);
      tx.executeSql('INSERT INTO c_configuracion ( key, value) VALUES(?,?)',["token",""]);
      tx.executeSql('INSERT INTO c_configuracion ( key, value) VALUES(?,?)',["isActivado",0]);
    }    

        

    fillCatalogos(remoteData){

      if(this.debug){
        console.log("...fillCatalogos()");
      }
      

      return new Promise((resolve, reject) => {

      if(this.db == null){ this.getConnection();}

      this.db.transaction(
        tx => {
      
          if(this.debug) console.log("remoteData.productoTipo.length: " + remoteData.productoTipo.length);
          this._fillTipoProducto(tx,remoteData.productoTipo);
          if(this.debug) console.log("remoteData.nivelSocioeconomico.length: " + remoteData.nivelSocioeconomico.length);
          this._fillNivelSocioeconomico(tx,remoteData.nivelSocioeconomico);
          if(this.debug) console.log("remoteData.producto.length: " + remoteData.producto.length);
          this._fillProducto(tx,remoteData.producto);
          if(this.debug) console.log("remoteData.productoServicioPrecio.length: " + remoteData.productoServicioPrecio.length);
          this._fillProductoPrecio(tx,remoteData.productoServicioPrecio);

          if(this.debug) console.log("remoteData.cliente.length: " + remoteData.cliente.length);
          this._fillClientes(tx,remoteData.cliente);
          /*if(this.debug) console.log("remoteData.clienteDireccion.length: " + remoteData.clienteDireccion.length);
          this._fillClienteDireccion(tx,remoteData.clienteDireccion);*/
          if(this.debug) console.log("remoteData.metodoPago.length: " + remoteData.metodoPago.length); 
          this._fillMetodoPago(tx,remoteData.metodoPago);
          if(this.debug) console.log("remoteData.banco.length: " + remoteData.banco.length);
          this._fillBanco(tx,remoteData.banco);
          if(this.debug) console.log("remoteData.usuario.length: " + remoteData.usuario.length);
          this._fillUsuario(tx,remoteData.usuario);

          if(this.debug) console.log("remoteData.domEstado.length: " + remoteData.domEstado.length);
          this._fillEstados(tx,remoteData.domEstado);
          if(this.debug) console.log("remoteData.domMunicipio.length: " + remoteData.domMunicipio.length);
          this._fillMunicipios(tx,remoteData.domMunicipio);
          if(this.debug) console.log("remoteData.impuestoTasaCuota.length: " + remoteData.impuestoTasaCuota.length);
          this._fillImpuestoTasaCuota(tx,remoteData.impuestoTasaCuota);
          if(this.debug) console.log("remoteData.idsProductoServicioPrecio.length: " + remoteData.idsProductoServicioPrecio.length);
          this._deleteProductoPrecio(remoteData.idsProductoServicioPrecio);

        }, function(error) {
          console.log("...error",{error});

          reject({success:false,error:error})
        
        }, () => {
          console.log("...TERMINE TODAS LAS TRANSACCIONES DE LLENADO.... ");
          if(this.lastUpdated != null){

            if(this.db == null){ this.getConnection();}
            
            this.db.transaction(
            tx => {
              this._saveLastUpdate(tx,this.lastUpdated);
              

            });
          }
          resolve({success:true})    

        });
      })

    }

    _saveLastUpdate(tx,lastUpdate){


      tx.executeSql('UPDATE c_configuracion SET value = ? WHERE KEY = ?',[lastUpdate,"lastUpdate"],
      function(tx, resultSet) {
            console.log("ON UPDATE _saveLastUpdate-success: " ,  resultSet);
          if(resultSet.rowsAffected == 0){


            tx.executeSql('INSERT INTO c_configuracion ( key, value) VALUES(?,?)', 
            [ "lastUpdate",lastUpdate ], 
            function(tx, resultSet) {
                console.log("_saveLastUpdate-insert-success: ");// , resultSet);
            }, function(tx, error) {
                console.log('_saveLastUpdate-insert-error: ' + error.message);
            });
        }
      }, 
      function(tx, error) {
        console.log('_saveLastUpdate-error: ' + error.message);
      });
    }

    _fillTipoProducto(tx,dto){

      for(let i=0;i<dto.length;i++){

        console.log("_fillTipoProducto",dto[i]);

        this.saveLastUpdate(dto[i].updated_at);

        tx.executeSql('UPDATE TipoProducto SET tipo_producto = ?, orden = ?, has_stock = ?, created_at = ?, updated_at = ? WHERE idtipoProducto = ?',[dto[i].tipo_producto, dto[i].orden, dto[i].has_stock, dto[i].created_at, dto[i].updated_at,dto[i].id],
        function(tx, resultSet) {
//          console.log("ON UPDATE TipoProducto-update-success: " ,  resultSet);
          if(resultSet.rowsAffected == 0){


            tx.executeSql('INSERT INTO TipoProducto (idtipoProducto, tipo_producto, orden, has_stock, created_at, updated_at) VALUES ( ?, ?, ?, ?, ?, ?)', 
            [ dto[i].id,dto[i].tipo_producto, dto[i].orden, dto[i].has_stock, dto[i].created_at, dto[i].updated_at], 
            function(tx, resultSet) {
              if(this.debug){
                console.log("TipoProducto-insert-success: ");// , resultSet);
              }
            }, function(tx, error) {
              console.log('TipoProducto-insert-error: ' + error.message);
            });
          }
        }, 
        function(tx, error) {
          console.log('TipoProducto-update-error: ' + error.message);
        });

      }
    }
    _fillNivelSocioeconomico(tx,dto){
      for(let i=0;i<dto.length;i++){

        this.saveLastUpdate(dto[i].updated_at);

        tx.executeSql('UPDATE NivelSocioeconomico SET nivel_socioeconomico = ?, orden = ?, precio_publico = ?, status = ?, created_at = ?, updated_at = ?  WHERE id = ?',[dto[i].nivel_socioeconomico, dto[i].orden, dto[i].precio_publico, dto[i].estatus, dto[i].created_at, dto[i].updated_at,dto[i].id],
        function(tx, resultSet) {
          if(this.debug){
            console.log("ON UPDATE NivelSocioeconomico-update-success: " ,  resultSet);
          }
          if(resultSet.rowsAffected == 0){
              tx.executeSql('INSERT INTO NivelSocioeconomico (id, nivel_socioeconomico, orden, precio_publico, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [dto[i].id, dto[i].nivel_socioeconomico, dto[i].orden, dto[i].precio_publico, dto[i].estatus, dto[i].created_at, dto[i].updated_at]);
          }
        }, 
        function(tx, error) {
          console.log('NivelSocioeconomico-update-error: ' + error.message);
        });          
      
      
      }
    }
    _fillProducto(tx,dtoList){

      for(let i=0;i<dtoList.length;i++){
      let url;
      const dto = dtoList[i];
      //console.log("indice: " + i + " = " , dto[i]);
      if(dtoList[i].imagenes === null){
              url="noimage.png" 
      }else{
              url=dtoList[i].imagenes.mini;
      }
      this.saveLastUpdate(dto.updated_at);

      tx.executeSql('UPDATE Producto SET idproductotipo = ?, codigo = ?, nombre = ?, descripcion = ?, cantidad = ?, precio = ?, id_laboratorio = ?, id_status = ?, id_proveedor = ?, id_tasa_cuota_iva = ?, id_tasa_cuota_ieps = ?, imagen = ?, created_at = ?, updated_at = ?  WHERE idProducto = ?',[ dto.id_producto_tipo, dto.codigo, dto.nombre, dto.descripcion, dto.cantidad, dto.precio, dto.id_laboratorio, dto.id_estatus, dto.id_proveedor, dto.id_tasa_cuota_iva, dto.id_tasa_cuota_ieps, url, dto.created_at, dto.updated_at,dto.id_producto ],
      function(tx, resultSet) {
        if(this.debug){
          console.log("ON UPDATE Producto-success: " ,  resultSet);
        }
        if(resultSet.rowsAffected == 0){
      
          tx.executeSql('INSERT INTO Producto (idProducto, idproductotipo, codigo, nombre, descripcion, cantidad, precio, id_laboratorio, id_status, id_proveedor, id_tasa_cuota_iva, id_tasa_cuota_ieps, imagen, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                                          [dto.id_producto, dto.id_producto_tipo, dto.codigo, dto.nombre, dto.descripcion, dto.cantidad, dto.precio, dto.id_laboratorio, dto.id_estatus, dto.id_proveedor, dto.id_tasa_cuota_iva, dto.id_tasa_cuota_ieps, url, dto.created_at, dto.updated_at]);

        }
      }, 
      function(tx, error) {
        console.log('Producto-update-error: ' + error.message);
      });

      }
    }

    
    _fillProductoPrecio(tx,dtoList){

      for(let i=0;i<dtoList.length;i++){
      let url;
      const dto = dtoList[i];
      this.saveLastUpdate(dto.updated_at);
      
      tx.executeSql('UPDATE ProductoServicioPrecio SET id_producto = ?, nivel_socioeconomico_id = ?, precio_antes_impuestos = ?, iva = ?, ieps = ?, precio = ?, created_at = ?, updated_at = ?  WHERE id = ?',[ dto.id_producto, dto.nivel_socioeconomico_id, dto.precio_antes_impuestos, dto.iva, dto.ieps, dto.precio , dto.created_at, dto.updated_at,dto.id ],
      function(tx, resultSet) {
        if(this.debug){
          console.log("ON UPDATE Producto-success: " ,  resultSet);
        }
        if(resultSet.rowsAffected == 0){
      
          tx.executeSql('INSERT INTO ProductoServicioPrecio (id,  id_producto,  nivel_socioeconomico_id,   precio_antes_impuestos,   iva, ieps, precio, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                                          [dto.id, dto.id_producto, dto.nivel_socioeconomico_id, dto.precio_antes_impuestos, dto.iva, dto.ieps, dto.precio, dto.created_at, dto.updated_at]);

        }
      }, 
      function(tx, error) {
        console.log('Producto-update-error: ' + error.message);
      });

      }
    }

    _deleteProductoPrecio(dtoList){

//      console.log("_deleteProductoPrecio---: ");

      let productoPrecioList = [];

      let productosEliminados = 0;
      if(this.db == null){ this.getConnection();}

      this.db.transaction(
        tx => {


      tx.executeSql('select id from ProductoServicioPrecio ORDER BY id asc', [],
      function(tx, resultSet) {
//              console.log('ProductoServicioPrecio: ',resultSet);
        productoPrecioList = resultSet.rows._array;
//        console.log('productoPrecioList: ',productoPrecioList[0].id);

        let indexLocal = 0;
        let indexServer = 0;
        let localId = null;
        let serverId = null;

        for(let i=0; true; i++){
 //         console.log("i: ", i );

          if(indexLocal < productoPrecioList.length){
            localId = productoPrecioList[indexLocal].id;
          }
          if(indexServer < dtoList.length){
            serverId = dtoList[indexServer].id;
          }else{
            break;
          }
    
          if(localId < serverId){
//            console.log("i: " + i + " localId["+localId+"] - serverId["+serverId+"]");

            tx.executeSql('DELETE FROM ProductoServicioPrecio  WHERE id = ?',[ localId ],
            function(tx, resultSet) {
              productosEliminados++;
              console.log("ON DELETE Producto-success: " ,  resultSet);
            }, 
            function(tx, error) {
              console.log('DELETE Producto-error: ' + error.message);
            });

            indexLocal++;
          }else if(localId == serverId){

            indexLocal++;
            indexServer++;
          }else if(localId > serverId){
            console.log("******* Este es un caso raro que no debería de existir .... localId["+localId+"] - serverId["+serverId+"]");
            indexServer++;
          }
          
        }

          console.log("Se eliminaron: " + productosEliminados + " registros...");

          result = {type : 'resolve', success: true, productosEliminados};

      }, function(tx, error) {
            console.log('Termino de executeSql error.',{error});
      });

    }, function(error) {
      console.log({error});
    
    }, () => {
//      console.log(true);
    });
  

    }

    _fillClientes(tx,dtoList){
      for(let i=0;i<dtoList.length;i++){
      const dto = dtoList[i];
      this.saveLastUpdate(dto.updated_at);
      
      tx.executeSql('UPDATE Clientes SET clave = ?, nombre_comercial = ?, razon_social = ?, rfc = ?, calle = ?, no_ext = ?, no_int = ?, colonia = ?, id_municipio = ?, id_estado = ?, codigo_postal = ?, genera_factura = ?, telefono = ?, celular = ?, nivel_socioeconomico_id = ?, id_status = ?, has_credito = ?, dias_credito = ?, importe_credito = ?, saldo_favor = ?, created_at = ?, updated_at = ?  WHERE idCliente = ?',[ dto.clave, dto.nombre_comercial, dto.razon_social, dto.rfc, dto.calle, dto.no_ext, dto.no_int, dto.colonia, dto.id_municipio, dto.id_estado, dto.codigo_postal, dto.genera_factura, dto.telefono, dto.celular, dto.nivel_socioeconomico_id, dto.id_estatus, dto.has_credito, dto.dias_credito, dto.importe_credito, dto.saldo_favor, dto.created_at, dto.updated_at, dto.id_cliente],
      function(tx, resultSet) {
        if(this.debug){
          console.log("ON UPDATE Clientes-success: ");// ,  resultSet);
        }
        if(resultSet.rowsAffected == 0){

          tx.executeSql('INSERT INTO Clientes (idCliente, clave, nombre_comercial, razon_social, rfc, calle, no_ext, no_int, colonia, id_municipio, id_estado,codigo_postal, genera_factura, telefono, celular, nivel_socioeconomico_id, id_status, has_credito, dias_credito, importe_credito, saldo_favor, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,? ,? ,? ,? ,? ,? , ?)', 
              [dto.id_cliente, dto.clave, dto.nombre_comercial, dto.razon_social, dto.rfc, dto.calle, dto.no_ext, dto.no_int, dto.colonia, dto.id_municipio, dto.id_estado, dto.codigo_postal, dto.genera_factura, dto.telefono, dto.celular, dto.nivel_socioeconomico_id, dto.id_estatus, dto.has_credito, dto.dias_credito, dto.importe_credito, dto.saldo_favor, dto.created_at, dto.updated_at])
      

          }
        }, 
        function(tx, error) {
          console.log('Clientes-update-error: ' + error.message);
        });
    
      }
    }

   /* _fillClienteDireccion(tx,dto){
        for(let i=0;i<dto.length;i++){

        this.saveLastUpdate(dto[i].updated_at);
        
        tx.executeSql('UPDATE t_cliente_direccion SET idCliente = ?, latitude = ?, longitude = ?, WHERE id = ?',[  dto.id_cliente, dto.latitude, dto.longitude, dto.id],
        function(tx, resultSet) {
          if(this.debug){
            console.log("ON UPDATE cliente_direccion-success: ");// ,  resultSet);
          }
          if(resultSet.rowsAffected == 0){
  
            tx.executeSql('INSERT INTO t_cliente_direccion (id, idCliente, latitude, longitude) VALUES (?, ?, ?, ?)', 
                [dto.id, dto.id_cliente, dto.latitude, dto.longitude])
        
  
            }
          }, 
          function(tx, error) {
            console.log('cliente_dirrecion-update-error: ' + error.message);
          });
      
        }
    }*/

    _fillMetodoPago(tx,dto){
        // console.log(dto[0].metodo_pago)
        for(let i=0;i<dto.length;i++){

          this.saveLastUpdate(dto[i].updated_at);

          tx.executeSql('UPDATE metodoPago SET metodo_pago = ?, clave = ?, is_venta = ?, is_pago_credito = ?, created_at = ?, update_at = ?  WHERE id = ?',[ dto[i].metodo_pago, dto[i].clave, dto[i].is_venta, dto[i].is_pago_credito, dto[i].created_at, dto[i].updated_at, dto[i].id],
          function(tx, resultSet) {
            if(this.debug){
              console.log("ON UPDATE metodoPago-success: " );//,  resultSet);
            }
            if(resultSet.rowsAffected == 0){
    

              tx.executeSql('INSERT INTO metodoPago (id, metodo_pago, clave, is_venta, is_pago_credito, created_at, update_at) VALUES ( ?, ?, ?, ?, ?, ?, ?)', [ dto[i].id, dto[i].metodo_pago, dto[i].clave, dto[i].is_venta, dto[i].is_pago_credito, dto[i].created_at, dto[i].updated_at], 
              function(tx, resultSet) {
                  //console.log(resultSet);
              }, function(tx, error) {
                  //console.log('INSERT error: ' + error.message);
              });

            }
          }, 
          function(tx, error) {
            console.log('metodoPago-update-error: ' + error.message);
          });



        }
    }

    _fillBanco(tx,dto){
      // console.log(dto[0].metodo_pago)
      for(let i=0;i<dto.length;i++){

        this.saveLastUpdate(dto[i].updated_at);

        tx.executeSql('UPDATE banco SET nombre_corto = ?, orden = ?, id_status = ?, created_at = ?, update_at = ?  WHERE id = ?',[ dto[i].nombre_corto, dto[i].orden, dto[i].id_status, dto[i].created_at, dto[i].updated_at, dto[i].id],
        function(tx, resultSet) {
          if(this.debug){
            console.log("ON UPDATE banco-success: " );//,  resultSet);
          }
          if(resultSet.rowsAffected == 0){
  

            tx.executeSql('INSERT INTO banco (id, nombre_corto, orden, id_status, created_at, update_at) VALUES ( ?, ?, ?, ?, ?, ?)', [ dto[i].id, dto[i].nombre_corto, dto[i].orden, dto[i].id_status, dto[i].created_at, dto[i].updated_at], 
            function(tx, resultSet) {
                //console.log(resultSet);
            }, function(tx, error) {
                //console.log('INSERT error: ' + error.message);
            });

          }
        }, 
        function(tx, error) {
          console.log('metodoPago-update-error: ' + error.message);
        });



      }
  }


    _fillUsuario(tx,dto){
      // console.log(dto[0].metodo_pago)
      for(let i=0;i<dto.length;i++){

        this.saveLastUpdate(dto[i].updated_at);

        tx.executeSql('UPDATE t_usuario SET username = ?, password = ?, id_rol = ?, autorizar_descuento = ?, created_at = ?, updated_at = ?  WHERE id_usuario = ?',[ dto[i].username, dto[i].password, dto[i].id_rol, dto[i].autorizar_descuento, dto[i].created_at, dto[i].updated_at, dto[i].id_usuario ],
        function(tx, resultSet) {
          if(this.debug){
            console.log("ON UPDATE t_usuario-success: " ,  resultSet);
          }
          if(resultSet.rowsAffected == 0){
  

            tx.executeSql('INSERT INTO t_usuario (id_usuario, username, password, id_rol, autorizar_descuento, created_at, updated_at) VALUES ( ?, ?, ?, ?, ?, ?, ?)', [ dto[i].id_usuario, dto[i].username, dto[i].password, dto[i].id_rol, dto[i].autorizar_descuento, dto[i].created_at, dto[i].updated_at], 
            function(tx, resultSet) {
                //console.log(resultSet);
            }, function(tx, error) {
                //console.log('INSERT error: ' + error.message);
            });

          }
        }, 
        function(tx, error) {
          console.log('t_usuario-update-error: ' + error.message);
        });



      }
  }

     
  _fillEstados(tx,dto){
    // console.log(dto[0].metodo_pago)
    for(let i=0;i<dto.length;i++){

      this.saveLastUpdate(dto[i].updated_at);
      
      tx.executeSql('UPDATE dom_estado SET nombre = ?, created_at = ?, updated_at = ?  WHERE id_estado = ?',[ dto[i].nombre, dto[i].created_at, dto[i].updated_at, dto[i].id_estado ],
      function(tx, resultSet) {
        if(this.debug){
          console.log("ON UPDATE dom_estado-success: " ,  resultSet);
        }
        if(resultSet.rowsAffected == 0) {
          tx.executeSql('INSERT INTO dom_estado (id_estado, nombre, created_at, updated_at) VALUES ( ?, ?, ?, ? )', [ dto[i].id_estado, dto[i].nombre, dto[i].created_at, dto[i].updated_at], 
          function(tx, resultSet) {
//              console.log(resultSet);
          }, function(tx, error) {
              console.log('INSERT error: ' + error.message);
          });
        }
      }, 
      function(tx, error) {
        console.log('dom_estado-update-error: ' + error.message);
      });
    }
  }

  _fillMunicipios(tx,dto){
    // console.log(dto[0].metodo_pago)
    for(let i=0;i<dto.length;i++){

      this.saveLastUpdate(dto[i].updated_at);

      tx.executeSql('UPDATE dom_municipio SET nombre = ?, clave_mun = ?, id_estado = ? , created_at = ?, updated_at = ?  WHERE id_municipio = ?',[ dto[i].nombre, dto[i].clave_mun, dto[i].id_estado, dto[i].created_at, dto[i].updated_at, dto[i].id_municipio ],
      function(tx, resultSet) {
        if(this.debug){
          console.log("ON UPDATE dom_municipio-success: " ,  resultSet);
        }
        if(resultSet.rowsAffected == 0) {
          tx.executeSql('INSERT INTO dom_municipio (id_municipio, nombre, clave_mun, id_estado, created_at, updated_at) VALUES ( ?, ?, ?, ?, ?, ? )', [ dto[i].id_municipio, dto[i].nombre, dto[i].clave_mun, dto[i].id_estado, dto[i].created_at, dto[i].updated_at], 
          function(tx, resultSet) {
//              console.log(resultSet);
          }, function(tx, error) {
              console.log('INSERT error: ' + error.message);
          });
        }
      }, 
      function(tx, error) {
        console.log('dom_municipio-update-error: ' + error.message);
      });
    }
  }


    _fillImpuestoTasaCuota(tx,dto){
      // console.log(dto[0].metodo_pago)
      for(let i=0;i<dto.length;i++){
  
        tx.executeSql('UPDATE c_impuesto_tasa_cuota SET id_tipo_impuesto = ?, id_tipo_factor = ?, tipo_cuota = ? , minimo = ?, maximo = ?  WHERE id = ?',[ dto[i].id_tipo_impuesto, dto[i].id_tipo_factor, dto[i].tipo_cuota, dto[i].minimo, dto[i].maximo, dto[i].id ],
        function(tx, resultSet) {

          if(this.debug){
            console.log("ON UPDATE c_impuesto_tasa_cuota-success: " ,  resultSet);
          }
          if(resultSet.rowsAffected == 0) {
            tx.executeSql('INSERT INTO c_impuesto_tasa_cuota (id, id_tipo_impuesto, id_tipo_factor, tipo_cuota, minimo, maximo) VALUES ( ?, ?, ?, ?, ?, ? )', [ dto[i].id, dto[i].id_tipo_impuesto, dto[i].id_tipo_factor, dto[i].tipo_cuota, dto[i].minimo, dto[i].maximo], 
            function(tx, resultSet) {
//                console.log(resultSet);
            }, function(tx, error) {
                console.log('INSERT error: ' + error.message);
            });
          }
        }, 
        function(tx, error) {
          console.log('c_impuesto_tasa_cuota-update-error: ' + error.message);
        });
      }
    }

    verifyCatalogos(){

//      console.log("...verifyCatalogos()");

      return new Promise((resolve, reject) => {
        //resolve({success:true})    

        if(this.db == null){ this.getConnection();}
        this.db.transaction(
        tx => {
          
          this._verifyTipoProducto(tx);
          this._verifyNivelSocioeconomico(tx);
          this._verifyProducto(tx);
          this._verifyClientes(tx);
          this._verifyMetodoPago(tx);
          this._verifyConfiguracion(tx);
          
//          this._verifyImpuestoTasaCuota(tx);
        }, function(error) {
          reject({success:false,error:error})
        }, () => {
          resolve({success:true})    
        });


      })
    }


    _verifyTipoProducto(tx){
      tx.executeSql(
        'select count(*) as cuantos from TipoProducto', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    }
    _verifyNivelSocioeconomico(tx){
      tx.executeSql(
        'select count(*) as cuantos from NivelSocioeconomico', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    }
    _verifyProducto(tx){
      tx.executeSql(
        'select count(*) as cuantos from Producto', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    }
    _verifyProductoPrecio(tx){
      tx.executeSql(
        'select count(*) as cuantos from ProductoServicioPrecio', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    }

    _verifyClientes(tx){
      tx.executeSql(
        'select count(*) as cuantos from Clientes', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );    
    }

   /* _verifyClienteDireccion(tx){
      tx.executeSql(
        'select count(*) as cuantos from t_cliente_direccion', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );  
    }*/

    _verifyMetodoPago(tx){
      tx.executeSql(
        'select count(*) as cuantos from metodoPago', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );    
    }
    _verifyConfiguracion(tx){

      console.log("Verificando configuracion")
      tx.executeSql(
        'select key, value from c_configuracion', [], (_, { rows }) =>
        console.log(rows)
      );
    }
    _verifyImpuestoTasaCuota(tx){
      tx.executeSql(
        'select * from c_impuesto_tasa_cuota', [], (_, { rows }) =>
        console.log("c_impuesto_tasa_cuota: " , (rows))
      );
    }

/**
 * 
 */




}

module.exports = LocalStorage;

