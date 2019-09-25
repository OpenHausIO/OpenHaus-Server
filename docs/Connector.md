# Adapter

### *Example code*

```js
module.exports = (log) => {

    // adapter init
    // get only called once

    return (input, output, iface, device, connections) => {

        // handler code goes here
        // get called for each interface the connector is attached to

    };

};
```

>An adapter exports a init function.\
>The function takes one argument:
>- `log` Winston logger instance
> 
> This init function returns a `function` (interface handler)

### Handler function (input, output, iface, device, connections)
- `input` {EventEmitter} Things that comes from the device interface
- `output` {EventEmitter} Things that goes to the device interface
- `iface` {EventEmitter} Events from the connector for interface `xyz`
- `device` {EventEmitter} Connector management channel
- `connections` {Object} [connections](#connections)
  - `interfaces` {Map}
  - `connector` {Map}
  - `adapter` {Map}



## **Input** {EventEmitter}
### Event: `data`
- `data` RAW data from the device
- `ws` WebSocket instance



## **Output** {EventEmitter}
### Event: `data`
>Triggerd from adapter/plugin or any other part that want so send data to the interface
- `data` RAW data to the device



## **Iface** {EventEmitter}
### Event: `command`
>Emited when a command received via API\
>Pack payload in interface specific protocol and send it via `output.emit(data)` to interface
- `payload` {Mixed} field from database
- `params` {Object} validated object
  - `key1`: `value1`
  - `key2`: `value2`
  - `key'n`: `value'n`

### Event: `connected`
>Interface connected on the WebSocket resource**¹**\
> \<host>/api/device/\<id>/interfaces/\<id>
- `interface` {Object} Interface description
- `ws` {WebSocket} instance

### Event: `disconnected`
>Interface disconnected from the WebSocket resource**¹**\
> \<host>/api/device/\<id>/interfaces/\<id>
- `interface` {Object} Interface description

**¹**This means not the connector has etablished a connection to the target device/interface.\
If you need this kind of events, see adapter handler function `device` parameter events



## **Device** {EventEmitter}
### Event: `:connected`
> Connection etablished to the target device interface\
> *Emitted on ETHERNET & HARDWARE types*
- `interface` {Object} Interface description

### Event: `:disconnected`
> Connection lost from device interface\
> *For RS232 or similar connections this mean you are physical not connected (broken wire, wrong pin layout)*
- `interface` {Object} Interface description


## **Connections** {object}
> states.js object of Map's
- `interfaces` {Map} WebSocket Server on `.../interfaces/<id>` resource
- `connector` {Map}
- `adapter` {Map}