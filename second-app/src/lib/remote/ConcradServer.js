import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import DateUtils from './../../lib/utils/dateUtils';


import gql from 'graphql-tag';


const apiURL = 'https://atletl.api.concrad.com/';
//const apiURL = 'http://192.168.15.20:3000/';


class ConcradServer{
  
    constructor() {
    //  this.debug = false;
    }

    _createApolloClient(){
      const link = new HttpLink({
        uri: apiURL+'graphql',
        headers: {
          'Authorization': `Bearer ${global.token}`
        }
      });
      return new ApolloClient({
        link,
        cache: new InMemoryCache()
      })
    }


    loadCatalogosFromServer(longTimestamp) {

        console.log("...loadCatalogosFromServer()");



        const client = this._createApolloClient();
//        const longTimestamp = "1";
        const FETCH_PRODUCTO = gql`
          {
            productoTipo( changesSince:${longTimestamp} ) {
                id
                tipo_producto
                orden
                has_stock
                created_at
                updated_at
            }
    
            producto(changesSince:${longTimestamp} ) {
                id_producto  
                id_producto_tipo
                codigo
                nombre
                descripcion
                cantidad
                precio
                id_laboratorio
                id_estatus
                id_proveedor
                id_tasa_cuota_iva
                id_tasa_cuota_ieps
                imagenes {
                  mini
                }
                created_at
                updated_at
            }
    
            productoServicioPrecio(changesSince:${longTimestamp} ) {
                id
                id_producto
                nivel_socioeconomico_id
                precio_antes_impuestos
                iva
                ieps
                precio
                created_at
                updated_at
            }
        
            nivelSocioeconomico(changesSince:${longTimestamp} ) {
                id
                nivel_socioeconomico
                orden
                precio_publico
                estatus
                created_at
                updated_at
            }
            banco(changesSince:${longTimestamp}) {
              id
              nombre_corto
              id_status
              orden
              created_at
              updated_at
            }
                
          
            cliente(changesSince:${longTimestamp}) {
                id_cliente
                clave
                nombre_comercial
                razon_social
                rfc
                calle
                no_ext
                no_int
                colonia
                id_municipio
                id_estado
                codigo_postal
                genera_factura
                telefono
                celular
                nivel_socioeconomico_id
                id_estatus
                has_credito
                dias_credito
                importe_credito
                saldo_favor
                created_at
                updated_at
            }  
          
            metodoPago(changesSince:${longTimestamp}) {
                id
                metodo_pago
                clave
                is_venta
                is_pago_credito
                created_at
                updated_at
            }
        
            impuestoTasaCuota(changesSince:${longTimestamp}) {
                id
                id_tipo_impuesto
                id_tipo_factor
                tipo_cuota
                minimo
                maximo
                descripcion
                para_traslado
                para_retencion
                created_at
                updated_at
            }
            
            usuario(changesSince:${longTimestamp}) {
                id_usuario
                username
                password
                id_rol
                autorizar_descuento
                created_at
                updated_at
              }
              domEstado(changesSince:${longTimestamp}) {
                id_estado
                nombre
                n_abreviado
                created_at
                updated_at
              }
              domMunicipio(changesSince:${longTimestamp}) {
                id_municipio
                clave_mun
                nombre
                id_estado
                created_at
                updated_at
              }
              idsProductoServicioPrecio: productoServicioPrecio {
                id
              }
          
          }
          `;


          return client.query({
                        query: FETCH_PRODUCTO,
                    });
    }
    

    checkActivationCode(inputKey){
      return fetch(apiURL + 'checkActivationCode/', {
    method: 'POST',
    body: JSON.stringify({
              key: inputKey
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  }).then((response) => response.json());
  }
    


    remoteLogin(user,password, isSucursal, sourceId){

        return fetch(apiURL + 'login', {
			method: 'POST',
			body: JSON.stringify({
                username: user,
                password:password,
                sucursal:isSucursal,
                caja:sourceId
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		}).then((response) => response.json());
    }

    loadConfiguration(sucursalId, sourceId){

        return fetch(apiURL + 'loadConfiguration/', {
			method: 'POST',
			body: JSON.stringify({
                id_source: sourceId,
                sucursal: sucursalId
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		}).then((response) => response.json());
    }


    confirmConfigurationSeriesFolios(sourceId){

    return fetch(apiURL + 'confirmConfigurationSeriesFolios/', {
			method: 'POST',
			body: JSON.stringify({
                id_source: sourceId
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		}).then((response) => response.json());
    }



    saveTransaction(type, source, transaction_id, fecha, data){
//    let fecha = DateUtils.fechaFormat(new Date(),'T');

    console.log("---> saveTransaction");
    return fetch(apiURL + 'saveTransaction/', {
      method: 'POST',
      body: JSON.stringify({
                transaction_type: type, // este valor es el que corresponde a una VENTA
                source: source, // este es el ID de la caja
                transaction_id: transaction_id,// este es el ID de la tabla syn_transaction
                creation_datetime: fecha, // la fecha de envio de la transaccion,
                transaction_data: data // este es el objeto de la transaccion de la venta 
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
		}).then((response) => response.json());
    }

    getTransactionStatus(type, source, transaction_id, fecha, server_id){

//    let fecha = DateUtils.fechaFormat(new Date(),'T');
    const body = JSON.stringify({
      transaction_type: type, // este valor es el que corresponde a una VENTA
      source: source, // este es el ID de la caja
      transaction_id: transaction_id,// este es el ID de la tabla syn_transaction
      server_id: server_id, // este es el objeto de la transaccion de la venta 
      creation_datetime: fecha // la fecha de envio de la transaccion,
});

console.log("getTransactionStatus: ", { "URL": (apiURL + 'getTransactionStatus') ,body} );

    return fetch(apiURL + 'getTransactionStatus', {
      method: 'POST',
      body: body,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        'Authorization': `Bearer ${global.token}`

      }
    }).then((response) => {
       return response.json();
    });
    }
}

module.exports = ConcradServer;