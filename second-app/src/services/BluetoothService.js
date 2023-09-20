

class ClienteModel  {

  constructor() {

    
  }


  


  consultarClientes(){

    BluetoothManager.isBluetoothEnabled().then((enabled) => {
        alert("enabled: "  + enabled)  // enabled ==> true /false
    }, (err) => {
      alert(err)
    });
  }
} 

