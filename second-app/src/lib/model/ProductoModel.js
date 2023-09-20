const LocalStorage = require ('../database/LocalStorage');

const localStorage = new LocalStorage();
import DateUtils from './../../lib/utils/dateUtils';


class ProductoModel  {

  constructor() {
  }


  

  consultarTiposProducto(){
    console.log("*** consultarTiposProducto");

    return new Promise((resolve, reject) => {
      let list = null;
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
        tx.executeSql(
          `select idtipoProducto, upper(tipo_producto) as tipo_producto from TipoProducto order by orden`, [], (tx, { rows }) => {

//            console.log("----> consultarTiposProducto:",rows);
            
            if(rows._array.length > 0){
              list = rows._array;
            }
            transactionResult = { type:'resolve', success:true, list };
 
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


  consultarProductosPrecio(){
    console.log("*** consultarProductosPrecio");

    return new Promise((resolve, reject) => {    
      let list = [];
      let transactionResult = {};
      localStorage.getConnection().transaction(tx => {
/*
SELECT id ,id_producto , nivel_socioeconomico_id, precio_antes_impuestos, iva, ieps, precio, created_at, updated_at
             FROM ProductoServicioPrecio
            WHERE id_producto = 1505
         ORDER BY id ASC
*/
        
        tx.executeSql(
          `SELECT * FROM c_configuracion`, [], (tx, { rows }) => {

//            console.log("----> config",rows);
            
            if(rows._array.length > 0){
                list = rows._array;
            }
            transactionResult = { type:'resolve', success:true, list };
 
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


  consultaProductos(nivelSocioeconomico){

    return new Promise((resolve, reject) => {    
      let list = [];
      let transactionResult = {};

    console.log("#### consultaProductos :  "  );
      localStorage.getConnection().transaction(tx => {

      tx.executeSql(
        //Producto.precio,
        `SELECT cast(idProducto as text) as key ,idProducto, idproductotipo, 
                TipoProducto.has_stock,
                codigo,
                upper(nombre) as nombre, cantidad,  
                imagen ,
                ProductoServicioPrecio.nivel_socioeconomico_id, 
                id_tasa_cuota_iva,
                tasa_cuota_iva.maximo as tasa_iva,
                id_tasa_cuota_ieps,
                max(ProductoServicioPrecio.precio_antes_impuestos) as precio_antes_impuestos, 
                max(ProductoServicioPrecio.iva) as iva, 
                ProductoServicioPrecio.ieps, 
                max(ProductoServicioPrecio.precio) as precio
           FROM c_impuesto_tasa_cuota as tasa_cuota_iva, ProductoServicioPrecio, TipoProducto, Producto 
          WHERE ProductoServicioPrecio.id_producto = Producto.idProducto
            AND Producto.id_status <> 0
--          AND idProducto = 53318
            AND TipoProducto.idtipoProducto = Producto.idproductotipo
            AND tasa_cuota_iva.id = Producto.id_tasa_cuota_iva
            AND ProductoServicioPrecio.nivel_socioeconomico_id = ?
            
            GROUP BY idProducto, idproductotipo, codigo, nombre, cantidad,  imagen ,
            ProductoServicioPrecio.nivel_socioeconomico_id,  ProductoServicioPrecio.ieps
            `, [nivelSocioeconomico], (_, { rows }) => {
//          console.log("consultaProductos: " , rows);
          list = rows._array;
          transactionResult = { type:'resolve', success:true, list };

        }, function(tx, error) {
          console.log("error de consulta d eproductos",{error});
          transactionResult = { type:'reject', success:false, error };

          
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


  consultaProductosByTipoProducto(nivelSocioeconomico, tipoProducto){

    return new Promise((resolve, reject) => {    
      let list = [];
      let transactionResult = {};

    console.log("#### consultaProductos :  "  );
      localStorage.getConnection().transaction(tx => {

      tx.executeSql(
        //Producto.precio,
        `SELECT "" + idProducto as key ,idProducto, idproductotipo, 
                TipoProducto.has_stock,
                codigo,
                upper(nombre) as nombre, cantidad,  
                imagen ,
                ProductoServicioPrecio.nivel_socioeconomico_id, 
                id_tasa_cuota_iva,
                tasa_cuota_iva.maximo as tasa_iva,
                id_tasa_cuota_ieps,
                max(ProductoServicioPrecio.precio_antes_impuestos) as precio_antes_impuestos, 
                max(ProductoServicioPrecio.iva) as iva, 
                ProductoServicioPrecio.ieps, 
                max(ProductoServicioPrecio.precio) as precio
           FROM c_impuesto_tasa_cuota as tasa_cuota_iva, ProductoServicioPrecio, TipoProducto, Producto 
          WHERE ProductoServicioPrecio.id_producto = Producto.idProducto
            AND Producto.id_status <> 0
--          AND idProducto = 53318
            AND TipoProducto.idtipoProducto = Producto.idproductotipo
            AND tasa_cuota_iva.id = Producto.id_tasa_cuota_iva
            AND ProductoServicioPrecio.nivel_socioeconomico_id = ?
            AND Producto.idproductotipo = ?
            
            GROUP BY idProducto, idproductotipo, codigo, nombre, cantidad,  imagen ,
            ProductoServicioPrecio.nivel_socioeconomico_id,  ProductoServicioPrecio.ieps
            `, [ nivelSocioeconomico, tipoProducto ], (_, { rows }) => {
//          console.log("consultaProductos: " , rows);
          list = rows._array;
          resolve({ success:true, list });

//          transactionResult = { type:'resolve', success:true, list };

        }, function(tx, error) {
          console.log("error de consulta d eproductos",{error});
          transactionResult = { type:'reject', success:false, error };

          
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

export default new ProductoModel();
